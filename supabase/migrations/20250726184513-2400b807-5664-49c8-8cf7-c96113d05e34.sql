-- Create trigger to auto-generate slugs for new villages
CREATE TRIGGER set_village_slug_trigger
  BEFORE INSERT OR UPDATE ON villages
  FOR EACH ROW
  EXECUTE FUNCTION set_village_slug();