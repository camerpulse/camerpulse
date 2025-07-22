-- SECURITY FIXES Phase 4: Fix remaining high-priority functions with search_path issues

-- Fix media and alert functions
CREATE OR REPLACE FUNCTION public.cleanup_expired_media()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted_count INTEGER := 0;
  expired_file RECORD;
BEGIN
  -- Get expired files
  FOR expired_file IN
    SELECT file_path, id
    FROM public.messenger_media_files
    WHERE expires_at < now()
  LOOP
    -- Delete from storage
    PERFORM storage.delete_object('messenger-media', expired_file.file_path);
    
    -- Delete metadata record
    DELETE FROM public.messenger_media_files WHERE id = expired_file.id;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$;

-- Fix civic functions
CREATE OR REPLACE FUNCTION public.calculate_civic_score(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  score INTEGER := 0;
  metrics RECORD;
BEGIN
  SELECT * INTO metrics FROM public.user_civic_metrics WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Calculate score based on activities
  score := (metrics.quiz_completions * 10) +
           (metrics.petitions_supported * 5) +
           (metrics.petitions_created * 25) +
           (metrics.projects_contributed * 15) +
           (metrics.events_attended * 8) +
           (metrics.grants_received * 50) +
           (metrics.scholarships_received * 40) +
           (metrics.badges_earned * 20);
  
  -- Bonus for streak
  IF metrics.streak_days > 7 THEN
    score := score + (metrics.streak_days * 2);
  END IF;
  
  RETURN score;
END;
$$;

-- Fix pan africa functions
CREATE OR REPLACE FUNCTION public.get_pan_africa_config(p_config_key text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB := '{}';
  config_record RECORD;
BEGIN
  IF p_config_key IS NOT NULL THEN
    -- Get specific config
    SELECT config_value INTO result
    FROM public.pan_africa_config
    WHERE config_key = p_config_key AND is_active = true;
    
    RETURN COALESCE(result, '{}');
  ELSE
    -- Get all active configs
    FOR config_record IN 
      SELECT config_key, config_value
      FROM public.pan_africa_config
      WHERE is_active = true
    LOOP
      result := result || jsonb_build_object(config_record.config_key, config_record.config_value);
    END LOOP;
    
    RETURN result;
  END IF;
END;
$$;

-- Fix detection functions
CREATE OR REPLACE FUNCTION public.detect_data_trends(p_category text, p_time_window interval DEFAULT '24:00:00'::interval)
RETURNS TABLE(trend_name text, momentum_score numeric, confidence_level numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Basic trend detection logic
  RETURN QUERY
  SELECT 
    td.trend_name,
    td.momentum_score,
    td.confidence_level
  FROM public.trend_detection td
  WHERE td.category = p_category
    AND td.last_updated_at > now() - p_time_window
    AND td.status = 'active'
  ORDER BY td.momentum_score DESC
  LIMIT 10;
END;
$$;

-- Fix media alert functions
CREATE OR REPLACE FUNCTION public.create_media_alert(p_analysis_id uuid, p_alert_type text, p_alert_title text, p_alert_description text DEFAULT NULL::text, p_severity threat_level DEFAULT 'medium'::threat_level)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  alert_id UUID;
  analysis_record RECORD;
BEGIN
  -- Get analysis details
  SELECT * INTO analysis_record 
  FROM public.media_content_analysis 
  WHERE id = p_analysis_id;
  
  -- Create alert
  INSERT INTO public.media_alerts (
    analysis_id,
    source_id,
    alert_type,
    alert_severity,
    alert_title,
    alert_description,
    entities_affected,
    regions_affected
  ) VALUES (
    p_analysis_id,
    analysis_record.source_id,
    p_alert_type,
    p_severity,
    p_alert_title,
    p_alert_description,
    analysis_record.politicians_mentioned || analysis_record.parties_mentioned,
    analysis_record.regions_mentioned
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;