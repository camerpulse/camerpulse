-- Create job categories table
CREATE TABLE public.job_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  job_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on job categories
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Job categories are viewable by everyone" ON public.job_categories FOR SELECT USING (true);

-- Create companies/employers table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_description TEXT,
  website_url TEXT,
  company_logo_url TEXT,
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  location TEXT,
  region TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_documents JSONB DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  founded_year INTEGER,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_jobs_posted INTEGER DEFAULT 0,
  total_hires INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Companies are viewable by everyone" ON public.companies FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage their own company" ON public.companies FOR ALL USING (auth.uid() = user_id);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies ON DELETE CASCADE,
  category_id UUID REFERENCES public.job_categories ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT NOT NULL,
  requirements JSONB DEFAULT '[]'::jsonb,
  responsibilities JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  salary_min BIGINT,
  salary_max BIGINT,
  salary_currency TEXT DEFAULT 'FCFA',
  job_type TEXT NOT NULL CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship', 'remote')),
  experience_level TEXT CHECK (experience_level IN ('entry', 'junior', 'mid', 'senior', 'executive')),
  location TEXT,
  region TEXT,
  is_remote BOOLEAN DEFAULT false,
  application_deadline TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'filled')),
  featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  external_apply_url TEXT,
  contact_email TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active jobs are viewable by everyone" ON public.jobs FOR SELECT USING (status = 'open');
CREATE POLICY "Company owners can manage their jobs" ON public.jobs FOR ALL USING (
  EXISTS (SELECT 1 FROM companies WHERE companies.id = jobs.company_id AND companies.user_id = auth.uid())
);

-- Create job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  cover_letter TEXT,
  cv_url TEXT,
  portfolio_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'interviewed', 'hired', 'rejected')),
  notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(job_id, applicant_id)
);

-- Enable RLS on job applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own applications" ON public.job_applications FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Users can create applications" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Company owners can view applications for their jobs" ON public.job_applications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM jobs j 
    JOIN companies c ON j.company_id = c.id 
    WHERE j.id = job_applications.job_id AND c.user_id = auth.uid()
  )
);
CREATE POLICY "Company owners can update application status" ON public.job_applications FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM jobs j 
    JOIN companies c ON j.company_id = c.id 
    WHERE j.id = job_applications.job_id AND c.user_id = auth.uid()
  )
);

-- Create expert profiles table for "Experts Available for Hire"
CREATE TABLE public.expert_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  professional_title TEXT NOT NULL,
  hourly_rate_min BIGINT,
  hourly_rate_max BIGINT,
  availability TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'not_available')),
  work_preference TEXT[] DEFAULT ARRAY['remote', 'on_site'],
  expertise_areas JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  portfolio_items JSONB DEFAULT '[]'::jsonb,
  years_experience INTEGER,
  education JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '["French", "English"]'::jsonb,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'expired')),
  featured_until TIMESTAMP WITH TIME ZONE,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_projects INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on expert profiles
ALTER TABLE public.expert_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active expert profiles are viewable by everyone" ON public.expert_profiles 
  FOR SELECT USING (is_active = true AND payment_status = 'paid');
CREATE POLICY "Users can manage their own expert profile" ON public.expert_profiles 
  FOR ALL USING (auth.uid() = user_id);

-- Create job bookmarks table
CREATE TABLE public.job_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, job_id)
);

-- Enable RLS on job bookmarks
ALTER TABLE public.job_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own bookmarks" ON public.job_bookmarks FOR ALL USING (auth.uid() = user_id);

-- Create job views tracking table
CREATE TABLE public.job_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on job views
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create job views" ON public.job_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own job views" ON public.job_views FOR SELECT USING (auth.uid() = user_id);

-- Insert default job categories
INSERT INTO public.job_categories (name, description, icon) VALUES
('Technology', 'Software development, IT, and tech roles', '💻'),
('Healthcare', 'Medical, nursing, and healthcare positions', '🏥'),
('Education', 'Teaching, training, and educational roles', '🎓'),
('Business', 'Management, consulting, and business roles', '💼'),
('Finance', 'Banking, accounting, and financial services', '💰'),
('Marketing', 'Digital marketing, advertising, and promotion', '📢'),
('Sales', 'Sales representatives and business development', '📈'),
('Engineering', 'Civil, mechanical, and other engineering roles', '🔧'),
('Agriculture', 'Farming, agribusiness, and rural development', '🌾'),
('Construction', 'Building, architecture, and construction work', '🏗️'),
('Transportation', 'Logistics, delivery, and transport services', '🚛'),
('Hospitality', 'Hotels, restaurants, and tourism', '🏨'),
('Legal', 'Law, legal services, and compliance', '⚖️'),
('Arts & Media', 'Creative, design, and media production', '🎨'),
('Government', 'Public service and government positions', '🏛️'),
('Non-Profit', 'NGO and charitable organization roles', '🤝');