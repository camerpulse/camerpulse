-- PulseProfile v4.0 Database Upgrade
-- Adding missing fields and tables for comprehensive profile system

-- Add profile slug for unique URLs (camerpulse.com/@username)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_slug text UNIQUE,
ADD COLUMN IF NOT EXISTS civic_interests text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS profile_tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS contribution_level text DEFAULT 'bronze' CHECK (contribution_level IN ('bronze', 'silver', 'gold', 'platinum')),
ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'en' CHECK (language_preference IN ('en', 'fr')),
ADD COLUMN IF NOT EXISTS enable_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_messages boolean DEFAULT true;

-- Generate profile slugs for existing users
UPDATE public.profiles 
SET profile_slug = LOWER(REPLACE(username, ' ', '_'))
WHERE profile_slug IS NULL;

-- Profile Settings table for detailed privacy controls
CREATE TABLE IF NOT EXISTS public.profile_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  hide_polls boolean DEFAULT false,
  hide_activity boolean DEFAULT false,
  hide_followers boolean DEFAULT false,
  hide_location boolean DEFAULT false,
  show_civic_score boolean DEFAULT true,
  show_contact_info boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User Saved Content table
CREATE TABLE IF NOT EXISTS public.user_saved_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('poll', 'post', 'event', 'article')),
  content_id uuid NOT NULL,
  saved_at timestamp with time zone DEFAULT now()
);

-- Profile Achievements/Badges system
CREATE TABLE IF NOT EXISTS public.profile_achievement_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  category text NOT NULL CHECK (category IN ('civic', 'engagement', 'contribution', 'special')),
  criteria jsonb DEFAULT '{}',
  points_value integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- User Achievement instances
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type_id uuid REFERENCES public.profile_achievement_types(id),
  awarded_at timestamp with time zone DEFAULT now(),
  progress_data jsonb DEFAULT '{}',
  UNIQUE(user_id, achievement_type_id)
);

-- Profile Activity Log (enhanced)
CREATE TABLE IF NOT EXISTS public.profile_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_title text NOT NULL,
  activity_description text,
  metadata jsonb DEFAULT '{}',
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Verification Requests table
CREATE TABLE IF NOT EXISTS public.profile_verification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type text NOT NULL CHECK (verification_type IN ('identity', 'profession', 'institution')),
  documents_submitted jsonb DEFAULT '[]',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  admin_notes text,
  reviewed_by uuid,
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone
);

-- Insert default achievement types
INSERT INTO public.profile_achievement_types (name, description, icon, category, criteria, points_value) VALUES
('Top Voter', 'Voted in 50+ polls', '🗳️', 'civic', '{"polls_voted": 50}', 100),
('Peace Advocate', 'Promoted peaceful discussion', '🕊️', 'civic', '{"peaceful_interactions": 100}', 150),
('Election Watcher', 'Active during election periods', '👁️', 'civic', '{"election_engagement": 25}', 200),
('Community Builder', 'Helped build local community', '🏘️', 'engagement', '{"community_events": 10}', 120),
('Transparency Champion', 'Advocated for government transparency', '🔍', 'civic', '{"transparency_score": 85}', 180),
('Youth Leader', 'Leadership in youth initiatives', '🎓', 'special', '{"youth_activities": 20}', 160),
('First Voter', 'Cast your first vote', '✨', 'civic', '{"first_vote": true}', 50),
('Poll Creator', 'Created 10+ public polls', '📊', 'engagement', '{"polls_created": 10}', 80),
('Active Citizen', 'Consistent civic engagement', '🏛️', 'civic', '{"monthly_activity": 12}', 250),
('Verified Member', 'Completed profile verification', '✅', 'special', '{"verified": true}', 300)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.profile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_achievement_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_verification_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_settings
CREATE POLICY "Users can manage their own settings" ON public.profile_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
  );

-- RLS Policies for user_saved_content
CREATE POLICY "Users can manage their saved content" ON public.user_saved_content
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for achievements
CREATE POLICY "Achievement types are visible to all" ON public.profile_achievement_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "User achievements are visible to all" ON public.user_achievements
  FOR SELECT USING (true);

CREATE POLICY "System can award achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

-- RLS Policies for activity log
CREATE POLICY "Users can view public activities" ON public.profile_activity_log
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage their own activities" ON public.profile_activity_log
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for verification queue
CREATE POLICY "Users can manage their verification requests" ON public.profile_verification_queue
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all verification requests" ON public.profile_verification_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Function to auto-create profile settings
CREATE OR REPLACE FUNCTION public.create_profile_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profile_settings (profile_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create settings when profile is created
DROP TRIGGER IF EXISTS create_profile_settings_trigger ON public.profiles;
CREATE TRIGGER create_profile_settings_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_settings();

-- Function to calculate contribution level based on activities
CREATE OR REPLACE FUNCTION public.calculate_contribution_level(p_user_id uuid)
RETURNS text AS $$
DECLARE
  total_points integer := 0;
  contribution_level text := 'bronze';
BEGIN
  -- Get total points from achievements
  SELECT COALESCE(SUM(pat.points_value), 0) INTO total_points
  FROM public.user_achievements ua
  JOIN public.profile_achievement_types pat ON ua.achievement_type_id = pat.id
  WHERE ua.user_id = p_user_id;
  
  -- Add points from profile activities
  SELECT total_points + 
    COALESCE((SELECT civic_influence_score FROM public.profiles WHERE user_id = p_user_id), 0) / 10
  INTO total_points;
  
  -- Determine level
  IF total_points >= 1000 THEN
    contribution_level := 'platinum';
  ELSIF total_points >= 500 THEN
    contribution_level := 'gold';
  ELSIF total_points >= 200 THEN
    contribution_level := 'silver';
  ELSE
    contribution_level := 'bronze';
  END IF;
  
  -- Update profile
  UPDATE public.profiles 
  SET contribution_level = calculate_contribution_level.contribution_level
  WHERE user_id = p_user_id;
  
  RETURN contribution_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(profile_slug);
CREATE INDEX IF NOT EXISTS idx_user_saved_content_user ON public.user_saved_content(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_activity_user ON public.profile_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_queue_status ON public.profile_verification_queue(status);

-- Create auto-update trigger for profiles
CREATE OR REPLACE FUNCTION public.update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_updated_at();

DROP TRIGGER IF EXISTS update_profile_settings_updated_at ON public.profile_settings;
CREATE TRIGGER update_profile_settings_updated_at
  BEFORE UPDATE ON public.profile_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_updated_at();