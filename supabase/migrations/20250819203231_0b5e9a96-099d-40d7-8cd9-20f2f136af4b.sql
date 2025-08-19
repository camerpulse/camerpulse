-- Remove French content columns from database
-- Drop French content column from constitution_articles table
ALTER TABLE public.constitution_articles DROP COLUMN IF EXISTS content_french;

-- Remove any language-specific data we might have missed
-- The previous search found content_french was the only French column