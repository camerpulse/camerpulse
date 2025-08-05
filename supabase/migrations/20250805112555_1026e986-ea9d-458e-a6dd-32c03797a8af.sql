-- CamerPulse Civic Platform Database Schema
-- This creates the foundational tables for the democratic transparency platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  village_id UUID,
  political_affiliation TEXT,
  verified BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'moderator', 'admin', 'politician')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Villages and Communities
CREATE TABLE public.villages (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  department TEXT,
  subdivision TEXT,
  population INTEGER,
  area_km2 DECIMAL,
  latitude DECIMAL,
  longitude DECIMAL,
  description TEXT,
  heritage_info TEXT,
  development_score INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Politicians
CREATE TABLE public.politicians (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID UNIQUE, -- Links to profiles if they have an account
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  party_affiliation TEXT,
  constituency TEXT,
  region TEXT,
  biography TEXT,
  photo_url TEXT,
  transparency_score INTEGER DEFAULT 0,
  approval_rating DECIMAL DEFAULT 0,
  term_start DATE,
  term_end DATE,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Political Parties
CREATE TABLE public.political_parties (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  acronym TEXT,
  ideology TEXT,
  founded_year INTEGER,
  leader_name TEXT,
  headquarters TEXT,
  logo_url TEXT,
  manifesto_url TEXT,
  website_url TEXT,
  description TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Petitions
CREATE TABLE public.petitions (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_audience TEXT NOT NULL, -- 'local', 'regional', 'national'
  target_office TEXT, -- Which government office this targets
  creator_id UUID NOT NULL,
  signatures_required INTEGER DEFAULT 1000,
  signatures_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'successful')),
  featured BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Petition Signatures
CREATE TABLE public.petition_signatures (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  petition_id UUID NOT NULL REFERENCES public.petitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(petition_id, user_id)
);

-- Transparency Reports
CREATE TABLE public.transparency_reports (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'budget', 'audit', 'performance', etc.
  department TEXT NOT NULL,
  report_period TEXT,
  summary TEXT,
  file_url TEXT,
  published_date DATE,
  transparency_score INTEGER,
  download_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Civic Education Content
CREATE TABLE public.civic_courses (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration_hours DECIMAL,
  lesson_count INTEGER DEFAULT 0,
  content_url TEXT,
  thumbnail_url TEXT,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Course Progress
CREATE TABLE public.user_course_progress (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.civic_courses(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_village_id ON public.profiles(village_id);
CREATE INDEX idx_villages_region ON public.villages(region);
CREATE INDEX idx_politicians_region ON public.politicians(region);
CREATE INDEX idx_petitions_status ON public.petitions(status);
CREATE INDEX idx_petitions_creator_id ON public.petitions(creator_id);
CREATE INDEX idx_petition_signatures_petition_id ON public.petition_signatures(petition_id);
CREATE INDEX idx_transparency_reports_department ON public.transparency_reports(department);
CREATE INDEX idx_user_course_progress_user_id ON public.user_course_progress(user_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.political_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transparency_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Villages (Public read, authenticated write)
CREATE POLICY "Anyone can view villages" ON public.villages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create villages" ON public.villages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update villages they created" ON public.villages FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for Politicians (Public read, admin write)
CREATE POLICY "Anyone can view politicians" ON public.politicians FOR SELECT USING (true);
CREATE POLICY "Admins can manage politicians" ON public.politicians FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for Political Parties (Public read, admin write)
CREATE POLICY "Anyone can view political parties" ON public.political_parties FOR SELECT USING (true);
CREATE POLICY "Admins can manage political parties" ON public.political_parties FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for Petitions
CREATE POLICY "Anyone can view active petitions" ON public.petitions FOR SELECT USING (status = 'active' OR status = 'successful');
CREATE POLICY "Users can create petitions" ON public.petitions FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own petitions" ON public.petitions FOR UPDATE USING (auth.uid() = creator_id);

-- RLS Policies for Petition Signatures
CREATE POLICY "Anyone can view petition signatures" ON public.petition_signatures FOR SELECT USING (true);
CREATE POLICY "Users can sign petitions" ON public.petition_signatures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their signatures" ON public.petition_signatures FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Transparency Reports (Public read, admin write)
CREATE POLICY "Anyone can view transparency reports" ON public.transparency_reports FOR SELECT USING (true);
CREATE POLICY "Admins can manage transparency reports" ON public.transparency_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for Civic Courses (Public read, admin write)
CREATE POLICY "Anyone can view published courses" ON public.civic_courses FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage courses" ON public.civic_courses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for User Course Progress
CREATE POLICY "Users can view their own progress" ON public.user_course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_course_progress FOR ALL USING (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_villages_updated_at BEFORE UPDATE ON public.villages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_politicians_updated_at BEFORE UPDATE ON public.politicians FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_political_parties_updated_at BEFORE UPDATE ON public.political_parties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_petitions_updated_at BEFORE UPDATE ON public.petitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transparency_reports_updated_at BEFORE UPDATE ON public.transparency_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_civic_courses_updated_at BEFORE UPDATE ON public.civic_courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();