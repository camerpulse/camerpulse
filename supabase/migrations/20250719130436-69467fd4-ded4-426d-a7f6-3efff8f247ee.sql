-- CRITICAL SECURITY FIXES - Phase 1: Essential RLS Policies Only

-- Add missing RLS policies for unprotected tables

-- 1. Merchandise table RLS policies
ALTER TABLE public.merchandise ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view merchandise" ON public.merchandise
FOR SELECT USING (true);

CREATE POLICY "Admins can manage all merchandise" ON public.merchandise
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 2. Event organizers RLS policies
ALTER TABLE public.event_organizers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view event organizers" ON public.event_organizers
FOR SELECT USING (true);

CREATE POLICY "Admins can manage all event organizers" ON public.event_organizers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3. Event linked content RLS policies
ALTER TABLE public.event_linked_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view linked content" ON public.event_linked_content
FOR SELECT USING (true);

CREATE POLICY "Content creators can manage their content" ON public.event_linked_content
FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all linked content" ON public.event_linked_content
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 4. Poll options RLS policies
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view poll options" ON public.poll_options
FOR SELECT USING (true);

CREATE POLICY "Poll creators can manage their options" ON public.poll_options
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.polls p
    WHERE p.id = poll_options.poll_id AND p.creator_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all poll options" ON public.poll_options
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 5. Community events RLS policies
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published events" ON public.community_events
FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all community events" ON public.community_events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- CRITICAL: Prevent privilege escalation by securing user_roles table
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;

-- Only admins can update roles
CREATE POLICY "Only admins can update roles" ON public.user_roles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_roles ur2
    WHERE ur2.user_id = auth.uid() AND ur2.role = 'admin'
  )
);

-- Prevent privilege escalation in role creation
CREATE POLICY "Secure role creation" ON public.user_roles
FOR INSERT WITH CHECK (
  -- Users can only create 'user' role for themselves
  (auth.uid() = user_id AND role = 'user') OR
  -- Admins can create any role for others (not themselves)
  (EXISTS (
    SELECT 1 FROM user_roles ur2
    WHERE ur2.user_id = auth.uid() AND ur2.role = 'admin'
  ) AND auth.uid() != user_id)
);

-- Create role change audit table
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_by UUID NOT NULL,
  target_user UUID NOT NULL,
  old_role TEXT,
  new_role TEXT NOT NULL,
  reason TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view role audit" ON public.role_change_audit
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);