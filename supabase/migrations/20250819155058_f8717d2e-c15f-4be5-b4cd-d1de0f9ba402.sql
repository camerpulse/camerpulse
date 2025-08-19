-- Enhance the political parties and politicians system with proper relationships

-- Add missing columns to political_parties table
ALTER TABLE public.political_parties ADD COLUMN IF NOT EXISTS founding_date DATE;
ALTER TABLE public.political_parties ADD COLUMN IF NOT EXISTS chairman_name TEXT;
ALTER TABLE public.political_parties ADD COLUMN IF NOT EXISTS headquarters_address TEXT;
ALTER TABLE public.political_parties ADD COLUMN IF NOT EXISTS official_website TEXT;
ALTER TABLE public.political_parties ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;
ALTER TABLE public.political_parties ADD COLUMN IF NOT EXISTS national_assembly_seats INTEGER DEFAULT 0;
ALTER TABLE public.political_parties ADD COLUMN IF NOT EXISTS senate_seats INTEGER DEFAULT 0;

-- Create unified politicians table for easier management
CREATE TABLE IF NOT EXISTS public.politicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('mp', 'senator', 'minister', 'mayor', 'governor')),
  position_title TEXT,
  constituency TEXT,
  region TEXT,
  ministry TEXT, -- For ministers
  department TEXT, -- For ministers/mayors
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  education TEXT,
  profile_picture_url TEXT,
  biography TEXT,
  career_timeline JSONB DEFAULT '[]',
  term_start_date DATE,
  term_end_date DATE,
  email TEXT,
  phone TEXT,
  village_hometown TEXT,
  official_profile_url TEXT,
  social_media_links JSONB DEFAULT '{}',
  
  -- Status and verification
  is_active BOOLEAN DEFAULT true,
  is_claimed BOOLEAN DEFAULT false,
  claimed_by UUID,
  is_verified BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'unverified',
  
  -- Performance metrics
  average_rating NUMERIC(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  transparency_score NUMERIC(3,2) DEFAULT 0.00,
  civic_engagement_score NUMERIC(3,2) DEFAULT 0.00,
  performance_score NUMERIC(3,2) DEFAULT 0.00,
  
  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  can_receive_messages BOOLEAN DEFAULT true,
  
  -- Political party (current)
  current_party_id UUID REFERENCES public.political_parties(id),
  party_position TEXT, -- Position within the party
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- SEO
  slug TEXT UNIQUE
);

-- Enable RLS on politicians table
ALTER TABLE public.politicians ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for politicians
CREATE POLICY "Politicians are viewable by everyone" ON public.politicians
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage all politicians" ON public.politicians
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Verified users can add politicians" ON public.politicians
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Politicians can update their own profiles" ON public.politicians
  FOR UPDATE USING (claimed_by = auth.uid());

-- Create function to generate politician slug
CREATE OR REPLACE FUNCTION public.generate_politician_slug(politician_name TEXT, politician_role TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from name and role
  base_slug := lower(trim(regexp_replace(
    politician_name || '-' || politician_role, 
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

-- Create trigger for politician slug generation
CREATE OR REPLACE FUNCTION public.set_politician_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_politician_slug(NEW.full_name, NEW.role);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_politician_slug_trigger
  BEFORE INSERT OR UPDATE ON public.politicians
  FOR EACH ROW EXECUTE FUNCTION public.set_politician_slug();

-- Create trigger for updated_at
CREATE TRIGGER update_politicians_updated_at
  BEFORE UPDATE ON public.politicians
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enhance party_affiliations table
ALTER TABLE public.party_affiliations ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE public.party_affiliations ADD COLUMN IF NOT EXISTS verified_by UUID;
ALTER TABLE public.party_affiliations ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Create function to update party member counts
CREATE OR REPLACE FUNCTION public.update_party_member_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update member count for the old party (if removing/changing)
  IF OLD.party_id IS NOT NULL THEN
    UPDATE public.political_parties 
    SET member_count = (
      SELECT COUNT(*) 
      FROM public.party_affiliations 
      WHERE party_id = OLD.party_id AND is_current = true
    )
    WHERE id = OLD.party_id;
  END IF;
  
  -- Update member count for the new party (if adding/changing)
  IF NEW.party_id IS NOT NULL THEN
    UPDATE public.political_parties 
    SET member_count = (
      SELECT COUNT(*) 
      FROM public.party_affiliations 
      WHERE party_id = NEW.party_id AND is_current = true
    )
    WHERE id = NEW.party_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for party member count updates
CREATE TRIGGER update_party_member_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.party_affiliations
  FOR EACH ROW EXECUTE FUNCTION public.update_party_member_counts();

-- Function to switch politician party affiliation
CREATE OR REPLACE FUNCTION public.switch_politician_party(
  p_politician_id UUID,
  p_new_party_id UUID,
  p_position_in_party TEXT DEFAULT NULL,
  p_reason_for_change TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_affiliation_id UUID;
BEGIN
  -- End current affiliation
  UPDATE public.party_affiliations 
  SET 
    is_current = false,
    end_date = CURRENT_DATE,
    updated_at = now()
  WHERE politician_id = p_politician_id AND is_current = true;
  
  -- Create new affiliation
  INSERT INTO public.party_affiliations (
    politician_id, party_id, start_date, is_current, 
    position_in_party, reason_for_change
  ) VALUES (
    p_politician_id, p_new_party_id, CURRENT_DATE, true,
    p_position_in_party, p_reason_for_change
  ) RETURNING id INTO new_affiliation_id;
  
  -- Update politician's current party
  UPDATE public.politicians 
  SET 
    current_party_id = p_new_party_id,
    party_position = p_position_in_party,
    updated_at = now()
  WHERE id = p_politician_id;
  
  RETURN new_affiliation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_politicians_role ON public.politicians(role);
CREATE INDEX IF NOT EXISTS idx_politicians_region ON public.politicians(region);
CREATE INDEX IF NOT EXISTS idx_politicians_current_party ON public.politicians(current_party_id);
CREATE INDEX IF NOT EXISTS idx_politicians_slug ON public.politicians(slug);
CREATE INDEX IF NOT EXISTS idx_party_affiliations_current ON public.party_affiliations(politician_id, is_current);
CREATE INDEX IF NOT EXISTS idx_party_affiliations_party ON public.party_affiliations(party_id, is_current);