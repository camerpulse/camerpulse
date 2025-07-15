-- Create tables for Ashen Debug Core system

-- Error logging and diagnostic data
CREATE TABLE public.ashen_error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  component_path TEXT NOT NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  line_number INTEGER,
  severity TEXT NOT NULL DEFAULT 'medium',
  confidence_score NUMERIC(3,2) DEFAULT 0.0,
  suggested_fix TEXT,
  screenshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  status TEXT NOT NULL DEFAULT 'open',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Code analysis results
CREATE TABLE public.ashen_code_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL,
  analysis_type TEXT NOT NULL,
  issues_found INTEGER DEFAULT 0,
  suggestions JSONB DEFAULT '[]'::jsonb,
  quality_score NUMERIC(3,2) DEFAULT 0.0,
  last_analyzed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  auto_fixable BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- User behavior simulation results
CREATE TABLE public.ashen_behavior_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  route_tested TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'desktop',
  test_result TEXT NOT NULL,
  issues_found JSONB DEFAULT '[]'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  screenshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- System monitoring configuration
CREATE TABLE public.ashen_monitoring_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Learning patterns and improvements
CREATE TABLE public.ashen_learning_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB NOT NULL,
  success_rate NUMERIC(3,2) DEFAULT 0.0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ashen_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_code_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_behavior_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_monitoring_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_learning_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin-only access
CREATE POLICY "Admins can manage error logs" ON public.ashen_error_logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can manage code analysis" ON public.ashen_code_analysis
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can manage behavior tests" ON public.ashen_behavior_tests
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can manage monitoring config" ON public.ashen_monitoring_config
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can manage learning patterns" ON public.ashen_learning_patterns
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Insert default configuration
INSERT INTO public.ashen_monitoring_config (config_key, config_value) VALUES
('auto_healing_enabled', 'false'),
('scan_interval_hours', '6'),
('confidence_threshold', '0.85'),
('max_auto_fixes_per_day', '10'),
('behavior_test_frequency', '24'),
('monitoring_enabled', 'true');

-- Create indexes for performance
CREATE INDEX idx_ashen_error_logs_created_at ON public.ashen_error_logs(created_at DESC);
CREATE INDEX idx_ashen_error_logs_status ON public.ashen_error_logs(status);
CREATE INDEX idx_ashen_code_analysis_file_path ON public.ashen_code_analysis(file_path);
CREATE INDEX idx_ashen_behavior_tests_route ON public.ashen_behavior_tests(route_tested);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_ashen_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for timestamp updates
CREATE TRIGGER update_ashen_monitoring_config_timestamp
  BEFORE UPDATE ON public.ashen_monitoring_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ashen_timestamp();

CREATE TRIGGER update_ashen_learning_patterns_timestamp
  BEFORE UPDATE ON public.ashen_learning_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ashen_timestamp();