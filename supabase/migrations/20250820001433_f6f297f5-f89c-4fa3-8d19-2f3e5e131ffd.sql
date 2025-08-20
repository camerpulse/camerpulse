-- Attempt to fix remaining recursive RLS policies with a lighter approach
-- This avoids heavy table locks by targeting specific problematic policies

-- Fix the government agency users recursive reference issue
-- The current policy references itself in the WHERE clause
DROP POLICY IF EXISTS "Agency users can view their agency members" ON public.government_agency_users;
CREATE POLICY "Agency users can view their agency members"
  ON public.government_agency_users
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_agency_member(agency_id));

-- Add a simpler policy for agency responses to avoid recursion
DROP POLICY IF EXISTS "Agency users can manage their responses" ON public.agency_responses;
CREATE POLICY "Agency users can manage their responses"
  ON public.agency_responses
  FOR ALL
  USING (public.is_agency_member(agency_id))
  WITH CHECK (public.is_agency_member(agency_id));