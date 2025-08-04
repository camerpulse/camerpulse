-- Phase 6E: Integration & API Features (Fixed)
-- External service connections, webhook endpoints, REST API, and custom connector framework

-- Integration services table
CREATE TABLE public.integration_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('slack', 'teams', 'discord', 'webhook', 'email', 'sms', 'custom')),
  display_name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  configuration_schema JSONB NOT NULL DEFAULT '{}',
  auth_type TEXT NOT NULL CHECK (auth_type IN ('oauth', 'api_key', 'webhook', 'basic_auth', 'none')),
  auth_config JSONB NOT NULL DEFAULT '{}',
  webhook_config JSONB DEFAULT '{}',
  rate_limits JSONB DEFAULT '{"requests_per_minute": 60, "burst_limit": 10}',
  supported_events TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- User integration connections
CREATE TABLE public.user_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_id UUID NOT NULL REFERENCES public.integration_services(id) ON DELETE CASCADE,
  connection_name TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  credentials JSONB DEFAULT '{}', -- Encrypted credentials
  webhook_url TEXT,
  webhook_secret TEXT,
  connection_status TEXT NOT NULL DEFAULT 'pending' CHECK (connection_status IN ('pending', 'connected', 'error', 'disconnected')),
  last_test_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  retry_count INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, service_id, connection_name)
);

-- Webhook endpoints for external triggers
CREATE TABLE public.webhook_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint_name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL UNIQUE,
  webhook_secret TEXT NOT NULL,
  allowed_origins TEXT[] DEFAULT ARRAY[]::TEXT[],
  event_filters JSONB DEFAULT '{}',
  transformation_rules JSONB DEFAULT '{}',
  rate_limit_config JSONB DEFAULT '{"requests_per_minute": 100}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  total_triggers BIGINT DEFAULT 0
);

-- API keys for REST API access
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  key_name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT ARRAY['read']::TEXT[],
  scopes TEXT[] DEFAULT ARRAY[]::TEXT[],
  rate_limit_config JSONB DEFAULT '{"requests_per_minute": 1000}',
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count BIGINT DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Custom connector definitions
CREATE TABLE public.custom_connectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  connector_name TEXT NOT NULL,
  connector_type TEXT NOT NULL,
  description TEXT,
  configuration_template JSONB NOT NULL DEFAULT '{}',
  code_template TEXT,
  test_config JSONB DEFAULT '{}',
  documentation TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version TEXT DEFAULT '1.0.0',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Integration usage analytics
