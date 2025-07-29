-- Phase 1: Performance Optimization & Enhanced Fraud Protection (Fixed)

-- 1. Vote Counting Triggers for Performance
CREATE OR REPLACE FUNCTION public.update_poll_vote_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment vote count
    UPDATE public.polls 
    SET votes_count = votes_count + 1,
        updated_at = now()
    WHERE id = NEW.poll_id;
    
    -- Update option counts in poll_options table
    INSERT INTO public.poll_options (poll_id, option_text, vote_count, option_order)
    SELECT NEW.poll_id, 
           (SELECT options->NEW.option_index FROM polls WHERE id = NEW.poll_id),
           1,
           NEW.option_index
    ON CONFLICT (poll_id, option_order) 
    DO UPDATE SET vote_count = poll_options.vote_count + 1;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement vote count
    UPDATE public.polls 
    SET votes_count = GREATEST(0, votes_count - 1),
        updated_at = now()
    WHERE id = OLD.poll_id;
    
    -- Update option counts
    UPDATE public.poll_options 
    SET vote_count = GREATEST(0, vote_count - 1)
    WHERE poll_id = OLD.poll_id AND option_order = OLD.option_index;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create triggers for vote counting
DROP TRIGGER IF EXISTS poll_vote_count_trigger ON public.poll_votes;
CREATE TRIGGER poll_vote_count_trigger
    AFTER INSERT OR DELETE ON public.poll_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_poll_vote_counts();

