-- Create poll bot detection logs table
CREATE TABLE public.poll_bot_detection_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL,
  is_bot BOOLEAN NOT NULL DEFAULT FALSE,
  confidence_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  risk_score INTEGER NOT NULL DEFAULT 0,
  detection_reasons TEXT[] DEFAULT '{}',
  user_agent TEXT,
  device_fingerprint TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll advanced config table  
CREATE TABLE public.poll_advanced_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL,
  poll_type TEXT NOT NULL DEFAULT 'single_choice',
  advanced_settings JSONB NOT NULL DEFAULT '{}',
  validation_rules JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll advanced responses table
CREATE TABLE public.poll_advanced_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL,
  user_id UUID,
  response_data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll rate limiting logs table
CREATE TABLE public.poll_rate_limiting_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL,
  user_identifier TEXT NOT NULL,
  action_type TEXT NOT NULL,
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.poll_bot_detection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_advanced_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_advanced_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_rate_limiting_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Fixed to use creator_id instead of created_by)
CREATE POLICY "Admins can manage bot detection logs" ON public.poll_bot_detection_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can manage their poll configs" ON public.poll_advanced_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM polls WHERE id = poll_id AND creator_id = auth.uid())
  );

CREATE POLICY "Users can view poll configs" ON public.poll_advanced_config
  FOR SELECT USING (true);

CREATE POLICY "Users can create responses" ON public.poll_advanced_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their responses" ON public.poll_advanced_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view rate limiting logs" ON public.poll_rate_limiting_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Indexes
CREATE INDEX idx_poll_bot_detection_logs_poll_id ON public.poll_bot_detection_logs(poll_id);
CREATE INDEX idx_poll_advanced_config_poll_id ON public.poll_advanced_config(poll_id);
CREATE INDEX idx_poll_advanced_responses_poll_id ON public.poll_advanced_responses(poll_id);
CREATE INDEX idx_poll_rate_limiting_logs_poll_id ON public.poll_rate_limiting_logs(poll_id);