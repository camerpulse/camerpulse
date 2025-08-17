-- Clean up marketplace-related database functions
DROP FUNCTION IF EXISTS public.generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS public.set_order_number() CASCADE;
DROP FUNCTION IF EXISTS public.update_marketplace_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.generate_dispute_number() CASCADE;
DROP FUNCTION IF EXISTS public.set_dispute_number() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_vendor_performance_metrics(uuid, date, date) CASCADE;
DROP FUNCTION IF EXISTS public.increment_product_view(uuid, uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_user_similarities() CASCADE;
DROP FUNCTION IF EXISTS public.update_product_views_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_vendor_presence(uuid, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.check_inventory_levels() CASCADE;

-- Remove marketplace-related types if they exist
DROP TYPE IF EXISTS public.marketplace_order_status CASCADE;
DROP TYPE IF EXISTS public.marketplace_product_status CASCADE;
DROP TYPE IF EXISTS public.marketplace_category CASCADE;