-- 2. Poll Results Caching Function
CREATE OR REPLACE FUNCTION public.refresh_poll_cache(p_poll_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  poll_record RECORD;
  option_results JSONB := '[]'::jsonb;
  regional_results JSONB := '{}'::jsonb;
  total_votes INTEGER := 0;
BEGIN
  -- Get poll data
  SELECT * INTO poll_record FROM public.polls WHERE id = p_poll_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate option results
  SELECT jsonb_agg(
    jsonb_build_object(
      'option_index', option_order,
      'option_text', option_text,
      'vote_count', vote_count,
      'percentage', CASE 
        WHEN poll_record.votes_count > 0 
        THEN ROUND((vote_count::numeric / poll_record.votes_count) * 100, 2)
        ELSE 0 
      END
    ) ORDER BY option_order
  ) INTO option_results
  FROM public.poll_options 
  WHERE poll_id = p_poll_id;
  
  -- Calculate regional distribution
  SELECT jsonb_object_agg(
    region,
    jsonb_build_object(
      'vote_count', vote_count,
      'percentage', CASE 
        WHEN poll_record.votes_count > 0 
        THEN ROUND((vote_count::numeric / poll_record.votes_count) * 100, 2)
        ELSE 0 
      END
    )
  ) INTO regional_results
  FROM (
    SELECT 
      COALESCE(region, 'Unknown') as region,
      COUNT(*) as vote_count
    FROM public.poll_votes 
    WHERE poll_id = p_poll_id
    GROUP BY region
  ) regional_data;
  
  -- Update or insert cache
  INSERT INTO public.poll_regional_results (
    poll_id, 
    regional_breakdown, 
    option_breakdown,
    last_updated
  ) VALUES (
    p_poll_id,
    COALESCE(regional_results, '{}'::jsonb),
    COALESCE(option_results, '[]'::jsonb),
    now()
  )
  ON CONFLICT (poll_id) DO UPDATE SET
    regional_breakdown = EXCLUDED.regional_breakdown,
    option_breakdown = EXCLUDED.option_breakdown,
    last_updated = EXCLUDED.last_updated;
END;
$$;

-- 3. Auto-refresh poll cache on vote changes
CREATE OR REPLACE FUNCTION public.trigger_poll_cache_refresh()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Refresh cache asynchronously
  PERFORM public.refresh_poll_cache(
    CASE WHEN TG_OP = 'DELETE' THEN OLD.poll_id ELSE NEW.poll_id END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS poll_cache_refresh_trigger ON public.poll_votes;
CREATE TRIGGER poll_cache_refresh_trigger
    AFTER INSERT OR DELETE ON public.poll_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_poll_cache_refresh();

-- 4. Enhanced Fraud Detection Function
CREATE OR REPLACE FUNCTION public.detect_advanced_fraud_patterns(p_poll_id uuid)
RETURNS TABLE(
  fraud_type text,
  severity text,
  confidence_score numeric,
  evidence_count integer,
  description text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  suspicious_patterns RECORD;
  total_votes INTEGER;
  fraud_threshold INTEGER := 5;
BEGIN
  -- Get total votes for the poll
  SELECT votes_count INTO total_votes FROM public.polls WHERE id = p_poll_id;
  
  -- Pattern 1: Rapid sequential voting from same IP
  FOR suspicious_patterns IN
    SELECT 
      hashed_ip,
      COUNT(*) as vote_count,
      MAX(created_at) - MIN(created_at) as time_span
    FROM public.poll_vote_log 
    WHERE poll_id = p_poll_id
    GROUP BY hashed_ip
    HAVING COUNT(*) >= 3 
    AND MAX(created_at) - MIN(created_at) < INTERVAL '1 minute'
  LOOP
    fraud_type := 'rapid_voting';
    severity := CASE 
      WHEN suspicious_patterns.vote_count >= 10 THEN 'critical'
      WHEN suspicious_patterns.vote_count >= 5 THEN 'high'
      ELSE 'medium'
    END;
    confidence_score := LEAST(0.95, 0.6 + (suspicious_patterns.vote_count * 0.05));
    evidence_count := suspicious_patterns.vote_count;
    description := format('Detected %s votes from same device in %s', 
      suspicious_patterns.vote_count, suspicious_patterns.time_span);
    RETURN NEXT;
  END LOOP;
  
  -- Pattern 2: Identical device fingerprints with different IPs
  FOR suspicious_patterns IN
    SELECT 
      device_fingerprint,
      COUNT(DISTINCT hashed_ip) as ip_count,
      COUNT(*) as vote_count
    FROM public.poll_vote_log 
    WHERE poll_id = p_poll_id
    AND device_fingerprint IS NOT NULL
    GROUP BY device_fingerprint
    HAVING COUNT(DISTINCT hashed_ip) >= 3
  LOOP
    fraud_type := 'device_spoofing';
    severity := 'high';
    confidence_score := 0.85;
    evidence_count := suspicious_patterns.vote_count;
    description := format('Same device fingerprint used from %s different IPs', 
      suspicious_patterns.ip_count);
    RETURN NEXT;
  END LOOP;
  
  -- Pattern 3: Unusual voting pattern timing
  FOR suspicious_patterns IN
    SELECT 
      DATE_TRUNC('hour', created_at) as hour_bucket,
      COUNT(*) as votes_in_hour
    FROM public.poll_vote_log 
    WHERE poll_id = p_poll_id
    GROUP BY DATE_TRUNC('hour', created_at)
    HAVING COUNT(*) > (total_votes * 0.3) -- More than 30% of votes in 1 hour
  LOOP
    fraud_type := 'burst_voting';
    severity := 'medium';
    confidence_score := 0.70;
    evidence_count := suspicious_patterns.votes_in_hour;
    description := format('Unusual spike: %s votes in single hour', 
      suspicious_patterns.votes_in_hour);
    RETURN NEXT;
  END LOOP;
  
  -- Pattern 4: Sequential user agent patterns
  FOR suspicious_patterns IN
    SELECT 
      user_agent,
      COUNT(*) as count
    FROM public.poll_vote_log 
    WHERE poll_id = p_poll_id
    AND user_agent IS NOT NULL
    GROUP BY user_agent
    HAVING COUNT(*) >= 5
    AND user_agent NOT LIKE '%Chrome%' 
    AND user_agent NOT LIKE '%Firefox%'
    AND user_agent NOT LIKE '%Safari%'
  LOOP
    fraud_type := 'suspicious_user_agent';
    severity := 'medium';
    confidence_score := 0.75;
    evidence_count := suspicious_patterns.count;
    description := format('Suspicious user agent pattern: %s votes', 
      suspicious_patterns.count);
    RETURN NEXT;
  END LOOP;
  
END;
$$;

-- 5. Real-time Fraud Alert System
CREATE OR REPLACE FUNCTION public.trigger_fraud_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  fraud_patterns RECORD;
  alert_count INTEGER := 0;
BEGIN
  -- Run fraud detection on the poll
  FOR fraud_patterns IN
    SELECT * FROM public.detect_advanced_fraud_patterns(NEW.poll_id)
    WHERE confidence_score >= 0.7
  LOOP
    -- Insert fraud alert
    INSERT INTO public.poll_fraud_alerts (
      poll_id,
      alert_type,
      alert_severity,
      alert_message,
      vote_count,
      time_window,
      detected_at,
      acknowledged
    ) VALUES (
      NEW.poll_id,
      fraud_patterns.fraud_type,
      fraud_patterns.severity,
      fraud_patterns.description,
      fraud_patterns.evidence_count,
      '1 hour'::text,
      now(),
      false
    );
    
    alert_count := alert_count + 1;
  END LOOP;
  
  -- If high-severity alerts, consider auto-actions
  IF alert_count >= 2 THEN
    -- Update poll settings to be more restrictive
    UPDATE public.poll_fraud_settings 
    SET 
      enable_captcha = true,
      max_votes_per_ip = GREATEST(1, max_votes_per_ip - 1),
      alert_threshold = GREATEST(10, alert_threshold - 10),
      updated_at = now()
    WHERE poll_id = NEW.poll_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create fraud detection trigger
DROP TRIGGER IF EXISTS poll_fraud_detection_trigger ON public.poll_vote_log;
CREATE TRIGGER poll_fraud_detection_trigger
    AFTER INSERT ON public.poll_vote_log
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_fraud_alert();

-- 6. Poll Performance Analytics Function
CREATE OR REPLACE FUNCTION public.calculate_poll_performance_metrics(p_poll_id uuid)
RETURNS TABLE(
  total_votes integer,
  unique_voters integer,
  engagement_rate numeric,
  average_time_to_vote interval,
  geographic_diversity_score numeric,
  fraud_risk_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  poll_created_at TIMESTAMP;
  unique_regions INTEGER;
  total_regions INTEGER := 10; -- Cameroon regions
  fraud_alerts INTEGER;
BEGIN
  -- Get poll creation time
  SELECT created_at INTO poll_created_at 
  FROM public.polls WHERE id = p_poll_id;
  
  -- Calculate metrics
  SELECT 
    COUNT(*) as votes,
    COUNT(DISTINCT COALESCE(user_id, session_id)) as unique_users,
    COUNT(DISTINCT region) as regions,
    COUNT(DISTINCT CASE WHEN created_at <= poll_created_at + INTERVAL '1 day' THEN hashed_ip END) as early_voters
  INTO 
    total_votes,
    unique_voters,
    unique_regions,
    fraud_alerts
  FROM public.poll_vote_log 
  WHERE poll_id = p_poll_id;
  
  -- Calculate engagement rate (unique voters / total site visitors - simplified)
  engagement_rate := CASE 
    WHEN total_votes > 0 THEN 
      ROUND((unique_voters::numeric / GREATEST(total_votes, 1)) * 100, 2)
    ELSE 0 
  END;
  
  -- Calculate average time to vote (from poll creation)
  SELECT AVG(created_at - poll_created_at) 
  INTO average_time_to_vote
  FROM public.poll_vote_log 
  WHERE poll_id = p_poll_id;
  
  -- Geographic diversity score
  geographic_diversity_score := ROUND(
    (unique_regions::numeric / total_regions) * 100, 2
  );
  
  -- Get fraud risk score
  SELECT COUNT(*) INTO fraud_alerts
  FROM public.poll_fraud_alerts 
  WHERE poll_id = p_poll_id AND acknowledged = false;
  
  fraud_risk_score := CASE 
    WHEN fraud_alerts = 0 THEN 0
    WHEN fraud_alerts <= 2 THEN 25
    WHEN fraud_alerts <= 5 THEN 50
    WHEN fraud_alerts <= 10 THEN 75
    ELSE 100
  END;
  
  RETURN NEXT;
END;
$$;

-- 7. Automated Poll Health Check
CREATE OR REPLACE FUNCTION public.run_poll_health_checks()
RETURNS TABLE(
  poll_id uuid,
  poll_title text,
  health_status text,
  issues_found text[],
  recommendations text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  poll_record RECORD;
  issues text[] := '{}';
  recommendations text[] := '{}';
  status text := 'healthy';
BEGIN
  FOR poll_record IN 
    SELECT p.id, p.title, p.votes_count, p.created_at, p.is_active
    FROM public.polls p
    WHERE p.is_active = true
    AND p.created_at > now() - INTERVAL '7 days'
  LOOP
    poll_id := poll_record.id;
    poll_title := poll_record.title;
    issues := '{}';
    recommendations := '{}';
    
    -- Check for low engagement
    IF poll_record.votes_count < 10 AND poll_record.created_at < now() - INTERVAL '1 day' THEN
      issues := array_append(issues, 'Low engagement');
      recommendations := array_append(recommendations, 'Consider promoting the poll or adjusting targeting');
      status := 'warning';
    END IF;
    
    -- Check for fraud alerts
    IF EXISTS (
      SELECT 1 FROM public.poll_fraud_alerts 
      WHERE poll_fraud_alerts.poll_id = poll_record.id 
      AND acknowledged = false
    ) THEN
      issues := array_append(issues, 'Unresolved fraud alerts');
      recommendations := array_append(recommendations, 'Review and address fraud alerts');
      status := 'critical';
    END IF;
    
    -- Check for technical issues
    IF NOT EXISTS (
      SELECT 1 FROM public.poll_fraud_settings 
      WHERE poll_fraud_settings.poll_id = poll_record.id
    ) THEN
      issues := array_append(issues, 'Missing fraud protection settings');
      recommendations := array_append(recommendations, 'Configure fraud protection settings');
      status := 'warning';
    END IF;
    
    health_status := status;
    issues_found := issues;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- Enable realtime for fraud alerts only (skip views)
ALTER TABLE public.poll_fraud_alerts REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_fraud_alerts;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id_created_at ON public.poll_votes(poll_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poll_vote_log_poll_id_ip ON public.poll_vote_log(poll_id, hashed_ip);
CREATE INDEX IF NOT EXISTS idx_poll_vote_log_poll_id_device ON public.poll_vote_log(poll_id, device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_poll_vote_log_created_at ON public.poll_vote_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poll_fraud_alerts_poll_id ON public.poll_fraud_alerts(poll_id, acknowledged);
CREATE INDEX IF NOT EXISTS idx_poll_regional_results_poll_id ON public.poll_regional_results(poll_id);