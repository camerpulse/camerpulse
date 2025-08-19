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

CREATE OR REPLACE FUNCTION public.generate_politician_slug(politician_name text, position text DEFAULT NULL, region text DEFAULT NULL, politician_id uuid DEFAULT NULL, table_name text DEFAULT 'politicians')
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  slug_text text;
BEGIN
  -- Combine name with position and region for better SEO
  slug_text := politician_name;
  
  IF position IS NOT NULL AND position != '' THEN
    slug_text := slug_text || ' ' || position;
  END IF;
  
  IF region IS NOT NULL AND region != '' THEN
    slug_text := slug_text || ' ' || region;
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

-- MPs slug trigger
CREATE OR REPLACE FUNCTION public.set_mp_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' OR (TG_OP = 'UPDATE' AND OLD.full_name != NEW.full_name) THEN
    NEW.slug := public.generate_politician_slug(NEW.full_name, 'MP', NEW.constituency, NEW.id, 'mps');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_mp_slug ON mps;
CREATE TRIGGER trigger_set_mp_slug
  BEFORE INSERT OR UPDATE ON mps
  FOR EACH ROW
  EXECUTE FUNCTION public.set_mp_slug();

-- Senators slug trigger
CREATE OR REPLACE FUNCTION public.set_senator_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' OR (TG_OP = 'UPDATE' AND OLD.full_name != NEW.full_name) THEN
    NEW.slug := public.generate_politician_slug(NEW.full_name, 'Senator', NEW.region, NEW.id, 'senators');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_senator_slug ON senators;
CREATE TRIGGER trigger_set_senator_slug
  BEFORE INSERT OR UPDATE ON senators
  FOR EACH ROW
  EXECUTE FUNCTION public.set_senator_slug();

-- Ministers slug trigger
CREATE OR REPLACE FUNCTION public.set_minister_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' OR (TG_OP = 'UPDATE' AND OLD.full_name != NEW.full_name) THEN
    NEW.slug := public.generate_politician_slug(NEW.full_name, NEW.position_title, NEW.ministry, NEW.id, 'ministers');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_minister_slug ON ministers;
CREATE TRIGGER trigger_set_minister_slug
  BEFORE INSERT OR UPDATE ON ministers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_minister_slug();

-- Politicians slug trigger
CREATE OR REPLACE FUNCTION public.set_politician_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' OR (TG_OP = 'UPDATE' AND OLD.name != NEW.name) THEN
    NEW.slug := public.generate_politician_slug(NEW.name, NEW.role_title, NEW.region, NEW.id, 'politicians');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_politician_slug ON politicians;
CREATE TRIGGER trigger_set_politician_slug
  BEFORE INSERT OR UPDATE ON politicians
  FOR EACH ROW
  EXECUTE FUNCTION public.set_politician_slug();

-- Update existing records to generate slugs
UPDATE political_parties SET slug = public.generate_political_party_slug(name, id) WHERE slug IS NULL;
UPDATE mps SET slug = public.generate_politician_slug(full_name, 'MP', constituency, id, 'mps') WHERE slug IS NULL;
UPDATE senators SET slug = public.generate_politician_slug(full_name, 'Senator', region, id, 'senators') WHERE slug IS NULL;
UPDATE ministers SET slug = public.generate_politician_slug(full_name, position_title, ministry, id, 'ministers') WHERE slug IS NULL;
UPDATE politicians SET slug = public.generate_politician_slug(name, role_title, region, id, 'politicians') WHERE slug IS NULL;

-- Create a slug redirect table for maintaining old URLs
CREATE TABLE IF NOT EXISTS public.slug_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  old_slug text NOT NULL,
  new_slug text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(entity_type, old_slug)
);

-- Enable RLS on slug redirects
ALTER TABLE public.slug_redirects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to redirects
CREATE POLICY "Public can read slug redirects" ON public.slug_redirects
FOR SELECT USING (true);

-- Only admins can manage redirects
CREATE POLICY "Admins can manage slug redirects" ON public.slug_redirects
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Function to handle slug changes and create redirects
CREATE OR REPLACE FUNCTION public.handle_slug_redirect()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- If this is an update and the slug changed, create a redirect
  IF TG_OP = 'UPDATE' AND OLD.slug IS NOT NULL AND OLD.slug != NEW.slug THEN
    INSERT INTO public.slug_redirects (entity_type, entity_id, old_slug, new_slug)
    VALUES (TG_TABLE_NAME, NEW.id, OLD.slug, NEW.slug)
    ON CONFLICT (entity_type, old_slug) DO UPDATE SET
      new_slug = EXCLUDED.new_slug,
      created_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add redirect triggers to all slug-enabled tables
CREATE TRIGGER trigger_handle_political_party_redirect
  AFTER UPDATE ON political_parties
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_slug_redirect();

CREATE TRIGGER trigger_handle_mp_redirect
  AFTER UPDATE ON mps
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_slug_redirect();

CREATE TRIGGER trigger_handle_senator_redirect
  AFTER UPDATE ON senators
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_slug_redirect();

CREATE TRIGGER trigger_handle_minister_redirect
  AFTER UPDATE ON ministers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_slug_redirect();

CREATE TRIGGER trigger_handle_politician_redirect
  AFTER UPDATE ON politicians
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_slug_redirect();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_political_parties_slug ON political_parties(slug);
CREATE INDEX IF NOT EXISTS idx_mps_slug ON mps(slug);
CREATE INDEX IF NOT EXISTS idx_senators_slug ON senators(slug);
CREATE INDEX IF NOT EXISTS idx_ministers_slug ON ministers(slug);
CREATE INDEX IF NOT EXISTS idx_politicians_slug ON politicians(slug);
CREATE INDEX IF NOT EXISTS idx_slug_redirects_lookup ON slug_redirects(entity_type, old_slug);

-- Function to resolve slug (handles redirects)
CREATE OR REPLACE FUNCTION public.resolve_slug(entity_type text, input_slug text)
RETURNS table(resolved_slug text, entity_id uuid, is_redirect boolean)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  redirect_record record;
  sql_query text;
  result_record record;
BEGIN
  -- First check if this is a redirect
  SELECT new_slug, entity_id INTO redirect_record
  FROM public.slug_redirects 
  WHERE slug_redirects.entity_type = resolve_slug.entity_type 
    AND old_slug = input_slug;
  
  IF FOUND THEN
    -- Return the redirect
    RETURN QUERY SELECT redirect_record.new_slug, redirect_record.entity_id, true;
    RETURN;
  END IF;
  
  -- Otherwise, look up the entity directly
  sql_query := format('SELECT slug, id FROM %I WHERE slug = $1', entity_type);
  EXECUTE sql_query INTO result_record USING input_slug;
  
  IF FOUND THEN
    RETURN QUERY SELECT result_record.slug, result_record.id, false;
  END IF;
END;
$$;