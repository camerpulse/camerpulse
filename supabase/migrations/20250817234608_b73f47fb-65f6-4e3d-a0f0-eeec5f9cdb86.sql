-- Create enums for political entities
CREATE TYPE political_party_status AS ENUM ('active', 'inactive', 'dissolved', 'suspended');
CREATE TYPE politician_status AS ENUM ('active', 'inactive', 'deceased', 'retired');
CREATE TYPE political_position_type AS ENUM ('senator', 'mp', 'minister', 'mayor', 'council_member', 'traditional_leader', 'party_leader');

-- Create political parties table
CREATE TABLE public.political_parties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  acronym TEXT,
  slug TEXT UNIQUE NOT NULL,
  founded_date DATE,
  headquarters_address TEXT,
  official_website TEXT,
  party_president TEXT,
  secretary_general TEXT,
  logo_url TEXT,
  party_colors TEXT[],
  ideology TEXT[],
  political_spectrum TEXT, -- left, center-left, center, center-right, right
  status political_party_status DEFAULT 'active',
  member_count INTEGER DEFAULT 0,
  description TEXT,
  vision_statement TEXT,
  mission_statement TEXT,
  manifesto_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  social_media_links JSONB DEFAULT '{}',
  regions_of_influence TEXT[],
  electoral_performance JSONB DEFAULT '{}', -- historical election results
  leadership_structure JSONB DEFAULT '{}',
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'pending', 'unverified', 'disputed')),
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create politicians table
CREATE TABLE public.politicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  date_of_birth DATE,
  place_of_birth TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  nationality TEXT DEFAULT 'Cameroonian',
  profile_picture_url TEXT,
  biography TEXT,
  education_background TEXT[],
  political_party_id UUID REFERENCES political_parties(id),
  current_positions political_position_type[],
  previous_positions JSONB DEFAULT '[]', -- array of position objects with dates
  constituency TEXT,
  region TEXT,
  division TEXT,
  election_history JSONB DEFAULT '[]', -- electoral history
  achievements TEXT[],
  controversies TEXT[],
  policy_positions JSONB DEFAULT '{}',
  committee_memberships TEXT[],
  languages_spoken TEXT[],
  marital_status TEXT,
  children_count INTEGER,
  net_worth_estimate BIGINT, -- in FCFA
  assets_declared JSONB DEFAULT '{}',
  contact_info JSONB DEFAULT '{}', -- phone, email, office address
  social_media_handles JSONB DEFAULT '{}',
  website_url TEXT,
  status politician_status DEFAULT 'active',
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'pending', 'unverified', 'disputed')),
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create political positions table (for tracking current and historical positions)
CREATE TABLE public.political_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  position_type political_position_type NOT NULL,
  position_title TEXT NOT NULL,
  institution TEXT, -- e.g., "National Assembly", "Senate", "Government"
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT true,
  appointment_method TEXT, -- elected, appointed, nominated
  constituency TEXT,
  region TEXT,
  salary_range TEXT,
  responsibilities TEXT[],
  achievements_in_role TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create politician ratings table
CREATE TABLE public.politician_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  transparency_rating INTEGER CHECK (transparency_rating >= 1 AND transparency_rating <= 5),
  responsiveness_rating INTEGER CHECK (responsiveness_rating >= 1 AND responsiveness_rating <= 5),
  integrity_rating INTEGER CHECK (integrity_rating >= 1 AND integrity_rating <= 5),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  accessibility_rating INTEGER CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
  review_title TEXT,
  review_content TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  flagged_reason TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(politician_id, user_id)
);

-- Create political party members junction table
CREATE TABLE public.political_party_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL REFERENCES political_parties(id) ON DELETE CASCADE,
  politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  membership_start_date DATE NOT NULL,
  membership_end_date DATE,
  is_current_member BOOLEAN DEFAULT true,
  membership_type TEXT DEFAULT 'member', -- member, executive, founder, honorary
  position_in_party TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(party_id, politician_id, membership_start_date)
);

-- Create political news/updates table
CREATE TABLE public.political_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  politician_id UUID REFERENCES politicians(id),
  political_party_id UUID REFERENCES political_parties(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  update_type TEXT NOT NULL, -- news, statement, announcement, achievement, controversy
  tags TEXT[],
  source_url TEXT,
  source_name TEXT,
  is_verified BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.political_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.political_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politician_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.political_party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.political_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for political_parties
CREATE POLICY "Political parties are publicly viewable" 
ON public.political_parties FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage political parties" 
ON public.political_parties FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Verified users can create political parties" 
ON public.political_parties FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- RLS Policies for politicians
CREATE POLICY "Politicians are publicly viewable" 
ON public.politicians FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage politicians" 
ON public.politicians FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Verified users can create politician profiles" 
ON public.politicians FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- RLS Policies for political_positions
CREATE POLICY "Political positions are publicly viewable" 
ON public.political_positions FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage political positions" 
ON public.political_positions FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for politician_ratings
CREATE POLICY "Ratings are publicly viewable" 
ON public.politician_ratings FOR SELECT 
USING (NOT is_flagged);

CREATE POLICY "Users can manage their own ratings" 
ON public.politician_ratings FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "Moderators can manage all ratings" 
ON public.politician_ratings FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
));

