-- Complete CamerTenders removal - drop all tender-related tables
-- This will permanently remove all CamerTenders functionality and data

-- Drop tables in correct order to avoid foreign key constraints
DROP TABLE IF EXISTS public.tender_ai_suggestions CASCADE;
DROP TABLE IF EXISTS public.tender_analytics CASCADE;
DROP TABLE IF EXISTS public.tender_analytics_cache CASCADE;
DROP TABLE IF EXISTS public.tender_audit_logs CASCADE;
DROP TABLE IF EXISTS public.tender_bids CASCADE;
DROP TABLE IF EXISTS public.tender_bonds CASCADE;
DROP TABLE IF EXISTS public.tender_bookmarks CASCADE;
DROP TABLE IF EXISTS public.tender_categories CASCADE;
DROP TABLE IF EXISTS public.tender_comments CASCADE;
DROP TABLE IF EXISTS public.tender_credibility_aggregates CASCADE;
DROP TABLE IF EXISTS public.tender_document_verification CASCADE;
DROP TABLE IF EXISTS public.tender_invoices CASCADE;
DROP TABLE IF EXISTS public.tender_moderation CASCADE;
DROP TABLE IF EXISTS public.tender_moderators CASCADE;
DROP TABLE IF EXISTS public.tender_notifications CASCADE;
DROP TABLE IF EXISTS public.tender_payment_plans CASCADE;
DROP TABLE IF EXISTS public.tender_payments CASCADE;
DROP TABLE IF EXISTS public.tender_ratings CASCADE;
DROP TABLE IF EXISTS public.tender_receipts_vault CASCADE;
DROP TABLE IF EXISTS public.tender_statistics CASCADE;
DROP TABLE IF EXISTS public.tender_updates CASCADE;
DROP TABLE IF EXISTS public.tenders CASCADE;
DROP TABLE IF EXISTS public.user_tender_watchlist CASCADE;
DROP TABLE IF EXISTS public.flagged_tender_entities CASCADE;
DROP TABLE IF EXISTS public.business_tender_eligibility CASCADE;

-- Drop any tender-related functions that might exist
DROP FUNCTION IF EXISTS public.check_business_tender_eligibility CASCADE;
DROP FUNCTION IF EXISTS public.generate_tender_ai_suggestions CASCADE;
DROP FUNCTION IF EXISTS public.update_tender_analytics_cache CASCADE;
DROP FUNCTION IF EXISTS public.update_tender_stats CASCADE;
DROP FUNCTION IF EXISTS public.update_tender_updated_at CASCADE;
DROP FUNCTION IF EXISTS public.calculate_issuer_credibility_score CASCADE;
DROP FUNCTION IF EXISTS public.calculate_bidder_credibility_score CASCADE;
DROP FUNCTION IF EXISTS public.update_tender_credibility_aggregates CASCADE;

-- Drop tender-related enums
DROP TYPE IF EXISTS tender_payment_status CASCADE;
DROP TYPE IF EXISTS business_verification_status CASCADE;