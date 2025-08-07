-- Phase 5: RLS Policies for Admin, Security, and Config Tables

-- Plugin management policies
CREATE POLICY "Plugin configurations are publicly viewable" 
ON public.plugin_configurations 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only admins can manage plugin configurations" 
ON public.plugin_configurations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Plugin activation history policies (already exist)

-- Security and audit tables policies
-- Ashen security tests policies (already exist)

-- Notification preferences policies
CREATE POLICY "Users can manage their own notification preferences" 
ON public.notification_preferences 
FOR ALL 
USING (auth.uid() = user_id);

-- User WhatsApp preferences policies (already exist)

-- Contract and payment policies
CREATE POLICY "Users can view contracts they're party to" 
ON public.contracts 
FOR SELECT 
USING (
  auth.uid() = client_id OR 
  auth.uid() = contractor_id OR
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Users can create contracts as client or contractor" 
ON public.contracts 
FOR INSERT 
WITH CHECK (
  auth.uid() = client_id OR 
  auth.uid() = contractor_id
);

CREATE POLICY "Contract parties can update their contracts" 
ON public.contracts 
FOR UPDATE 
USING (
  auth.uid() = client_id OR 
  auth.uid() = contractor_id
);

-- Contract payments policies
CREATE POLICY "Contract parties can view payments" 
ON public.contract_payments 
FOR SELECT 
USING (
  contract_id IN (
    SELECT id FROM contracts 
    WHERE client_id = auth.uid() OR contractor_id = auth.uid()
  )
);

-- Royalty payments policies (already exist)

-- Payment gateway configs policies (already exist)

-- Diaspora and investment policies
CREATE POLICY "Users can manage their own diaspora profile" 
ON public.diaspora_profiles 
FOR ALL 
USING (auth.uid() = user_id);

-- Diaspora investment projects policies (already exist)

-- Election and political data policies
CREATE POLICY "Election calendar is publicly viewable" 
ON public.election_calendar 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage election calendar" 
ON public.election_calendar 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Policy tracker policies (already exist)

-- Election interference alerts policies (already exist)

-- Civic fusion alerts policies (already exist)

-- Media sources and content policies
CREATE POLICY "Media sources are publicly viewable" 
ON public.media_sources 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage media sources" 
ON public.media_sources 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Media content analysis policies
CREATE POLICY "Media analysis is publicly viewable" 
ON public.media_content_analysis 
FOR SELECT 
USING (true);

-- Trust feedback policies
CREATE POLICY "Trust feedback is aggregated publicly" 
ON public.trust_feedback_summary 
FOR SELECT 
USING (true);

-- User trust feedback policies (already exist)

-- Debt tracking policies
CREATE POLICY "Debt records are publicly viewable" 
ON public.debt_records 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage debt records" 
ON public.debt_records 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));