-- Create poll vote log table for fraud protection
CREATE TABLE public.poll_vote_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NULL, -- null for anonymous votes
  hashed_ip TEXT NOT NULL,
  device_fingerprint TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  vote_option INTEGER NOT NULL,
  suspicious_flag BOOLEAN DEFAULT false,
  region TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create poll fraud settings table
CREATE TABLE public.poll_fraud_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  enable_rate_limiting BOOLEAN DEFAULT true,
  max_votes_per_ip INTEGER DEFAULT 1,
  max_votes_per_session INTEGER DEFAULT 1,
  enable_captcha BOOLEAN DEFAULT false,
  enable_fingerprinting BOOLEAN DEFAULT true,
  alert_threshold INTEGER DEFAULT 50, -- votes per minute
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id)
);

-- Create fraud alerts table
CREATE TABLE public.poll_fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'rate_spike', 'duplicate_votes', 'suspicious_pattern'
  alert_severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
  alert_message TEXT NOT NULL,
  vote_count INTEGER,
  time_window TEXT, -- e.g., '2 minutes'
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE NULL
);

-- Enable RLS on new tables
ALTER TABLE public.poll_vote_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_fraud_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_fraud_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for poll_vote_log
CREATE POLICY "Admins can view all vote logs"
ON public.poll_vote_log
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Poll creators can view their poll logs"
ON public.poll_vote_log
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.polls 
  WHERE id = poll_vote_log.poll_id AND creator_id = auth.uid()
));

CREATE POLICY "System can insert vote logs"
ON public.poll_vote_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS policies for poll_fraud_settings
CREATE POLICY "Poll creators can manage fraud settings"
ON public.poll_fraud_settings
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.polls 
  WHERE id = poll_fraud_settings.poll_id AND creator_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.polls 
  WHERE id = poll_fraud_settings.poll_id AND creator_id = auth.uid()
));

CREATE POLICY "Admins can manage all fraud settings"
ON public.poll_fraud_settings
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS policies for poll_fraud_alerts
CREATE POLICY "Admins can view all fraud alerts"
ON public.poll_fraud_alerts
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Poll creators can view their poll alerts"
ON public.poll_fraud_alerts
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.polls 
  WHERE id = poll_fraud_alerts.poll_id AND creator_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_poll_vote_log_poll_id ON public.poll_vote_log(poll_id);
CREATE INDEX idx_poll_vote_log_hashed_ip ON public.poll_vote_log(hashed_ip);
CREATE INDEX idx_poll_vote_log_timestamp ON public.poll_vote_log(timestamp);
CREATE INDEX idx_poll_vote_log_suspicious ON public.poll_vote_log(suspicious_flag);

-- Function to create default fraud settings for new polls
CREATE OR REPLACE FUNCTION public.create_default_fraud_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.poll_fraud_settings (poll_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default fraud settings
CREATE TRIGGER create_poll_fraud_settings
  AFTER INSERT ON public.polls
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_fraud_settings();

-- Function to detect fraud patterns
CREATE OR REPLACE FUNCTION public.detect_fraud_patterns(p_poll_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  vote_spike INTEGER;
  settings_record RECORD;
BEGIN
  -- Get fraud settings for this poll
  SELECT * INTO settings_record
  FROM public.poll_fraud_settings
  WHERE poll_id = p_poll_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check for vote spikes in last 2 minutes
  SELECT COUNT(*) INTO vote_spike
  FROM public.poll_vote_log
  WHERE poll_id = p_poll_id
    AND timestamp > now() - INTERVAL '2 minutes';
  
  -- Create alert if spike detected
  IF vote_spike >= settings_record.alert_threshold THEN
    INSERT INTO public.poll_fraud_alerts (
      poll_id, alert_type, alert_severity, alert_message, 
      vote_count, time_window
    ) VALUES (
      p_poll_id, 'rate_spike', 'high',
      'Suspicious voting spike detected: ' || vote_spike || ' votes in 2 minutes',
      vote_spike, '2 minutes'
    );
  END IF;
END;
$$;