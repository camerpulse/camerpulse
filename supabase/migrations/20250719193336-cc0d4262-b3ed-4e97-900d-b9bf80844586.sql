-- Create School Directory Database Schema

-- Create school_type enum
CREATE TYPE school_type AS ENUM ('nursery', 'primary', 'secondary', 'vocational', 'university', 'special');

-- Create school_ownership enum
CREATE TYPE school_ownership AS ENUM ('government', 'private', 'community', 'religious', 'ngo');

-- Create schools table
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type school_type NOT NULL,
  ownership school_ownership NOT NULL,
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
CREATE TABLE public.school_ratings (
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
CREATE TABLE public.school_claims (
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

-- Create school_updates table for monetization
CREATE TABLE public.school_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  update_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create school_monetization table
CREATE TABLE public.school_monetization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('claim_school', 'post_updates', 'enable_inbox', 'feature_school')),
  payment_amount NUMERIC(10,2),
  payment_currency TEXT DEFAULT 'XAF',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_reference TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_schools_region ON public.schools(region);
CREATE INDEX idx_schools_type ON public.schools(type);
CREATE INDEX idx_schools_ownership ON public.schools(ownership);
CREATE INDEX idx_schools_verification ON public.schools(verification_status);
CREATE INDEX idx_schools_location ON public.schools(region, division, village_or_city);
CREATE INDEX idx_schools_ratings_school ON public.school_ratings(school_id);
CREATE INDEX idx_schools_claims_school ON public.school_claims(school_id);
CREATE INDEX idx_schools_updates_school ON public.school_updates(school_id);

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_monetization ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Schools policies
CREATE POLICY "Schools are viewable by everyone" ON public.schools
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add schools" ON public.schools
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their submitted schools" ON public.schools
  FOR UPDATE USING (auth.uid() = submitted_by OR auth.uid() = claimed_by);

CREATE POLICY "Admins can manage all schools" ON public.schools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- School ratings policies
CREATE POLICY "School ratings are viewable by everyone" ON public.school_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own ratings" ON public.school_ratings
  FOR ALL USING (auth.uid() = user_id);

-- School claims policies
CREATE POLICY "Users can view their own claims" ON public.school_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create claims" ON public.school_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all claims" ON public.school_claims
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- School updates policies
CREATE POLICY "Public updates are viewable by everyone" ON public.school_updates
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "School owners can manage updates" ON public.school_updates
  FOR ALL USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.schools 
      WHERE id = school_id AND (submitted_by = auth.uid() OR claimed_by = auth.uid())
    )
  );

-- School monetization policies
CREATE POLICY "Users can view their own monetization" ON public.school_monetization
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create monetization records" ON public.school_monetization
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all monetization" ON public.school_monetization
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to update school ratings
CREATE OR REPLACE FUNCTION public.update_school_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the school's average ratings
  UPDATE public.schools 
  SET 
    overall_rating = (
      SELECT COALESCE(AVG(overall_rating), 0) 
      FROM public.school_ratings 
      WHERE school_id = COALESCE(NEW.school_id, OLD.school_id)
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM public.school_ratings 
      WHERE school_id = COALESCE(NEW.school_id, OLD.school_id)
    ),
    aggregate_ratings = (
      SELECT jsonb_build_object(
        'teaching_quality', COALESCE(AVG(teaching_quality), 0),
        'academic_performance', COALESCE(AVG(academic_performance), 0),
        'infrastructure', COALESCE(AVG(infrastructure), 0),
        'discipline_safety', COALESCE(AVG(discipline_safety), 0),
        'tech_access', COALESCE(AVG(tech_access), 0),
        'community_trust', COALESCE(AVG(community_trust), 0),
        'inclusiveness', COALESCE(AVG(inclusiveness), 0)
      )
      FROM public.school_ratings 
      WHERE school_id = COALESCE(NEW.school_id, OLD.school_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.school_id, OLD.school_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER update_school_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.school_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_school_ratings();

-- Insert sample data
INSERT INTO public.schools (name, type, ownership, region, division, village_or_city, languages_taught, programs_offered, phone, email) VALUES
('Government Bilingual High School Yaoundé', 'secondary', 'government', 'Centre', 'Mfoundi', 'Yaoundé', '{"English", "French"}', 'General Secondary Education, Technical Streams', '+237123456789', 'contact@gbhsy.cm'),
('University of Yaoundé I', 'university', 'government', 'Centre', 'Mfoundi', 'Yaoundé', '{"English", "French"}', 'Medicine, Law, Arts, Sciences, Engineering', '+237123456790', 'info@uy1.cm'),
('Sacred Heart College Mankon', 'secondary', 'religious', 'Northwest', 'Mezam', 'Bamenda', '{"English"}', 'Secondary Education, Arts and Sciences', '+237123456791', 'shc@mankon.cm'),
('Government Primary School Douala', 'primary', 'government', 'Littoral', 'Wouri', 'Douala', '{"French"}', 'Primary Education Curriculum', '+237123456792', 'gps@douala.cm');