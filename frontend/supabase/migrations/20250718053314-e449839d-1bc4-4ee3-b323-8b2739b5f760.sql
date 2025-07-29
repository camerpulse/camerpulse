-- Advanced User Profile System for CamerPulse
-- Create enhanced profile types and related tables

-- Create enum for profile types
CREATE TYPE profile_type AS ENUM (
  'normal_user',
  'politician',
  'political_party', 
  'artist',
  'company',
  'government_institution',
  'school',
  'ngo',
  'journalist',
  'activist',
  'camerpulse_official',
  'moderator'
);

-- Create enum for verification status
CREATE TYPE verification_status AS ENUM (
  'pending',
  'verified',
  'rejected',
  'under_review'
);

-- Enhance existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_type profile_type DEFAULT 'normal_user',
ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS profession TEXT,
ADD COLUMN IF NOT EXISTS civic_tagline TEXT,
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS subdivision TEXT,
ADD COLUMN IF NOT EXISTS civic_influence_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS polls_created INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS events_attended INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rich_bio JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"profile_visible": true, "allow_followers": true, "show_region": true}',
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT now();

-- Create profile analytics table
CREATE TABLE IF NOT EXISTS public.profile_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value INTEGER NOT NULL DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Create profile ratings table for eligible profiles
CREATE TABLE IF NOT EXISTS public.profile_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rated_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rater_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating_type TEXT NOT NULL CHECK (rating_type IN ('trust', 'performance', 'transparency', 'responsiveness')),
  rating_value INTEGER NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(rated_profile_id, rater_user_id, rating_type)
);

-- Create profile verification requests table
CREATE TABLE IF NOT EXISTS public.profile_verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_type profile_type NOT NULL,
  supporting_documents JSONB DEFAULT '[]',
  verification_notes TEXT,
  admin_notes TEXT,
  status verification_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profile badges table
CREATE TABLE IF NOT EXISTS public.profile_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  awarded_by UUID REFERENCES auth.users(id),
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

-- Create profile activity timeline table
CREATE TABLE IF NOT EXISTS public.profile_activity_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_title TEXT NOT NULL,
  activity_description TEXT,
  activity_data JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profile reports table
CREATE TABLE IF NOT EXISTS public.profile_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('spam', 'harassment', 'impersonation', 'misinformation', 'inappropriate_content', 'other')),
  report_reason TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create professional profiles extension table
CREATE TABLE IF NOT EXISTS public.professional_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_name TEXT,
  position_title TEXT,
  department TEXT,
  years_experience INTEGER,
  education JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  skills TEXT[] DEFAULT '{}',
  portfolio_links JSONB DEFAULT '[]',
  salary_range TEXT,
  availability_status TEXT DEFAULT 'not_specified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.profile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_activity_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profile_analytics
CREATE POLICY "Users can view their own analytics" ON public.profile_analytics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can view all analytics" ON public.profile_analytics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create RLS policies for profile_ratings
CREATE POLICY "Users can view ratings for profiles" ON public.profile_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can rate other profiles" ON public.profile_ratings
  FOR INSERT WITH CHECK (rater_user_id = auth.uid());

CREATE POLICY "Users can update their own ratings" ON public.profile_ratings
  FOR UPDATE USING (rater_user_id = auth.uid());

-- Create RLS policies for profile_verification_requests
CREATE POLICY "Users can manage their verification requests" ON public.profile_verification_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all verification requests" ON public.profile_verification_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create RLS policies for profile_badges
CREATE POLICY "Public can view active badges" ON public.profile_badges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage badges" ON public.profile_badges
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create RLS policies for profile_activity_timeline
CREATE POLICY "Users can view public activity" ON public.profile_activity_timeline
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own activity" ON public.profile_activity_timeline
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
  );

CREATE POLICY "System can create activity entries" ON public.profile_activity_timeline
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for profile_reports
CREATE POLICY "Users can create reports" ON public.profile_reports
  FOR INSERT WITH CHECK (reporter_user_id = auth.uid());

