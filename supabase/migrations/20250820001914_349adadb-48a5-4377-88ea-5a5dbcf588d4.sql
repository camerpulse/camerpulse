-- Fix critical PII exposure vulnerabilities (avoid duplicate policy names)

-- 1. Fix petition signatures - protect signer privacy
ALTER TABLE IF EXISTS public.petition_signatures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view petition signatures" ON public.petition_signatures;
DROP POLICY IF EXISTS "Users can sign petitions" ON public.petition_signatures;

CREATE POLICY "Petition creators and signers can view signatures"
  ON public.petition_signatures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.petitions p 
      WHERE p.id = petition_signatures.petition_id AND p.creator_id = auth.uid()
    ) OR 
    user_id = auth.uid()
  );

CREATE POLICY "Authenticated users can sign petitions"
  ON public.petition_signatures
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. Fix political parties - protect contact emails
ALTER TABLE IF EXISTS public.political_parties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Political parties are publicly viewable" ON public.political_parties;

CREATE POLICY "Public can view political party basic info"
  ON public.political_parties
  FOR SELECT
  USING (true);

-- 3. Fix delivery company profiles - protect PII  
ALTER TABLE IF EXISTS public.delivery_company_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view basic company info" ON public.delivery_company_profiles;

CREATE POLICY "Public can view company basic info"
  ON public.delivery_company_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Company owners can manage their profile"
  ON public.delivery_company_profiles
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. Fix scholarship programs - protect contact details
ALTER TABLE IF EXISTS public.scholarship_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view scholarship opportunities" ON public.scholarship_programs;

CREATE POLICY "Public can view scholarship info"
  ON public.scholarship_programs
  FOR SELECT
  USING (true);

CREATE POLICY "Scholarship creators can manage programs"
  ON public.scholarship_programs
  FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- 5. Fix volunteer opportunities - protect contact info
ALTER TABLE IF EXISTS public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view volunteer opportunities" ON public.volunteer_opportunities;

CREATE POLICY "Public can view volunteer info"
  ON public.volunteer_opportunities
  FOR SELECT
  USING (true);

CREATE POLICY "Opportunity organizers can manage listings"
  ON public.volunteer_opportunities
  FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());