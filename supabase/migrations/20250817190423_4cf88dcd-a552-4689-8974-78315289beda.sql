-- CRITICAL: Fix infinite recursion in RLS policies
-- Remove problematic policies and create safe ones

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Staff can view their own record" ON public.shipping_company_staff;
DROP POLICY IF EXISTS "Company admins can manage staff" ON public.shipping_company_staff;
DROP POLICY IF EXISTS "Companies are publicly viewable" ON public.shipping_companies;
DROP POLICY IF EXISTS "Owners can manage their companies" ON public.shipping_companies;
DROP POLICY IF EXISTS "Customers can manage their own orders" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Vendors can view orders containing their products" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Users can view items in their orders" ON public.marketplace_order_items;

-- Create safe RLS policies without recursion
CREATE POLICY "Safe staff access" 
ON public.shipping_company_staff 
FOR ALL 
USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Safe company access" 
ON public.shipping_companies 
FOR SELECT 
USING (true);

CREATE POLICY "Safe company management" 
ON public.shipping_companies 
FOR ALL 
USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Safe order access" 
ON public.marketplace_orders 
FOR ALL 
USING (
  auth.uid() = customer_id OR 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Safe order items access" 
ON public.marketplace_order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.marketplace_orders 
    WHERE id = marketplace_order_items.order_id 
    AND customer_id = auth.uid()
  ) OR 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Add missing RLS policies for critical admin tables
CREATE POLICY "Admin access to activity logs" 
ON public.admin_activity_logs 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin access to alerts" 
ON public.admin_alerts 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Ensure admin_notifications table has proper policies
CREATE POLICY "Users can view their own admin notifications" 
ON public.admin_notifications 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all notifications" 
ON public.admin_notifications 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));