CREATE POLICY "Users can view their own reports" ON public.profile_reports
  FOR SELECT USING (reporter_user_id = auth.uid());

CREATE POLICY "Admins can manage all reports" ON public.profile_reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create RLS policies for professional_profiles
CREATE POLICY "Public can view professional profiles" ON public.professional_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their professional profile" ON public.professional_profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_profile_type ON public.profiles(profile_type);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles(region);
CREATE INDEX IF NOT EXISTS idx_profiles_civic_influence_score ON public.profiles(civic_influence_score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at ON public.profiles(last_active_at DESC);

CREATE INDEX IF NOT EXISTS idx_profile_analytics_profile_id ON public.profile_analytics(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_metric_type ON public.profile_analytics(metric_type);

CREATE INDEX IF NOT EXISTS idx_profile_ratings_rated_profile_id ON public.profile_ratings(rated_profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_ratings_rating_type ON public.profile_ratings(rating_type);

CREATE INDEX IF NOT EXISTS idx_profile_reports_reported_profile_id ON public.profile_reports(reported_profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_reports_status ON public.profile_reports(status);

-- Create functions for profile management

-- Function to calculate civic influence score
CREATE OR REPLACE FUNCTION calculate_civic_influence_score(p_profile_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  influence_score INTEGER := 0;
  post_score INTEGER;
  follower_score INTEGER;
  rating_score INTEGER;
BEGIN
  -- Base score from posts (1 point per post, max 100)
  SELECT LEAST(100, COALESCE(post_count, 0)) INTO post_score
  FROM public.profiles WHERE id = p_profile_id;
  
  -- Score from followers (1 point per 10 followers, max 150)
  SELECT LEAST(150, COALESCE(COUNT(*) / 10, 0)) INTO follower_score
  FROM public.follows WHERE following_id = (
    SELECT user_id FROM public.profiles WHERE id = p_profile_id
  );
  
  -- Score from ratings (average rating * 20, max 100)
  SELECT LEAST(100, COALESCE(AVG(rating_value) * 20, 0)) INTO rating_score
  FROM public.profile_ratings WHERE rated_profile_id = p_profile_id;
  
  influence_score := post_score + follower_score + rating_score;
  
  -- Update the profile
  UPDATE public.profiles 
  SET civic_influence_score = influence_score,
      updated_at = now()
  WHERE id = p_profile_id;
  
  RETURN influence_score;
END;
$$;

-- Function to add activity timeline entry
CREATE OR REPLACE FUNCTION add_profile_activity(
  p_profile_id UUID,
  p_activity_type TEXT,
  p_activity_title TEXT,
  p_activity_description TEXT DEFAULT NULL,
  p_activity_data JSONB DEFAULT '{}',
  p_is_public BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.profile_activity_timeline (
    profile_id, activity_type, activity_title, activity_description, activity_data, is_public
  ) VALUES (
    p_profile_id, p_activity_type, p_activity_title, p_activity_description, p_activity_data, p_is_public
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- Function to update profile stats
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- This will be called by triggers on related tables
  -- Update post count, poll count etc.
  
  IF TG_TABLE_NAME = 'pulse_posts' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.profiles 
      SET post_count = post_count + 1,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.profiles 
      SET post_count = GREATEST(0, post_count - 1),
          updated_at = now()
      WHERE user_id = OLD.user_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for automatic updates
CREATE OR REPLACE TRIGGER update_profile_post_count
  AFTER INSERT OR DELETE ON public.pulse_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_stats();

-- Create function to clean old activity entries
CREATE OR REPLACE FUNCTION cleanup_old_profile_activities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Keep only last 100 activities per profile and delete entries older than 1 year
  DELETE FROM public.profile_activity_timeline
  WHERE created_at < NOW() - INTERVAL '1 year'
  OR id NOT IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY profile_id ORDER BY created_at DESC) as rn
      FROM public.profile_activity_timeline
    ) ranked
    WHERE rn <= 100
  );
END;
$$;