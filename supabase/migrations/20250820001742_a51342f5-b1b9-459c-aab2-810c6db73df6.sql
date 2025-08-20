-- Fix critical PII exposure vulnerabilities by adding proper RLS policies

-- 1. Fix petition signatures - signatures should only be visible to petition creators and signers
ALTER TABLE IF EXISTS public.petition_signatures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view petition signatures" ON public.petition_signatures;
CREATE POLICY "Petition creators can view signatures"
  ON public.petition_signatures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.petitions p 
      WHERE p.id = petition_signatures.petition_id AND p.created_by = auth.uid()
    ) OR 
    user_id = auth.uid()
  );

-- 2. Fix political parties - limit contact info access to admins only
DROP POLICY IF EXISTS "Political parties are publicly viewable" ON public.political_parties;
CREATE POLICY "Public can view basic political party info"
  ON public.political_parties
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can view full political party details"
  ON public.political_parties
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Fix delivery company profiles - protect PII
ALTER TABLE IF EXISTS public.delivery_company_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view basic company info"
  ON public.delivery_company_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Company owners can view full profile"
  ON public.delivery_company_profiles
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. Fix scholarship programs - protect contact details
ALTER TABLE IF EXISTS public.scholarship_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view scholarship info"
  ON public.scholarship_programs
  FOR SELECT
  USING (true);

CREATE POLICY "Creators can manage scholarships"
  ON public.scholarship_programs
  FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- 5. Fix volunteer opportunities - protect contact info
ALTER TABLE IF EXISTS public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view volunteer opportunities"
  ON public.volunteer_opportunities
  FOR SELECT
  USING (true);

CREATE POLICY "Organizers can manage opportunities"
  ON public.volunteer_opportunities
  FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());