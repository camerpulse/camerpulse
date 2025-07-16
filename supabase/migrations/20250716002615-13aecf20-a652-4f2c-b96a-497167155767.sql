-- Create Ashen Sync Guard tables for feature registry and conflict detection

-- Core registry of all modules and features
CREATE TABLE public.ashen_feature_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name TEXT NOT NULL,
  feature_type TEXT NOT NULL DEFAULT 'component',
  version_tag TEXT NOT NULL DEFAULT 'v1.0',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'broken', 'deprecated', 'under_development')),
  file_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
  dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
  linked_features TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  last_scanned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Sync configuration settings
CREATE TABLE public.ashen_sync_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Sync scan logs and results
CREATE TABLE public.ashen_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_type TEXT NOT NULL DEFAULT 'pre_build_check',
  feature_scanned TEXT NOT NULL,
  conflict_status TEXT NOT NULL CHECK (conflict_status IN ('no_conflict', 'duplicate_found', 'broken_found', 'outdated_found')),
  scan_result TEXT NOT NULL CHECK (scan_result IN ('skipped', 'built', 'upgraded', 'repaired', 'error')),
  conflict_details JSONB DEFAULT '{}',
  recommendations TEXT[],
  admin_override BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scan_duration_ms INTEGER,
  metadata JSONB DEFAULT '{}'
);

-- Feature conflict detection results
CREATE TABLE public.ashen_conflict_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name TEXT NOT NULL,
  existing_feature_id UUID REFERENCES public.ashen_feature_registry(id),
  conflict_type TEXT NOT NULL CHECK (conflict_type IN ('exact_duplicate', 'similar_functionality', 'version_conflict', 'dependency_conflict')),
  similarity_score NUMERIC(5,2) DEFAULT 0.0,
  conflict_severity TEXT NOT NULL DEFAULT 'medium' CHECK (conflict_severity IN ('low', 'medium', 'high', 'critical')),
  resolution_recommendation TEXT,
  auto_resolvable BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  analysis_details JSONB DEFAULT '{}'
);

-- Module upgrade history
CREATE TABLE public.ashen_upgrade_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_id UUID NOT NULL REFERENCES public.ashen_feature_registry(id),
  old_version TEXT NOT NULL,
  new_version TEXT NOT NULL,
  upgrade_type TEXT NOT NULL CHECK (upgrade_type IN ('patch', 'minor', 'major', 'rebuild')),
  upgrade_reason TEXT,
  changes_summary TEXT,
  backward_compatible BOOLEAN DEFAULT true,
  rollback_available BOOLEAN DEFAULT true,
  rollback_data JSONB,
  upgrade_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  upgraded_by UUID,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.ashen_feature_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_sync_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_conflict_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_upgrade_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage feature registry" ON public.ashen_feature_registry
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage sync config" ON public.ashen_sync_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view sync logs" ON public.ashen_sync_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view conflict analysis" ON public.ashen_conflict_analysis
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view upgrade history" ON public.ashen_upgrade_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_feature_registry_name ON public.ashen_feature_registry(feature_name);
CREATE INDEX idx_feature_registry_type ON public.ashen_feature_registry(feature_type);
CREATE INDEX idx_feature_registry_status ON public.ashen_feature_registry(status);
CREATE INDEX idx_sync_logs_feature ON public.ashen_sync_logs(feature_scanned);
CREATE INDEX idx_sync_logs_created_at ON public.ashen_sync_logs(created_at DESC);
CREATE INDEX idx_conflict_analysis_feature ON public.ashen_conflict_analysis(feature_name);
CREATE INDEX idx_upgrade_history_feature ON public.ashen_upgrade_history(feature_id);

-- Create triggers for updated_at
CREATE TRIGGER update_ashen_feature_registry_updated_at
  BEFORE UPDATE ON public.ashen_feature_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ashen_sync_config_updated_at
  BEFORE UPDATE ON public.ashen_sync_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sync configuration
INSERT INTO public.ashen_sync_config (config_key, config_value) VALUES
('allow_duplicate', '{"enabled": false, "admin_override_required": true}'),
('scan_frequency_hours', '{"value": 4, "auto_scan": true}'),
('conflict_thresholds', '{"similarity_threshold": 80, "version_check": true}'),
('upgrade_mode', '{"auto_upgrade": false, "prompt_before_upgrade": true}'),
('scan_scope', '{"include_components": true, "include_functions": true, "include_tables": true}');

