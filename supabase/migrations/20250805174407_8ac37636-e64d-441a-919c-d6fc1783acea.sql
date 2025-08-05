-- Unified User Profile System for CamerPulse
-- This creates the foundation for a scalable, SEO-friendly user profile system

-- Create enums for user roles and verification status
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin', 'artist', 'vendor', 'healthcare_provider', 'employer');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE profile_visibility AS ENUM ('public', 'private', 'friends_only');

-- Core unified profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Core identity fields
  username TEXT NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9_-]+$' AND length(username) >= 3),
  display_name TEXT NOT NULL CHECK (length(display_name) >= 2),
  email TEXT NOT NULL,
  
  -- Profile content
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  
  -- Location and contact
  location TEXT,
  region TEXT,
  country TEXT DEFAULT 'Cameroon',
  phone_number TEXT,
  website_url TEXT,
  
  -- Core settings
  primary_role user_role DEFAULT 'user',
  additional_roles user_role[] DEFAULT '{}',
  verification_status verification_status DEFAULT 'unverified',
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  
  -- Privacy settings
  profile_visibility profile_visibility DEFAULT 'public',
  show_email BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  
  -- SEO and discoverability
  slug TEXT NOT NULL UNIQUE,
  keywords TEXT[],
  social_links JSONB DEFAULT '{}',
  
  -- Profile metrics
  profile_completion_score INTEGER DEFAULT 0 CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  total_contributions INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Music platform profiles
CREATE TABLE public.music_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Artist information
  artist_name TEXT,
  stage_name TEXT,
  genre TEXT[],
  instruments TEXT[],
  years_active INTEGER,
  record_label TEXT,
  
  -- Music career details
  debut_date DATE,
  origin_city TEXT,
  music_style TEXT,
  influences TEXT[],
  collaborations TEXT[],
  
  -- Platform specific
  spotify_url TEXT,
  apple_music_url TEXT,
  youtube_channel TEXT,
  soundcloud_url TEXT,
  
  -- Metrics
  monthly_listeners INTEGER DEFAULT 0,
  total_streams INTEGER DEFAULT 0,
  total_releases INTEGER DEFAULT 0,
  
  -- Settings
  is_verified_artist BOOLEAN DEFAULT false,
  accepts_collaborations BOOLEAN DEFAULT true,
  available_for_booking BOOLEAN DEFAULT false,
  booking_rate_range TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job/Career profiles
CREATE TABLE public.job_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Professional information
  current_title TEXT,
  current_company TEXT,
  industry TEXT,
  experience_years INTEGER DEFAULT 0,
  education_level TEXT,
  
  -- Skills and expertise
  skills TEXT[],
  certifications TEXT[],
  languages TEXT[],
  salary_expectation_min INTEGER,
  salary_expectation_max INTEGER,
  currency TEXT DEFAULT 'FCFA',
  
  -- Availability
  employment_status TEXT DEFAULT 'seeking', -- seeking, employed, freelance, not_available
  available_for_relocation BOOLEAN DEFAULT false,
  remote_work_preference TEXT DEFAULT 'hybrid', -- remote, office, hybrid, no_preference
  
  -- Documents
  resume_url TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  
  -- Preferences
  preferred_job_types TEXT[],
  preferred_industries TEXT[],
  preferred_regions TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Village community memberships
CREATE TABLE public.village_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  village_id UUID NOT NULL, -- References villages table
  
  -- Membership details
  membership_type TEXT DEFAULT 'resident', -- resident, native, supporter, visitor
  residence_since DATE,
  family_ties TEXT,
  contribution_areas TEXT[],
  
  -- Community involvement
  is_village_leader BOOLEAN DEFAULT false,
  leadership_role TEXT,
  community_projects TEXT[],
  volunteer_activities TEXT[],
  
  -- Verification
  verified_by_chief BOOLEAN DEFAULT false,
  verification_document_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, village_id)
);

-- Marketplace vendor/buyer profiles
CREATE TABLE public.marketplace_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Vendor information
  business_name TEXT,
  business_type TEXT,
  business_registration_number TEXT,
  tax_id TEXT,
  
  -- Business details
  business_description TEXT,
  business_category TEXT[],
  established_date DATE,
  employee_count INTEGER,
  
  -- Contact and location
  business_address TEXT,
  business_phone TEXT,
  business_email TEXT,
  delivery_areas TEXT[],
  
  -- Settings
  is_verified_vendor BOOLEAN DEFAULT false,
  accepts_custom_orders BOOLEAN DEFAULT true,
  minimum_order_amount NUMERIC DEFAULT 0,
  
  -- Metrics
  total_sales INTEGER DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  average_rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  
  -- Payment and shipping
  accepted_payment_methods TEXT[],
  shipping_methods TEXT[],
  return_policy TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Healthcare provider profiles
CREATE TABLE public.healthcare_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Professional credentials
  medical_license_number TEXT,
  specialization TEXT[],
  medical_degree TEXT,
  institution_graduated TEXT,
  graduation_year INTEGER,
  
  -- Practice information
  practice_name TEXT,
  practice_type TEXT, -- hospital, clinic, private_practice, public_health
  years_of_experience INTEGER DEFAULT 0,
  
  -- Certifications and memberships
  board_certifications TEXT[],
  professional_memberships TEXT[],
  additional_training TEXT[],
  
  -- Services and availability
  services_offered TEXT[],
  consultation_types TEXT[], -- in_person, telemedicine, home_visit
  working_hours JSONB,
  emergency_availability BOOLEAN DEFAULT false,
  
  -- Verification
  license_verified BOOLEAN DEFAULT false,
  institution_verified BOOLEAN DEFAULT false,
  verified_by_health_board BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profile follows/connections
