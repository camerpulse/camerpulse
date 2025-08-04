-- CRITICAL SECURITY FIXES - Phase 1: Database Security

-- Fix search_path vulnerabilities in all functions
-- This prevents malicious schema injection attacks

CREATE OR REPLACE FUNCTION public.update_message_search_index()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.message_search_index (
    message_id, conversation_id, sender_id, search_vector, content_preview
  ) VALUES (
    NEW.id, 
    NEW.conversation_id, 
    NEW.sender_id,
    to_tsvector('english', COALESCE(NEW.content, '')),
    LEFT(COALESCE(NEW.content, ''), 100)
  )
  ON CONFLICT (message_id) DO UPDATE SET
    search_vector = to_tsvector('english', COALESCE(NEW.content, '')),
    content_preview = LEFT(COALESCE(NEW.content, ''), 100);
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_diaspora_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_mp_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at, updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_realtime_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_grant_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.setup_renewal_cron_job()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN 'Cron job setup function created. Configure pg_cron to call check_claim_renewals() daily.';
END;
$function$;

CREATE OR REPLACE FUNCTION public.detect_data_trends(p_category text, p_time_window interval DEFAULT '24:00:00'::interval)
RETURNS TABLE(trend_name text, momentum_score numeric, confidence_level numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
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
$function$;

-- Add missing RLS policies for critical tables

-- Fix analytics_alert_instances - allow users to update acknowledgments
CREATE POLICY "Users can acknowledge alert instances for their alerts" 
ON analytics_alert_instances 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM analytics_alerts 
  WHERE analytics_alerts.id = analytics_alert_instances.alert_id 
  AND ((analytics_alerts.created_by = auth.uid()) OR (auth.uid() = ANY (analytics_alerts.recipients)))
));

-- Fix advanced_sentiment_analysis - allow system to insert analysis results
CREATE POLICY "System can insert sentiment analysis" 
ON advanced_sentiment_analysis 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage sentiment analysis" 
ON advanced_sentiment_analysis 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'::app_role
));

-- Fix artist_analytics - allow system to insert analytics data
CREATE POLICY "System can insert artist analytics" 
ON artist_analytics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage artist analytics" 
ON artist_analytics 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'::app_role
));

-- Strengthen existing security functions with better validation
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action_type text, 
  p_resource_type text, 
  p_resource_id uuid DEFAULT NULL::uuid, 
  p_details jsonb DEFAULT '{}'::jsonb, 
  p_severity text DEFAULT 'info'::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Validate severity level
  IF p_severity NOT IN ('low', 'medium', 'high', 'critical') THEN
    p_severity := 'medium';
  END IF;
  
  -- Validate action_type length
  IF length(p_action_type) > 100 THEN
    RAISE EXCEPTION 'Action type too long';
  END IF;
  
  -- Validate resource_type length  
  IF length(p_resource_type) > 100 THEN
    RAISE EXCEPTION 'Resource type too long';
  END IF;
  
  INSERT INTO public.security_audit_logs (
    user_id, action_type, resource_type, resource_id, 
    details, severity, timestamp
  ) VALUES (
    auth.uid(), p_action_type, p_resource_type, p_resource_id,
    p_details, p_severity, now()
  );
END;
$function$;

-- Enhanced message sanitization with stronger XSS protection
CREATE OR REPLACE FUNCTION public.sanitize_message_content(content text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $function$
BEGIN
  IF content IS NULL THEN
    RETURN '';
  END IF;
  
  -- Remove dangerous HTML tags and attributes
  content := regexp_replace(content, '<script[^>]*>.*?</script>', '', 'gi');
  content := regexp_replace(content, '<iframe[^>]*>.*?</iframe>', '', 'gi');
  content := regexp_replace(content, '<object[^>]*>.*?</object>', '', 'gi');
  content := regexp_replace(content, '<embed[^>]*>', '', 'gi');
  content := regexp_replace(content, '<link[^>]*>', '', 'gi');
  content := regexp_replace(content, '<meta[^>]*>', '', 'gi');
  content := regexp_replace(content, '<form[^>]*>.*?</form>', '', 'gi');
  content := regexp_replace(content, '<input[^>]*>', '', 'gi');
  content := regexp_replace(content, '<button[^>]*>.*?</button>', '', 'gi');
  
  -- Remove dangerous protocols
  content := regexp_replace(content, 'javascript:', '', 'gi');
  content := regexp_replace(content, 'vbscript:', '', 'gi');
  content := regexp_replace(content, 'data:text/html', '', 'gi');
  content := regexp_replace(content, 'data:application/', '', 'gi');
  
  -- Remove event handlers
  content := regexp_replace(content, 'on\w+\s*=', '', 'gi');
  
  -- Encode HTML entities
  content := replace(content, '<', '&lt;');
  content := replace(content, '>', '&gt;');
  content := replace(content, '"', '&quot;');
  content := replace(content, '''', '&#x27;');
  content := replace(content, '/', '&#x2F;');
  content := replace(content, '&', '&amp;');
  
  -- Limit length to prevent DoS
  IF length(content) > 50000 THEN
    content := left(content, 50000) || '... [truncated]';
  END IF;
  
  RETURN content;
END;
$function$;

-- Create secure rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit_secure(
  p_identifier_type text, 
  p_identifier_value text, 
  p_action_type text, 
  p_limit_per_hour integer DEFAULT 100
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Validate inputs
    IF p_identifier_type IS NULL OR p_identifier_value IS NULL OR p_action_type IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Prevent excessively high limits
    IF p_limit_per_hour > 10000 THEN
        p_limit_per_hour := 10000;
    END IF;
    
    window_start := DATE_TRUNC('hour', NOW());
    
    -- Get current count for this hour
    SELECT COALESCE(SUM(action_count), 0) INTO current_count
    FROM poll_rate_limits
    WHERE identifier_type = p_identifier_type
    AND identifier_value = p_identifier_value
    AND action_type = p_action_type
    AND window_start >= DATE_TRUNC('hour', NOW());
    
    -- Check if limit exceeded
    IF current_count >= p_limit_per_hour THEN
        -- Log rate limit violation
        PERFORM public.log_security_event(
            'rate_limit_exceeded',
            'rate_limiting',
            NULL,
            jsonb_build_object(
                'identifier_type', p_identifier_type,
                'action_type', p_action_type,
                'current_count', current_count,
                'limit', p_limit_per_hour
            ),
            'medium'
        );
        RETURN FALSE;
    END IF;
    
    -- Record this action
    INSERT INTO poll_rate_limits (
        identifier_type, identifier_value, poll_id, action_type, window_start
    ) VALUES (
        p_identifier_type, p_identifier_value, NULL, p_action_type, window_start
    )
    ON CONFLICT (identifier_type, identifier_value, poll_id, action_type, window_start)
    DO UPDATE SET action_count = poll_rate_limits.action_count + 1;
    
    RETURN TRUE;
END;
$function$;