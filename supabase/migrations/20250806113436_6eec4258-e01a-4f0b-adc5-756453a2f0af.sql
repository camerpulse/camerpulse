-- Add slug columns to all political entities tables
ALTER TABLE public.politicians ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.senators ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.mps ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.ministers ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.political_parties ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS slug text;

-- Create indexes on slug columns for better performance
CREATE INDEX IF NOT EXISTS idx_politicians_slug ON public.politicians(slug);
CREATE INDEX IF NOT EXISTS idx_senators_slug ON public.senators(slug);
CREATE INDEX IF NOT EXISTS idx_mps_slug ON public.mps(slug);
CREATE INDEX IF NOT EXISTS idx_ministers_slug ON public.ministers(slug);
CREATE INDEX IF NOT EXISTS idx_political_parties_slug ON public.political_parties(slug);
CREATE INDEX IF NOT EXISTS idx_villages_slug ON public.villages(slug);
CREATE INDEX IF NOT EXISTS idx_hospitals_slug ON public.hospitals(slug);
CREATE INDEX IF NOT EXISTS idx_schools_slug ON public.schools(slug);

-- Function to generate slug from text
CREATE OR REPLACE FUNCTION generate_slug(input_text text, entity_id text DEFAULT NULL)
RETURNS text AS $$
DECLARE
    slug_text text;
BEGIN
    -- Handle null/empty input
    IF input_text IS NULL OR trim(input_text) = '' THEN
        RETURN COALESCE(entity_id, 'item');
    END IF;
    
    -- Convert to lowercase and replace non-alphanumeric with hyphens
    slug_text := lower(trim(input_text));
    slug_text := regexp_replace(slug_text, '[^a-z0-9\s-]', '', 'g');
    slug_text := regexp_replace(slug_text, '\s+', '-', 'g');
    slug_text := regexp_replace(slug_text, '-+', '-', 'g');
    slug_text := regexp_replace(slug_text, '^-+|-+$', '', 'g');
    
    -- Handle special characters
    slug_text := replace(slug_text, 'à', 'a');
    slug_text := replace(slug_text, 'á', 'a');
    slug_text := replace(slug_text, 'â', 'a');
    slug_text := replace(slug_text, 'ä', 'a');
    slug_text := replace(slug_text, 'ã', 'a');
    slug_text := replace(slug_text, 'è', 'e');
    slug_text := replace(slug_text, 'é', 'e');
    slug_text := replace(slug_text, 'ê', 'e');
    slug_text := replace(slug_text, 'ë', 'e');
    slug_text := replace(slug_text, 'ì', 'i');
    slug_text := replace(slug_text, 'í', 'i');
    slug_text := replace(slug_text, 'î', 'i');
    slug_text := replace(slug_text, 'ï', 'i');
    slug_text := replace(slug_text, 'ò', 'o');
    slug_text := replace(slug_text, 'ó', 'o');
    slug_text := replace(slug_text, 'ô', 'o');
    slug_text := replace(slug_text, 'ö', 'o');
    slug_text := replace(slug_text, 'õ', 'o');
    slug_text := replace(slug_text, 'ø', 'o');
    slug_text := replace(slug_text, 'ù', 'u');
    slug_text := replace(slug_text, 'ú', 'u');
    slug_text := replace(slug_text, 'û', 'u');
    slug_text := replace(slug_text, 'ü', 'u');
    slug_text := replace(slug_text, 'ñ', 'n');
    slug_text := replace(slug_text, 'ç', 'c');
    slug_text := replace(slug_text, 'ß', 'ss');
    slug_text := replace(slug_text, 'ý', 'y');
    slug_text := replace(slug_text, 'ÿ', 'y');
    
    -- Append entity ID if provided for uniqueness
    IF entity_id IS NOT NULL THEN
        slug_text := COALESCE(NULLIF(slug_text, ''), 'item') || '-' || entity_id;
    END IF;
    
    RETURN COALESCE(NULLIF(slug_text, ''), COALESCE(entity_id, 'item'));
