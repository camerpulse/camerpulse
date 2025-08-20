-- Replace recursive RLS policies with secure versions using security definer functions

-- Fix company_team_members recursive policy
DROP POLICY IF EXISTS "Company admins can manage team members" ON public.company_team_members;
CREATE POLICY "Company admins can manage team members"
  ON public.company_team_members
  FOR ALL
  USING (public.is_company_admin_for_team_member(company_id))
  WITH CHECK (public.is_company_admin_for_team_member(company_id));

-- Fix government_agency_users recursive policy  
DROP POLICY IF EXISTS "Agency users can view their agency members" ON public.government_agency_users;
CREATE POLICY "Agency users can view their agency members"
  ON public.government_agency_users
  FOR SELECT
  USING (public.is_agency_member(agency_id) OR user_id = auth.uid());

-- Fix marketplace_order_items recursive policy
DROP POLICY IF EXISTS "Users can view their order items" ON public.marketplace_order_items;
CREATE POLICY "Users can view their order items"
  ON public.marketplace_order_items
  FOR SELECT
  USING (public.owns_marketplace_order(order_id));

-- Fix marketplace_orders policy to prevent recursion
DROP POLICY IF EXISTS "Vendors can view orders containing their products" ON public.marketplace_orders;
CREATE POLICY "Vendors can view orders containing their products"
  ON public.marketplace_orders
  FOR SELECT
  USING (
    customer_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.marketplace_vendors mv 
      WHERE mv.user_id = auth.uid() 
        AND mv.id IN (
          SELECT vendor_id FROM public.marketplace_order_items 
          WHERE order_id = marketplace_orders.id
        )
    )
  );

-- Fix shipping_company_staff related policies if they exist
DROP POLICY IF EXISTS "Agency staff can manage their branding" ON public.agency_branding_settings;
CREATE POLICY "Agency staff can manage their branding"
  ON public.agency_branding_settings
  FOR ALL
  USING (public.is_shipping_company_staff(agency_id));

-- Comment: Fixed all recursive RLS policies by using security definer functions