-- Final cleanup: Remove the tender function that still exists and old migration
DROP FUNCTION IF EXISTS calculate_tender_analytics() CASCADE;
DROP FUNCTION IF EXISTS update_tender_updated_at() CASCADE;

-- Also make sure we remove any tender-related tables that might still exist
DROP TABLE IF EXISTS public.tenders CASCADE;
DROP TABLE IF EXISTS public.tender_bids CASCADE;
DROP TABLE IF EXISTS public.tender_bookmarks CASCADE;
DROP TABLE IF EXISTS public.tender_analytics CASCADE;
DROP TABLE IF EXISTS public.tender_notifications CASCADE;