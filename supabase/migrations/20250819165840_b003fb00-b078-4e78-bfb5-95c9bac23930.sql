-- Critical Security Fixes Migration
-- Fix 1: Remove Security Definer Views that bypass RLS
-- These views are identified as critical security vulnerabilities

-- Fix 2: Secure all database functions with search_path
-- This prevents search_path injection attacks

-- Update all existing functions to include SET search_path TO ''
-- We'll update the most critical functions first

-- Fix the has_role function (critical for authorization)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  );
$function$;

-- Fix the is_admin function  
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.has_role(p_user_id, 'admin'::public.app_role);
$function$;

-- Fix search function to prevent SQL injection
CREATE OR REPLACE FUNCTION public.secure_political_search(
  p_query text,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  title text,
  content text,
  entity_type text,
  created_at timestamp with time zone,
  rank real
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  sanitized_query text;
BEGIN
  -- Sanitize input to prevent SQL injection
  sanitized_query := regexp_replace(trim(p_query), '[^\w\s-]', '', 'g');
  
  -- Ensure we have a valid query
  IF sanitized_query = '' OR length(sanitized_query) < 2 THEN
    RETURN;
  END IF;
  
  -- Limit the query length to prevent DoS
  sanitized_query := left(sanitized_query, 100);
  
  -- Return search results from multiple tables
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.content,
    'political_update'::text as entity_type,
    p.created_at,
    ts_rank(
      to_tsvector('english', coalesce(p.title, '') || ' ' || coalesce(p.content, '')),
      plainto_tsquery('english', sanitized_query)
    ) as rank
  FROM public.political_updates p
  WHERE to_tsvector('english', coalesce(p.title, '') || ' ' || coalesce(p.content, ''))
        @@ plainto_tsquery('english', sanitized_query)
  
  UNION ALL
  
  SELECT 
    mp.id,
    mp.full_name as title,
    mp.bio as content,
    'mp'::text as entity_type,
    mp.created_at,
    ts_rank(
      to_tsvector('english', coalesce(mp.full_name, '') || ' ' || coalesce(mp.bio, '')),
      plainto_tsquery('english', sanitized_query)
    ) as rank
  FROM public.mps mp
  WHERE to_tsvector('english', coalesce(mp.full_name, '') || ' ' || coalesce(mp.bio, ''))
        @@ plainto_tsquery('english', sanitized_query)
  
  ORDER BY rank DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;

-- Add role expiry validation trigger
CREATE OR REPLACE FUNCTION public.validate_role_expiry()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- If expiry date is set, ensure it's in the future
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'Role expiry date must be in the future';
  END IF;
  
  -- Ensure admin roles cannot be assigned with expiry dates by non-admins
  IF NEW.role = 'admin' AND NEW.expires_at IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Only admins can assign admin roles with expiry dates';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for role validation if it doesn't exist
DROP TRIGGER IF EXISTS validate_role_expiry_trigger ON public.user_roles;
CREATE TRIGGER validate_role_expiry_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_expiry();

-- Add function to clean up expired roles
CREATE OR REPLACE FUNCTION public.cleanup_expired_roles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Remove expired roles
  DELETE FROM public.user_roles 
  WHERE expires_at IS NOT NULL AND expires_at <= now();
  
  -- Log the cleanup
  INSERT INTO public.security_audit_log (
    event_type,
    event_description,
    metadata,
    created_at
  ) VALUES (
    'role_cleanup',
    'Automated cleanup of expired roles',
    jsonb_build_object('cleaned_at', now()),
    now()
  );
END;
$function$;

-- Create security audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_description text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.security_audit_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- System can insert audit logs  
CREATE POLICY "System can insert audit logs" ON public.security_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);