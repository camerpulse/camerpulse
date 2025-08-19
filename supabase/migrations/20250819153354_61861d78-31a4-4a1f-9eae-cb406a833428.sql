-- Create political parties table
CREATE TABLE public.political_parties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  short_name TEXT,
  logo_url TEXT,
  description TEXT,
  founding_date DATE,
  chairman_name TEXT,
  ideology TEXT,
  headquarters_address TEXT,
  region TEXT,
  website_url TEXT,
  phone_number TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  member_count INTEGER DEFAULT 0,
  founded_by TEXT,
  political_orientation TEXT, -- left, right, center, etc
  status TEXT DEFAULT 'active', -- active, dissolved, suspended
  national_assembly_seats INTEGER DEFAULT 0,
  senate_seats INTEGER DEFAULT 0,
  regional_seats INTEGER DEFAULT 0,
  municipal_seats INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  slug TEXT UNIQUE
);

-- Create politicians table  
CREATE TABLE public.politicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  title TEXT, -- Hon., Dr., Prof., etc
  position_type TEXT NOT NULL, -- mp, senator, minister, mayor, governor
  position_title TEXT NOT NULL, -- Minister of Health, MP for Douala, etc
  constituency TEXT, -- for MPs
  region TEXT NOT NULL,
  division TEXT,
  subdivision TEXT,
  gender TEXT,
  date_of_birth DATE,
  photo_url TEXT,
  biography TEXT,
  education JSONB DEFAULT '[]',
  career_history JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  committees JSONB DEFAULT '[]',
  contact_info JSONB DEFAULT '{}',
  social_media JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_independent BOOLEAN DEFAULT false,
  years_in_office INTEGER DEFAULT 0,
  term_start_date DATE,
  term_end_date DATE,
  office_address TEXT,
  phone_number TEXT,
  email TEXT,
  website_url TEXT,
  overall_rating NUMERIC(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'pending', -- pending, verified, unverified
  status TEXT DEFAULT 'active', -- active, inactive, deceased
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  slug TEXT UNIQUE
);

