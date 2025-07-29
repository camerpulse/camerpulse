-- Emergency Revert & AI Snapshot Restore System Tables

-- Table for storing system snapshots
CREATE TABLE public.ashen_system_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_name TEXT NOT NULL,
  snapshot_type TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'auto', 'pre_patch', 'scheduled'
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Snapshot content
  file_structure JSONB DEFAULT '{}'::JSONB,
  database_schema JSONB DEFAULT '{}'::JSONB,
  configuration_data JSONB DEFAULT '{}'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Size and statistics
  total_files INTEGER DEFAULT 0,
  total_size_mb NUMERIC DEFAULT 0.0,
  compression_ratio NUMERIC DEFAULT 1.0,
  
  -- Relationships
  triggered_by_patch_id UUID,
  triggered_by_plugin_id UUID,
  parent_snapshot_id UUID,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'creating', -- 'creating', 'completed', 'failed', 'corrupted'
  creation_started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  creation_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Administrative
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for tracking restore operations
CREATE TABLE public.ashen_restore_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_id UUID NOT NULL REFERENCES public.ashen_system_snapshots(id),
  
  -- Restore details
  restore_type TEXT NOT NULL DEFAULT 'full', -- 'full', 'files_only', 'db_only', 'config_only'
  restore_scope TEXT[] DEFAULT ARRAY[]::TEXT[], -- specific files/tables to restore
  
  -- Pre-restore backup
  pre_restore_snapshot_id UUID REFERENCES public.ashen_system_snapshots(id),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'rolled_back'
  progress_percentage INTEGER DEFAULT 0,
  current_step TEXT,
  
  -- Results
  files_restored INTEGER DEFAULT 0,
  tables_restored INTEGER DEFAULT 0,
  errors_encountered JSONB DEFAULT '[]'::JSONB,
  
  -- Safety measures
  safety_checks_passed BOOLEAN DEFAULT false,
  rollback_available BOOLEAN DEFAULT true,
  
  -- Administrative
  initiated_by UUID,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for snapshot comparisons
CREATE TABLE public.ashen_snapshot_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_a_id UUID NOT NULL REFERENCES public.ashen_system_snapshots(id),
  snapshot_b_id UUID NOT NULL REFERENCES public.ashen_system_snapshots(id),
  
  -- Comparison results
  files_added JSONB DEFAULT '[]'::JSONB,
  files_modified JSONB DEFAULT '[]'::JSONB,
  files_deleted JSONB DEFAULT '[]'::JSONB,
  
  tables_added JSONB DEFAULT '[]'::JSONB,
  tables_modified JSONB DEFAULT '[]'::JSONB,
  tables_deleted JSONB DEFAULT '[]'::JSONB,
  
  config_changes JSONB DEFAULT '{}'::JSONB,
  
  -- Summary statistics
  total_changes INTEGER DEFAULT 0,
  change_severity TEXT DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  
  -- Analysis
  comparison_summary TEXT,
  risk_assessment JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for snapshot retention policies
CREATE TABLE public.ashen_snapshot_retention_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_name TEXT NOT NULL UNIQUE,
  
  -- Retention rules
  max_snapshots INTEGER DEFAULT 30,
  max_age_days INTEGER DEFAULT 90,
  auto_cleanup_enabled BOOLEAN DEFAULT true,
  
  -- Snapshot frequency
  auto_snapshot_enabled BOOLEAN DEFAULT true,
  auto_snapshot_frequency TEXT DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  auto_snapshot_time TIME DEFAULT '02:00:00',
  
  -- Pre-patch snapshots
  pre_patch_snapshots BOOLEAN DEFAULT true,
  pre_plugin_snapshots BOOLEAN DEFAULT true,
  
  -- Emergency settings
  emergency_restore_enabled BOOLEAN DEFAULT true,
  auto_rollback_on_critical_error BOOLEAN DEFAULT false,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_ashen_system_snapshots_type ON public.ashen_system_snapshots(snapshot_type);
CREATE INDEX idx_ashen_system_snapshots_status ON public.ashen_system_snapshots(status);
CREATE INDEX idx_ashen_system_snapshots_created_at ON public.ashen_system_snapshots(created_at);
CREATE INDEX idx_ashen_system_snapshots_patch_id ON public.ashen_system_snapshots(triggered_by_patch_id);

CREATE INDEX idx_ashen_restore_operations_status ON public.ashen_restore_operations(status);
CREATE INDEX idx_ashen_restore_operations_snapshot_id ON public.ashen_restore_operations(snapshot_id);

-- Triggers for updated_at
CREATE TRIGGER update_ashen_system_snapshots_updated_at
  BEFORE UPDATE ON public.ashen_system_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ashen_timestamp();

CREATE TRIGGER update_ashen_snapshot_retention_config_updated_at
  BEFORE UPDATE ON public.ashen_snapshot_retention_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ashen_timestamp();

-- RLS Policies
ALTER TABLE public.ashen_system_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_restore_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_snapshot_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_snapshot_retention_config ENABLE ROW LEVEL SECURITY;

-- Admin access policies
CREATE POLICY "Admins can manage system snapshots" ON public.ashen_system_snapshots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Admins can manage restore operations" ON public.ashen_restore_operations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Admins can manage snapshot comparisons" ON public.ashen_snapshot_comparisons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Admins can manage retention config" ON public.ashen_snapshot_retention_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- Functions for snapshot management
CREATE OR REPLACE FUNCTION public.create_system_snapshot(
  p_snapshot_name TEXT,
  p_snapshot_type TEXT DEFAULT 'manual',
  p_description TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT ARRAY[]::TEXT[]
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  snapshot_id UUID;
BEGIN
  -- Create snapshot record
  INSERT INTO public.ashen_system_snapshots (
    snapshot_name,
    snapshot_type,
    description,
    tags,
    created_by,
    status
  ) VALUES (
    p_snapshot_name,
    p_snapshot_type,
    p_description,
    p_tags,
    auth.uid(),
    'creating'
  ) RETURNING id INTO snapshot_id;
  
  RETURN snapshot_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.compare_snapshots(
  p_snapshot_a_id UUID,
  p_snapshot_b_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  comparison_id UUID;
  snapshot_a RECORD;
  snapshot_b RECORD;
  total_changes INTEGER := 0;
BEGIN
  -- Get snapshot data
  SELECT * INTO snapshot_a FROM public.ashen_system_snapshots WHERE id = p_snapshot_a_id;
  SELECT * INTO snapshot_b FROM public.ashen_system_snapshots WHERE id = p_snapshot_b_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'One or both snapshots not found';
  END IF;
  
  -- Create comparison record (detailed comparison would be done in edge function)
  INSERT INTO public.ashen_snapshot_comparisons (
    snapshot_a_id,
    snapshot_b_id,
    total_changes,
    comparison_summary
  ) VALUES (
    p_snapshot_a_id,
    p_snapshot_b_id,
    total_changes,
    'Comparison between ' || snapshot_a.snapshot_name || ' and ' || snapshot_b.snapshot_name
  ) RETURNING id INTO comparison_id;
  
  RETURN comparison_id;
END;
$$;

-- Insert default retention policy
INSERT INTO public.ashen_snapshot_retention_config (
  policy_name,
  max_snapshots,
  max_age_days,
  auto_cleanup_enabled,
  auto_snapshot_enabled,
  auto_snapshot_frequency,
  pre_patch_snapshots,
  pre_plugin_snapshots,
  emergency_restore_enabled
) VALUES (
  'default_policy',
  30,
  90,
  true,
  true,
  'daily',
  true,
  true,
  true
) ON CONFLICT (policy_name) DO NOTHING;