-- Complete cleanup: Remove all remaining tender references

-- Drop the calculate_tender_analytics function
DROP FUNCTION IF EXISTS calculate_tender_analytics() CASCADE;

-- Remove tender_id columns from remaining tables
ALTER TABLE contracts DROP COLUMN IF EXISTS tender_id;
ALTER TABLE petition_connections DROP COLUMN IF EXISTS tender_id;  
ALTER TABLE document_uploads DROP COLUMN IF EXISTS tender_id;

-- Remove tender columns from issuer_credibility_scores
ALTER TABLE issuer_credibility_scores DROP COLUMN IF EXISTS tenders_posted;
ALTER TABLE issuer_credibility_scores DROP COLUMN IF EXISTS tenders_awarded;

-- Search for any remaining data containing 'tender' or 'camertender'
-- (This will help us identify any leftover references)