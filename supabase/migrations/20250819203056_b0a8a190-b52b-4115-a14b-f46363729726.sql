-- Remove French content columns from database
-- Drop French content column from constitution_articles table
ALTER TABLE public.constitution_articles DROP COLUMN IF EXISTS content_french;

-- Update any other tables that might have French columns
-- (The search only found content_french, but checking for any others)

-- Set default language attributes for any language-related configurations
UPDATE public.user_profiles SET language_preference = 'en' WHERE language_preference = 'fr' OR language_preference IS NULL;

-- If there are any other language-related columns, they would be handled here
-- For now, we only found content_french in constitution_articles