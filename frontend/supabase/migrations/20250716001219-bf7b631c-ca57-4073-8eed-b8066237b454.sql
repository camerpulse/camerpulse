-- Create integrations table for storing integration definitions
CREATE TABLE public.custom_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL DEFAULT 'rest_api', -- rest_api, webhook, oauth2, messaging, data_sheet
  endpoint_url TEXT,
  auth_type TEXT NOT NULL DEFAULT 'none', -- none, bearer, api_key, oauth2, basic
  auth_config JSONB DEFAULT '{}',
  request_method TEXT NOT NULL DEFAULT 'GET',
  request_headers JSONB DEFAULT '{}',
  request_body JSONB DEFAULT '{}',
  purpose TEXT,
  output_target TEXT,
  pull_interval TEXT DEFAULT 'manual', -- manual, hourly, daily, weekly
  pull_schedule TEXT, -- cron expression for scheduled pulls
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_executed_at TIMESTAMP WITH TIME ZONE,
  execution_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

-- Create integration logs table
CREATE TABLE public.integration_execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.custom_integrations(id) ON DELETE CASCADE,
  execution_status TEXT NOT NULL, -- success, error, timeout, auth_failed
  request_data JSONB DEFAULT '{}',
  response_data JSONB DEFAULT '{}',
  response_status_code INTEGER,
  execution_time_ms INTEGER,
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Create integration auth secrets table (for sensitive data)
CREATE TABLE public.integration_auth_secrets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.custom_integrations(id) ON DELETE CASCADE,
  secret_key TEXT NOT NULL,
  secret_value TEXT NOT NULL, -- encrypted
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create integration usage stats table
CREATE TABLE public.integration_usage_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.custom_integrations(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_requests INTEGER NOT NULL DEFAULT 0,
  successful_requests INTEGER NOT NULL DEFAULT 0,
  failed_requests INTEGER NOT NULL DEFAULT 0,
  average_response_time_ms INTEGER NOT NULL DEFAULT 0,
  total_data_transferred_bytes BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(integration_id, stat_date)
);

-- Enable RLS on all tables
ALTER TABLE public.custom_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_auth_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_usage_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_integrations
CREATE POLICY "Admins can manage integrations" ON public.custom_integrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- RLS Policies for integration_execution_logs
CREATE POLICY "Admins can view execution logs" ON public.integration_execution_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- RLS Policies for integration_auth_secrets
CREATE POLICY "Admins can manage auth secrets" ON public.integration_auth_secrets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- RLS Policies for integration_usage_stats
CREATE POLICY "Admins can view usage stats" ON public.integration_usage_stats
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_custom_integrations_active ON public.custom_integrations(is_active);
CREATE INDEX idx_custom_integrations_type ON public.custom_integrations(integration_type);
CREATE INDEX idx_custom_integrations_created_by ON public.custom_integrations(created_by);
CREATE INDEX idx_integration_logs_integration_id ON public.integration_execution_logs(integration_id);
CREATE INDEX idx_integration_logs_status ON public.integration_execution_logs(execution_status);
CREATE INDEX idx_integration_logs_executed_at ON public.integration_execution_logs(executed_at);
CREATE INDEX idx_integration_auth_integration_id ON public.integration_auth_secrets(integration_id);
CREATE INDEX idx_integration_stats_integration_id ON public.integration_usage_stats(integration_id);
CREATE INDEX idx_integration_stats_date ON public.integration_usage_stats(stat_date);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_integration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_integrations_updated_at
  BEFORE UPDATE ON public.custom_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_integration_updated_at();

CREATE TRIGGER update_integration_auth_secrets_updated_at
  BEFORE UPDATE ON public.integration_auth_secrets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_integration_updated_at();

CREATE TRIGGER update_integration_usage_stats_updated_at
  BEFORE UPDATE ON public.integration_usage_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_integration_updated_at();

-- Function to execute integration
CREATE OR REPLACE FUNCTION public.execute_integration(p_integration_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  integration_record RECORD;
  result JSONB := '{"status": "initiated", "message": "Integration execution started"}';
BEGIN
  -- Get integration details
  SELECT * INTO integration_record 
  FROM public.custom_integrations 
  WHERE id = p_integration_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Integration not found or inactive: %', p_integration_id;
  END IF;
  
  -- Update execution stats
  UPDATE public.custom_integrations
  SET 
    execution_count = execution_count + 1,
    last_executed_at = now(),
    updated_at = now()
  WHERE id = p_integration_id;
  
  -- Log the execution attempt
  INSERT INTO public.integration_execution_logs (
    integration_id, execution_status, request_data, executed_at
  ) VALUES (
    p_integration_id, 'initiated', 
    jsonb_build_object(
      'endpoint', integration_record.endpoint_url,
      'method', integration_record.request_method,
      'timestamp', now()
    ), 
    now()
  );
  
  result := result || jsonb_build_object(
    'integration_id', p_integration_id,
    'integration_name', integration_record.integration_name,
    'execution_time', now()
  );
  
  RETURN result;
END;
$$;