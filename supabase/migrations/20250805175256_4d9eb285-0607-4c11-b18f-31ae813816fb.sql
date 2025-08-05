-- Check existing types and modify migration accordingly
-- First, let's work with existing types or create new ones

-- Drop and recreate enums if they exist to ensure consistency
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS profile_visibility CASCADE;

-- Create enums (verification_status already exists, so we'll use it)
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin', 'artist', 'vendor', 'healthcare_provider', 'employer');
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
  employment_status TEXT DEFAULT 'seeking',
  available_for_relocation BOOLEAN DEFAULT false,
  remote_work_preference TEXT DEFAULT 'hybrid',
  
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
  village_id UUID NOT NULL,
  
  -- Membership details
  membership_type TEXT DEFAULT 'resident',
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
  practice_type TEXT,
  years_of_experience INTEGER DEFAULT 0,
  
  -- Certifications and memberships
  board_certifications TEXT[],
  professional_memberships TEXT[],
  additional_training TEXT[],
  
  -- Services and availability
  services_offered TEXT[],
  consultation_types TEXT[],
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