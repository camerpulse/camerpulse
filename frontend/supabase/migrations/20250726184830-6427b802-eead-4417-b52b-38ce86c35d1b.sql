-- Recreate the set_village_slug function and trigger
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

-- Create trigger to auto-generate slugs for new villages
CREATE TRIGGER set_village_slug_trigger
  BEFORE INSERT OR UPDATE ON villages
  FOR EACH ROW
  EXECUTE FUNCTION set_village_slug();