CREATE TABLE public.profile_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (main table)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (profile_visibility = 'public' OR user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own profile" ON public.profiles
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for module-specific profiles
CREATE POLICY "Module profiles visible based on main profile visibility" ON public.music_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = music_profiles.user_id 
      AND (p.profile_visibility = 'public' OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their own music profile" ON public.music_profiles
  FOR ALL USING (user_id = auth.uid());

-- Similar policies for other module profiles
CREATE POLICY "Module profiles visible based on main profile visibility" ON public.job_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = job_profiles.user_id 
      AND (p.profile_visibility = 'public' OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their own job profile" ON public.job_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Village memberships are publicly viewable" ON public.village_memberships
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own village memberships" ON public.village_memberships
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Marketplace profiles are publicly viewable" ON public.marketplace_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own marketplace profile" ON public.marketplace_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Healthcare profiles are publicly viewable" ON public.healthcare_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own healthcare profile" ON public.healthcare_profiles
  FOR ALL USING (user_id = auth.uid());

-- Profile follows policies
CREATE POLICY "Follows are publicly viewable" ON public.profile_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.profile_follows
  FOR INSERT WITH CHECK (
    follower_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can unfollow others" ON public.profile_follows
  FOR DELETE USING (
    follower_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Functions for slug generation and profile management
CREATE OR REPLACE FUNCTION public.generate_username_slug(username_input text)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase and replace spaces/special chars with hyphens
  base_slug := lower(trim(regexp_replace(username_input, '[^a-zA-Z0-9]+', '-', 'g')));
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_username text;
  generated_slug text;
BEGIN
  -- Generate default username from email
  default_username := split_part(NEW.email, '@', 1);
  generated_slug := public.generate_username_slug(default_username);
  
  -- Insert profile for new user
  INSERT INTO public.profiles (
    user_id,
    username,
    display_name,
    email,
    slug
  ) VALUES (
    NEW.id,
    default_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    generated_slug
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update profile completion score
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  score integer := 0;
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record FROM public.profiles WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN RETURN 0; END IF;
  
  -- Basic info (40 points)
  IF profile_record.display_name IS NOT NULL THEN score := score + 10; END IF;
  IF profile_record.bio IS NOT NULL AND length(profile_record.bio) > 20 THEN score := score + 10; END IF;
  IF profile_record.location IS NOT NULL THEN score := score + 5; END IF;
  IF profile_record.avatar_url IS NOT NULL THEN score := score + 15; END IF;
  
  -- Contact info (20 points)
  IF profile_record.phone_number IS NOT NULL THEN score := score + 10; END IF;
  IF profile_record.website_url IS NOT NULL THEN score := score + 10; END IF;
  
  -- Social links (20 points)
  IF jsonb_array_length(COALESCE(profile_record.social_links, '[]'::jsonb)) > 0 THEN score := score + 20; END IF;
  
  -- Additional roles and verification (20 points)
  IF array_length(profile_record.additional_roles, 1) > 0 THEN score := score + 10; END IF;
  IF profile_record.verification_status = 'verified' THEN score := score + 10; END IF;
  
  -- Update the score
  UPDATE public.profiles SET profile_completion_score = score WHERE user_id = p_user_id;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update follower counts
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increase following count for follower
    UPDATE public.profiles SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    -- Increase followers count for followed user
    UPDATE public.profiles SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrease following count for follower
    UPDATE public.profiles SET following_count = following_count - 1 
    WHERE id = OLD.follower_id;
    
    -- Decrease followers count for followed user
    UPDATE public.profiles SET followers_count = followers_count - 1 
    WHERE id = OLD.following_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for follow count updates
CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON public.profile_follows
  FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();

-- Update timestamp triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_music_profiles_updated_at
  BEFORE UPDATE ON public.music_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_profiles_updated_at
  BEFORE UPDATE ON public.job_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_village_memberships_updated_at
  BEFORE UPDATE ON public.village_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_profiles_updated_at
  BEFORE UPDATE ON public.marketplace_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_healthcare_profiles_updated_at
  BEFORE UPDATE ON public.healthcare_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_slug ON public.profiles(slug);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_verification ON public.profiles(verification_status);
CREATE INDEX idx_profiles_visibility ON public.profiles(profile_visibility);
CREATE INDEX idx_profiles_region ON public.profiles(region);

CREATE INDEX idx_music_profiles_user_id ON public.music_profiles(user_id);
CREATE INDEX idx_music_profiles_verified ON public.music_profiles(is_verified_artist);

CREATE INDEX idx_job_profiles_user_id ON public.job_profiles(user_id);
CREATE INDEX idx_job_profiles_status ON public.job_profiles(employment_status);

CREATE INDEX idx_village_memberships_village ON public.village_memberships(village_id);
CREATE INDEX idx_village_memberships_user ON public.village_memberships(user_id);

CREATE INDEX idx_marketplace_profiles_verified ON public.marketplace_profiles(is_verified_vendor);
CREATE INDEX idx_marketplace_profiles_category ON public.marketplace_profiles USING GIN(business_category);

CREATE INDEX idx_healthcare_profiles_specialization ON public.healthcare_profiles USING GIN(specialization);
CREATE INDEX idx_healthcare_profiles_verified ON public.healthcare_profiles(license_verified);

CREATE INDEX idx_profile_follows_follower ON public.profile_follows(follower_id);
CREATE INDEX idx_profile_follows_following ON public.profile_follows(following_id);