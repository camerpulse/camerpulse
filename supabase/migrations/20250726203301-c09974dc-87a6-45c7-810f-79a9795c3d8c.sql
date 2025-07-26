-- Fix critical security issues identified by linter

-- 1. Enable RLS on tables that don't have it (ERROR level issues)
ALTER TABLE public.artist_event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_campaign_responses ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for tables with RLS enabled but no policies (INFO level issues)
-- For artist_analytics table
CREATE POLICY "Users can view their own analytics" ON public.artist_analytics
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage analytics" ON public.artist_analytics
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- For ashen_pattern_learning table (assuming it exists)
-- First check if the table exists, if not skip
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ashen_pattern_learning') THEN
        EXECUTE 'CREATE POLICY "Admins can manage pattern learning" ON public.ashen_pattern_learning FOR ALL USING (
          EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = ''admin''::app_role
          )
        )';
    END IF;
END $$;

-- 3. Fix function search paths for all functions (WARN level issues - high priority for security)
-- Update all functions to have secure search path
CREATE OR REPLACE FUNCTION public.update_certificate_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_fan_club_member_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.fan_clubs SET 
      member_count = member_count + 1,
      updated_at = now()
    WHERE id = NEW.fan_club_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.fan_clubs SET 
      member_count = member_count - 1,
      updated_at = now()
    WHERE id = OLD.fan_club_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_fan_timestamps()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sanitize_message_content(content text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.log_security_event(p_action_type text, p_resource_type text, p_resource_id uuid DEFAULT NULL::uuid, p_details jsonb DEFAULT '{}'::jsonb, p_severity text DEFAULT 'info'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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