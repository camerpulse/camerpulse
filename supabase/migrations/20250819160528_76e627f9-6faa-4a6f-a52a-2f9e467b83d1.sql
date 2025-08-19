-- Drop existing function first
DROP FUNCTION IF EXISTS public.generate_politician_slug(text, text);

-- First, let's create the unified politicians table
CREATE TABLE IF NOT EXISTS public.politicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'politician', -- 'mp', 'senator', 'minister', 'mayor', 'governor', 'politician'
  position_title TEXT,
  constituency TEXT,
  region TEXT,
  gender TEXT,
  date_of_birth DATE,
  biography TEXT,
  profile_picture_url TEXT,
  email TEXT,
  phone TEXT,
  website_url TEXT,
  social_media_links JSONB DEFAULT '{}',
  achievements TEXT[],
  committees TEXT[],
  education_background TEXT,
  professional_background TEXT,
  languages_spoken TEXT[],
  
  -- Ratings and metrics
  average_rating NUMERIC DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  transparency_rating NUMERIC DEFAULT 0.00,
  performance_rating NUMERIC DEFAULT 0.00,
  responsiveness_rating NUMERIC DEFAULT 0.00,
  
  -- Status and metadata
  is_active BOOLEAN DEFAULT true,
  term_start_date DATE,
  term_end_date DATE,
  verification_status TEXT DEFAULT 'unverified',
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- SEO and routing
  slug TEXT UNIQUE,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  
  CONSTRAINT valid_role CHECK (role IN ('mp', 'senator', 'minister', 'mayor', 'governor', 'politician')),
  CONSTRAINT valid_gender CHECK (gender IS NULL OR gender IN ('male', 'female', 'other')),
  CONSTRAINT valid_verification_status CHECK (verification_status IN ('unverified', 'pending', 'verified', 'disputed'))
);

-- Add missing columns to political_parties table
ALTER TABLE public.political_parties 
ADD COLUMN IF NOT EXISTS founding_date DATE,
ADD COLUMN IF NOT EXISTS headquarters_city TEXT,
ADD COLUMN IF NOT EXISTS headquarters_region TEXT,
ADD COLUMN IF NOT EXISTS official_website TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS party_president TEXT,
ADD COLUMN IF NOT EXISTS vice_president TEXT,
ADD COLUMN IF NOT EXISTS secretary_general TEXT,
ADD COLUMN IF NOT EXISTS treasurer TEXT,
ADD COLUMN IF NOT EXISTS mission TEXT,
ADD COLUMN IF NOT EXISTS vision TEXT,
ADD COLUMN IF NOT EXISTS ideology TEXT,
ADD COLUMN IF NOT EXISTS political_leaning TEXT,
ADD COLUMN IF NOT EXISTS historical_promises TEXT[],
ADD COLUMN IF NOT EXISTS promises_fulfilled INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS promises_failed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS promises_ongoing INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS approval_rating NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS transparency_rating NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS development_rating NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS trust_rating NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS founded_by TEXT[],
ADD COLUMN IF NOT EXISTS key_milestones JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS media_gallery TEXT[],
ADD COLUMN IF NOT EXISTS mps_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS senators_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mayors_count INTEGER DEFAULT 0;

-- Create party_affiliations table for tracking relationships
CREATE TABLE IF NOT EXISTS public.party_affiliations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  politician_id UUID NOT NULL REFERENCES public.politicians(id) ON DELETE CASCADE,
  party_id UUID NOT NULL REFERENCES public.political_parties(id) ON DELETE CASCADE,
  position_in_party TEXT, -- 'member', 'executive', 'leader', etc.
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  reason_for_leaving TEXT, -- 'resignation', 'expelled', 'switched_party', etc.
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  
  -- Ensure no overlapping current affiliations
  UNIQUE(politician_id, party_id, start_date)
);

