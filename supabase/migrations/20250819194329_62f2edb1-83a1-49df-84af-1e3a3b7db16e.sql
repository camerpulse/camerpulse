-- SEO-Friendly Slug System Implementation for CamerPulse

-- Create a comprehensive slug generation function
CREATE OR REPLACE FUNCTION public.generate_seo_slug(input_text text, entity_table text, entity_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
  sql_query text;
  record_exists boolean;
BEGIN
  -- Step 1: Convert to lowercase and clean the input
  base_slug := lower(trim(input_text));
  
  -- Step 2: Handle accents and special characters
  base_slug := translate(base_slug,
    'àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ',
    'aaaaaaeceeeeiiiinooooooouuuuyy'
  );
  
  -- Step 3: Replace non-alphanumeric characters with hyphens
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  
  -- Step 4: Remove leading/trailing hyphens and collapse multiple hyphens
  base_slug := trim(base_slug, '-');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  
  -- Step 5: Ensure minimum length (fallback to 'entity' if too short)
  IF length(base_slug) < 2 THEN
    base_slug := 'entity';
  END IF;
  
  final_slug := base_slug;
  
  -- Step 6: Check for uniqueness and append counter if needed
  LOOP
    -- Dynamic query to check if slug exists in the specified table
    sql_query := format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1%s)',
      entity_table,
      CASE WHEN entity_id IS NOT NULL THEN ' AND id != $2' ELSE '' END
    );
    
    IF entity_id IS NOT NULL THEN
      EXECUTE sql_query INTO record_exists USING final_slug, entity_id;
    ELSE
      EXECUTE sql_query INTO record_exists USING final_slug;
    END IF;
    
    -- If slug is unique, we're done
    IF NOT record_exists THEN
      EXIT;
    END IF;
    
    -- Otherwise, increment counter and try again
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Add slug columns to existing tables that don't have them
-- Political parties
ALTER TABLE political_parties ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Politicians tables
ALTER TABLE mps ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE senators ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE ministers ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE politicians ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Other entity tables
ALTER TABLE villages ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE traditional_leaders ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create slug generation functions for each entity type
CREATE OR REPLACE FUNCTION public.generate_political_party_slug(party_name text, party_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN public.generate_seo_slug(party_name, 'political_parties', party_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_politician_slug(politician_name text, position_title text DEFAULT NULL, region_name text DEFAULT NULL, politician_id uuid DEFAULT NULL, table_name text DEFAULT 'politicians')
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  slug_text text;
BEGIN
  -- Combine name with position and region for better SEO
  slug_text := politician_name;
  
  IF position_title IS NOT NULL AND position_title != '' THEN
    slug_text := slug_text || ' ' || position_title;
  END IF;
  
  IF region_name IS NOT NULL AND region_name != '' THEN
    slug_text := slug_text || ' ' || region_name;
  END IF;
  
  RETURN public.generate_seo_slug(slug_text, table_name, politician_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_village_slug(village_name text, region_name text, village_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN public.generate_seo_slug(village_name || ' ' || region_name, 'villages', village_id);
END;
$$;

-- Create triggers to automatically generate slugs on insert and update

-- Political Parties slug trigger
CREATE OR REPLACE FUNCTION public.set_political_party_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' OR (TG_OP = 'UPDATE' AND OLD.name != NEW.name) THEN
    NEW.slug := public.generate_political_party_slug(NEW.name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_political_party_slug ON political_parties;
CREATE TRIGGER trigger_set_political_party_slug
  BEFORE INSERT OR UPDATE ON political_parties
  FOR EACH ROW
  EXECUTE FUNCTION public.set_political_party_slug();