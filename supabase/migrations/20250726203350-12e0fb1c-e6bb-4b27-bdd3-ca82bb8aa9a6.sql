-- Fix critical security issues for existing tables only

-- 1. Fix function search paths for all existing functions (critical security issue)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_profile_completion_score(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  score integer := 0;
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record 
  FROM public.user_profiles 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Basic info (40 points total)
  IF profile_record.display_name IS NOT NULL THEN score := score + 10; END IF;
  IF profile_record.bio IS NOT NULL AND length(profile_record.bio) > 20 THEN score := score + 10; END IF;
  IF profile_record.location IS NOT NULL THEN score := score + 5; END IF;
  IF profile_record.profile_picture_url IS NOT NULL THEN score := score + 15; END IF;
  
  -- Contact info (20 points total)
  IF profile_record.phone_number IS NOT NULL THEN score := score + 10; END IF;
  IF profile_record.website_url IS NOT NULL THEN score := score + 10; END IF;
  
  -- Skills and interests (20 points total)
  IF array_length(profile_record.skills, 1) > 0 THEN score := score + 10; END IF;
  IF array_length(profile_record.interests, 1) > 0 THEN score := score + 10; END IF;
  
  -- Experience and education (20 points total)
  IF jsonb_array_length(profile_record.work_experience) > 0 THEN score := score + 10; END IF;
  IF jsonb_array_length(profile_record.education) > 0 THEN score := score + 10; END IF;
  
  -- Update the score in the profile
  UPDATE public.user_profiles 
  SET profile_completion_score = score 
  WHERE user_id = p_user_id;
  
  RETURN score;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_conversation_ids(user_uuid uuid)
RETURNS TABLE(conversation_id uuid)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT cp.conversation_id
  FROM conversation_participants cp
  WHERE cp.user_id = user_uuid;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_poll_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.check_rate_limit_secure(p_identifier_type text, p_identifier_value text, p_action_type text, p_limit_per_hour integer DEFAULT 100)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate current hour window
    window_start := DATE_TRUNC('hour', NOW());
    
    -- Get current count for this hour
    SELECT COALESCE(COUNT(*), 0) INTO current_count
    FROM public.security_audit_logs
    WHERE action_type = p_action_type
    AND details->>'identifier_type' = p_identifier_type
    AND details->>'identifier_value' = p_identifier_value
    AND timestamp >= window_start;
    
    -- Check if limit exceeded
    IF current_count >= p_limit_per_hour THEN
        -- Log the rate limit violation
        INSERT INTO public.security_audit_logs (
            action_type, resource_type, details, severity, timestamp
        ) VALUES (
            'rate_limit_exceeded', 'security', 
            jsonb_build_object(
                'identifier_type', p_identifier_type,
                'identifier_value', p_identifier_value,
                'action_type', p_action_type,
                'current_count', current_count,
                'limit', p_limit_per_hour
            ),
            'high', now()
        );
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$function$;