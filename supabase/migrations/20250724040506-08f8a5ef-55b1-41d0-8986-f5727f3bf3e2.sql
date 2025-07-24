-- Remove all remaining tender-related database elements
-- Drop any remaining tender-related tables that might exist
DROP TABLE IF EXISTS public.tender_document_verification CASCADE;
DROP TABLE IF EXISTS public.tender_invoices CASCADE;
DROP TABLE IF EXISTS public.tender_payments CASCADE;
DROP TABLE IF EXISTS public.tender_payment_plans CASCADE;
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;

-- Drop tender-related types
DROP TYPE IF EXISTS tender_payment_status CASCADE;
DROP TYPE IF EXISTS business_verification_status CASCADE;

-- Remove any tender-related functions
DROP FUNCTION IF EXISTS public.generate_license_key() CASCADE;
DROP FUNCTION IF EXISTS public.assign_license_key(uuid, uuid, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_commission(decimal, text) CASCADE;
DROP FUNCTION IF EXISTS public.process_payment_success(uuid, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.increment_usage_count(uuid) CASCADE;