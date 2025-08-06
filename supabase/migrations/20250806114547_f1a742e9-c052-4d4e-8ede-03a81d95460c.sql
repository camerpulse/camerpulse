-- Update existing records with generated slugs
-- For senators table (using full_name)
UPDATE public.senators 
SET slug = generate_slug(full_name, id::text) 
WHERE slug IS NULL AND full_name IS NOT NULL;

-- For mps table (using full_name)
UPDATE public.mps 
SET slug = generate_slug(full_name, id::text) 
WHERE slug IS NULL AND full_name IS NOT NULL;

-- For ministers table (using full_name)
UPDATE public.ministers 
SET slug = generate_slug(full_name, id::text) 
WHERE slug IS NULL AND full_name IS NOT NULL;

-- For politicians table (using name column)
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