-- Database functions for sync operations
CREATE OR REPLACE FUNCTION public.scan_for_feature_conflicts(
  p_feature_name TEXT,
  p_feature_type TEXT DEFAULT 'component',
  p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  similar_features RECORD;
  conflict_result JSONB := '{"conflicts": [], "recommendations": [], "can_proceed": true}';
  conflicts_array JSONB := '[]';
  recommendations_array JSONB := '[]';
  similarity_threshold NUMERIC := 80.0;
BEGIN
  -- Get similarity threshold from config
  SELECT (config_value->'similarity_threshold')::NUMERIC INTO similarity_threshold
  FROM public.ashen_sync_config 
  WHERE config_key = 'conflict_thresholds';
  
  -- Find similar features
  FOR similar_features IN
    SELECT 
      id,
      feature_name,
      feature_type,
      version_tag,
      status,
      file_paths,
      public.similarity(feature_name, p_feature_name) * 100 as name_similarity
    FROM public.ashen_feature_registry
    WHERE feature_type = p_feature_type
    AND status IN ('active', 'broken')
    ORDER BY name_similarity DESC
    LIMIT 5
  LOOP
    IF similar_features.name_similarity >= similarity_threshold THEN
      -- High similarity conflict found
      conflicts_array := conflicts_array || jsonb_build_object(
        'existing_feature_id', similar_features.id,
        'existing_name', similar_features.feature_name,
        'similarity_score', similar_features.name_similarity,
        'version', similar_features.version_tag,
        'status', similar_features.status,
        'conflict_type', CASE 
          WHEN similar_features.name_similarity >= 95 THEN 'exact_duplicate'
          ELSE 'similar_functionality'
        END
      );
      
      -- Add recommendation based on status
      IF similar_features.status = 'active' THEN
        recommendations_array := recommendations_array || jsonb_build_object(
          'action', 'skip',
          'reason', 'Feature already exists and is functional',
          'existing_feature', similar_features.feature_name
        );
      ELSIF similar_features.status = 'broken' THEN
        recommendations_array := recommendations_array || jsonb_build_object(
          'action', 'repair',
          'reason', 'Feature exists but is broken - consider repairing instead of rebuilding',
          'existing_feature', similar_features.feature_name
        );
      END IF;
    END IF;
  END LOOP;
  
  -- Build final result
  conflict_result := jsonb_build_object(
    'conflicts', conflicts_array,
    'recommendations', recommendations_array,
    'can_proceed', CASE WHEN jsonb_array_length(conflicts_array) = 0 THEN true ELSE false END,
    'scan_timestamp', now()
  );
  
  -- Log the scan
  INSERT INTO public.ashen_sync_logs (
    scan_type, feature_scanned, conflict_status, scan_result, conflict_details
  ) VALUES (
    'pre_build_check',
    p_feature_name,
    CASE WHEN jsonb_array_length(conflicts_array) = 0 THEN 'no_conflict' ELSE 'duplicate_found' END,
    CASE WHEN jsonb_array_length(conflicts_array) = 0 THEN 'built' ELSE 'skipped' END,
    conflict_result
  );
  
  RETURN conflict_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_new_feature(
  p_feature_name TEXT,
  p_feature_type TEXT,
  p_version_tag TEXT DEFAULT 'v1.0',
  p_file_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
  p_dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  feature_id UUID;
BEGIN
  INSERT INTO public.ashen_feature_registry (
    feature_name,
    feature_type,
    version_tag,
    file_paths,
    dependencies,
    description,
    created_by,
    last_scanned_at
  ) VALUES (
    p_feature_name,
    p_feature_type,
    p_version_tag,
    p_file_paths,
    p_dependencies,
    p_description,
    auth.uid(),
    now()
  ) RETURNING id INTO feature_id;
  
  RETURN feature_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_sync_guard_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}';
  active_modules INTEGER;
  skipped_duplicates INTEGER;
  auto_upgraded INTEGER;
  last_scan TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Count active modules
  SELECT COUNT(*) INTO active_modules
  FROM public.ashen_feature_registry
  WHERE status = 'active';
  
  -- Count skipped due to duplication (last 30 days)
  SELECT COUNT(*) INTO skipped_duplicates
  FROM public.ashen_sync_logs
  WHERE scan_result = 'skipped' 
  AND conflict_status = 'duplicate_found'
  AND created_at > now() - INTERVAL '30 days';
  
  -- Count auto-upgraded (last 30 days)
  SELECT COUNT(*) INTO auto_upgraded
  FROM public.ashen_upgrade_history
  WHERE created_at > now() - INTERVAL '30 days';
  
  -- Get last scan time
  SELECT MAX(created_at) INTO last_scan
  FROM public.ashen_sync_logs;
  
  result := jsonb_build_object(
    'active_modules', active_modules,
    'skipped_duplicates', skipped_duplicates,
    'auto_upgraded', auto_upgraded,
    'last_scan', last_scan,
    'status', 'operational'
  );
  
  RETURN result;
END;
$$;