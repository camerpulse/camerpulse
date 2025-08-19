-- Complete French language removal from CamerPulse database
-- Phase 1: Remove French columns from tables

-- Remove French explanation column from civic_law_explanations (no data to migrate)
ALTER TABLE public.civic_law_explanations 
DROP COLUMN IF EXISTS french_explanation;

-- Remove French translation column from language_preservation (no data to migrate) 
ALTER TABLE public.language_preservation 
DROP COLUMN IF EXISTS french_translation;

-- Remove pidgin explanation column as part of multilingual cleanup
ALTER TABLE public.civic_law_explanations 
DROP COLUMN IF EXISTS pidgin_explanation;

-- Drop multilingual tables that are no longer needed
DROP TABLE IF EXISTS public.language_learning_progress CASCADE;
DROP TABLE IF EXISTS public.message_translations CASCADE;

-- The language_preservation table should remain as it's for preserving local African languages,
-- but we've removed the French translation column to keep it English + local languages only

-- Remove any French-related constraints or indexes
DROP INDEX IF EXISTS idx_civic_law_explanations_french;
DROP INDEX IF EXISTS idx_language_preservation_french;