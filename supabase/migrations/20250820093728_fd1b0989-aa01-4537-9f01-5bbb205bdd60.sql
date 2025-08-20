-- Create policies on government_agency_users
DO $$
BEGIN
  IF to_regclass('public.government_agency_users') IS NOT NULL THEN
    EXECUTE 'CREATE POLICY "Users manage their own agency rows" ON public.government_agency_users FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Admins manage all agency users" ON public.government_agency_users FOR ALL USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))';
  END IF;
END $$;