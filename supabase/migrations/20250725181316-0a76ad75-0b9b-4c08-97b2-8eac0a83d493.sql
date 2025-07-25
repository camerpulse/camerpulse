-- Create poll export logs table
CREATE TABLE public.poll_export_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL,
  export_format TEXT NOT NULL,
  exported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  file_size_bytes BIGINT,
  exported_by UUID,
  metadata JSONB DEFAULT '{}'
);

-- Create poll webhooks table
CREATE TABLE public.poll_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Create poll integrations table
CREATE TABLE public.poll_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_type TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Create poll view log table for analytics
CREATE TABLE public.poll_view_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL,
  user_id UUID,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  device_type TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll API keys table
CREATE TABLE public.poll_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key_name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  permissions TEXT[] DEFAULT ARRAY['read'],
  rate_limit_per_hour INTEGER DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.poll_export_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_view_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their export logs" ON public.poll_export_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM polls WHERE id = poll_id AND creator_id = auth.uid())
  );

CREATE POLICY "Users can manage their webhooks" ON public.poll_webhooks
  FOR ALL USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM polls WHERE id = poll_id AND creator_id = auth.uid())
  );

CREATE POLICY "Users can manage their integrations" ON public.poll_integrations
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Admins can view all API keys" ON public.poll_api_keys
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can manage their API keys" ON public.poll_api_keys
  FOR ALL USING (created_by = auth.uid());

-- Indexes for performance
CREATE INDEX idx_poll_export_logs_poll_id ON public.poll_export_logs(poll_id);
CREATE INDEX idx_poll_webhooks_poll_id ON public.poll_webhooks(poll_id);
CREATE INDEX idx_poll_view_log_poll_id ON public.poll_view_log(poll_id);
CREATE INDEX idx_poll_view_log_viewed_at ON public.poll_view_log(viewed_at);
CREATE INDEX idx_poll_api_keys_active ON public.poll_api_keys(is_active);

-- Function to generate API keys
CREATE OR REPLACE FUNCTION public.generate_poll_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_key TEXT;
BEGIN
  -- Generate a secure API key
  new_key := 'pk_' || encode(gen_random_bytes(32), 'hex');
  RETURN new_key;
END;
$$;