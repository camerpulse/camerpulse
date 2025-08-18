-- Security hardening for user_roles: prevent privilege escalation
-- 1) Helper function to check roles (SECURITY DEFINER, STABLE)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  );
$$;

-- Allow authenticated users to execute the function
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- 2) Ensure RLS is enabled on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3) READ policies
-- Users can view their own roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_roles' 
      AND policyname = 'Users can view their own roles'
  ) THEN
    CREATE POLICY "Users can view their own roles"
      ON public.user_roles
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Admins can view all roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_roles' 
      AND policyname = 'Admins can view all roles'
  ) THEN
    CREATE POLICY "Admins can view all roles"
      ON public.user_roles
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- 4) WRITE policies (AS RESTRICTIVE so they always apply)
-- Only admins can INSERT roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_roles' 
      AND policyname = 'Only admins can insert user_roles'
  ) THEN
    CREATE POLICY "Only admins can insert user_roles"
      AS RESTRICTIVE
      ON public.user_roles
      FOR INSERT
      TO authenticated
      WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- Only admins can UPDATE roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_roles' 
      AND policyname = 'Only admins can update user_roles'
  ) THEN
    CREATE POLICY "Only admins can update user_roles"
      AS RESTRICTIVE
      ON public.user_roles
      FOR UPDATE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::public.app_role))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- Only admins can DELETE roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_roles' 
      AND policyname = 'Only admins can delete user_roles'
  ) THEN
    CREATE POLICY "Only admins can delete user_roles"
      AS RESTRICTIVE
      ON public.user_roles
      FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- 5) Guard trigger to enforce admin-only modifications at the DB level
CREATE OR REPLACE FUNCTION public.enforce_user_roles_admin_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can modify user roles';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_user_roles_admin_only'
  ) THEN
    CREATE TRIGGER trg_user_roles_admin_only
    BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.enforce_user_roles_admin_only();
  END IF;
END $$;
