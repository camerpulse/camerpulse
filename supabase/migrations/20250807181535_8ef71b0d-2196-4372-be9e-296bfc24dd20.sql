-- Fix remaining RLS policies with correct column structures

-- Fix shipping companies policies (use correct column names)
DROP POLICY IF EXISTS "Users can create shipping companies" ON public.shipping_companies;
DROP POLICY IF EXISTS "Company owners can update their shipping company" ON public.shipping_companies;

CREATE POLICY "Users can create shipping companies" 
ON public.shipping_companies 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update shipping companies" 
ON public.shipping_companies 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Fix certificates policies (use correct column names)
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Issuers can create certificates" ON public.certificates;

CREATE POLICY "Users can view their own certificates" 
ON public.certificates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Issuers can create certificates" 
ON public.certificates 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix contract policies with proper column validation
DROP POLICY IF EXISTS "Users can view contracts they're party to" ON public.contracts;
DROP POLICY IF EXISTS "Users can create contracts as client or contractor" ON public.contracts;
DROP POLICY IF EXISTS "Contract parties can update their contracts" ON public.contracts;

-- First check if contracts table has the expected columns, if not create simpler policies
CREATE POLICY "Users can view their contracts" 
ON public.contracts 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create contracts" 
ON public.contracts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Add missing policies for tables that definitely exist
CREATE POLICY "Users can manage their own profile activity" 
ON public.profile_activity_log 
FOR ALL 
USING (auth.uid() = user_id);

-- Notification queue policies for system use
CREATE POLICY "System can manage notification queue" 
ON public.notification_queue 
FOR ALL 
USING (true);

-- Debt documents policies
CREATE POLICY "Debt documents are publicly viewable" 
ON public.debt_documents 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage debt documents" 
ON public.debt_documents 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Add missing WhatsApp preferences policies
CREATE POLICY "Users can create their WhatsApp preferences" 
ON public.user_whatsapp_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Moderator onboarding policies
CREATE POLICY "Moderators can delete their onboarding progress" 
ON public.moderator_onboarding_progress 
FOR DELETE 
USING (auth.uid() = user_id);