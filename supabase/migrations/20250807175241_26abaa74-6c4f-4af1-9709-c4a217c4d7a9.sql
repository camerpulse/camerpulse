-- Phase 1: Critical RLS Policy Fixes for Marketplace Tables

-- First, make user_id NOT NULL in marketplace_cart for security
ALTER TABLE public.marketplace_cart ALTER COLUMN user_id SET NOT NULL;

-- Add RLS policies for marketplace_cart
CREATE POLICY "Users can view their own cart items" 
ON public.marketplace_cart 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cart items" 
ON public.marketplace_cart 
FOR ALL 
USING (auth.uid() = user_id);

-- Add RLS policies for marketplace_vendors
CREATE POLICY "Vendors are publicly viewable" 
ON public.marketplace_vendors 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create vendor profiles" 
ON public.marketplace_vendors 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own profiles" 
ON public.marketplace_vendors 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add RLS policies for marketplace_products
CREATE POLICY "Products are publicly viewable" 
ON public.marketplace_products 
FOR SELECT 
USING (true);

CREATE POLICY "Vendors can manage their own products" 
ON public.marketplace_products 
FOR ALL 
USING (vendor_id IN (SELECT id FROM marketplace_vendors WHERE user_id = auth.uid()));

-- Add RLS policies for marketplace_orders
CREATE POLICY "Users can view their own orders as buyers" 
ON public.marketplace_orders 
FOR SELECT 
USING (auth.uid() = buyer_id);

CREATE POLICY "Vendors can view orders for their products" 
ON public.marketplace_orders 
FOR SELECT 
USING (vendor_id IN (SELECT id FROM marketplace_vendors WHERE user_id = auth.uid()));

CREATE POLICY "Users can create orders as buyers" 
ON public.marketplace_orders 
FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Vendors can update orders for their products" 
ON public.marketplace_orders 
FOR UPDATE 
USING (vendor_id IN (SELECT id FROM marketplace_vendors WHERE user_id = auth.uid()));

-- Add RLS policies for marketplace_categories
CREATE POLICY "Categories are publicly viewable" 
ON public.marketplace_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage categories" 
ON public.marketplace_categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Add RLS policies for marketplace_product_reviews
CREATE POLICY "Reviews are publicly viewable" 
ON public.marketplace_product_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews for products they purchased" 
ON public.marketplace_product_reviews 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM marketplace_orders 
    WHERE buyer_id = auth.uid() AND product_id = marketplace_product_reviews.product_id AND status = 'completed'
  )
);

CREATE POLICY "Users can update their own reviews" 
ON public.marketplace_product_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add RLS policies for marketplace_coupons
CREATE POLICY "Active coupons are publicly viewable" 
ON public.marketplace_coupons 
FOR SELECT 
USING (is_active = true AND expires_at > now());

CREATE POLICY "Vendors can manage their own coupons" 
ON public.marketplace_coupons 
FOR ALL 
USING (vendor_id IN (SELECT id FROM marketplace_vendors WHERE user_id = auth.uid()));

-- Add RLS policies for marketplace_wishlists
CREATE POLICY "Users can manage their own wishlists" 
ON public.marketplace_wishlists 
FOR ALL 
USING (auth.uid() = user_id);

-- Add RLS policies for marketplace_shipping_addresses
CREATE POLICY "Users can manage their own shipping addresses" 
ON public.marketplace_shipping_addresses 
FOR ALL 
USING (auth.uid() = user_id);

-- Add security definer function to safely check user roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Add RLS policies for user_roles to prevent self-elevation
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Only admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Only admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (public.get_user_role() = 'admin'::app_role);

-- Add audit logging trigger for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.profile_activity_log (
      user_id, activity_type, activity_title, activity_description, metadata
    ) VALUES (
      NEW.user_id, 'role_assigned', 'Role Assigned', 
      'Role ' || NEW.role || ' was assigned', 
      jsonb_build_object('role', NEW.role, 'assigned_by', auth.uid())
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.profile_activity_log (
      user_id, activity_type, activity_title, activity_description, metadata
    ) VALUES (
      NEW.user_id, 'role_changed', 'Role Changed', 
      'Role changed from ' || OLD.role || ' to ' || NEW.role, 
      jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role, 'changed_by', auth.uid())
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.profile_activity_log (
      user_id, activity_type, activity_title, activity_description, metadata
    ) VALUES (
      OLD.user_id, 'role_removed', 'Role Removed', 
      'Role ' || OLD.role || ' was removed', 
      jsonb_build_object('role', OLD.role, 'removed_by', auth.uid())
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_role_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();