-- Security Fix Migration: Add search_path to critical functions
-- This addresses the Function Search Path Mutable warnings

-- Fix the most critical functions that handle authentication and authorization
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SET search_path TO 'public';
ALTER FUNCTION public.is_admin(p_user_id uuid) SET search_path TO 'public';
ALTER FUNCTION public.enforce_user_roles_admin_only() SET search_path TO 'public';
ALTER FUNCTION public.log_security_event(p_event_type text, p_user_id uuid, p_details jsonb) SET search_path TO '';

-- Fix other high-priority security functions
ALTER FUNCTION public.calculate_profile_completion_score(p_user_id uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_similar_users(target_user_id uuid, limit_users integer) SET search_path TO 'public';
ALTER FUNCTION public.merge_duplicate_profiles(p_primary_profile_id uuid, p_duplicate_profile_ids uuid[]) SET search_path TO 'public';
ALTER FUNCTION public.safe_consolidate_user_profiles() SET search_path TO 'public';

-- Fix validation and sanitization functions
ALTER FUNCTION public.update_village_overall_rating() SET search_path TO 'public';
ALTER FUNCTION public.sanitize_message_trigger() SET search_path TO '';

-- Add security-focused RLS policy improvements
-- Strengthen user_roles policies to prevent privilege escalation
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- Ensure only admins can modify roles
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Only admins can manage roles" ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Add trigger to validate role expiry dates
CREATE OR REPLACE FUNCTION public.validate_role_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent expired roles from being activated
  IF NEW.is_active = true AND NEW.expires_at IS NOT NULL AND NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'Cannot activate expired role';
  END IF;
  
  -- Auto-deactivate expired roles
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= now() THEN
    NEW.is_active = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Add the trigger
DROP TRIGGER IF EXISTS validate_role_expiry_trigger ON public.user_roles;
CREATE TRIGGER validate_role_expiry_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_expiry();

-- Create secure search function to prevent SQL injection
CREATE OR REPLACE FUNCTION public.secure_political_search(
  search_query text,
  search_limit integer DEFAULT 20
) RETURNS TABLE (
  id uuid,
  entity_type text,
  name text,
  slug text,
  role_title text,
  region text,
  description text,
  profile_image_url text,
  logo_url text,
  performance_score numeric
) AS $$
DECLARE
  clean_query text;
BEGIN
  -- Sanitize input to prevent SQL injection
  clean_query := trim(lower(search_query));
  
  -- Validate input length
  IF length(clean_query) < 2 THEN
    RETURN;
  END IF;
  
  -- Escape special characters
  clean_query := replace(clean_query, '%', '\%');
  clean_query := replace(clean_query, '_', '\_');
  
  -- Return politicians
  RETURN QUERY
  SELECT 
    p.id,
    'politician'::text as entity_type,
    p.name,
    p.slug,
    p.role_title,
    p.region,
    p.description,
    p.profile_image_url,
    null::text as logo_url,
    p.performance_score
  FROM public.politicians p
  WHERE 
    p.name ILIKE '%' || clean_query || '%' OR
    p.role_title ILIKE '%' || clean_query || '%' OR
    p.region ILIKE '%' || clean_query || '%'
  LIMIT search_limit;
  
  -- Return political parties
  RETURN QUERY
  SELECT 
    pp.id,
    'party'::text as entity_type,
    pp.name,
    pp.slug,
    null::text as role_title,
    null::text as region,
    pp.description,
    null::text as profile_image_url,
    pp.logo_url,
    null::numeric as performance_score
  FROM public.political_parties pp
  WHERE 
    pp.is_active = true AND (
      pp.name ILIKE '%' || clean_query || '%' OR
      pp.description ILIKE '%' || clean_query || '%' OR
      pp.acronym ILIKE '%' || clean_query || '%'
    )
  LIMIT search_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.secure_political_search(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.secure_political_search(text, integer) TO anon;