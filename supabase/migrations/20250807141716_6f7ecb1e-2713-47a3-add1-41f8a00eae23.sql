-- Create enum for traditional leader titles
CREATE TYPE traditional_title AS ENUM (
  'fon', 'chief', 'sultan', 'lamido', 'emir', 'oba', 'sarki', 'etsu', 'mai'
);

-- Create traditional leaders table
CREATE TABLE traditional_leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  title traditional_title NOT NULL,
  village_id UUID REFERENCES villages(id) ON DELETE SET NULL,
  region TEXT NOT NULL,
  division TEXT,
  subdivision TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  accession_date DATE,
  birth_date DATE,
  biography TEXT,
  portrait_url TEXT,
  regalia_photos TEXT[],
  honors TEXT[],
  achievements TEXT[],
  cultural_significance TEXT,
  languages_spoken TEXT[],
  contact_phone TEXT,
  contact_email TEXT,
  official_residence TEXT,
  dynasty_name TEXT,
  predecessor_name TEXT,
  successor_name TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_notes TEXT,
  overall_rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  slug TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deceased', 'abdicated', 'suspended'))
);

-- Enable RLS
ALTER TABLE traditional_leaders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Traditional leaders are viewable by everyone" 
ON traditional_leaders 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create leader profiles" 
ON traditional_leaders 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can manage all leader profiles" 
ON traditional_leaders 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Creators can update their submissions" 
ON traditional_leaders 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Create traditional leader ratings table
CREATE TABLE traditional_leader_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id UUID NOT NULL REFERENCES traditional_leaders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  leadership_rating INTEGER CHECK (leadership_rating >= 1 AND leadership_rating <= 5),
  cultural_preservation_rating INTEGER CHECK (cultural_preservation_rating >= 1 AND cultural_preservation_rating <= 5),
  community_development_rating INTEGER CHECK (community_development_rating >= 1 AND community_development_rating <= 5),
  accessibility_rating INTEGER CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
  review_title TEXT,
  review_content TEXT,
  helpful_count INTEGER DEFAULT 0,
  is_flagged BOOLEAN DEFAULT false,
  flagged_reason TEXT,
  moderated_by UUID,
  moderated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(leader_id, user_id)
);

-- Enable RLS for ratings
ALTER TABLE traditional_leader_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ratings
CREATE POLICY "Ratings are publicly viewable" 
ON traditional_leader_ratings 
FOR SELECT 
USING (NOT is_flagged);

CREATE POLICY "Authenticated users can create ratings" 
ON traditional_leader_ratings 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON traditional_leader_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ratings" 
ON traditional_leader_ratings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create function to generate leader slug
CREATE OR REPLACE FUNCTION generate_leader_slug(leader_name TEXT, title_name TEXT, village_name TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from name, title, and village
  base_slug := lower(trim(regexp_replace(
    COALESCE(title_name, '') || '-' || leader_name || CASE WHEN village_name IS NOT NULL THEN '-' || village_name ELSE '' END,
    '[^a-zA-Z0-9\s]', '', 'g'
  )));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  -- Check for uniqueness
  WHILE EXISTS (SELECT 1 FROM traditional_leaders WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set slug
CREATE OR REPLACE FUNCTION set_leader_slug() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_leader_slug(
      NEW.full_name, 
      NEW.title::TEXT,
      (SELECT village_name FROM villages WHERE id = NEW.village_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_leader_slug_trigger
  BEFORE INSERT OR UPDATE ON traditional_leaders
  FOR EACH ROW
  EXECUTE FUNCTION set_leader_slug();

-- Create function to update leader ratings
CREATE OR REPLACE FUNCTION update_leader_rating() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE traditional_leaders SET
      overall_rating = (
        SELECT ROUND(AVG(overall_rating::DECIMAL), 2)
        FROM traditional_leader_ratings 
        WHERE leader_id = NEW.leader_id AND NOT is_flagged
      ),
      total_ratings = (
        SELECT COUNT(*)
        FROM traditional_leader_ratings 
        WHERE leader_id = NEW.leader_id AND NOT is_flagged
      ),
      updated_at = now()
    WHERE id = NEW.leader_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE traditional_leaders SET
      overall_rating = (
        SELECT COALESCE(ROUND(AVG(overall_rating::DECIMAL), 2), 0)
        FROM traditional_leader_ratings 
        WHERE leader_id = OLD.leader_id AND NOT is_flagged
      ),
      total_ratings = (
        SELECT COUNT(*)
        FROM traditional_leader_ratings 
        WHERE leader_id = OLD.leader_id AND NOT is_flagged
      ),
      updated_at = now()
    WHERE id = OLD.leader_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leader_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON traditional_leader_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_leader_rating();

-- Create indexes for better performance
CREATE INDEX idx_traditional_leaders_region ON traditional_leaders(region);
CREATE INDEX idx_traditional_leaders_title ON traditional_leaders(title);
CREATE INDEX idx_traditional_leaders_village ON traditional_leaders(village_id);
CREATE INDEX idx_traditional_leaders_rating ON traditional_leaders(overall_rating DESC);
CREATE INDEX idx_traditional_leaders_slug ON traditional_leaders(slug);
CREATE INDEX idx_traditional_leader_ratings_leader ON traditional_leader_ratings(leader_id);

-- Create function to automatically add leader when village is created
CREATE OR REPLACE FUNCTION create_village_leader() 
RETURNS TRIGGER AS $$
BEGIN
  -- Only create if village has leadership information
  IF NEW.village_chief_name IS NOT NULL OR NEW.fon_name IS NOT NULL THEN
    INSERT INTO traditional_leaders (
      full_name,
      title,
      village_id,
      region,
      division,
      subdivision,
      created_by,
      created_at
    ) VALUES (
      COALESCE(NEW.fon_name, NEW.village_chief_name, 'Unknown'),
      CASE 
        WHEN NEW.fon_name IS NOT NULL THEN 'fon'::traditional_title
        ELSE 'chief'::traditional_title
      END,
      NEW.id,
      NEW.region,
      NEW.division,
      NEW.subdivision,
      NEW.created_by,
      NEW.created_at
    ) ON CONFLICT (slug) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic leader creation (if village table has these columns)
-- This will only work if the villages table has chief/fon name columns
-- CREATE TRIGGER create_village_leader_trigger
--   AFTER INSERT ON villages
--   FOR EACH ROW
--   EXECUTE FUNCTION create_village_leader();