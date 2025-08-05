-- Create user roles system and civic platform tables
-- Fix the RLS policies to use proper role checking

-- Create app role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'politician');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create civic platform tables
CREATE TABLE IF NOT EXISTS public.politicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE,
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

CREATE TABLE IF NOT EXISTS public.petitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  target_office TEXT,
  creator_id UUID NOT NULL,
  signatures_required INTEGER DEFAULT 1000,
  signatures_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'successful')),
  featured BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.petition_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id UUID NOT NULL REFERENCES public.petitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(petition_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.transparency_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL,
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

-- Enable Row Level Security
ALTER TABLE public.politicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.political_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transparency_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies using proper role checking
-- Politicians
DROP POLICY IF EXISTS "Anyone can view politicians" ON public.politicians;
CREATE POLICY "Anyone can view politicians" ON public.politicians FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage politicians" ON public.politicians;
CREATE POLICY "Admins can manage politicians" ON public.politicians FOR ALL USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Political Parties
DROP POLICY IF EXISTS "Anyone can view political parties" ON public.political_parties;
CREATE POLICY "Anyone can view political parties" ON public.political_parties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage political parties" ON public.political_parties;
CREATE POLICY "Admins can manage political parties" ON public.political_parties FOR ALL USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Petitions
DROP POLICY IF EXISTS "Anyone can view active petitions" ON public.petitions;
CREATE POLICY "Anyone can view active petitions" ON public.petitions FOR SELECT USING (status = 'active' OR status = 'successful');

DROP POLICY IF EXISTS "Users can create petitions" ON public.petitions;
CREATE POLICY "Users can create petitions" ON public.petitions FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can update their own petitions" ON public.petitions;
CREATE POLICY "Users can update their own petitions" ON public.petitions FOR UPDATE USING (auth.uid() = creator_id);

-- Petition Signatures
DROP POLICY IF EXISTS "Anyone can view petition signatures" ON public.petition_signatures;
CREATE POLICY "Anyone can view petition signatures" ON public.petition_signatures FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can sign petitions" ON public.petition_signatures;
CREATE POLICY "Users can sign petitions" ON public.petition_signatures FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their signatures" ON public.petition_signatures;
CREATE POLICY "Users can remove their signatures" ON public.petition_signatures FOR DELETE USING (auth.uid() = user_id);

-- Transparency Reports
DROP POLICY IF EXISTS "Anyone can view transparency reports" ON public.transparency_reports;
CREATE POLICY "Anyone can view transparency reports" ON public.transparency_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage transparency reports" ON public.transparency_reports;
CREATE POLICY "Admins can manage transparency reports" ON public.transparency_reports FOR ALL USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Civic Courses
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.civic_courses;
CREATE POLICY "Anyone can view published courses" ON public.civic_courses FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admins can manage courses" ON public.civic_courses;
CREATE POLICY "Admins can manage courses" ON public.civic_courses FOR ALL USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- User Course Progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_course_progress;
CREATE POLICY "Users can view their own progress" ON public.user_course_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_course_progress;
CREATE POLICY "Users can update their own progress" ON public.user_course_progress FOR ALL USING (auth.uid() = user_id);

-- User Roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Insert sample data for testing
INSERT INTO public.civic_courses (title, description, level, duration_hours, lesson_count, published, featured) VALUES
('Understanding Democracy', 'Learn the fundamentals of democratic governance and citizen participation', 'beginner', 2.0, 8, true, true),
('Cameroon Constitution', 'Comprehensive guide to Cameroons constitution and legal framework', 'intermediate', 3.0, 12, true, true),
('Citizen Rights & Duties', 'Know your rights and responsibilities as a Cameroonian citizen', 'beginner', 1.5, 6, true, false),
('Electoral Process', 'How elections work in Cameroon from registration to results', 'intermediate', 2.5, 10, true, false)
ON CONFLICT DO NOTHING;

INSERT INTO public.transparency_reports (title, report_type, department, summary, published_date, verified) VALUES
('2024 National Budget Analysis', 'budget', 'Ministry of Finance', 'Comprehensive analysis of the 2024 national budget allocation and spending patterns', '2024-03-15', true),
('Municipal Spending Transparency Review', 'audit', 'Municipal Affairs', 'Review of transparency practices in municipal spending across major cities', '2024-03-10', true),
('Electoral Commission Performance', 'performance', 'Electoral Commission', 'Performance assessment of electoral commission during recent elections', '2024-03-05', true),
('Public Procurement Monitoring', 'audit', 'Public Procurement', 'Quarterly monitoring report on public procurement processes and transparency', '2024-02-28', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.political_parties (name, acronym, ideology, leader_name, headquarters, description, verified) VALUES
('Cameroon Peoples Democratic Movement', 'CPDM', 'Centrist', 'Paul Biya', 'Yaoundé', 'Ruling party of Cameroon since 1985', true),
('Social Democratic Front', 'SDF', 'Social Democracy', 'Joshua Osih', 'Bamenda', 'Opposition party advocating for democratic reforms', true),
('Cameroon Renaissance Movement', 'MRC', 'Progressive', 'Maurice Kamto', 'Yaoundé', 'Opposition movement for political change', true),
('National Union for Democracy and Progress', 'UNDP', 'Liberal', 'Maigari Bello Bouba', 'Garoua', 'Opposition party focusing on northern regions', true)
ON CONFLICT DO NOTHING;