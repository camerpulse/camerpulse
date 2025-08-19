-- Continue SEO slug system - Politicians triggers and redirect system

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