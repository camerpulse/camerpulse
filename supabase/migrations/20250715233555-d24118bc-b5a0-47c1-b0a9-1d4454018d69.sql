-- Create Ashen Dev Terminal tables
CREATE TABLE public.ashen_dev_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_prompt TEXT NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'plugin', -- 'plugin', 'feature', 'page', 'dashboard', 'scraper', 'integration'
  target_users TEXT[] NOT NULL DEFAULT ARRAY['admin'], -- 'public', 'admin', 'researcher', 'minister'
  build_mode TEXT NOT NULL DEFAULT 'think_first', -- 'think_first', 'auto_build'
  use_civic_memory BOOLEAN NOT NULL DEFAULT true,
  preview_before_build BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'analyzing', 'building', 'completed', 'failed', 'reverted'
  priority_level INTEGER NOT NULL DEFAULT 3, -- 1-5 priority scale
  estimated_complexity INTEGER, -- 1-10 complexity scale
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  build_duration_seconds INTEGER,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- Create table for generated artifacts
CREATE TABLE public.ashen_generated_artifacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL,
  artifact_type TEXT NOT NULL, -- 'table_schema', 'edge_function', 'rls_policy', 'component', 'route', 'admin_ui'
  artifact_name TEXT NOT NULL,
  file_path TEXT,
  generated_code TEXT,
  schema_definition JSONB,
  dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
  linked_modules TEXT[] DEFAULT ARRAY[]::TEXT[], -- modules this artifact links to
  is_applied BOOLEAN NOT NULL DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  reverted_at TIMESTAMP WITH TIME ZONE,
  revert_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- Create build execution logs
CREATE TABLE public.ashen_build_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL,
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL, -- 'analysis', 'schema_generation', 'code_generation', 'deployment', 'testing'
  step_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'skipped'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  output_data JSONB,
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for civic memory patterns
CREATE TABLE public.ashen_civic_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name TEXT NOT NULL,
  pattern_type TEXT NOT NULL, -- 'common_request', 'code_template', 'schema_pattern', 'integration_pattern'
  pattern_description TEXT,
  pattern_data JSONB NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  success_rate NUMERIC NOT NULL DEFAULT 0.0,
  last_used TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for feature dependencies and relationships
CREATE TABLE public.ashen_feature_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL,
  depends_on_table TEXT,
  depends_on_function TEXT,
  depends_on_component TEXT,
  dependency_type TEXT NOT NULL, -- 'requires', 'extends', 'integrates_with', 'conflicts_with'
  is_critical BOOLEAN NOT NULL DEFAULT false,
  validation_status TEXT DEFAULT 'pending', -- 'pending', 'validated', 'failed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ashen_dev_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_generated_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_build_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_civic_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_feature_dependencies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage dev requests" ON public.ashen_dev_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view generated artifacts" ON public.ashen_generated_artifacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view build logs" ON public.ashen_build_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage civic memory" ON public.ashen_civic_memory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view dependencies" ON public.ashen_feature_dependencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX idx_ashen_dev_requests_status ON public.ashen_dev_requests(status);
CREATE INDEX idx_ashen_dev_requests_created_at ON public.ashen_dev_requests(created_at);
CREATE INDEX idx_ashen_dev_requests_type ON public.ashen_dev_requests(request_type);
CREATE INDEX idx_ashen_generated_artifacts_request_id ON public.ashen_generated_artifacts(request_id);
CREATE INDEX idx_ashen_build_logs_request_id ON public.ashen_build_logs(request_id);
CREATE INDEX idx_ashen_civic_memory_pattern_type ON public.ashen_civic_memory(pattern_type);
CREATE INDEX idx_ashen_civic_memory_tags ON public.ashen_civic_memory USING gin(tags);

-- Add foreign key constraints
ALTER TABLE public.ashen_generated_artifacts 
ADD CONSTRAINT fk_ashen_artifacts_request 
FOREIGN KEY (request_id) REFERENCES public.ashen_dev_requests(id);

ALTER TABLE public.ashen_build_logs 
ADD CONSTRAINT fk_ashen_logs_request 
FOREIGN KEY (request_id) REFERENCES public.ashen_dev_requests(id);

ALTER TABLE public.ashen_feature_dependencies 
ADD CONSTRAINT fk_ashen_dependencies_request 
FOREIGN KEY (request_id) REFERENCES public.ashen_dev_requests(id);

-- Create triggers for updated_at
CREATE TRIGGER update_ashen_civic_memory_updated_at
  BEFORE UPDATE ON public.ashen_civic_memory
  FOR EACH ROW EXECUTE FUNCTION public.update_ashen_timestamp();

