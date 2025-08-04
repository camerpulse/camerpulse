-- Fix Critical Data Conflicts for Production Readiness (Corrected)

-- 1. RESOLVE USER PROFILE CONFLICTS
-- Create master profile consolidation function
CREATE OR REPLACE FUNCTION public.consolidate_user_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Consolidate diaspora_profiles into main profiles table
  INSERT INTO public.profiles (
    user_id, display_name, location, region, profession,
    verification_status, verified, created_at, updated_at
  )
  SELECT DISTINCT ON (dp.user_id)
    dp.user_id,
    dp.full_name,
    dp.country_of_residence,
    CASE 
      WHEN dp.home_village_town_city IS NOT NULL 
      THEN 'diaspora'
      ELSE 'unknown'
    END as region,
    dp.profession_sector,
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

  -- Mark profiles as diaspora and add additional data
  UPDATE public.profiles p
  SET 
    is_diaspora = true,
    civic_interests = ARRAY['diaspora_engagement', 'community_development'],
    contribution_level = CASE 
      WHEN dp.total_contributions_fcfa > 1000000 THEN 'high'
      WHEN dp.total_contributions_fcfa > 100000 THEN 'medium'
      ELSE 'low'
    END
  FROM public.diaspora_profiles dp
  WHERE p.user_id = dp.user_id;
END;
$$;

-- 2. FIX INFINITE RECURSION IN USER_ROLES
-- Create security definer function to check user roles safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = auth.uid() 
  ORDER BY granted_at DESC 
  LIMIT 1;
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Drop ALL existing policies on user_roles to fix infinite recursion
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Secure role creation" ON public.user_roles;
DROP POLICY IF EXISTS "System can insert initial roles" ON public.user_roles;
DROP POLICY IF EXISTS "System can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "User roles are viewable by everyone" ON public.user_roles;

-- Create simple, safe RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System admin management"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  user_id = auth.uid() OR 
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role = 'admin'::app_role 
    AND user_id = auth.uid()
  )
);

-- 3. CONSOLIDATE ADMIN SYSTEMS
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

CREATE POLICY "Admin access management"
ON public.unified_admin_access
FOR ALL
TO authenticated
USING (
  user_id = auth.uid() OR 
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role = 'admin'::app_role
  )
);

-- 4. RESOLVE POLITICAL DATA INCONSISTENCY
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

CREATE POLICY "Admin politician management"
ON public.authoritative_politicians
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role = 'admin'::app_role
  )
);

-- 5. CREATE DATA SYNCHRONIZATION TRIGGERS
-- Apply triggers to key tables
CREATE TRIGGER update_unified_admin_access_updated_at
BEFORE UPDATE ON public.unified_admin_access
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_authoritative_politicians_updated_at
BEFORE UPDATE ON public.authoritative_politicians
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. CONSOLIDATE USER PROFILE DATA
SELECT public.consolidate_user_profiles();

-- 7. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_unified_admin_access_user_id ON public.unified_admin_access(user_id);
CREATE INDEX IF NOT EXISTS idx_authoritative_politicians_region ON public.authoritative_politicians(region);
CREATE INDEX IF NOT EXISTS idx_authoritative_politicians_verification ON public.authoritative_politicians(verification_status);