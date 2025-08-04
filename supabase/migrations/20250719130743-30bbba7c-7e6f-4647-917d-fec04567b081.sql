-- SECURITY FIXES Phase 2: Extensions, Views, and Critical Functions

-- Move pg_trgm extension to extensions schema if it exists in public
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    CREATE SCHEMA IF NOT EXISTS extensions;
    ALTER EXTENSION pg_trgm SET SCHEMA extensions;
  END IF;
END $$;

-- Fix the most critical security-sensitive functions with search_path
-- These are functions that handle authentication, roles, and sensitive data

-- Update has_role function (already has search_path set correctly)
-- Update get_current_user_role function  
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Fix role-related functions
CREATE OR REPLACE FUNCTION public.update_politician_term_status(p_politician_id uuid, p_new_status text, p_reason text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  old_status text;
  old_office_status boolean;
BEGIN
  -- Get current status
  SELECT term_status, is_currently_in_office 
  INTO old_status, old_office_status
  FROM public.politicians 
  WHERE id = p_politician_id;
  
  -- Update status
  UPDATE public.politicians 
  SET 
    term_status = p_new_status,
    is_currently_in_office = CASE 
      WHEN p_new_status IN ('expired', 'deceased') THEN false
      ELSE true
    END,
    last_term_validation = now(),
    office_history = office_history || jsonb_build_object(
      'timestamp', now(),
      'old_status', old_status,
      'new_status', p_new_status,
      'reason', COALESCE(p_reason, 'Status update'),
      'old_office_status', old_office_status,
      'new_office_status', CASE 
        WHEN p_new_status IN ('expired', 'deceased') THEN false
        ELSE true
      END
    )
  WHERE id = p_politician_id;
  
  RETURN FOUND;
END;
$$;

-- Fix authentication-related functions
CREATE OR REPLACE FUNCTION public.create_default_notification_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Fix billionaire stats function
CREATE OR REPLACE FUNCTION public.get_billionaire_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
  total_billionaires integer;
  total_wealth_fcfa bigint;
  pending_applications integer;
BEGIN
  -- Count verified billionaires
  SELECT COUNT(*) INTO total_billionaires
  FROM public.billionaires 
  WHERE is_verified = true;
  
  -- Calculate total wealth
  SELECT COALESCE(SUM(verified_net_worth_fcfa), 0) INTO total_wealth_fcfa
  FROM public.billionaires 
  WHERE is_verified = true;
  
  -- Count pending applications
  SELECT COUNT(*) INTO pending_applications
  FROM public.billionaire_applications 
  WHERE status = 'pending';
  
  result := jsonb_build_object(
    'total_billionaires', total_billionaires,
    'total_wealth_fcfa', total_wealth_fcfa,
    'total_wealth_usd', total_wealth_fcfa / 600,
    'pending_applications', pending_applications,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$;

-- Fix media analysis function
CREATE OR REPLACE FUNCTION public.analyze_media_content(p_source_id uuid, p_content_url text, p_title text DEFAULT NULL::text, p_content_text text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB := '{"status": "initiated", "analysis_id": null}';
  analysis_id UUID;
BEGIN
  -- Insert placeholder analysis record
  INSERT INTO public.media_content_analysis (
    source_id,
    content_url,
    title,
    content_text,
    bias_score,
    trust_score,
    ai_confidence
  ) VALUES (
    p_source_id,
    p_content_url,
    p_title,
    p_content_text,
    0, -- will be updated by AI analysis
    50, -- default trust score
    0.0 -- will be updated by AI
  ) RETURNING id INTO analysis_id;
  
  -- Update last monitored time for source
  UPDATE public.media_sources 
  SET last_monitored_at = now() 
  WHERE id = p_source_id;
  
  result := result || jsonb_build_object(
    'analysis_id', analysis_id,
    'source_id', p_source_id,
    'initiated_at', now()
  );
  
  RETURN result;
END;
$$;