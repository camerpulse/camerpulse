-- Drop existing policies on problematic tables to resolve infinite recursion
DO $$
DECLARE
  pol record;
BEGIN
  IF to_regclass('public.company_team_members') IS NOT NULL THEN
    FOR pol IN 
      SELECT policyname FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'company_team_members'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.company_team_members', pol.policyname);
    END LOOP;
    -- Ensure RLS is enabled
    EXECUTE 'ALTER TABLE public.company_team_members ENABLE ROW LEVEL SECURITY';
  END IF;

  IF to_regclass('public.government_agency_users') IS NOT NULL THEN
    FOR pol IN 
      SELECT policyname FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'government_agency_users'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.government_agency_users', pol.policyname);
    END LOOP;
    -- Ensure RLS is enabled
    EXECUTE 'ALTER TABLE public.government_agency_users ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;