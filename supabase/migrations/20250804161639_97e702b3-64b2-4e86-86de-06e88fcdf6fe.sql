-- Phase 2: Fix critical security policies (simplified)

-- Ensure user_roles table has proper security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "System can insert initial roles" ON public.user_roles;

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Only admins can manage roles  
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    )
  );

-- System can insert roles for new users
CREATE POLICY "System can insert initial roles" ON public.user_roles
  FOR INSERT WITH CHECK (true);

-- Fix security_audit_logs policies
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_logs;
CREATE POLICY "System and authenticated users can insert audit logs" ON public.security_audit_logs
  FOR INSERT WITH CHECK (true);

-- Add update policy for admin management of audit logs
CREATE POLICY "Admins can update audit logs" ON public.security_audit_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );