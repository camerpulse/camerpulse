-- Fix critical RLS policy gaps for core tables
-- Add missing RLS policies for tables that have RLS enabled but no policies

-- Politicians table policies
CREATE POLICY IF NOT EXISTS "Politicians are publicly viewable" 
ON public.politicians FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS "Admins can manage politicians" 
ON public.politicians FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Villages table policies  
CREATE POLICY IF NOT EXISTS "Villages are publicly viewable"
ON public.villages FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can suggest village updates"
ON public.villages FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Companies table policies
CREATE POLICY IF NOT EXISTS "Companies are publicly viewable"
ON public.companies FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Company owners can update their profiles"
ON public.companies FOR UPDATE
USING (auth.uid() = owner_user_id);

-- Schools table policies
CREATE POLICY IF NOT EXISTS "Schools are publicly viewable"
ON public.schools FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can add schools"
ON public.schools FOR INSERT
WITH CHECK (auth.uid() = submitted_by);

-- Messages table policies
CREATE POLICY IF NOT EXISTS "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM conversation_participants cp
  WHERE cp.conversation_id = messages.conversation_id 
  AND cp.user_id = auth.uid()
));

CREATE POLICY IF NOT EXISTS "Users can send messages to their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id 
    AND cp.user_id = auth.uid()
  )
);