-- RLS Policies for political_party_members
CREATE POLICY "Party memberships are publicly viewable" 
ON public.political_party_members FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage party memberships" 
ON public.political_party_members FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for political_updates
CREATE POLICY "Political updates are publicly viewable" 
ON public.political_updates FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage political updates" 
ON public.political_updates FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Verified users can create political updates" 
ON public.political_updates FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Functions for slug generation
CREATE OR REPLACE FUNCTION generate_political_party_slug(party_name TEXT)
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
  
  WHILE EXISTS (SELECT 1 FROM political_parties WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_politician_slug(politician_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(trim(regexp_replace(politician_name, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM politicians WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic slug generation
CREATE OR REPLACE FUNCTION set_political_party_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_political_party_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_politician_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_politician_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER political_party_slug_trigger
  BEFORE INSERT OR UPDATE ON political_parties
  FOR EACH ROW EXECUTE FUNCTION set_political_party_slug();

CREATE TRIGGER politician_slug_trigger
  BEFORE INSERT OR UPDATE ON politicians
  FOR EACH ROW EXECUTE FUNCTION set_politician_slug();

-- Function to update politician ratings
CREATE OR REPLACE FUNCTION update_politician_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE politicians SET
      average_rating = (
        SELECT ROUND(AVG(overall_rating::DECIMAL), 2)
        FROM politician_ratings 
        WHERE politician_id = NEW.politician_id AND NOT is_flagged
      ),
      total_ratings = (
        SELECT COUNT(*)
        FROM politician_ratings 
        WHERE politician_id = NEW.politician_id AND NOT is_flagged
      ),
      updated_at = now()
    WHERE id = NEW.politician_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE politicians SET
      average_rating = (
        SELECT COALESCE(ROUND(AVG(overall_rating::DECIMAL), 2), 0)
        FROM politician_ratings 
        WHERE politician_id = OLD.politician_id AND NOT is_flagged
      ),
      total_ratings = (
        SELECT COUNT(*)
        FROM politician_ratings 
        WHERE politician_id = OLD.politician_id AND NOT is_flagged
      ),
      updated_at = now()
    WHERE id = OLD.politician_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER politician_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON politician_ratings
  FOR EACH ROW EXECUTE FUNCTION update_politician_rating();

-- Function to update party member count
CREATE OR REPLACE FUNCTION update_party_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE political_parties SET
      member_count = (
        SELECT COUNT(*)
        FROM political_party_members 
        WHERE party_id = NEW.party_id AND is_current_member = true
      ),
      updated_at = now()
    WHERE id = NEW.party_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE political_parties SET
      member_count = (
        SELECT COUNT(*)
        FROM political_party_members 
        WHERE party_id = OLD.party_id AND is_current_member = true
      ),
      updated_at = now()
    WHERE id = OLD.party_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER party_member_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON political_party_members
  FOR EACH ROW EXECUTE FUNCTION update_party_member_count();

-- Indexes for performance
CREATE INDEX idx_politicians_party_id ON politicians(political_party_id);
CREATE INDEX idx_politicians_region ON politicians(region);
CREATE INDEX idx_politicians_status ON politicians(status);
CREATE INDEX idx_politicians_rating ON politicians(average_rating DESC);
CREATE INDEX idx_politicians_slug ON politicians(slug);

CREATE INDEX idx_political_parties_status ON political_parties(status);
CREATE INDEX idx_political_parties_slug ON political_parties(slug);
CREATE INDEX idx_political_parties_member_count ON political_parties(member_count DESC);

CREATE INDEX idx_political_positions_politician_id ON political_positions(politician_id);
CREATE INDEX idx_political_positions_current ON political_positions(is_current);

CREATE INDEX idx_politician_ratings_politician_id ON politician_ratings(politician_id);
CREATE INDEX idx_politician_ratings_user_id ON politician_ratings(user_id);

CREATE INDEX idx_party_members_party_id ON political_party_members(party_id);
CREATE INDEX idx_party_members_politician_id ON political_party_members(politician_id);
CREATE INDEX idx_party_members_current ON political_party_members(is_current_member);

CREATE INDEX idx_political_updates_politician_id ON political_updates(politician_id);
CREATE INDEX idx_political_updates_party_id ON political_updates(political_party_id);
CREATE INDEX idx_political_updates_published ON political_updates(published_at DESC);