-- Function to generate politician slug (with new name)
CREATE OR REPLACE FUNCTION public.create_politician_slug(pol_name TEXT, pol_role TEXT DEFAULT '')
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from name and role
  base_slug := lower(trim(regexp_replace(
    CASE WHEN pol_role != '' THEN pol_role || '-' || pol_name ELSE pol_name END,
    '[^a-zA-Z0-9\s]', '', 'g'
  )));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  -- Check for uniqueness
  WHILE EXISTS (SELECT 1 FROM public.politicians WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set politician slug
CREATE OR REPLACE FUNCTION public.set_politician_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.create_politician_slug(NEW.full_name, NEW.role);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER politician_slug_trigger
  BEFORE INSERT OR UPDATE ON public.politicians
  FOR EACH ROW
  EXECUTE FUNCTION public.set_politician_slug();

-- Function to update party member counts
CREATE OR REPLACE FUNCTION public.update_party_member_counts()
RETURNS TRIGGER AS $$
DECLARE
  old_party_id UUID;
  new_party_id UUID;
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    new_party_id := NEW.party_id;
    
    -- Update new party counts
    UPDATE public.political_parties SET
      mps_count = (
        SELECT COUNT(*) FROM public.party_affiliations pa
        JOIN public.politicians p ON pa.politician_id = p.id
        WHERE pa.party_id = new_party_id AND pa.is_current = true AND p.role = 'mp'
      ),
      senators_count = (
        SELECT COUNT(*) FROM public.party_affiliations pa
        JOIN public.politicians p ON pa.politician_id = p.id
        WHERE pa.party_id = new_party_id AND pa.is_current = true AND p.role = 'senator'
      ),
      mayors_count = (
        SELECT COUNT(*) FROM public.party_affiliations pa
        JOIN public.politicians p ON pa.politician_id = p.id
        WHERE pa.party_id = new_party_id AND pa.is_current = true AND p.role = 'mayor'
      )
    WHERE id = new_party_id;
  END IF;
  
  -- Handle UPDATE and DELETE - old party
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    old_party_id := OLD.party_id;
    
    -- Update old party counts if different from new
    IF old_party_id != new_party_id OR TG_OP = 'DELETE' THEN
      UPDATE public.political_parties SET
        mps_count = (
          SELECT COUNT(*) FROM public.party_affiliations pa
          JOIN public.politicians p ON pa.politician_id = p.id
          WHERE pa.party_id = old_party_id AND pa.is_current = true AND p.role = 'mp'
        ),
        senators_count = (
          SELECT COUNT(*) FROM public.party_affiliations pa
          JOIN public.politicians p ON pa.politician_id = p.id
          WHERE pa.party_id = old_party_id AND pa.is_current = true AND p.role = 'senator'
        ),
        mayors_count = (
          SELECT COUNT(*) FROM public.party_affiliations pa
          JOIN public.politicians p ON pa.politician_id = p.id
          WHERE pa.party_id = old_party_id AND pa.is_current = true AND p.role = 'mayor'
        )
      WHERE id = old_party_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER party_member_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.party_affiliations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_party_member_counts();

-- Function to handle party switching (end current, start new)
CREATE OR REPLACE FUNCTION public.switch_politician_party(
  p_politician_id UUID,
  p_new_party_id UUID,
  p_reason TEXT DEFAULT 'switched_party'
)
RETURNS UUID AS $$
DECLARE
  v_new_affiliation_id UUID;
BEGIN
  -- End current affiliations
  UPDATE public.party_affiliations 
  SET 
    is_current = false,
    end_date = CURRENT_DATE,
    reason_for_leaving = p_reason,
    updated_at = now()
  WHERE politician_id = p_politician_id AND is_current = true;
  
  -- Create new affiliation
  INSERT INTO public.party_affiliations (
    politician_id, party_id, is_current, start_date
  ) VALUES (
    p_politician_id, p_new_party_id, true, CURRENT_DATE
  ) RETURNING id INTO v_new_affiliation_id;
  
  RETURN v_new_affiliation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE public.politicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_affiliations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for politicians
CREATE POLICY "Politicians are viewable by everyone" ON public.politicians
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create politicians" ON public.politicians
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Politicians can update their own profiles" ON public.politicians
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all politicians" ON public.politicians
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- RLS Policies for party_affiliations
CREATE POLICY "Party affiliations are viewable by everyone" ON public.party_affiliations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create affiliations" ON public.party_affiliations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can manage all affiliations" ON public.party_affiliations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- Create party_ratings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.party_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL REFERENCES public.political_parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  approval_rating INTEGER NOT NULL CHECK (approval_rating >= 1 AND approval_rating <= 5),
  transparency_rating INTEGER NOT NULL CHECK (transparency_rating >= 1 AND transparency_rating <= 5),
  development_rating INTEGER NOT NULL CHECK (development_rating >= 1 AND development_rating <= 5),
  trust_rating INTEGER NOT NULL CHECK (trust_rating >= 1 AND trust_rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(party_id, user_id)
);

ALTER TABLE public.party_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own party ratings" ON public.party_ratings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Party ratings are viewable by everyone" ON public.party_ratings
  FOR SELECT USING (true);

-- Update timestamps trigger
CREATE OR REPLACE TRIGGER politician_updated_at_trigger
  BEFORE UPDATE ON public.politicians
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER party_affiliation_updated_at_trigger
  BEFORE UPDATE ON public.party_affiliations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER party_rating_updated_at_trigger
  BEFORE UPDATE ON public.party_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();