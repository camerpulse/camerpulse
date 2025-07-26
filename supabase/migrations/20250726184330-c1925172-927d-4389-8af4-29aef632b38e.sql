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