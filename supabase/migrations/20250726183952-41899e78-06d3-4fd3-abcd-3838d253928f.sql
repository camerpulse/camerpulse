-- Add slug column to villages table for SEO-friendly URLs
ALTER TABLE villages ADD COLUMN slug text UNIQUE;

-- Create function to generate village slugs
CREATE OR REPLACE FUNCTION generate_village_slug(village_name text, region_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Create base slug from village name and region
  base_slug := lower(trim(regexp_replace(
    village_name || '-' || region_name, 
    '[^a-zA-Z0-9\s]', '', 'g'
  )));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  -- Check for uniqueness
  WHILE EXISTS (SELECT 1 FROM villages WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Update existing villages with slugs
UPDATE villages 
SET slug = generate_village_slug(village_name, region)
WHERE slug IS NULL;

-- Create trigger to auto-generate slugs for new villages
CREATE OR REPLACE FUNCTION set_village_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_village_slug(NEW.village_name, NEW.region);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_village_slug_trigger
  BEFORE INSERT OR UPDATE ON villages
  FOR EACH ROW
  EXECUTE FUNCTION set_village_slug();