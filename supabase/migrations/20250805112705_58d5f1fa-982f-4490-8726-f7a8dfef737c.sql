-- Add missing civic platform tables (those that don't already exist)
-- This complements the existing database structure with civic-specific functionality

-- Add profiles table extensions for civic functionality (only if needed)
DO $$ 
BEGIN
  -- Add civic-specific columns to profiles if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_diaspora') THEN
    ALTER TABLE public.profiles ADD COLUMN is_diaspora BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'civic_interests') THEN
    ALTER TABLE public.profiles ADD COLUMN civic_interests TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verification_status') THEN
    ALTER TABLE public.profiles ADD COLUMN verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'));
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore errors if table doesn't exist
END $$;

-- Create politicians table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.politicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create political parties table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.political_parties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create petitions table if it doesn't exist  
CREATE TABLE IF NOT EXISTS public.petitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create petition signatures table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.petition_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id UUID NOT NULL REFERENCES public.petitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(petition_id, user_id)
);

-- Create transparency reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.transparency_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create civic courses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.civic_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create user course progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.civic_courses(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_politicians_region ON public.politicians(region);
CREATE INDEX IF NOT EXISTS idx_petitions_status ON public.petitions(status);
CREATE INDEX IF NOT EXISTS idx_petitions_creator_id ON public.petitions(creator_id);
CREATE INDEX IF NOT EXISTS idx_petition_signatures_petition_id ON public.petition_signatures(petition_id);
CREATE INDEX IF NOT EXISTS idx_transparency_reports_department ON public.transparency_reports(department);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id ON public.user_course_progress(user_id);

-- Enable Row Level Security
ALTER TABLE public.politicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.political_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transparency_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Politicians (Public read, admin write)
DROP POLICY IF EXISTS "Anyone can view politicians" ON public.politicians;
CREATE POLICY "Anyone can view politicians" ON public.politicians FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage politicians" ON public.politicians;
CREATE POLICY "Admins can manage politicians" ON public.politicians FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for Political Parties (Public read, admin write)
DROP POLICY IF EXISTS "Anyone can view political parties" ON public.political_parties;
CREATE POLICY "Anyone can view political parties" ON public.political_parties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage political parties" ON public.political_parties;
CREATE POLICY "Admins can manage political parties" ON public.political_parties FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for Petitions
DROP POLICY IF EXISTS "Anyone can view active petitions" ON public.petitions;
CREATE POLICY "Anyone can view active petitions" ON public.petitions FOR SELECT USING (status = 'active' OR status = 'successful');

DROP POLICY IF EXISTS "Users can create petitions" ON public.petitions;
CREATE POLICY "Users can create petitions" ON public.petitions FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can update their own petitions" ON public.petitions;
CREATE POLICY "Users can update their own petitions" ON public.petitions FOR UPDATE USING (auth.uid() = creator_id);

-- RLS Policies for Petition Signatures
DROP POLICY IF EXISTS "Anyone can view petition signatures" ON public.petition_signatures;
CREATE POLICY "Anyone can view petition signatures" ON public.petition_signatures FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can sign petitions" ON public.petition_signatures;
CREATE POLICY "Users can sign petitions" ON public.petition_signatures FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their signatures" ON public.petition_signatures;
CREATE POLICY "Users can remove their signatures" ON public.petition_signatures FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Transparency Reports (Public read, admin write)
DROP POLICY IF EXISTS "Anyone can view transparency reports" ON public.transparency_reports;
CREATE POLICY "Anyone can view transparency reports" ON public.transparency_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage transparency reports" ON public.transparency_reports;
CREATE POLICY "Admins can manage transparency reports" ON public.transparency_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for Civic Courses (Public read, admin write)
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.civic_courses;
CREATE POLICY "Anyone can view published courses" ON public.civic_courses FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admins can manage courses" ON public.civic_courses;
CREATE POLICY "Admins can manage courses" ON public.civic_courses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for User Course Progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_course_progress;
CREATE POLICY "Users can view their own progress" ON public.user_course_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_course_progress;
CREATE POLICY "Users can update their own progress" ON public.user_course_progress FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_politicians_updated_at ON public.politicians;
CREATE TRIGGER update_politicians_updated_at BEFORE UPDATE ON public.politicians FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_political_parties_updated_at ON public.political_parties;
CREATE TRIGGER update_political_parties_updated_at BEFORE UPDATE ON public.political_parties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_petitions_updated_at ON public.petitions;
CREATE TRIGGER update_petitions_updated_at BEFORE UPDATE ON public.petitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_transparency_reports_updated_at ON public.transparency_reports;
CREATE TRIGGER update_transparency_reports_updated_at BEFORE UPDATE ON public.transparency_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_civic_courses_updated_at ON public.civic_courses;
CREATE TRIGGER update_civic_courses_updated_at BEFORE UPDATE ON public.civic_courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();