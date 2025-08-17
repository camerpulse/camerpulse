-- Fix RLS policies with correct column references

-- Clean up and recreate RLS policies properly
DO $$
BEGIN
    -- Drop existing problematic policies
    DROP POLICY IF EXISTS "Staff can view their own record" ON public.shipping_company_staff;
    DROP POLICY IF EXISTS "Company admins can manage staff" ON public.shipping_company_staff;
    DROP POLICY IF EXISTS "Companies are publicly viewable" ON public.shipping_companies;
    DROP POLICY IF EXISTS "Owners can manage their companies" ON public.shipping_companies;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_shipping_company_role(p_user_id uuid, p_company_id uuid)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.shipping_company_staff 
  WHERE user_id = p_user_id AND company_id = p_company_id AND is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_shipping_company_owner(p_user_id uuid, p_company_id uuid)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT user_id = p_user_id FROM public.shipping_companies WHERE id = p_company_id;
$$;

-- Create proper RLS policies
CREATE POLICY "Staff can view their own record" 
ON public.shipping_company_staff 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Staff can update their own record" 
ON public.shipping_company_staff 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Company owners can manage staff" 
ON public.shipping_company_staff 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.shipping_companies sc
    WHERE sc.id = shipping_company_staff.company_id 
    AND sc.user_id = auth.uid()
  )
);

CREATE POLICY "Companies are publicly viewable" 
ON public.shipping_companies 
FOR SELECT 
USING (true);

CREATE POLICY "Company owners can manage their companies" 
ON public.shipping_companies 
FOR ALL 
USING (user_id = auth.uid());

-- Fix marketplace policies with proper column references
DROP POLICY IF EXISTS "Customers can manage their own orders" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Vendors can view orders containing their products" ON public.marketplace_orders;

CREATE POLICY "Customers can manage their own orders" 
ON public.marketplace_orders 
FOR ALL 
USING (customer_id = auth.uid());

CREATE POLICY "Vendors can view orders for their products" 
ON public.marketplace_orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.marketplace_order_items moi
    JOIN public.marketplace_products mp ON moi.product_id = mp.id
    WHERE moi.order_id = marketplace_orders.id
    AND mp.vendor_id = auth.uid()
  )
);

-- Fix marketplace order items
DROP POLICY IF EXISTS "Users can view items in their orders" ON public.marketplace_order_items;

CREATE POLICY "Users can view items in their orders" 
ON public.marketplace_order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.marketplace_orders mo
    WHERE mo.id = marketplace_order_items.order_id
    AND mo.customer_id = auth.uid()
  )
);

-- Add policies for critical tables that need them
CREATE POLICY "Public read access for analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (true);

CREATE POLICY "Users can track their own events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Add policies for certificates
CREATE POLICY "Users can view their own certificates" 
ON public.certificates 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create certificates" 
ON public.certificates 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Add policies for civic events calendar
CREATE POLICY "Civic events are publicly readable" 
ON public.civic_events_calendar 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage civic events" 
ON public.civic_events_calendar 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);