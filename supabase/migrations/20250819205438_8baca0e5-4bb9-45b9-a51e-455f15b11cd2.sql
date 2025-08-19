-- Remove remaining multilingual columns from constitution_articles
ALTER TABLE public.constitution_articles 
DROP COLUMN IF EXISTS content_pidgin,
DROP COLUMN IF EXISTS content_fulfulde;