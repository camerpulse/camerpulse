-- Recreate safe, non-recursive policies on company_team_members
DO $$
BEGIN
  IF to_regclass('public.company_team_members') IS NOT NULL THEN
    EXECUTE 'CREATE POLICY "Users manage their own membership rows" ON public.company_team_members FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Admins manage all memberships" ON public.company_team_members FOR ALL USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))';
  END IF;
END $$;

-- Recreate safe, non-recursive policies on government_agency_users
DO $$
BEGIN
  IF to_regclass('public.government_agency_users') IS NOT NULL THEN
    EXECUTE 'CREATE POLICY "Users manage their own agency rows" ON public.government_agency_users FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Admins manage all agency users" ON public.government_agency_users FOR ALL USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))';
  END IF;
END $$;