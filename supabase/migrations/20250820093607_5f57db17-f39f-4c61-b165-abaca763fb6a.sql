-- Create policies on company_team_members (retry serialized)
DO $$
BEGIN
  IF to_regclass('public.company_team_members') IS NOT NULL THEN
    EXECUTE 'CREATE POLICY "Users manage their own membership rows" ON public.company_team_members FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Admins manage all memberships" ON public.company_team_members FOR ALL USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))';
  END IF;
END $$;