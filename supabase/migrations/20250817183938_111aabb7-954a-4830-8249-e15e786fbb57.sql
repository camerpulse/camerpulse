-- Fix RLS policies incrementally - check existing and update carefully

-- First, let's check for existing policies and drop/recreate them safely
DO $$
BEGIN
    -- Drop problematic policies if they exist
    DROP POLICY IF EXISTS "Staff can manage their company data" ON public.shipping_company_staff;
    DROP POLICY IF EXISTS "Company owners can manage staff" ON public.shipping_company_staff;
    DROP POLICY IF EXISTS "Companies are viewable by everyone" ON public.shipping_companies;
    DROP POLICY IF EXISTS "Company owners can update" ON public.shipping_companies;
    DROP POLICY IF EXISTS "Users can manage their orders" ON public.marketplace_orders;
    DROP POLICY IF EXISTS "Vendors can view orders for their products" ON public.marketplace_orders;
    DROP POLICY IF EXISTS "Order items follow order permissions" ON public.marketplace_order_items;
    DROP POLICY IF EXISTS "Team members can view company data" ON public.company_team_members;
    DROP POLICY IF EXISTS "Agency users can view agency data" ON public.government_agency_users;
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if policies don't exist
    NULL;
END $$;

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

-- Now create new policies without conflicts
DO $$
BEGIN
    -- Only create if doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'shipping_company_staff' 
        AND policyname = 'Staff can view their own record'
    ) THEN
        EXECUTE 'CREATE POLICY "Staff can view their own record" ON public.shipping_company_staff FOR SELECT USING (user_id = auth.uid())';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'shipping_company_staff' 
        AND policyname = 'Company admins can manage staff'
    ) THEN
        EXECUTE 'CREATE POLICY "Company admins can manage staff" ON public.shipping_company_staff FOR ALL USING (EXISTS (SELECT 1 FROM public.shipping_companies sc WHERE sc.id = shipping_company_staff.company_id AND sc.created_by = auth.uid()))';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'shipping_companies' 
        AND policyname = 'Companies are publicly viewable'
    ) THEN
        EXECUTE 'CREATE POLICY "Companies are publicly viewable" ON public.shipping_companies FOR SELECT USING (true)';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'shipping_companies' 
        AND policyname = 'Owners can manage their companies'
    ) THEN
        EXECUTE 'CREATE POLICY "Owners can manage their companies" ON public.shipping_companies FOR ALL USING (created_by = auth.uid())';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'marketplace_orders' 
        AND policyname = 'Customers can manage their own orders'
    ) THEN
        EXECUTE 'CREATE POLICY "Customers can manage their own orders" ON public.marketplace_orders FOR ALL USING (customer_id = auth.uid())';
    END IF;

END $$;