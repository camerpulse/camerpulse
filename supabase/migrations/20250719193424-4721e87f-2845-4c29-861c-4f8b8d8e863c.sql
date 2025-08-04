-- Create School Directory Tables (without enum creation)

-- Create schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('nursery', 'primary', 'secondary', 'vocational', 'university', 'special')),
  ownership TEXT NOT NULL CHECK (ownership IN ('government', 'private', 'community', 'religious', 'ngo')),
  region TEXT NOT NULL,
  division TEXT NOT NULL,
  village_or_city TEXT NOT NULL,
  languages_taught TEXT[] DEFAULT '{}',
  programs_offered TEXT,
  photo_gallery TEXT[] DEFAULT '{}',
  founder_or_don TEXT,
  contact_info JSONB DEFAULT '{}',
  phone TEXT,
  email TEXT,
  website TEXT,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified')),
  is_claimable BOOLEAN DEFAULT true,
  claimed_by UUID,
  claimed_at TIMESTAMPTZ,
  submitted_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- Rating fields (calculated from school_ratings)
  overall_rating NUMERIC(3,2) DEFAULT 0.0,
  total_ratings INTEGER DEFAULT 0,
  aggregate_ratings JSONB DEFAULT '{}'
);

-- Create school_ratings table
CREATE TABLE IF NOT EXISTS public.school_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  teaching_quality INTEGER CHECK (teaching_quality >= 1 AND teaching_quality <= 5),
  academic_performance INTEGER CHECK (academic_performance >= 1 AND academic_performance <= 5),
  infrastructure INTEGER CHECK (infrastructure >= 1 AND infrastructure <= 5),
  discipline_safety INTEGER CHECK (discipline_safety >= 1 AND discipline_safety <= 5),
  tech_access INTEGER CHECK (tech_access >= 1 AND tech_access <= 5),
  community_trust INTEGER CHECK (community_trust >= 1 AND community_trust <= 5),
  inclusiveness INTEGER CHECK (inclusiveness >= 1 AND inclusiveness <= 5),
  overall_rating NUMERIC(3,2),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, user_id)
);

-- Create school_claims table
CREATE TABLE IF NOT EXISTS public.school_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  claim_type TEXT NOT NULL DEFAULT 'ownership',
  claim_reason TEXT,
  evidence_files TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance (IF NOT EXISTS is implicit for indexes in PostgreSQL)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_schools_region') THEN
    CREATE INDEX idx_schools_region ON public.schools(region);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_schools_type') THEN
    CREATE INDEX idx_schools_type ON public.schools(type);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_schools_ownership') THEN
    CREATE INDEX idx_schools_ownership ON public.schools(ownership);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_schools_location') THEN
    CREATE INDEX idx_schools_location ON public.schools(region, division, village_or_city);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_claims ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (DROP IF EXISTS to avoid conflicts)
DROP POLICY IF EXISTS "Schools are viewable by everyone" ON public.schools;
CREATE POLICY "Schools are viewable by everyone" ON public.schools
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can add schools" ON public.schools;
CREATE POLICY "Authenticated users can add schools" ON public.schools
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "School ratings are viewable by everyone" ON public.school_ratings;
CREATE POLICY "School ratings are viewable by everyone" ON public.school_ratings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own ratings" ON public.school_ratings;
CREATE POLICY "Users can manage their own ratings" ON public.school_ratings
  FOR ALL USING (auth.uid() = user_id);

-- Insert sample data (ON CONFLICT DO NOTHING to avoid duplicates)
INSERT INTO public.schools (name, type, ownership, region, division, village_or_city, languages_taught, programs_offered, phone, email) VALUES
('Government Bilingual High School Yaoundé', 'secondary', 'government', 'Centre', 'Mfoundi', 'Yaoundé', '{"English", "French"}', 'General Secondary Education, Technical Streams', '+237123456789', 'contact@gbhsy.cm'),
('University of Yaoundé I', 'university', 'government', 'Centre', 'Mfoundi', 'Yaoundé', '{"English", "French"}', 'Medicine, Law, Arts, Sciences, Engineering', '+237123456790', 'info@uy1.cm'),
('Sacred Heart College Mankon', 'secondary', 'religious', 'Northwest', 'Mezam', 'Bamenda', '{"English"}', 'Secondary Education, Arts and Sciences', '+237123456791', 'shc@mankon.cm'),
('Government Primary School Douala', 'primary', 'government', 'Littoral', 'Wouri', 'Douala', '{"French"}', 'Primary Education Curriculum', '+237123456792', 'gps@douala.cm')
ON CONFLICT (name) DO NOTHING;