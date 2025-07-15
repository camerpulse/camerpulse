-- Create autonomous monitoring configuration table
CREATE TABLE public.ashen_autonomous_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL DEFAULT '{}',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  risk_threshold INTEGER NOT NULL DEFAULT 6,
  scan_frequency_minutes INTEGER NOT NULL DEFAULT 10,
  auto_approve_safe_fixes BOOLEAN NOT NULL DEFAULT true,
  notify_on_human_approval_needed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create autonomous operations log table
CREATE TABLE public.ashen_autonomous_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type TEXT NOT NULL, -- 'scan', 'repair', 'upgrade', 'notification'
  target_module TEXT,
  risk_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'requires_approval'
  operation_details JSONB NOT NULL DEFAULT '{}',
  fix_applied BOOLEAN NOT NULL DEFAULT false,
  human_approval_required BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  reverted_at TIMESTAMP WITH TIME ZONE,
  snapshot_created_before UUID,
  execution_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create autonomous scan results table
CREATE TABLE public.ashen_autonomous_scan_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_type TEXT NOT NULL, -- 'ui', 'api', 'permissions', 'mobile', 'data_integrity'
  target_path TEXT,
  issue_detected BOOLEAN NOT NULL DEFAULT false,
  issue_severity TEXT NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  issue_description TEXT,
  suggested_fix TEXT,
  fix_confidence INTEGER NOT NULL DEFAULT 0, -- 0-100
  can_auto_fix BOOLEAN NOT NULL DEFAULT false,
  scan_metadata JSONB NOT NULL DEFAULT '{}',
  operation_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create autonomous blacklist table
CREATE TABLE public.ashen_autonomous_blacklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blacklist_type TEXT NOT NULL, -- 'fix_pattern', 'module', 'operation_type'
  blacklist_value TEXT NOT NULL,
  reason TEXT,
  added_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ashen_autonomous_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_autonomous_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_autonomous_scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_autonomous_blacklist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage autonomous config" ON public.ashen_autonomous_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage autonomous operations" ON public.ashen_autonomous_operations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view scan results" ON public.ashen_autonomous_scan_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage blacklist" ON public.ashen_autonomous_blacklist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX idx_autonomous_operations_status ON public.ashen_autonomous_operations(status);
CREATE INDEX idx_autonomous_operations_created_at ON public.ashen_autonomous_operations(created_at);
CREATE INDEX idx_autonomous_scan_results_issue_detected ON public.ashen_autonomous_scan_results(issue_detected);
CREATE INDEX idx_autonomous_scan_results_severity ON public.ashen_autonomous_scan_results(issue_severity);

-- Create triggers for updated_at
CREATE TRIGGER update_ashen_autonomous_config_updated_at
  BEFORE UPDATE ON public.ashen_autonomous_config
  FOR EACH ROW EXECUTE FUNCTION public.update_ashen_timestamp();

-- Add foreign key constraints
ALTER TABLE public.ashen_autonomous_scan_results 
ADD CONSTRAINT fk_autonomous_scan_operation 
FOREIGN KEY (operation_id) REFERENCES public.ashen_autonomous_operations(id);

-- Insert default configuration
INSERT INTO public.ashen_autonomous_config (config_key, config_value, is_enabled, risk_threshold, scan_frequency_minutes) VALUES
('zero_input_mode', '{"enabled": false, "silent_mode": true, "smart_mode": true}', false, 6, 10),
('auto_upgrade', '{"enabled": false, "check_frequency_hours": 48, "auto_apply": false}', false, 7, 10),
('monitoring_scope', '{"ui_elements": true, "api_failures": true, "permissions": true, "mobile_responsive": true, "data_integrity": true}', true, 5, 10);

-- Create function to get autonomous config
CREATE OR REPLACE FUNCTION public.get_autonomous_config(p_config_key TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}';
  config_record RECORD;
BEGIN
  IF p_config_key IS NOT NULL THEN
    SELECT config_value INTO result
    FROM public.ashen_autonomous_config
    WHERE config_key = p_config_key AND is_enabled = true;
    
    RETURN COALESCE(result, '{}');
  ELSE
    FOR config_record IN 
      SELECT config_key, config_value, is_enabled, risk_threshold, scan_frequency_minutes
      FROM public.ashen_autonomous_config
    LOOP
      result := result || jsonb_build_object(
        config_record.config_key, 
        jsonb_build_object(
          'config', config_record.config_value,
          'enabled', config_record.is_enabled,
          'risk_threshold', config_record.risk_threshold,
          'scan_frequency', config_record.scan_frequency_minutes
        )
      );
    END LOOP;
    
    RETURN result;
  END IF;
END;
$$;

-- Create function to log autonomous operation
CREATE OR REPLACE FUNCTION public.log_autonomous_operation(
  p_operation_type TEXT,
  p_target_module TEXT DEFAULT NULL,
  p_risk_score INTEGER DEFAULT 0,
  p_operation_details JSONB DEFAULT '{}',
  p_human_approval_required BOOLEAN DEFAULT false
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  operation_id UUID;
BEGIN
  INSERT INTO public.ashen_autonomous_operations (
    operation_type,
    target_module,
    risk_score,
    operation_details,
    human_approval_required,
    status
  ) VALUES (
    p_operation_type,
    p_target_module,
    p_risk_score,
    p_operation_details,
    p_human_approval_required,
    CASE WHEN p_human_approval_required THEN 'requires_approval' ELSE 'pending' END
  ) RETURNING id INTO operation_id;
  
  RETURN operation_id;
END;
$$;