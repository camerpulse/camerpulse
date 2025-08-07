-- Phase 6: Final RLS Policies for Confirmed Existing Tables

-- Shipping and logistics policies
CREATE POLICY "Shipping companies are publicly viewable" 
ON public.shipping_companies 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create shipping companies" 
ON public.shipping_companies 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Company owners can update their shipping company" 
ON public.shipping_companies 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Shipping company ratings policies
CREATE POLICY "Shipping ratings are publicly viewable" 
ON public.shipping_company_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create shipping ratings" 
ON public.shipping_company_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shipping ratings" 
ON public.shipping_company_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Shipments policies
CREATE POLICY "Users can view shipments they're involved in" 
ON public.shipments 
FOR SELECT 
USING (
  auth.uid() = sender_id OR 
  auth.uid() = recipient_id OR
  shipping_company_id IN (
    SELECT id FROM shipping_companies WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can create shipments" 
ON public.shipments 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Shipping companies can update their shipments" 
ON public.shipments 
FOR UPDATE 
USING (
  shipping_company_id IN (
    SELECT id FROM shipping_companies WHERE created_by = auth.uid()
  )
);

-- Fan clubs and engagement policies
CREATE POLICY "Fan clubs are publicly viewable" 
ON public.fan_clubs 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create fan clubs" 
ON public.fan_clubs 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Club creators can update their fan clubs" 
ON public.fan_clubs 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Fan club memberships policies
CREATE POLICY "Fan club memberships are publicly viewable" 
ON public.fan_club_memberships 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own fan club memberships" 
ON public.fan_club_memberships 
FOR ALL 
USING (auth.uid() = user_id);

-- Polls and voting policies
CREATE POLICY "Polls are publicly viewable" 
ON public.polls 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create polls" 
ON public.polls 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Poll creators can update their polls" 
ON public.polls 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Poll votes policies
CREATE POLICY "Poll votes are aggregated publicly" 
ON public.poll_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can vote on polls" 
ON public.poll_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Certificates policies
CREATE POLICY "Certificates are publicly viewable" 
ON public.certificates 
FOR SELECT 
USING (true);

CREATE POLICY "Users can view their own certificates" 
ON public.certificates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Issuers can create certificates" 
ON public.certificates 
FOR INSERT 
WITH CHECK (auth.uid() = issued_by);

-- Ticket purchases and events
CREATE POLICY "Users can view their own ticket purchases" 
ON public.ticket_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create ticket purchases" 
ON public.ticket_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- User presence policies
CREATE POLICY "User presence is publicly viewable" 
ON public.user_presence 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own presence" 
ON public.user_presence 
FOR ALL 
USING (auth.uid() = user_id);