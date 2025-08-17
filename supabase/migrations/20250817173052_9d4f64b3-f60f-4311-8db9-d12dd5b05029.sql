-- Remove all marketplace-related database tables and storage policies
DROP TABLE IF EXISTS public.marketplace_vendors CASCADE;
DROP TABLE IF EXISTS public.marketplace_products CASCADE;
DROP TABLE IF EXISTS public.marketplace_orders CASCADE;
DROP TABLE IF EXISTS public.marketplace_reviews CASCADE;
DROP TABLE IF EXISTS public.marketplace_categories CASCADE;
DROP TABLE IF EXISTS public.vendor_profiles CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.marketplace_transactions CASCADE;

-- Remove marketplace storage buckets and policies
DELETE FROM storage.buckets WHERE id IN ('marketplace-images', 'vendor-logos', 'product-photos');

-- Clean up any marketplace-related RLS policies
DROP POLICY IF EXISTS "marketplace_vendors_policy" ON public.marketplace_vendors;
DROP POLICY IF EXISTS "marketplace_products_policy" ON public.marketplace_products;
DROP POLICY IF EXISTS "marketplace_orders_policy" ON public.marketplace_orders;
DROP POLICY IF EXISTS "marketplace_reviews_policy" ON public.marketplace_reviews;