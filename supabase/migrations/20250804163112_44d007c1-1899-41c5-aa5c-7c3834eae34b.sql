-- Fix infinite recursion in user_roles policy
-- Drop the problematic policies and recreate them correctly

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (true);