-- Create enum types for schools directory (with conditional creation)
DO $$ BEGIN
    CREATE TYPE school_type AS ENUM ('nursery', 'primary', 'secondary', 'vocational', 'university', 'special');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE school_ownership AS ENUM ('government', 'private', 'community', 'religious', 'ngo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE claim_status AS ENUM ('unclaimed', 'pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  school_type school_type NOT NULL,
  ownership school_ownership NOT NULL,
  region TEXT NOT NULL,
  division TEXT NOT NULL,
  village_or_city TEXT NOT NULL,
  languages_taught TEXT[] DEFAULT ARRAY['English', 'French'],
  programs_offered TEXT,
  photo_gallery TEXT[] DEFAULT ARRAY[]::TEXT[],
  founder_or_don TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  contact_website TEXT,
  verification_status verification_status DEFAULT 'unverified',
  claim_status claim_status DEFAULT 'unclaimed',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  description TEXT,
  established_year INTEGER,
  student_capacity INTEGER,
  current_enrollment INTEGER,
  fees_range_min BIGINT,
  fees_range_max BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  claimed_by UUID REFERENCES auth.users(id),
  claimed_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create school ratings table
CREATE TABLE IF NOT EXISTS public.school_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teaching_quality INTEGER CHECK (teaching_quality >= 1 AND teaching_quality <= 5),
  academic_performance INTEGER CHECK (academic_performance >= 1 AND academic_performance <= 5),
  infrastructure INTEGER CHECK (infrastructure >= 1 AND infrastructure <= 5),
  discipline_safety INTEGER CHECK (discipline_safety >= 1 AND discipline_safety <= 5),
  tech_access INTEGER CHECK (tech_access >= 1 AND tech_access <= 5),
  community_trust INTEGER CHECK (community_trust >= 1 AND community_trust <= 5),
  inclusiveness INTEGER CHECK (inclusiveness >= 1 AND inclusiveness <= 5),
  overall_rating DECIMAL(3,2),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(school_id, user_id)
);

-- Create school claims table
CREATE TABLE IF NOT EXISTS public.school_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claim_reason TEXT NOT NULL,
  evidence_documents TEXT[] DEFAULT ARRAY[]::TEXT[],
  admin_notes TEXT,
  status claim_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create school updates table (for claimed schools)
CREATE TABLE IF NOT EXISTS public.school_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create school monetization features table
CREATE TABLE IF NOT EXISTS public.school_monetization (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL, -- 'claim', 'updates', 'inbox', 'featured'
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  payment_amount BIGINT,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance (with conditional creation)
DO $$ BEGIN
    CREATE INDEX idx_schools_region ON public.schools(region);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_schools_type ON public.schools(school_type);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_schools_ownership ON public.schools(ownership);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_schools_verification ON public.schools(verification_status);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_schools_location ON public.schools(latitude, longitude);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_monetization ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schools
DROP POLICY IF EXISTS "Anyone can view schools" ON public.schools;
CREATE POLICY "Anyone can view schools" ON public.schools FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create schools" ON public.schools;
CREATE POLICY "Authenticated users can create schools" ON public.schools FOR INSERT 
  TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "School owners can update their schools" ON public.schools;
CREATE POLICY "School owners can update their schools" ON public.schools FOR UPDATE 
  USING (auth.uid() = claimed_by OR auth.uid() = created_by);

DROP POLICY IF EXISTS "Admins can manage all schools" ON public.schools;
CREATE POLICY "Admins can manage all schools" ON public.schools FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS Policies for ratings
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.school_ratings;
CREATE POLICY "Anyone can view ratings" ON public.school_ratings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create ratings" ON public.school_ratings;
CREATE POLICY "Authenticated users can create ratings" ON public.school_ratings FOR INSERT 
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ratings" ON public.school_ratings;
CREATE POLICY "Users can update their own ratings" ON public.school_ratings FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.school_ratings;
CREATE POLICY "Users can delete their own ratings" ON public.school_ratings FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to calculate overall rating
CREATE OR REPLACE FUNCTION calculate_school_overall_rating()
RETURNS TRIGGER AS $$
BEGIN
  NEW.overall_rating := (
    COALESCE(NEW.teaching_quality, 0) + 
    COALESCE(NEW.academic_performance, 0) + 
    COALESCE(NEW.infrastructure, 0) + 
    COALESCE(NEW.discipline_safety, 0) + 
    COALESCE(NEW.tech_access, 0) + 
    COALESCE(NEW.community_trust, 0) + 
    COALESCE(NEW.inclusiveness, 0)
  ) / 7.0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for overall rating calculation
DROP TRIGGER IF EXISTS calculate_overall_rating_trigger ON public.school_ratings;
CREATE TRIGGER calculate_overall_rating_trigger
  BEFORE INSERT OR UPDATE ON public.school_ratings
  FOR EACH ROW
  EXECUTE FUNCTION calculate_school_overall_rating();