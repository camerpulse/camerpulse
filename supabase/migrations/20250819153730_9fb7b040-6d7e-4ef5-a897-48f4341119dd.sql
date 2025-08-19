-- Ensure required extension for exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create party_affiliations table (if not exists)
CREATE TABLE IF NOT EXISTS public.party_affiliations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  politician_id UUID NOT NULL REFERENCES public.politicians(id) ON DELETE CASCADE,
  party_id UUID NOT NULL REFERENCES public.political_parties(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  position_in_party TEXT,
  reason_for_change TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Add exclusion constraint to prevent multiple current affiliations per politician
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'no_multiple_current_affiliations'
  ) THEN
    ALTER TABLE public.party_affiliations
    ADD CONSTRAINT no_multiple_current_affiliations
    EXCLUDE USING gist (politician_id WITH =) WHERE (is_current);
  END IF;
END$$;

-- Create politician_ratings table (if not exists)
CREATE TABLE IF NOT EXISTS public.politician_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  politician_id UUID NOT NULL REFERENCES public.politicians(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  leadership_rating INTEGER CHECK (leadership_rating BETWEEN 1 AND 5),
  transparency_rating INTEGER CHECK (transparency_rating BETWEEN 1 AND 5),
  performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 5),
  accessibility_rating INTEGER CHECK (accessibility_rating BETWEEN 1 AND 5),
  review_title TEXT,
  review_content TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  flagged_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(politician_id, user_id)
);

-- Enable RLS
ALTER TABLE public.party_affiliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politician_ratings ENABLE ROW LEVEL SECURITY;

-- Policies for party_affiliations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='party_affiliations' AND policyname='Party affiliations are viewable by everyone'
  ) THEN
    CREATE POLICY "Party affiliations are viewable by everyone"
      ON public.party_affiliations FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='party_affiliations' AND policyname='Admins can manage party affiliations'
  ) THEN
    CREATE POLICY "Admins can manage party affiliations"
      ON public.party_affiliations FOR ALL
      USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role))
      WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));
  END IF;
END$$;

-- Policies for politician_ratings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='politician_ratings' AND policyname='Politician ratings are viewable by everyone'
  ) THEN
    CREATE POLICY "Politician ratings are viewable by everyone"
      ON public.politician_ratings FOR SELECT USING (NOT is_flagged);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='politician_ratings' AND policyname='Users can create ratings'
  ) THEN
    CREATE POLICY "Users can create ratings"
      ON public.politician_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='politician_ratings' AND policyname='Users can update their own ratings'
  ) THEN
    CREATE POLICY "Users can update their own ratings"
      ON public.politician_ratings FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='politician_ratings' AND policyname='Admins can manage all ratings'
  ) THEN
    CREATE POLICY "Admins can manage all ratings"
      ON public.politician_ratings FOR ALL
      USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));
  END IF;
END$$;

