-- Fix infinite recursion in RLS policies and add missing RLS policies
-- This addresses the critical security gaps identified in the linter

-- 1. Fix infinite recursion in shipping_company_staff
DROP POLICY IF EXISTS "Staff can manage their company data" ON public.shipping_company_staff;
DROP POLICY IF EXISTS "Company owners can manage staff" ON public.shipping_company_staff;

-- Create security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_company_role(p_user_id uuid)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.shipping_company_staff 
  WHERE user_id = p_user_id AND is_active = true
  LIMIT 1;
$$;

-- Recreate policies without recursion
CREATE POLICY "Staff can view their own record" 
ON public.shipping_company_staff 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Company admins can manage staff" 
ON public.shipping_company_staff 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.shipping_companies sc
    WHERE sc.id = shipping_company_staff.company_id 
    AND sc.created_by = auth.uid()
  )
);

-- 2. Fix infinite recursion in shipping_companies
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON public.shipping_companies;
DROP POLICY IF EXISTS "Company owners can update" ON public.shipping_companies;

CREATE POLICY "Companies are publicly viewable" 
ON public.shipping_companies 
FOR SELECT 
USING (true);

CREATE POLICY "Owners can manage their companies" 
ON public.shipping_companies 
FOR ALL 
USING (created_by = auth.uid());

-- 3. Fix infinite recursion in marketplace_orders
DROP POLICY IF EXISTS "Users can manage their orders" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Vendors can view orders for their products" ON public.marketplace_orders;

CREATE POLICY "Customers can manage their own orders" 
ON public.marketplace_orders 
FOR ALL 
USING (customer_id = auth.uid());

CREATE POLICY "Vendors can view orders containing their products" 
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

-- 4. Fix infinite recursion in marketplace_order_items
DROP POLICY IF EXISTS "Order items follow order permissions" ON public.marketplace_order_items;

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

-- 5. Fix infinite recursion in company_team_members
DROP POLICY IF EXISTS "Team members can view company data" ON public.company_team_members;

CREATE POLICY "Users can view their own team membership" 
ON public.company_team_members 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Company owners can manage team members" 
ON public.company_team_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = company_team_members.company_id
    AND c.created_by = auth.uid()
  )
);

-- 6. Fix infinite recursion in government_agency_users
DROP POLICY IF EXISTS "Agency users can view agency data" ON public.government_agency_users;

CREATE POLICY "Users can view their own agency membership" 
ON public.government_agency_users 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Agency admins can manage users" 
ON public.government_agency_users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

-- 7. Add missing RLS policies for tables that have RLS enabled but no policies

-- Add policies for tables identified in linter scan
CREATE POLICY "Public read access" ON public.api_configurations FOR SELECT USING (true);
CREATE POLICY "Admin manage access" ON public.api_configurations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read access" ON public.analytics_events FOR SELECT USING (true);
CREATE POLICY "Users can create their events" ON public.analytics_events FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their certificates" ON public.certificates FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create certificates" ON public.certificates FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public read access" ON public.civic_events_calendar FOR SELECT USING (true);
CREATE POLICY "Admin manage access" ON public.civic_events_calendar FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view their connections" ON public.profile_connections FOR ALL USING (
  requester_id = auth.uid() OR receiver_id = auth.uid()
);

CREATE POLICY "Users can manage their views" ON public.profile_views FOR ALL USING (viewer_id = auth.uid());

-- Create missing tables and policies for economic data
CREATE TABLE IF NOT EXISTS public.economic_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_name text NOT NULL,
  value numeric NOT NULL,
  unit text,
  year integer NOT NULL,
  quarter integer,
  source text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.economic_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Economic indicators are publicly viewable" 
ON public.economic_indicators 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage economic indicators" 
ON public.economic_indicators 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Add update trigger
CREATE TRIGGER update_economic_indicators_updated_at
  BEFORE UPDATE ON public.economic_indicators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();