END;
$$ LANGUAGE plpgsql;

-- Update existing records with generated slugs
UPDATE public.politicians 
SET slug = generate_slug(full_name, id::text) 
WHERE slug IS NULL;

UPDATE public.senators 
SET slug = generate_slug(full_name, id::text) 
WHERE slug IS NULL;

UPDATE public.mps 
SET slug = generate_slug(full_name, id::text) 
WHERE slug IS NULL;

UPDATE public.ministers 
SET slug = generate_slug(full_name, id::text) 
WHERE slug IS NULL;

UPDATE public.politicians 
SET slug = generate_slug(name, id::text) 
WHERE slug IS NULL AND name IS NOT NULL;

UPDATE public.political_parties 
SET slug = generate_slug(name, id::text) 
WHERE slug IS NULL AND name IS NOT NULL;

UPDATE public.villages 
SET slug = generate_slug(name || '-' || region, id::text) 
WHERE slug IS NULL AND name IS NOT NULL;

UPDATE public.hospitals 
SET slug = generate_slug(name, id::text) 
WHERE slug IS NULL AND name IS NOT NULL;

UPDATE public.schools 
SET slug = generate_slug(name, id::text) 
WHERE slug IS NULL AND name IS NOT NULL;

-- Create triggers to auto-generate slugs for new records
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS trigger AS $$
BEGIN
    -- Generate slug based on name/full_name field
    IF NEW.slug IS NULL THEN
        IF TG_TABLE_NAME = 'politicians' THEN
            NEW.slug := generate_slug(COALESCE(NEW.full_name, NEW.name), NEW.id::text);
        ELSIF TG_TABLE_NAME = 'senators' THEN
            NEW.slug := generate_slug(NEW.full_name, NEW.id::text);
        ELSIF TG_TABLE_NAME = 'mps' THEN
            NEW.slug := generate_slug(NEW.full_name, NEW.id::text);
        ELSIF TG_TABLE_NAME = 'ministers' THEN
            NEW.slug := generate_slug(NEW.full_name, NEW.id::text);
        ELSIF TG_TABLE_NAME = 'political_parties' THEN
            NEW.slug := generate_slug(NEW.name, NEW.id::text);
        ELSIF TG_TABLE_NAME = 'villages' THEN
            NEW.slug := generate_slug(NEW.name || '-' || COALESCE(NEW.region, ''), NEW.id::text);
        ELSIF TG_TABLE_NAME = 'hospitals' THEN
            NEW.slug := generate_slug(NEW.name, NEW.id::text);
        ELSIF TG_TABLE_NAME = 'schools' THEN
            NEW.slug := generate_slug(NEW.name, NEW.id::text);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
DROP TRIGGER IF EXISTS politicians_auto_slug ON public.politicians;
CREATE TRIGGER politicians_auto_slug
    BEFORE INSERT OR UPDATE ON public.politicians
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS senators_auto_slug ON public.senators;
CREATE TRIGGER senators_auto_slug
    BEFORE INSERT OR UPDATE ON public.senators
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS mps_auto_slug ON public.mps;
CREATE TRIGGER mps_auto_slug
    BEFORE INSERT OR UPDATE ON public.mps
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS ministers_auto_slug ON public.ministers;
CREATE TRIGGER ministers_auto_slug
    BEFORE INSERT OR UPDATE ON public.ministers
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS political_parties_auto_slug ON public.political_parties;
CREATE TRIGGER political_parties_auto_slug
    BEFORE INSERT OR UPDATE ON public.political_parties
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS villages_auto_slug ON public.villages;
CREATE TRIGGER villages_auto_slug
    BEFORE INSERT OR UPDATE ON public.villages
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS hospitals_auto_slug ON public.hospitals;
CREATE TRIGGER hospitals_auto_slug
    BEFORE INSERT OR UPDATE ON public.hospitals
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS schools_auto_slug ON public.schools;
CREATE TRIGGER schools_auto_slug
    BEFORE INSERT OR UPDATE ON public.schools
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();