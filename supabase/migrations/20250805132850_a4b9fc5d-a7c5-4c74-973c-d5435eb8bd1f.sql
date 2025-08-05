-- Add slug columns to entities that don't have them
ALTER TABLE politicians ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE senators ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE mps ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE ministers ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE political_parties ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE petitions ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug text;

-- Create indexes for slug columns for better performance
CREATE INDEX IF NOT EXISTS idx_politicians_slug ON politicians(slug);
CREATE INDEX IF NOT EXISTS idx_senators_slug ON senators(slug);
CREATE INDEX IF NOT EXISTS idx_mps_slug ON mps(slug);
CREATE INDEX IF NOT EXISTS idx_ministers_slug ON ministers(slug);
CREATE INDEX IF NOT EXISTS idx_political_parties_slug ON political_parties(slug);
CREATE INDEX IF NOT EXISTS idx_hospitals_slug ON hospitals(slug);
CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(slug);
CREATE INDEX IF NOT EXISTS idx_pharmacies_slug ON pharmacies(slug);
CREATE INDEX IF NOT EXISTS idx_petitions_slug ON petitions(slug);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_villages_slug ON villages(slug);

-- Create function to generate SEO-friendly slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text text, entity_id text DEFAULT NULL) 
RETURNS text AS $$
DECLARE
    slug_text text;
BEGIN
    -- Convert to lowercase, replace special chars and spaces with hyphens
    slug_text := lower(trim(input_text));
    slug_text := regexp_replace(slug_text, '[^a-z0-9\s-]', '', 'g');
    slug_text := regexp_replace(slug_text, '[\s_-]+', '-', 'g');
    slug_text := regexp_replace(slug_text, '^-+|-+$', '', 'g');
    
    -- Append entity ID if provided
    IF entity_id IS NOT NULL THEN
        slug_text := slug_text || '-' || entity_id;
    END IF;
    
    RETURN slug_text;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure unique slugs per table
CREATE OR REPLACE FUNCTION ensure_unique_slug(table_name text, base_slug text, current_id text DEFAULT NULL)
RETURNS text AS $$
DECLARE
    final_slug text;
    counter integer := 1;
    slug_exists boolean;
BEGIN
    final_slug := base_slug;
    
    -- Check if slug exists (excluding current record if updating)
    LOOP
        EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1 AND ($2 IS NULL OR id != $2))', table_name)
        INTO slug_exists
        USING final_slug, current_id;
        
        IF NOT slug_exists THEN
            EXIT;
        END IF;
        
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Generate slugs for existing politicians
UPDATE politicians 
SET slug = ensure_unique_slug('politicians', generate_slug(name, id::text), id::text)
WHERE slug IS NULL;

-- Generate slugs for existing senators  
UPDATE senators 
SET slug = ensure_unique_slug('senators', generate_slug(name, id::text), id::text)
WHERE slug IS NULL;

-- Generate slugs for existing political parties
UPDATE political_parties 
SET slug = ensure_unique_slug('political_parties', generate_slug(COALESCE(acronym, name), id::text), id::text)
WHERE slug IS NULL;

-- Generate slugs for existing villages
UPDATE villages 
SET slug = ensure_unique_slug('villages', generate_slug(name || '-' || COALESCE(region, ''), id::text), id::text)
WHERE slug IS NULL;

-- Generate slugs for existing hospitals
UPDATE hospitals 
SET slug = ensure_unique_slug('hospitals', generate_slug(name, id::text), id::text)
WHERE slug IS NULL;

-- Generate slugs for existing schools
UPDATE schools 
SET slug = ensure_unique_slug('schools', generate_slug(name, id::text), id::text)
WHERE slug IS NULL;

-- Generate slugs for existing pharmacies
UPDATE pharmacies 
SET slug = ensure_unique_slug('pharmacies', generate_slug(name, id::text), id::text)
WHERE slug IS NULL;

-- Triggers to auto-generate slugs on insert/update
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS trigger AS $$
DECLARE
    table_name text;
    slug_source text;
BEGIN
    table_name := TG_TABLE_NAME;
    
    -- Determine slug source based on table
    CASE table_name
        WHEN 'politicians', 'senators', 'ministers', 'mps' THEN
            slug_source := NEW.name;
        WHEN 'political_parties' THEN
            slug_source := COALESCE(NEW.acronym, NEW.name);
        WHEN 'villages' THEN
            slug_source := NEW.name || '-' || COALESCE(NEW.region, '');
        WHEN 'hospitals', 'schools', 'pharmacies' THEN
            slug_source := NEW.name;
        WHEN 'petitions' THEN
            slug_source := NEW.title;
        WHEN 'events' THEN
            slug_source := NEW.title;
        ELSE
            slug_source := 'item';
    END CASE;
    
    -- Generate and ensure unique slug
    NEW.slug := ensure_unique_slug(
        table_name, 
        generate_slug(slug_source, NEW.id::text),
        CASE WHEN TG_OP = 'UPDATE' THEN OLD.id::text ELSE NULL END
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all entities
DROP TRIGGER IF EXISTS trigger_auto_generate_politicians_slug ON politicians;
CREATE TRIGGER trigger_auto_generate_politicians_slug
    BEFORE INSERT OR UPDATE ON politicians
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS trigger_auto_generate_senators_slug ON senators;
CREATE TRIGGER trigger_auto_generate_senators_slug
    BEFORE INSERT OR UPDATE ON senators
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS trigger_auto_generate_political_parties_slug ON political_parties;
CREATE TRIGGER trigger_auto_generate_political_parties_slug
    BEFORE INSERT OR UPDATE ON political_parties
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS trigger_auto_generate_villages_slug ON villages;
CREATE TRIGGER trigger_auto_generate_villages_slug
    BEFORE INSERT OR UPDATE ON villages
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS trigger_auto_generate_hospitals_slug ON hospitals;
CREATE TRIGGER trigger_auto_generate_hospitals_slug
    BEFORE INSERT OR UPDATE ON hospitals
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS trigger_auto_generate_schools_slug ON schools;
CREATE TRIGGER trigger_auto_generate_schools_slug
    BEFORE INSERT OR UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS trigger_auto_generate_pharmacies_slug ON pharmacies;
CREATE TRIGGER trigger_auto_generate_pharmacies_slug
    BEFORE INSERT OR UPDATE ON pharmacies
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS trigger_auto_generate_petitions_slug ON petitions;
CREATE TRIGGER trigger_auto_generate_petitions_slug
    BEFORE INSERT OR UPDATE ON petitions
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS trigger_auto_generate_events_slug ON events;
CREATE TRIGGER trigger_auto_generate_events_slug
    BEFORE INSERT OR UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();