-- Slug generation functions and triggers
CREATE OR REPLACE FUNCTION public.generate_party_slug(party_name TEXT)
RETURNS TEXT AS $$
DECLARE base_slug TEXT; final_slug TEXT; counter INTEGER := 0; BEGIN
  base_slug := lower(trim(regexp_replace(party_name, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.political_parties WHERE slug = final_slug) LOOP
    counter := counter + 1; final_slug := base_slug || '-' || counter;
  END LOOP; RETURN final_slug; END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_politician_slug(politician_name TEXT, position_title TEXT)
RETURNS TEXT AS $$
DECLARE base_slug TEXT; final_slug TEXT; counter INTEGER := 0; BEGIN
  base_slug := lower(trim(regexp_replace(politician_name || '-' || position_title, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.politicians WHERE slug = final_slug) LOOP
    counter := counter + 1; final_slug := base_slug || '-' || counter;
  END LOOP; RETURN final_slug; END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_party_slug()
RETURNS TRIGGER AS $$ BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN NEW.slug := public.generate_party_slug(NEW.name); END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_politician_slug()
RETURNS TRIGGER AS $$ BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN NEW.slug := public.generate_politician_slug(NEW.full_name, NEW.position_title); END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_party_slug_trigger ON public.political_parties;
CREATE TRIGGER set_party_slug_trigger BEFORE INSERT ON public.political_parties FOR EACH ROW EXECUTE FUNCTION public.set_party_slug();

DROP TRIGGER IF EXISTS set_politician_slug_trigger ON public.politicians;
CREATE TRIGGER set_politician_slug_trigger BEFORE INSERT ON public.politicians FOR EACH ROW EXECUTE FUNCTION public.set_politician_slug();

-- Rating aggregation trigger
CREATE OR REPLACE FUNCTION public.update_politician_rating()
RETURNS TRIGGER AS $$ BEGIN
  IF TG_OP IN ('INSERT','UPDATE') THEN
    UPDATE public.politicians SET
      overall_rating = (
        SELECT COALESCE(ROUND(AVG(overall_rating)::numeric, 2), 0)
        FROM public.politician_ratings WHERE politician_id = NEW.politician_id AND NOT is_flagged
      ),
      total_ratings = (
        SELECT COUNT(*) FROM public.politician_ratings WHERE politician_id = NEW.politician_id AND NOT is_flagged
      ),
      updated_at = now()
    WHERE id = NEW.politician_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.politicians SET
      overall_rating = (
        SELECT COALESCE(ROUND(AVG(overall_rating)::numeric, 2), 0)
        FROM public.politician_ratings WHERE politician_id = OLD.politician_id AND NOT is_flagged
      ),
      total_ratings = (
        SELECT COUNT(*) FROM public.politician_ratings WHERE politician_id = OLD.politician_id AND NOT is_flagged
      ),
      updated_at = now()
    WHERE id = OLD.politician_id;
  END IF; RETURN COALESCE(NEW, OLD); END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_politician_rating_trigger ON public.politician_ratings;
CREATE TRIGGER update_politician_rating_trigger AFTER INSERT OR UPDATE OR DELETE ON public.politician_ratings FOR EACH ROW EXECUTE FUNCTION public.update_politician_rating();

-- Affiliation change handler (enforce single current + member counts)
CREATE OR REPLACE FUNCTION public.handle_affiliation_change()
RETURNS TRIGGER AS $$ BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_current THEN
      UPDATE public.party_affiliations SET is_current=false, end_date=CURRENT_DATE, updated_at=now()
      WHERE politician_id=NEW.politician_id AND id<>NEW.id AND is_current=true;
      UPDATE public.politicians SET is_independent=false, updated_at=now() WHERE id=NEW.politician_id;
      UPDATE public.political_parties SET member_count = GREATEST(member_count + 1, 0), updated_at=now() WHERE id=NEW.party_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_current = true AND NEW.is_current = false THEN
      UPDATE public.political_parties SET member_count = GREATEST(member_count - 1, 0), updated_at=now() WHERE id=OLD.party_id;
    ELSIF OLD.is_current = false AND NEW.is_current = true THEN
      UPDATE public.party_affiliations SET is_current=false, end_date=CURRENT_DATE, updated_at=now()
      WHERE politician_id=NEW.politician_id AND id<>NEW.id AND is_current=true;
      UPDATE public.political_parties SET member_count = member_count + 1, updated_at=now() WHERE id=NEW.party_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_current = true THEN
      UPDATE public.politicians SET is_independent = true, updated_at=now() WHERE id=OLD.politician_id;
      UPDATE public.political_parties SET member_count = GREATEST(member_count - 1, 0), updated_at=now() WHERE id=OLD.party_id;
    END IF;
  END IF; RETURN COALESCE(NEW, OLD); END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_affiliation_change_trigger ON public.party_affiliations;
CREATE TRIGGER handle_affiliation_change_trigger AFTER INSERT OR UPDATE OR DELETE ON public.party_affiliations FOR EACH ROW EXECUTE FUNCTION public.handle_affiliation_change();

-- When a party is deleted, mark active affiliates as independent and end affiliations
CREATE OR REPLACE FUNCTION public.handle_party_delete()
RETURNS TRIGGER AS $$ BEGIN
  UPDATE public.politicians p
  SET is_independent = true, updated_at = now()
  WHERE EXISTS (
    SELECT 1 FROM public.party_affiliations a
    WHERE a.politician_id = p.id AND a.party_id = OLD.id AND a.is_current = true
  );
  UPDATE public.party_affiliations SET is_current=false, end_date=CURRENT_DATE, updated_at=now()
  WHERE party_id = OLD.id AND is_current = true;
  RETURN OLD; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_party_delete_trigger ON public.political_parties;
CREATE TRIGGER handle_party_delete_trigger BEFORE DELETE ON public.political_parties FOR EACH ROW EXECUTE FUNCTION public.handle_party_delete();

-- Updated_at triggers for new tables
DROP TRIGGER IF EXISTS update_affiliations_updated_at ON public.party_affiliations;
CREATE TRIGGER update_affiliations_updated_at BEFORE UPDATE ON public.party_affiliations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ratings_updated_at ON public.politician_ratings;
CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON public.politician_ratings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();