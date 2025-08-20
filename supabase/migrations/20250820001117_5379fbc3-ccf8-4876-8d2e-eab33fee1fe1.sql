-- Fix infinite recursion in RLS policies by creating security definer functions

-- 1. Create security definer function to check user company admin role
CREATE OR REPLACE FUNCTION public.is_company_admin_for_team_member(company_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies 
    WHERE id = company_id_param AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.company_team_members 
    WHERE company_id = company_id_param 
      AND user_id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
  );
$$;

-- 2. Create security definer function to check government agency membership
CREATE OR REPLACE FUNCTION public.is_agency_member(agency_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.government_agency_users 
    WHERE user_id = auth.uid() AND agency_id = agency_id_param
  );
$$;

-- 3. Create security definer function to check shipping company staff membership
CREATE OR REPLACE FUNCTION public.is_shipping_company_staff(company_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shipping_company_staff 
    WHERE user_id = auth.uid() AND company_id = company_id_param
  );
$$;

-- 4. Create security definer function to check marketplace order ownership
CREATE OR REPLACE FUNCTION public.owns_marketplace_order(order_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.marketplace_orders 
    WHERE id = order_id_param AND customer_id = auth.uid()
  );
$$;