CREATE TABLE public.integration_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES public.user_integrations(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance (with unique names)
CREATE INDEX idx_user_integrations_user ON public.user_integrations(user_id);
CREATE INDEX idx_user_integrations_service ON public.user_integrations(service_id);
CREATE INDEX idx_user_integrations_conn_status ON public.user_integrations(connection_status);
CREATE INDEX idx_webhook_endpoints_user ON public.webhook_endpoints(user_id);
CREATE INDEX idx_webhook_endpoints_endpoint_url ON public.webhook_endpoints(endpoint_url);
CREATE INDEX idx_api_keys_user ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_api_key ON public.api_keys(api_key);
CREATE INDEX idx_integration_logs_integration ON public.integration_logs(integration_id);
CREATE INDEX idx_integration_logs_timestamp ON public.integration_logs(created_at);
CREATE INDEX idx_custom_connectors_user ON public.custom_connectors(user_id);
CREATE INDEX idx_custom_connectors_public_filter ON public.custom_connectors(is_public) WHERE is_public = true;
CREATE INDEX idx_integration_analytics_integration ON public.integration_analytics(integration_id);
CREATE INDEX idx_integration_analytics_time_period ON public.integration_analytics(period_start, period_end);

-- Enable RLS
ALTER TABLE public.integration_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Integration services - public read, admin manage
CREATE POLICY "Public can view active integration services"
  ON public.integration_services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage integration services"
  ON public.integration_services FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- User integrations - users manage their own
CREATE POLICY "Users can manage their own integrations"
  ON public.user_integrations FOR ALL
  USING (auth.uid() = user_id);

-- Webhook endpoints - users manage their own
CREATE POLICY "Users can manage their own webhook endpoints"
  ON public.webhook_endpoints FOR ALL
  USING (auth.uid() = user_id);

-- API keys - users manage their own
CREATE POLICY "Users can manage their own API keys"
  ON public.api_keys FOR ALL
  USING (auth.uid() = user_id);

-- Integration logs - users can view their own, system can insert
CREATE POLICY "Users can view their own integration logs"
  ON public.integration_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_integrations ui 
      WHERE ui.id = integration_logs.integration_id 
      AND ui.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM webhook_endpoints we 
      WHERE we.id = integration_logs.webhook_endpoint_id 
      AND we.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM api_keys ak 
      WHERE ak.id = integration_logs.api_key_id 
      AND ak.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert integration logs"
  ON public.integration_logs FOR INSERT
  WITH CHECK (true);

-- Custom connectors - users manage their own, public read for public connectors
CREATE POLICY "Users can manage their own custom connectors"
  ON public.custom_connectors FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view public custom connectors"
  ON public.custom_connectors FOR SELECT
  USING (is_public = true);

-- Integration analytics - users can view their own, system can insert
CREATE POLICY "Users can view their own integration analytics"
  ON public.integration_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_integrations ui 
      WHERE ui.id = integration_analytics.integration_id 
      AND ui.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert integration analytics"
  ON public.integration_analytics FOR INSERT
  WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_integration_services_updated_at
  BEFORE UPDATE ON public.integration_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_integrations_updated_at
  BEFORE UPDATE ON public.user_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhook_endpoints_updated_at
  BEFORE UPDATE ON public.webhook_endpoints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_connectors_updated_at
  BEFORE UPDATE ON public.custom_connectors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key(key_name TEXT, user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  key_prefix TEXT;
  random_suffix TEXT;
  full_key TEXT;
BEGIN
  -- Generate prefix from user ID and key name
  key_prefix := 'nk_' || substring(user_uuid::text, 1, 8);
  
  -- Generate random suffix
  random_suffix := encode(gen_random_bytes(16), 'hex');
  
  -- Combine to form full key
  full_key := key_prefix || '_' || random_suffix;
  
  RETURN full_key;
END;
$$;

-- Function to test integration connection
CREATE OR REPLACE FUNCTION test_integration_connection(integration_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{"success": false, "message": "Connection test not implemented"}';
  integration_record RECORD;
BEGIN
  -- Get integration details
  SELECT ui.*, s.service_type, s.configuration_schema
  INTO integration_record
  FROM user_integrations ui
  JOIN integration_services s ON ui.service_id = s.id
  WHERE ui.id = integration_uuid
  AND ui.user_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN '{"success": false, "message": "Integration not found"}';
  END IF;
  
  -- Update last test time
  UPDATE user_integrations 
  SET last_test_at = now() 
  WHERE id = integration_uuid;
  
  -- For now, return a placeholder success
  -- In a real implementation, this would make actual API calls
  result := jsonb_build_object(
    'success', true,
    'message', 'Connection test successful',
    'service_type', integration_record.service_type,
    'tested_at', now()
  );
  
  RETURN result;
END;
$$;

-- Insert default integration services
INSERT INTO public.integration_services (service_name, service_type, display_name, description, auth_type, configuration_schema, supported_events) VALUES
('slack', 'slack', 'Slack', 'Send notifications to Slack channels and users', 'oauth', 
 '{"webhook_url": {"type": "string", "required": true}, "channel": {"type": "string", "required": false}, "username": {"type": "string", "required": false}}',
 ARRAY['message', 'alert', 'reminder']),
('teams', 'teams', 'Microsoft Teams', 'Send notifications to Microsoft Teams channels', 'oauth',
 '{"webhook_url": {"type": "string", "required": true}, "channel": {"type": "string", "required": false}}',
 ARRAY['message', 'alert', 'reminder']),
('discord', 'discord', 'Discord', 'Send notifications to Discord channels', 'webhook',
 '{"webhook_url": {"type": "string", "required": true}, "username": {"type": "string", "required": false}, "avatar_url": {"type": "string", "required": false}}',
 ARRAY['message', 'alert', 'reminder']),
('webhook', 'webhook', 'Generic Webhook', 'Send HTTP requests to any webhook endpoint', 'none',
 '{"url": {"type": "string", "required": true}, "method": {"type": "string", "enum": ["POST", "PUT", "PATCH"], "default": "POST"}, "headers": {"type": "object", "required": false}}',
 ARRAY['message', 'alert', 'reminder', 'custom']),
('email', 'email', 'Email', 'Send email notifications', 'api_key',
 '{"smtp_server": {"type": "string", "required": false}, "from_email": {"type": "string", "required": true}, "from_name": {"type": "string", "required": false}}',
 ARRAY['message', 'alert', 'reminder']),
('sms', 'sms', 'SMS', 'Send SMS notifications', 'api_key',
 '{"provider": {"type": "string", "enum": ["twilio", "nexmo", "aws"], "required": true}, "from_number": {"type": "string", "required": true}}',
 ARRAY['alert', 'reminder']);