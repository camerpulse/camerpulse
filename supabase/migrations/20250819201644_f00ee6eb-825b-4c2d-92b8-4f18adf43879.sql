-- First create all slug generation functions before using them

-- Add missing slug generation function for petitions
CREATE OR REPLACE FUNCTION public.generate_petition_slug(petition_title text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from petition title
  base_slug := lower(trim(regexp_replace(
    petition_title, 
    '[^a-zA-Z0-9\s]', '', 'g'
  )));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  -- Check for uniqueness
  WHILE EXISTS (SELECT 1 FROM petitions WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Add missing slug generation function for events
CREATE OR REPLACE FUNCTION public.generate_event_slug(event_title text, venue_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from event title and venue
  base_slug := lower(trim(regexp_replace(
    event_title || '-' || venue_name, 
    '[^a-zA-Z0-9\s]', '', 'g'
  )));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  -- Check for uniqueness
  WHILE EXISTS (SELECT 1 FROM events WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Now populate slug data for existing records that don't have slugs

-- Update existing hospitals without slugs
UPDATE hospitals 
SET slug = public.generate_hospital_slug(name, region)
WHERE slug IS NULL OR slug = '';

-- Update existing schools without slugs  
UPDATE schools 
SET slug = public.generate_school_slug(name, region)
WHERE slug IS NULL OR slug = '';

-- Update existing events without slugs
UPDATE events 
SET slug = public.generate_event_slug(title, venue_name)
WHERE slug IS NULL OR slug = '';

-- Update existing petitions without slugs
UPDATE petitions 
SET slug = public.generate_petition_slug(title)
WHERE slug IS NULL OR slug = '';

-- Add trigger for petition slug generation
CREATE OR REPLACE FUNCTION public.set_petition_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_petition_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;

-- Add trigger for event slug generation
CREATE OR REPLACE FUNCTION public.set_event_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_event_slug(NEW.title, NEW.venue_name);
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers if not exist
DROP TRIGGER IF EXISTS set_petition_slug_trigger ON petitions;
CREATE TRIGGER set_petition_slug_trigger
  BEFORE INSERT OR UPDATE ON petitions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_petition_slug();

DROP TRIGGER IF EXISTS set_event_slug_trigger ON events;
CREATE TRIGGER set_event_slug_trigger
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_event_slug();

-- Add RPC function to get entity by slug for all entity types
CREATE OR REPLACE FUNCTION public.get_entity_by_slug(
  p_table_name text,
  p_slug text,
  p_id_column text DEFAULT 'id',
  p_slug_column text DEFAULT 'slug'
)
RETURNS TABLE(
  entity_id uuid,
  canonical_slug text,
  entity_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sql_query text;
  entity_record record;
BEGIN
  -- Validate table name to prevent SQL injection
  IF p_table_name NOT IN ('politicians', 'mps', 'senators', 'ministers', 'political_parties', 
                          'villages', 'hospitals', 'schools', 'events', 'petitions') THEN
    RAISE EXCEPTION 'Invalid table name: %', p_table_name;
  END IF;

  -- Try to find by slug first
  sql_query := format('SELECT %I as id, %I as slug, to_jsonb(t.*) as data FROM %I t WHERE %I = $1',
                      p_id_column, p_slug_column, p_table_name, p_slug_column);
  
  EXECUTE sql_query USING p_slug INTO entity_record;
  
  IF FOUND THEN
    entity_id := entity_record.id;
    canonical_slug := entity_record.slug;
    entity_data := entity_record.data;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Try to find by ID if slug lookup failed (for legacy support)
  sql_query := format('SELECT %I as id, %I as slug, to_jsonb(t.*) as data FROM %I t WHERE %I = $1',
                      p_id_column, p_slug_column, p_table_name, p_id_column);
  
  BEGIN
    EXECUTE sql_query USING p_slug::uuid INTO entity_record;
    
    IF FOUND THEN
      entity_id := entity_record.id;
      canonical_slug := entity_record.slug;
      entity_data := entity_record.data;
      RETURN NEXT;
    END IF;
  EXCEPTION
    WHEN invalid_text_representation THEN
      -- p_slug is not a valid UUID, return nothing
      RETURN;
  END;
END;
$$;