-- Create follows table for user connections
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Create policies for follows table
CREATE POLICY "Users can view follows" 
ON public.follows 
FOR SELECT 
USING (true);

CREATE POLICY "Users can follow others" 
ON public.follows 
FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" 
ON public.follows 
FOR DELETE 
USING (auth.uid() = follower_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON public.follows(created_at);

-- Update profiles table to ensure proper schema
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS is_diaspora BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS profile_type TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS civic_influence_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS allow_messages BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS languages TEXT[],
ADD COLUMN IF NOT EXISTS work_experience JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS portfolio_items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE;

-- Create function to generate username from email
CREATE OR REPLACE FUNCTION generate_username_from_email(email_input TEXT)
RETURNS TEXT AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 1;
BEGIN
  -- Extract username part from email and clean it
  base_username := regexp_replace(split_part(email_input, '@', 1), '[^a-zA-Z0-9_]', '', 'g');
  base_username := lower(base_username);
  
  -- Ensure it's not too long
  IF length(base_username) > 20 THEN
    base_username := left(base_username, 20);
  END IF;
  
  -- Ensure it's not too short
  IF length(base_username) < 3 THEN
    base_username := base_username || 'user';
  END IF;
  
  final_username := base_username;
  
  -- Check if username exists and increment if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    final_username := base_username || counter::TEXT;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the trigger function to set username for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    user_id, 
    username,
    display_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.id,
    generate_username_from_email(NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add profile completion calculation function
CREATE OR REPLACE FUNCTION calculate_profile_completion(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  completion_score INTEGER := 0;
  profile_data RECORD;
BEGIN
  SELECT * INTO profile_data FROM public.profiles WHERE id = profile_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Basic info (40 points total)
  IF profile_data.display_name IS NOT NULL AND length(profile_data.display_name) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_data.bio IS NOT NULL AND length(profile_data.bio) > 10 THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF profile_data.avatar_url IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_data.location IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;
  
  -- Skills and interests (30 points total)
  IF profile_data.skills IS NOT NULL AND array_length(profile_data.skills, 1) > 0 THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF profile_data.interests IS NOT NULL AND array_length(profile_data.interests, 1) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_data.languages IS NOT NULL AND array_length(profile_data.languages, 1) > 0 THEN
    completion_score := completion_score + 5;
  END IF;
  
  -- Experience and education (20 points total)
  IF profile_data.work_experience IS NOT NULL AND jsonb_array_length(profile_data.work_experience) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_data.education IS NOT NULL AND jsonb_array_length(profile_data.education) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Contact and social (10 points total)
  IF profile_data.website IS NOT NULL OR profile_data.phone IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;
  
  IF profile_data.social_links IS NOT NULL AND jsonb_object_keys(profile_data.social_links) IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;
  
  -- Update the profile with the calculated score
  UPDATE public.profiles 
  SET profile_completion_score = completion_score 
  WHERE id = profile_id;
  
  RETURN completion_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';