-- Create party affiliations table for tracking relationships and history
CREATE TABLE public.party_affiliations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  politician_id UUID NOT NULL REFERENCES public.politicians(id) ON DELETE CASCADE,
  party_id UUID NOT NULL REFERENCES public.political_parties(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE, -- NULL means current affiliation
  is_current BOOLEAN NOT NULL DEFAULT true,
  position_in_party TEXT, -- Secretary General, Vice Chairman, etc
  reason_for_change TEXT, -- defection, expulsion, resignation, etc
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Ensure no overlapping current affiliations
  CONSTRAINT no_multiple_current_affiliations 
    EXCLUDE (politician_id WITH =) WHERE (is_current = true),
    
  -- Ensure end_date is after start_date when both are present
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Create politician ratings table
CREATE TABLE public.politician_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  politician_id UUID NOT NULL REFERENCES public.politicians(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  leadership_rating INTEGER CHECK (leadership_rating >= 1 AND leadership_rating <= 5),
  transparency_rating INTEGER CHECK (transparency_rating >= 1 AND transparency_rating <= 5),
  performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
  accessibility_rating INTEGER CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
  review_title TEXT,
  review_content TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  flagged_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- One rating per user per politician
  UNIQUE(politician_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.political_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_affiliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politician_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for political_parties
CREATE POLICY "Political parties are viewable by everyone"
  ON public.political_parties FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage political parties"
  ON public.political_parties FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- RLS Policies for politicians
CREATE POLICY "Politicians are viewable by everyone"
  ON public.politicians FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage politicians"
  ON public.politicians FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- RLS Policies for party_affiliations
CREATE POLICY "Party affiliations are viewable by everyone"
  ON public.party_affiliations FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage party affiliations"
  ON public.party_affiliations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- RLS Policies for politician_ratings
CREATE POLICY "Politician ratings are viewable by everyone"
  ON public.politician_ratings FOR SELECT
  USING (NOT is_flagged);

CREATE POLICY "Users can create ratings"
  ON public.politician_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.politician_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ratings"
  ON public.politician_ratings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- Create slug generation functions
CREATE OR REPLACE FUNCTION public.generate_party_slug(party_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(trim(regexp_replace(party_name, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.political_parties WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_politician_slug(politician_name TEXT, position TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(trim(regexp_replace(
    politician_name || '-' || position, 
    '[^a-zA-Z0-9\s]', '', 'g'
  )));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.politicians WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic slug generation
CREATE OR REPLACE FUNCTION public.set_party_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_party_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_politician_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_politician_slug(NEW.full_name, NEW.position_title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_party_slug_trigger
  BEFORE INSERT ON public.political_parties
  FOR EACH ROW EXECUTE FUNCTION public.set_party_slug();

CREATE TRIGGER set_politician_slug_trigger
  BEFORE INSERT ON public.politicians
  FOR EACH ROW EXECUTE FUNCTION public.set_politician_slug();

-- Function to update politician ratings
CREATE OR REPLACE FUNCTION public.update_politician_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.politicians SET
      overall_rating = (
        SELECT ROUND(AVG(overall_rating::DECIMAL), 2)
        FROM public.politician_ratings 
        WHERE politician_id = NEW.politician_id AND NOT is_flagged
      ),
      total_ratings = (
        SELECT COUNT(*)
        FROM public.politician_ratings 
        WHERE politician_id = NEW.politician_id AND NOT is_flagged
      ),
      updated_at = now()
    WHERE id = NEW.politician_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.politicians SET
      overall_rating = (
        SELECT COALESCE(ROUND(AVG(overall_rating::DECIMAL), 2), 0)
        FROM public.politician_ratings 
        WHERE politician_id = OLD.politician_id AND NOT is_flagged
      ),
      total_ratings = (
        SELECT COUNT(*)
        FROM public.politician_ratings 
        WHERE politician_id = OLD.politician_id AND NOT is_flagged
      ),
      updated_at = now()
    WHERE id = OLD.politician_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_politician_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.politician_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_politician_rating();

-- Function to handle affiliation changes
CREATE OR REPLACE FUNCTION public.handle_affiliation_change()
RETURNS TRIGGER AS $$
BEGIN
  -- When setting a new current affiliation, end all other current affiliations for this politician
  IF NEW.is_current = true THEN
    UPDATE public.party_affiliations 
    SET 
      is_current = false, 
      end_date = CURRENT_DATE,
      updated_at = now()
    WHERE politician_id = NEW.politician_id 
      AND id != NEW.id 
      AND is_current = true;
      
    -- Update politician's independent status
    UPDATE public.politicians 
    SET is_independent = false, updated_at = now()
    WHERE id = NEW.politician_id;
  END IF;
  
  -- Update party member counts
  IF TG_OP = 'INSERT' AND NEW.is_current = true THEN
    UPDATE public.political_parties 
    SET member_count = member_count + 1, updated_at = now()
    WHERE id = NEW.party_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If affiliation ended
    IF OLD.is_current = true AND NEW.is_current = false THEN
      UPDATE public.political_parties 
      SET member_count = member_count - 1, updated_at = now()
      WHERE id = OLD.party_id;
    END IF;
    -- If new current affiliation
    IF OLD.is_current = false AND NEW.is_current = true THEN
      UPDATE public.political_parties 
      SET member_count = member_count + 1, updated_at = now()
      WHERE id = NEW.party_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.is_current = true THEN
    UPDATE public.political_parties 
    SET member_count = member_count - 1, updated_at = now()
    WHERE id = OLD.party_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_affiliation_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.party_affiliations
  FOR EACH ROW EXECUTE FUNCTION public.handle_affiliation_change();

-- Create updated_at triggers
CREATE TRIGGER update_parties_updated_at
  BEFORE UPDATE ON public.political_parties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_politicians_updated_at
  BEFORE UPDATE ON public.politicians
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliations_updated_at
  BEFORE UPDATE ON public.party_affiliations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON public.politician_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();