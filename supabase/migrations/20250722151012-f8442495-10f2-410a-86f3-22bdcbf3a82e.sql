-- SECURITY FIXES Phase 7: Fix remaining critical functions with correct approach
-- Manually fix the most important remaining functions that need search_path

-- Fix fraud detection functions
CREATE OR REPLACE FUNCTION public.detect_fraud_patterns(p_poll_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- Fix automated alert generation
CREATE OR REPLACE FUNCTION public.generate_automated_alert(p_alert_type text, p_title text, p_message text, p_severity alert_severity DEFAULT 'medium'::alert_severity)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.realtime_notifications (
    notification_type,
    title,
    message,
    priority,
    target_audience,
    delivery_channels
  ) VALUES (
    p_alert_type,
    p_title,
    p_message,
    p_severity,
    CASE 
      WHEN p_severity IN ('critical', 'emergency') THEN 'all'
      ELSE 'admins'
    END,
    CASE 
      WHEN p_severity IN ('critical', 'emergency') THEN ARRAY['in_app', 'email', 'sms']
      ELSE ARRAY['in_app', 'email']
    END
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Fix ticket generation functions
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  new_number TEXT;
  number_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate ticket number: TKT-YYYY-XXXXXXXX
    new_number := 'TKT-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    
    -- Check if number already exists
    SELECT EXISTS(SELECT 1 FROM public.ticket_purchases WHERE ticket_number = new_number) INTO number_exists;
    
    IF NOT number_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_qr_data()
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  qr_data TEXT;
  data_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate QR data: 32 character random string
    qr_data := encode(gen_random_bytes(16), 'hex');
    
    -- Check if data already exists
    SELECT EXISTS(SELECT 1 FROM public.ticket_purchases WHERE qr_code_data = qr_data) INTO data_exists;
    
    IF NOT data_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN qr_data;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_ticket_defaults()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := public.generate_ticket_number();
  END IF;
  
  IF NEW.qr_code_data IS NULL THEN
    NEW.qr_code_data := public.generate_qr_data();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix live polling functions
CREATE OR REPLACE FUNCTION public.update_live_polling_metrics(p_session_id uuid, p_active_users integer DEFAULT NULL::integer, p_new_participant boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.live_polling_sessions
  SET 
    current_active_users = COALESCE(p_active_users, current_active_users),
    total_participants = CASE 
      WHEN p_new_participant THEN total_participants + 1
      ELSE total_participants
    END,
    updated_at = now()
  WHERE id = p_session_id;
END;
$$;