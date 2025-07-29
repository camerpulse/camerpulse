-- CRITICAL SECURITY FIXES - Phase 1: RLS Policies and Role Protection

-- Add missing RLS policies for unprotected tables

-- 1. Merchandise table RLS policies
ALTER TABLE public.merchandise ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active merchandise" ON public.merchandise
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage merchandise" ON public.merchandise
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 2. Event organizers RLS policies  
ALTER TABLE public.event_organizers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view event organizers" ON public.event_organizers
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own organizer profiles" ON public.event_organizers
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all organizers" ON public.event_organizers
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

CREATE POLICY "Event organizers can manage their content" ON public.event_linked_content
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.event_organizers eo
    JOIN public.events e ON e.organizer_id = eo.id
    WHERE eo.user_id = auth.uid() AND e.id = event_linked_content.event_id
  )
);

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
    WHERE p.id = poll_options.poll_id AND p.created_by = auth.uid()
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

CREATE POLICY "Users can create community events" ON public.community_events
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Event creators can manage their events" ON public.community_events
FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Event creators can delete their events" ON public.community_events
FOR DELETE USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all community events" ON public.community_events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- CRITICAL: Fix role escalation vulnerability
-- Prevent users from updating their own roles directly

-- Create security definer function to safely update roles (admin only)
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id UUID,
  new_role app_role,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_role app_role;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_user_role
  FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin';
  
  IF current_user_role IS NULL THEN
    RAISE EXCEPTION 'Only admins can update user roles';
  END IF;
  
  -- Prevent self-role changes for additional security
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Users cannot change their own roles';
  END IF;
  
  -- Update the role
  UPDATE public.user_roles 
  SET role = new_role, updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Log the role change
  INSERT INTO public.role_change_audit (
    changed_by, target_user, old_role, new_role, reason, changed_at
  ) VALUES (
    auth.uid(), target_user_id, 
    (SELECT role FROM public.user_roles WHERE user_id = target_user_id),
    new_role, reason, now()
  );
  
  RETURN TRUE;
END;
$$;

-- Create audit table for role changes
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_by UUID NOT NULL,
  target_user UUID NOT NULL,
  old_role app_role,
  new_role app_role NOT NULL,
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

-- Restrict direct updates to user_roles table
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;

-- Only allow role updates through the secure function or by admins
CREATE POLICY "Only admins can directly update roles" ON public.user_roles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_roles ur2
    WHERE ur2.user_id = auth.uid() AND ur2.role = 'admin'
  )
);

-- Prevent users from inserting admin roles for themselves
CREATE POLICY "Restrict role creation" ON public.user_roles
FOR INSERT WITH CHECK (
  -- Users can only create 'user' role for themselves
  (auth.uid() = user_id AND role = 'user') OR
  -- Or admins can create any role for anyone
  EXISTS (
    SELECT 1 FROM user_roles ur2
    WHERE ur2.user_id = auth.uid() AND ur2.role = 'admin'
  )
);