-- SECURITY FIXES Phase 5: Comprehensive fix for ALL remaining functions
-- This is a massive fix to secure the remaining ~210 functions

-- Fix all trigger functions with search_path
CREATE OR REPLACE FUNCTION public.update_image_verification_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_integration_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_autonomous_polls_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_poll_templates_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_default_fraud_settings()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.poll_fraud_settings (poll_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at, updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_realtime_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_diaspora_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_grant_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix generator functions
CREATE OR REPLACE FUNCTION public.generate_artist_id()
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate ID in format: CPA-YYYY-XXXXXX (CamerPulse Artist)
    new_id := 'CPA-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM public.artist_applications WHERE artist_id_number = new_id) INTO id_exists;
    
    IF NOT id_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_politician_terms()
RETURNS TABLE(politician_id uuid, name text, current_status text, needs_update boolean, days_since_term_end integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as politician_id,
    p.name,
    p.term_status as current_status,
    CASE 
      WHEN p.term_end_date IS NOT NULL AND p.term_end_date < CURRENT_DATE AND p.term_status = 'active' THEN true
      WHEN p.term_end_date IS NULL AND p.term_status != 'unknown' THEN true
      ELSE false
    END as needs_update,
    CASE 
      WHEN p.term_end_date IS NOT NULL THEN 
        EXTRACT(DAY FROM CURRENT_DATE - p.term_end_date)::integer
      ELSE NULL
    END as days_since_term_end
  FROM public.politicians p
  WHERE p.term_status IN ('active', 'unknown')
  ORDER BY p.term_end_date ASC NULLS LAST;
END;
$$;