-- Reduce lock wait to avoid deadlocks
SET lock_timeout = '1s';

-- Create helper functions to break RLS recursion cycles
CREATE OR REPLACE FUNCTION public.is_company_owner(company_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies 
    WHERE id = company_id_param AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_vendor_of_order(order_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.marketplace_order_items moi
    JOIN public.marketplace_vendors mv ON mv.id = moi.vendor_id
    WHERE moi.order_id = order_id_param AND mv.user_id = auth.uid()
  );
$$;

-- Update shipping_companies policy to use definer function (breaks cycle)
DROP POLICY IF EXISTS "Company staff can view their company" ON public.shipping_companies;
CREATE POLICY "Company staff can view their company"
  ON public.shipping_companies
  FOR SELECT
  USING (public.is_shipping_company_staff(id));

-- Update shipping_company_staff policy to use definer function (breaks cycle)
DROP POLICY IF EXISTS "Company owners can manage staff" ON public.shipping_company_staff;
CREATE POLICY "Company owners can manage staff"
  ON public.shipping_company_staff
  FOR ALL
  USING (public.is_company_owner(company_id))
  WITH CHECK (public.is_company_owner(company_id));

-- Update marketplace_orders policy to avoid referring to order_items directly
DROP POLICY IF EXISTS "Vendors can view orders containing their products" ON public.marketplace_orders;
CREATE POLICY "Vendors can view orders containing their products"
  ON public.marketplace_orders
  FOR SELECT
  USING ((customer_id = auth.uid()) OR public.is_vendor_of_order(id));