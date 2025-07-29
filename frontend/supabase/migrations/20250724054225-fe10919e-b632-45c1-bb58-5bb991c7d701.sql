-- Force drop the persistent function
DROP FUNCTION IF EXISTS public.calculate_tender_analytics(text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_tender_analytics CASCADE;