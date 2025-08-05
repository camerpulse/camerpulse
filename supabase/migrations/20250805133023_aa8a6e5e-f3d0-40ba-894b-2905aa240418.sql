-- Fix the type casting issue in the ensure_unique_slug function
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
        EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1 AND ($2 IS NULL OR id::text != $2))', table_name)
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

-- Now run the auto-generation for existing records with proper type casting
UPDATE politicians 
SET slug = ensure_unique_slug('politicians', generate_slug(name, id::text), id::text)
WHERE slug IS NULL;

UPDATE senators 
SET slug = ensure_unique_slug('senators', generate_slug(name, id::text), id::text)
WHERE slug IS NULL;

UPDATE political_parties 
SET slug = ensure_unique_slug('political_parties', generate_slug(COALESCE(acronym, name), id::text), id::text)
WHERE slug IS NULL;

UPDATE villages 
SET slug = ensure_unique_slug('villages', generate_slug(name || '-' || COALESCE(region, ''), id::text), id::text)
WHERE slug IS NULL;

UPDATE hospitals 
SET slug = ensure_unique_slug('hospitals', generate_slug(name, id::text), id::text)
WHERE slug IS NULL;

UPDATE schools 
SET slug = ensure_unique_slug('schools', generate_slug(name, id::text), id::text)
WHERE slug IS NULL;

UPDATE pharmacies 
SET slug = ensure_unique_slug('pharmacies', generate_slug(name, id::text), id::text)
WHERE slug IS NULL;