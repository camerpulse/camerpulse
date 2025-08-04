-- Create MPs table
CREATE TABLE public.mps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  constituency TEXT,
  political_party TEXT,
  region TEXT,
  date_of_birth DATE,
  education TEXT,
  profile_picture_url TEXT,
  career_timeline JSONB DEFAULT '[]'::jsonb,
  bills_sponsored INTEGER DEFAULT 0,
  parliament_attendance NUMERIC(5,2) DEFAULT 0,
  term_start_date DATE,
  term_end_date DATE,
  media_appearances INTEGER DEFAULT 0,
  email TEXT,
  phone TEXT,
  village_hometown TEXT,
  official_profile_url TEXT,
  is_claimed BOOLEAN DEFAULT false,
  claimed_by UUID,
  is_verified BOOLEAN DEFAULT false,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  transparency_score NUMERIC(3,2) DEFAULT 0,
  civic_engagement_score NUMERIC(3,2) DEFAULT 0,
  crisis_response_score NUMERIC(3,2) DEFAULT 0,
  promise_delivery_score NUMERIC(3,2) DEFAULT 0,
  legislative_activity_score NUMERIC(3,2) DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  can_receive_messages BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Ministers table
CREATE TABLE public.ministers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  position_title TEXT NOT NULL,
  ministry TEXT NOT NULL,
  political_party TEXT,
  region TEXT,
  date_of_birth DATE,
  education TEXT,
  profile_picture_url TEXT,
  career_timeline JSONB DEFAULT '[]'::jsonb,
  term_start_date DATE,
  term_end_date DATE,
  email TEXT,
  phone TEXT,
  village_hometown TEXT,
  official_profile_url TEXT,
  is_claimed BOOLEAN DEFAULT false,
  claimed_by UUID,
  is_verified BOOLEAN DEFAULT false,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  transparency_score NUMERIC(3,2) DEFAULT 0,
  civic_engagement_score NUMERIC(3,2) DEFAULT 0,
  crisis_response_score NUMERIC(3,2) DEFAULT 0,
  promise_delivery_score NUMERIC(3,2) DEFAULT 0,
  performance_score NUMERIC(3,2) DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  can_receive_messages BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create MP ratings table
CREATE TABLE public.mp_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mp_id UUID NOT NULL REFERENCES public.mps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  transparency_rating INTEGER CHECK (transparency_rating >= 1 AND transparency_rating <= 5),
  civic_engagement_rating INTEGER CHECK (civic_engagement_rating >= 1 AND civic_engagement_rating <= 5),
  crisis_response_rating INTEGER CHECK (crisis_response_rating >= 1 AND crisis_response_rating <= 5),
  promise_delivery_rating INTEGER CHECK (promise_delivery_rating >= 1 AND promise_delivery_rating <= 5),
  legislative_activity_rating INTEGER CHECK (legislative_activity_rating >= 1 AND legislative_activity_rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Minister ratings table
CREATE TABLE public.minister_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  minister_id UUID NOT NULL REFERENCES public.ministers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  transparency_rating INTEGER CHECK (transparency_rating >= 1 AND transparency_rating <= 5),
  civic_engagement_rating INTEGER CHECK (civic_engagement_rating >= 1 AND civic_engagement_rating <= 5),
  crisis_response_rating INTEGER CHECK (crisis_response_rating >= 1 AND crisis_response_rating <= 5),
  promise_delivery_rating INTEGER CHECK (promise_delivery_rating >= 1 AND promise_delivery_rating <= 5),
  performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create MP followers table
CREATE TABLE public.mp_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mp_id UUID NOT NULL REFERENCES public.mps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mp_id, user_id)
);

-- Create Minister followers table
CREATE TABLE public.minister_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  minister_id UUID NOT NULL REFERENCES public.ministers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(minister_id, user_id)
);

-- Create MP claims table
CREATE TABLE public.mp_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mp_id UUID NOT NULL REFERENCES public.mps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  claim_type TEXT NOT NULL DEFAULT 'ownership',
  claim_reason TEXT,
  evidence_files TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Minister claims table
CREATE TABLE public.minister_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  minister_id UUID NOT NULL REFERENCES public.ministers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  claim_type TEXT NOT NULL DEFAULT 'ownership',
  claim_reason TEXT,
  evidence_files TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mp_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minister_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mp_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minister_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mp_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minister_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for MPs
CREATE POLICY "MPs are viewable by everyone" ON public.mps FOR SELECT USING (true);
CREATE POLICY "Admins can manage MPs" ON public.mps FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Claimed MPs can update their profiles" ON public.mps FOR UPDATE USING (
  is_claimed = true AND claimed_by = auth.uid()
);

-- RLS Policies for Ministers
CREATE POLICY "Ministers are viewable by everyone" ON public.ministers FOR SELECT USING (true);
CREATE POLICY "Admins can manage Ministers" ON public.ministers FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Claimed Ministers can update their profiles" ON public.ministers FOR UPDATE USING (
  is_claimed = true AND claimed_by = auth.uid()
);

-- RLS Policies for Ratings
CREATE POLICY "MP ratings are viewable by everyone" ON public.mp_ratings FOR SELECT USING (true);
CREATE POLICY "Users can manage their own MP ratings" ON public.mp_ratings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Minister ratings are viewable by everyone" ON public.minister_ratings FOR SELECT USING (true);
CREATE POLICY "Users can manage their own Minister ratings" ON public.minister_ratings FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Followers
CREATE POLICY "Users can manage their own MP follows" ON public.mp_followers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "MP owners can view their followers" ON public.mp_followers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.mps WHERE id = mp_id AND claimed_by = auth.uid())
);

CREATE POLICY "Users can manage their own Minister follows" ON public.minister_followers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Minister owners can view their followers" ON public.minister_followers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ministers WHERE id = minister_id AND claimed_by = auth.uid())
);

-- RLS Policies for Claims
CREATE POLICY "Users can create MP claims" ON public.mp_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own MP claims" ON public.mp_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all MP claims" ON public.mp_claims FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can create Minister claims" ON public.minister_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own Minister claims" ON public.minister_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all Minister claims" ON public.minister_claims FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create indexes for performance
CREATE INDEX idx_mps_region ON public.mps(region);
CREATE INDEX idx_mps_political_party ON public.mps(political_party);
CREATE INDEX idx_mps_constituency ON public.mps(constituency);
CREATE INDEX idx_mps_average_rating ON public.mps(average_rating);
CREATE INDEX idx_mps_claimed ON public.mps(is_claimed);

CREATE INDEX idx_ministers_ministry ON public.ministers(ministry);
CREATE INDEX idx_ministers_region ON public.ministers(region);
CREATE INDEX idx_ministers_average_rating ON public.ministers(average_rating);
CREATE INDEX idx_ministers_claimed ON public.ministers(is_claimed);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_mp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mps_updated_at
  BEFORE UPDATE ON public.mps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mp_updated_at();

CREATE TRIGGER update_ministers_updated_at
  BEFORE UPDATE ON public.ministers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mp_updated_at();

CREATE TRIGGER update_mp_ratings_updated_at
  BEFORE UPDATE ON public.mp_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mp_updated_at();

CREATE TRIGGER update_minister_ratings_updated_at
  BEFORE UPDATE ON public.minister_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mp_updated_at();