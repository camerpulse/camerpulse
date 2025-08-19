-- Add missing slug columns and complete slug system

-- Add slug columns to missing tables
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.petitions ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create slug generation functions for all entities
CREATE OR REPLACE FUNCTION public.generate_hospital_slug(hospital_name text, location text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(trim(regexp_replace(
    hospital_name || '-' || location, 
    '[^a-zA-Z0-9\s]', '', 'g'
  )));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.hospitals WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_school_slug(school_name text, location text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(trim(regexp_replace(
    school_name || '-' || location, 
    '[^a-zA-Z0-9\s]', '', 'g'
  )));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.schools WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_event_slug(event_title text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(trim(regexp_replace(
    event_title, 
    '[^a-zA-Z0-9\s]', '', 'g'
  )));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.events WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_petition_slug(petition_title text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(trim(regexp_replace(
    petition_title, 
    '[^a-zA-Z0-9\s]', '', 'g'
  )));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.petitions WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Create triggers to automatically generate slugs
CREATE OR REPLACE FUNCTION public.set_hospital_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_hospital_slug(NEW.name, NEW.village_or_city);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_school_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_school_slug(NEW.name, NEW.village_or_city);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_event_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_event_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;

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

-- Create triggers
CREATE TRIGGER trigger_hospital_slug
  BEFORE INSERT OR UPDATE ON public.hospitals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_hospital_slug();

CREATE TRIGGER trigger_school_slug
  BEFORE INSERT OR UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.set_school_slug();

CREATE TRIGGER trigger_event_slug
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_event_slug();

CREATE TRIGGER trigger_petition_slug
  BEFORE INSERT OR UPDATE ON public.petitions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_petition_slug();

-- Generate slugs for existing records
UPDATE public.hospitals 
SET slug = public.generate_hospital_slug(name, village_or_city)
WHERE slug IS NULL OR slug = '';

UPDATE public.schools 
SET slug = public.generate_school_slug(name, village_or_city)
WHERE slug IS NULL OR slug = '';

UPDATE public.events 
SET slug = public.generate_event_slug(title)
WHERE slug IS NULL OR slug = '';

UPDATE public.petitions 
SET slug = public.generate_petition_slug(title)
WHERE slug IS NULL OR slug = '';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_hospitals_slug ON public.hospitals(slug);
CREATE INDEX IF NOT EXISTS idx_schools_slug ON public.schools(slug);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_petitions_slug ON public.petitions(slug);