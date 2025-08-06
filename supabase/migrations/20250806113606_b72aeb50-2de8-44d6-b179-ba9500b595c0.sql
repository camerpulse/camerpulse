-- Add slug columns to all political entities tables (the ALTER statements may have succeeded)
ALTER TABLE public.politicians ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.senators ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.mps ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.ministers ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.political_parties ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS slug text;

-- Update existing records with generated slugs using existing generate_slug function
-- For senators table
UPDATE public.senators 
SET slug = generate_slug(full_name, id::text) 
WHERE slug IS NULL AND full_name IS NOT NULL;

-- For mps table  
UPDATE public.mps 
SET slug = generate_slug(full_name, id::text) 
WHERE slug IS NULL AND full_name IS NOT NULL;

-- For ministers table
UPDATE public.ministers 
SET slug = generate_slug(full_name, id::text) 
WHERE slug IS NULL AND full_name IS NOT NULL;

-- For politicians table (only use 'name' column)
UPDATE public.politicians 
SET slug = generate_slug(name, id::text) 
WHERE slug IS NULL AND name IS NOT NULL;

-- For political_parties table
UPDATE public.political_parties 
SET slug = generate_slug(name, id::text) 
WHERE slug IS NULL AND name IS NOT NULL;

-- For villages table
UPDATE public.villages 
SET slug = generate_slug(COALESCE(village_name, name) || '-' || region, id::text) 
WHERE slug IS NULL AND (village_name IS NOT NULL OR name IS NOT NULL);

-- For hospitals table
UPDATE public.hospitals 
SET slug = generate_slug(name, id::text) 
WHERE slug IS NULL AND name IS NOT NULL;

-- For schools table
UPDATE public.schools 
SET slug = generate_slug(name, id::text) 
WHERE slug IS NULL AND name IS NOT NULL;