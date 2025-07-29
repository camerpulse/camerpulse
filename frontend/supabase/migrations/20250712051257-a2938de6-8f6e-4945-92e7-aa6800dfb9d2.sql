-- Fix infinite recursion in user_roles policy
-- Drop the problematic policy completely
DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;

-- Create a new policy that doesn't cause recursion
CREATE POLICY "Only admins can manage user roles" ON public.user_roles
FOR ALL USING (
  -- Allow the user to see their own roles
  auth.uid() = user_id
  OR
  -- Allow admins to see all roles (using the security definer function)
  public.has_role(auth.uid(), 'admin'::app_role)
);