-- Insert initial civic memory patterns
INSERT INTO public.ashen_civic_memory (pattern_name, pattern_type, pattern_description, pattern_data, tags) VALUES
('Complaint Form Pattern', 'code_template', 'Standard pattern for public complaint forms', '{"table_schema": {"columns": ["title", "description", "category", "region", "status", "user_id", "created_at"], "policies": ["public_insert", "admin_select_all"]}, "ui_pattern": "form_with_regions"}', ARRAY['complaint', 'public', 'form']),
('Minister Dashboard Pattern', 'code_template', 'Pattern for minister-specific dashboards', '{"table_schema": {"columns": ["minister_id", "metric_type", "value", "date", "region"], "policies": ["minister_own_data"]}, "ui_pattern": "dashboard_with_charts"}', ARRAY['minister', 'dashboard', 'metrics']),
('Regional Analytics Pattern', 'code_template', 'Pattern for regional data analysis features', '{"table_schema": {"columns": ["region", "metric_name", "value", "calculation_date"], "policies": ["admin_full_access"]}, "ui_pattern": "regional_heatmap"}', ARRAY['regional', 'analytics', 'metrics']),
('Public Rating System Pattern', 'code_template', 'Pattern for public rating/feedback systems', '{"table_schema": {"columns": ["entity_id", "entity_type", "rating", "comment", "user_id"], "policies": ["authenticated_insert", "public_read"]}, "ui_pattern": "rating_component"}', ARRAY['rating', 'public', 'feedback']);

-- Create function to analyze build request
CREATE OR REPLACE FUNCTION public.analyze_dev_request(
  p_request_id UUID,
  p_prompt TEXT,
  p_request_type TEXT DEFAULT 'plugin'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  analysis_result JSONB := '{}';
  complexity_score INTEGER := 1;
  estimated_artifacts TEXT[] := ARRAY[]::TEXT[];
  related_patterns RECORD;
BEGIN
  -- Basic complexity analysis based on prompt keywords
  IF p_prompt ILIKE '%dashboard%' OR p_prompt ILIKE '%analytics%' THEN
    complexity_score := complexity_score + 3;
    estimated_artifacts := array_append(estimated_artifacts, 'dashboard_component');
  END IF;
  
  IF p_prompt ILIKE '%form%' OR p_prompt ILIKE '%complaint%' OR p_prompt ILIKE '%feedback%' THEN
    complexity_score := complexity_score + 2;
    estimated_artifacts := array_append(estimated_artifacts, 'form_component');
  END IF;
  
  IF p_prompt ILIKE '%integration%' OR p_prompt ILIKE '%api%' OR p_prompt ILIKE '%scraper%' THEN
    complexity_score := complexity_score + 4;
    estimated_artifacts := array_append(estimated_artifacts, 'edge_function');
  END IF;
  
  IF p_prompt ILIKE '%database%' OR p_prompt ILIKE '%table%' OR p_prompt ILIKE '%schema%' THEN
    complexity_score := complexity_score + 2;
    estimated_artifacts := array_append(estimated_artifacts, 'table_schema');
  END IF;
  
  -- Find related patterns in civic memory
  FOR related_patterns IN
    SELECT pattern_name, pattern_type, pattern_data, tags
    FROM public.ashen_civic_memory
    WHERE is_active = true
    AND (
      tags && string_to_array(lower(p_prompt), ' ') OR
      pattern_description ILIKE '%' || p_request_type || '%'
    )
    ORDER BY usage_count DESC, success_rate DESC
    LIMIT 3
  LOOP
    analysis_result := analysis_result || jsonb_build_object(
      'related_patterns', 
      COALESCE(analysis_result->'related_patterns', '[]'::jsonb) || 
      jsonb_build_object(
        'name', related_patterns.pattern_name,
        'type', related_patterns.pattern_type,
        'data', related_patterns.pattern_data,
        'tags', related_patterns.tags
      )
    );
  END LOOP;
  
  -- Build final analysis
  analysis_result := analysis_result || jsonb_build_object(
    'complexity_score', LEAST(complexity_score, 10),
    'estimated_artifacts', estimated_artifacts,
    'estimated_duration_minutes', complexity_score * 5,
    'analysis_timestamp', now()
  );
  
  -- Update the request with analysis
  UPDATE public.ashen_dev_requests
  SET 
    estimated_complexity = LEAST(complexity_score, 10),
    metadata = metadata || analysis_result,
    status = 'analyzed'
  WHERE id = p_request_id;
  
  RETURN analysis_result;
END;
$$;