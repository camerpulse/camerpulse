-- Create security penetration tests table
CREATE TABLE public.ashen_security_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL, -- 'xss', 'csrf', 'sql_injection', 'auth_bypass', 'cors', 'clickjacking'
  target_endpoint TEXT NOT NULL,
  attack_vector TEXT NOT NULL,
  test_payload TEXT,
  test_result TEXT NOT NULL DEFAULT 'pending', -- 'passed', 'failed', 'blocked', 'error'
  exploit_risk_score INTEGER DEFAULT 0,
  vulnerability_found BOOLEAN DEFAULT false,
  patch_suggested BOOLEAN DEFAULT false,
  patch_applied BOOLEAN DEFAULT false,
  patch_details JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security breach replay table
CREATE TABLE public.ashen_security_breaches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  breach_name TEXT NOT NULL,
  breach_type TEXT NOT NULL,
  original_date TIMESTAMP WITH TIME ZONE,
  target_module TEXT NOT NULL,
  exploit_method TEXT NOT NULL,
  replay_result TEXT NOT NULL DEFAULT 'pending', -- 'vulnerable', 'patched', 'failed', 'blocked'
  current_risk_level TEXT DEFAULT 'unknown', -- 'none', 'low', 'medium', 'high', 'critical'
  patch_status TEXT DEFAULT 'none', -- 'none', 'suggested', 'applied', 'manual_required'
  replay_details JSONB DEFAULT '{}',
  fix_suggestions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_replayed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create security vulnerability logs table
CREATE TABLE public.ashen_security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name TEXT NOT NULL,
  vulnerability_type TEXT NOT NULL,
  attack_vector TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  exploit_risk_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'patched', 'acknowledged', 'false_positive'
  affected_files TEXT[] DEFAULT ARRAY[]::TEXT[],
  detection_method TEXT NOT NULL, -- 'automated_scan', 'breach_replay', 'manual_test'
  patch_available BOOLEAN DEFAULT false,
  patch_applied BOOLEAN DEFAULT false,
  patch_details JSONB DEFAULT '{}',
  exploit_details JSONB DEFAULT '{}',
  remediation_steps TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  patched_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID
);

-- Create security scan configurations table
CREATE TABLE public.ashen_security_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Insert default security configurations
INSERT INTO public.ashen_security_config (config_key, config_value, description) VALUES
('penetration_testing_enabled', 'true', 'Enable automated penetration testing'),
('auto_fix_enabled', 'false', 'Enable automatic vulnerability fixes'),
('breach_replay_enabled', 'true', 'Enable security breach replay testing'),
('scan_frequency', '"weekly"', 'Frequency of automated security scans'),
('notification_enabled', 'true', 'Send notifications for security findings'),
('report_retention_days', '90', 'Number of days to retain security reports'),
('risk_threshold_auto_fix', '75', 'Risk score threshold for automatic fixes'),
('scan_endpoints', '["auth", "admin", "api", "upload", "feedback"]', 'Endpoints to include in security scans');

-- Enable RLS
ALTER TABLE public.ashen_security_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_security_breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_security_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security tables
CREATE POLICY "Admins can manage security tests" ON public.ashen_security_tests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage security breaches" ON public.ashen_security_breaches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage security logs" ON public.ashen_security_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage security config" ON public.ashen_security_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_ashen_security_tests_type ON public.ashen_security_tests(test_type);
CREATE INDEX idx_ashen_security_tests_result ON public.ashen_security_tests(test_result);
CREATE INDEX idx_ashen_security_tests_risk_score ON public.ashen_security_tests(exploit_risk_score);
CREATE INDEX idx_ashen_security_breaches_type ON public.ashen_security_breaches(breach_type);
CREATE INDEX idx_ashen_security_breaches_risk ON public.ashen_security_breaches(current_risk_level);
CREATE INDEX idx_ashen_security_logs_severity ON public.ashen_security_logs(severity);
CREATE INDEX idx_ashen_security_logs_status ON public.ashen_security_logs(status);
CREATE INDEX idx_ashen_security_logs_created_at ON public.ashen_security_logs(created_at);

-- Create trigger to update updated_at column
CREATE TRIGGER update_ashen_security_config_updated_at
  BEFORE UPDATE ON public.ashen_security_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();