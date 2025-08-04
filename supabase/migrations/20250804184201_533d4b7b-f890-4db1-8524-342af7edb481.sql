-- Fix Critical Data Conflicts for Production Readiness (Final)

-- 1. FIX INFINITE RECURSION IN USER_ROLES FIRST
-- Drop ALL existing policies on user_roles to fix infinite recursion
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Secure role creation" ON public.user_roles;
DROP POLICY IF EXISTS "System can insert initial roles" ON public.user_roles;
Drop POLICY IF EXISTS "System can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "User roles are viewable by everyone" ON public.user_roles;

-- Create simple, safe RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert their own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND role = 'user'::app_role);

-- 2. CONSOLIDATE ADMIN SYSTEMS
-- Create unified admin access table
CREATE TABLE IF NOT EXISTS public.unified_admin_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_level integer NOT NULL DEFAULT 1 CHECK (admin_level BETWEEN 1 AND 5),
  permissions jsonb NOT NULL DEFAULT '{}',
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  access_reason text,
  last_accessed timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on unified_admin_access
ALTER TABLE public.unified_admin_access ENABLE ROW LEVEL SECURITY;

-- Create policies for unified admin access
CREATE POLICY "Users can view their own admin access"
ON public.unified_admin_access
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3. RESOLVE POLITICAL DATA INCONSISTENCY
-- Create authoritative politicians table
CREATE TABLE IF NOT EXISTS public.authoritative_politicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  position_title text NOT NULL,
  political_party_id uuid REFERENCES public.political_parties(id),
  constituency text,
  region text NOT NULL,
  term_start_date date,
  term_end_date date,
  is_current boolean NOT NULL DEFAULT true,
  verification_status text NOT NULL DEFAULT 'pending',
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamp with time zone,
  data_sources jsonb NOT NULL DEFAULT '[]',
  confidence_score numeric DEFAULT 0.0 CHECK (confidence_score BETWEEN 0.0 AND 1.0),
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on authoritative_politicians
ALTER TABLE public.authoritative_politicians ENABLE ROW LEVEL SECURITY;

-- Create policies for authoritative politicians
CREATE POLICY "Politicians are publicly viewable"
ON public.authoritative_politicians
FOR SELECT
TO authenticated
USING (verification_status = 'verified');

-- 4. CREATE CONFLICT RESOLUTION FUNCTIONS
-- Function to safely consolidate user profiles without constraint violations
CREATE OR REPLACE FUNCTION public.safe_consolidate_user_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update existing profiles with diaspora data safely
  UPDATE public.profiles p
  SET 
    is_diaspora = true,
    civic_interests = CASE 
      WHEN p.civic_interests IS NULL OR array_length(p.civic_interests, 1) IS NULL
      THEN ARRAY['diaspora_engagement', 'community_development']
      ELSE p.civic_interests || ARRAY['diaspora_engagement', 'community_development']
    END
  FROM public.diaspora_profiles dp
  WHERE p.user_id = dp.user_id
    AND NOT p.is_diaspora; -- Only update if not already marked as diaspora

  -- Insert new profiles for diaspora users who don't have profiles yet
  INSERT INTO public.profiles (
    user_id, display_name, location, is_diaspora,
    verification_status, verified, created_at, updated_at
  )
  SELECT DISTINCT ON (dp.user_id)
    dp.user_id,
    dp.full_name,
    dp.country_of_residence,
    true,
    CASE 
      WHEN dp.verified_by_consulate THEN 'verified'::verification_status
      ELSE 'pending'::verification_status
    END,
    dp.verified_by_consulate,
    dp.created_at,
    dp.updated_at
  FROM public.diaspora_profiles dp
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = dp.user_id
  );
END;
$$;

-- 5. RUN SAFE CONSOLIDATION
SELECT public.safe_consolidate_user_profiles();

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_unified_admin_access_user_id ON public.unified_admin_access(user_id);
CREATE INDEX IF NOT EXISTS idx_authoritative_politicians_region ON public.authoritative_politicians(region);
CREATE INDEX IF NOT EXISTS idx_authoritative_politicians_verification ON public.authoritative_politicians(verification_status);

-- 7. CREATE DATA SYNCHRONIZATION TRIGGERS
CREATE TRIGGER update_unified_admin_access_updated_at
BEFORE UPDATE ON public.unified_admin_access
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_authoritative_politicians_updated_at
BEFORE UPDATE ON public.authoritative_politicians
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();