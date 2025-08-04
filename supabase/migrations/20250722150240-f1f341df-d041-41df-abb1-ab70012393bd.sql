-- Fix critical security issues identified in security review

-- 1. Fix search_path security issues in functions
-- Update all functions to use secure search_path

-- Fix get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  SET search_path = '';
  RETURN (SELECT role::text FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fix update_politician_term_status function  
CREATE OR REPLACE FUNCTION public.update_politician_term_status(p_politician_id uuid, p_new_status text, p_reason text DEFAULT NULL::text)
RETURNS boolean AS $$
BEGIN
  SET search_path = '';
  
  -- Update politician status
  UPDATE public.politicians 
  SET term_status = p_new_status, updated_at = now()
  WHERE id = p_politician_id;
  
  -- Log the change in office history
  INSERT INTO public.office_history (
    politician_id, office_type, status_change, reason, changed_at
  ) VALUES (
    p_politician_id, 'unknown', p_new_status, p_reason, now()
  );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix create_default_notification_settings function
CREATE OR REPLACE FUNCTION public.create_default_notification_settings()
RETURNS trigger AS $$
BEGIN
  SET search_path = '';
  
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_billionaire_stats function
CREATE OR REPLACE FUNCTION public.get_billionaire_stats()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  total_billionaires integer;
  total_wealth_fcfa bigint;
  pending_applications integer;
BEGIN
  SET search_path = '';
  
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix analyze_media_content function
CREATE OR REPLACE FUNCTION public.analyze_media_content(p_source_id uuid, p_content_url text, p_title text DEFAULT NULL::text, p_content_text text DEFAULT NULL::text)
RETURNS jsonb AS $$
DECLARE
  result JSONB := '{"status": "initiated", "analysis_id": null}';
  analysis_id UUID;
BEGIN
  SET search_path = '';
  
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
$$ LANGUAGE plpgsql SECURITY DEFINER;