-- Step 5: Enhanced User Profiles & Personal Information

-- Create enhanced user profiles table
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  first_name text,
  last_name text,
  bio text,
  profile_picture_url text,
  cover_image_url text,
  location text,
  region text,
  country text DEFAULT 'Cameroon',
  phone_number text,
  date_of_birth date,
  gender text,
  website_url text,
  social_media_links jsonb DEFAULT '{}',
  skills text[] DEFAULT '{}',
  interests text[] DEFAULT '{}',
  languages text[] DEFAULT '{}',
  education jsonb DEFAULT '[]',
  work_experience jsonb DEFAULT '[]',
  achievements jsonb DEFAULT '[]',
  portfolio_items jsonb DEFAULT '[]',
  is_verified boolean DEFAULT false,
  verification_type text,
  verification_date timestamp with time zone,
  profile_visibility text DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'friends')),
  show_email boolean DEFAULT false,
  show_phone boolean DEFAULT false,
  show_location boolean DEFAULT true,
  allow_messages boolean DEFAULT true,
  allow_friend_requests boolean DEFAULT true,
  profile_completion_score integer DEFAULT 0,
  last_active timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create unique index on user_id
CREATE UNIQUE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Create index on username for fast lookups
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);

-- Create index on location for regional searches
CREATE INDEX idx_user_profiles_location ON public.user_profiles(region, country);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view public profiles" 
ON public.user_profiles 
FOR SELECT 
USING (profile_visibility = 'public');

CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create profile connections table (friends/following system)
CREATE TABLE public.profile_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_type text NOT NULL DEFAULT 'friend' CHECK (connection_type IN ('friend', 'follow')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Prevent duplicate connections
  UNIQUE(requester_id, receiver_id, connection_type)
);

-- Enable RLS for connections
ALTER TABLE public.profile_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_connections
CREATE POLICY "Users can view connections involving them" 
ON public.profile_connections 
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create connection requests" 
ON public.profile_connections 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update connections involving them" 
ON public.profile_connections 
FOR UPDATE 
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Create profile views tracking table
CREATE TABLE public.profile_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_ip inet,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  user_agent text,
  referrer text
);

-- Enable RLS for profile views
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_views
CREATE POLICY "Profile owners can view their profile analytics" 
ON public.profile_views 
FOR SELECT 
USING (auth.uid() = profile_user_id);

CREATE POLICY "System can track profile views" 
ON public.profile_views 
FOR INSERT 
WITH CHECK (true);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  achievement_name text NOT NULL,
  achievement_description text,
  achievement_icon text,
  achievement_data jsonb DEFAULT '{}',
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view featured achievements" 
ON public.user_achievements 
FOR SELECT 
USING (is_featured = true);

CREATE POLICY "System can award achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profile_connections_updated_at
  BEFORE UPDATE ON public.profile_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate profile completion score
CREATE OR REPLACE FUNCTION public.calculate_profile_completion_score(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  score integer := 0;
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record 
  FROM public.user_profiles 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Basic info (40 points total)
  IF profile_record.display_name IS NOT NULL THEN score := score + 10; END IF;
  IF profile_record.bio IS NOT NULL AND length(profile_record.bio) > 20 THEN score := score + 10; END IF;
  IF profile_record.location IS NOT NULL THEN score := score + 5; END IF;
  IF profile_record.profile_picture_url IS NOT NULL THEN score := score + 15; END IF;
  
  -- Contact info (20 points total)
  IF profile_record.phone_number IS NOT NULL THEN score := score + 10; END IF;
  IF profile_record.website_url IS NOT NULL THEN score := score + 10; END IF;
  
  -- Skills and interests (20 points total)
  IF array_length(profile_record.skills, 1) > 0 THEN score := score + 10; END IF;
  IF array_length(profile_record.interests, 1) > 0 THEN score := score + 10; END IF;
  
  -- Experience and education (20 points total)
  IF jsonb_array_length(profile_record.work_experience) > 0 THEN score := score + 10; END IF;
  IF jsonb_array_length(profile_record.education) > 0 THEN score := score + 10; END IF;
  
  -- Update the score in the profile
  UPDATE public.user_profiles 
  SET profile_completion_score = score 
  WHERE user_id = p_user_id;
  
  RETURN score;
END;
$$;

-- Function to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id, 
    username, 
    display_name,
    first_name,
    last_name
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();