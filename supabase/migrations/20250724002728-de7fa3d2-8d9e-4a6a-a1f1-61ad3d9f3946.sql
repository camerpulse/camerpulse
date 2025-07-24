-- CamerPulse Jobs Engine - Phase 1 Database Structure

-- Job categories table
CREATE TABLE public.job_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Icon name for UI
  color TEXT DEFAULT '#3B82F6', -- Category color
  is_active BOOLEAN NOT NULL DEFAULT true,
  job_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Main jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  company_id UUID, -- References companies table (optional for now)
  company_name TEXT NOT NULL,
  company_logo TEXT,
  category_id UUID REFERENCES public.job_categories(id),
  location TEXT NOT NULL,
  region TEXT NOT NULL,
  job_type TEXT NOT NULL DEFAULT 'full_time', -- full_time, part_time, contract, internship
  experience_level TEXT NOT NULL DEFAULT 'entry', -- entry, junior, mid, senior, executive
  education_level TEXT, -- high_school, diploma, bachelor, master, phd
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'FCFA',
  salary_period TEXT DEFAULT 'monthly', -- monthly, yearly, hourly
  description TEXT NOT NULL,
  requirements TEXT,
  benefits TEXT,
  how_to_apply TEXT,
  external_url TEXT,
  application_email TEXT,
  deadline DATE,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  is_remote BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'open', -- open, closed, paused, expired
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_by UUID, -- User who posted the job
  tags TEXT[] DEFAULT '{}',
  meta_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Job applications table (for future phases)
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References auth.users
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  cover_letter TEXT,
  resume_url TEXT,
  application_status TEXT NOT NULL DEFAULT 'submitted', -- submitted, reviewed, shortlisted, rejected, hired
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT, -- Employer notes
  meta_data JSONB DEFAULT '{}'
);

-- Saved jobs table
CREATE TABLE public.job_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References auth.users
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- Job views tracking
CREATE TABLE public.job_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID, -- Optional - can track anonymous views
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_category ON public.jobs(category_id);
CREATE INDEX idx_jobs_location ON public.jobs(location);
CREATE INDEX idx_jobs_region ON public.jobs(region);
CREATE INDEX idx_jobs_job_type ON public.jobs(job_type);
CREATE INDEX idx_jobs_experience ON public.jobs(experience_level);
CREATE INDEX idx_jobs_featured ON public.jobs(is_featured);
CREATE INDEX idx_jobs_deadline ON public.jobs(deadline);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX idx_jobs_published_at ON public.jobs(published_at DESC);
CREATE INDEX idx_jobs_search ON public.jobs USING gin(to_tsvector('english', title || ' ' || company_name || ' ' || description));

CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(application_status);

CREATE INDEX idx_job_bookmarks_user_id ON public.job_bookmarks(user_id);
CREATE INDEX idx_job_views_job_id ON public.job_views(job_id);

-- Enable Row Level Security
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Job categories - public read access
CREATE POLICY "Anyone can view active job categories" ON public.job_categories
  FOR SELECT USING (is_active = true);

-- Jobs - public read access for open jobs
CREATE POLICY "Anyone can view open jobs" ON public.jobs
  FOR SELECT USING (status = 'open' AND (expires_at IS NULL OR expires_at > now()));

-- Job applications - users can manage their own applications
CREATE POLICY "Users can view their own applications" ON public.job_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications" ON public.job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Job bookmarks - users can manage their own bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON public.job_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Job views - anyone can create views
CREATE POLICY "Anyone can create job views" ON public.job_views
  FOR INSERT WITH CHECK (true);

-- Admin policies (will add user roles later)
CREATE POLICY "System can manage all job data" ON public.jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update job category counts
CREATE OR REPLACE FUNCTION public.update_job_category_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update count for old category (if exists)
  IF OLD.category_id IS NOT NULL THEN
    UPDATE public.job_categories 
    SET job_count = (
      SELECT COUNT(*) FROM public.jobs 
      WHERE category_id = OLD.category_id AND status = 'open'
    )
    WHERE id = OLD.category_id;
  END IF;
  
  -- Update count for new category (if exists)
  IF NEW.category_id IS NOT NULL THEN
    UPDATE public.job_categories 
    SET job_count = (
      SELECT COUNT(*) FROM public.jobs 
      WHERE category_id = NEW.category_id AND status = 'open'
    )
    WHERE id = NEW.category_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update view counts
CREATE OR REPLACE FUNCTION public.update_job_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.jobs 
  SET views_count = views_count + 1
  WHERE id = NEW.job_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update application counts
CREATE OR REPLACE FUNCTION public.update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.jobs 
    SET applications_count = applications_count + 1
    WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.jobs 
    SET applications_count = applications_count - 1
    WHERE id = OLD.job_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_job_category_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_job_category_count();

CREATE TRIGGER update_job_view_count_trigger
  AFTER INSERT ON public.job_views
  FOR EACH ROW EXECUTE FUNCTION public.update_job_view_count();

CREATE TRIGGER update_job_application_count_trigger
  AFTER INSERT OR DELETE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_job_application_count();

-- Function to generate job slug
CREATE OR REPLACE FUNCTION public.generate_job_slug(job_title TEXT, company_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from title and company
  base_slug := lower(trim(regexp_replace(
    job_title || '-at-' || company_name, 
    '[^a-zA-Z0-9\s]', '', 'g'
  )));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  -- Check for uniqueness
  WHILE EXISTS (SELECT 1 FROM public.jobs WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug
CREATE OR REPLACE FUNCTION public.set_job_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_job_slug(NEW.title, NEW.company_name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_job_slug_trigger
  BEFORE INSERT ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_job_slug();

-- Standard updated_at triggers
CREATE OR REPLACE FUNCTION public.update_job_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_job_updated_at();

CREATE TRIGGER update_job_categories_updated_at
  BEFORE UPDATE ON public.job_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_job_updated_at();

-- Insert default job categories
INSERT INTO public.job_categories (name, slug, description, icon, color) VALUES
('Technology', 'technology', 'Software development, IT, and tech roles', 'Monitor', '#3B82F6'),
('Healthcare', 'healthcare', 'Medical, nursing, and health services', 'Heart', '#EF4444'),
('Education', 'education', 'Teaching, training, and educational roles', 'GraduationCap', '#10B981'),
('Engineering', 'engineering', 'Civil, mechanical, electrical engineering', 'Cog', '#F59E0B'),
('Finance', 'finance', 'Banking, accounting, and financial services', 'DollarSign', '#8B5CF6'),
('Marketing', 'marketing', 'Digital marketing, sales, and communications', 'Megaphone', '#EC4899'),
('Government', 'government', 'Public sector and civil service roles', 'Building2', '#6B7280'),
('Agriculture', 'agriculture', 'Farming, agribusiness, and rural development', 'Wheat', '#84CC16'),
('Construction', 'construction', 'Building, infrastructure, and construction', 'HardHat', '#F97316'),
('Hospitality', 'hospitality', 'Tourism, hotels, and service industry', 'Coffee', '#14B8A6'),
('Transportation', 'transportation', 'Logistics, delivery, and transport services', 'Truck', '#6366F1'),
('Media', 'media', 'Journalism, broadcasting, and content creation', 'Camera', '#DC2626'),
('Non-Profit', 'non-profit', 'NGOs, charities, and social impact roles', 'Heart', '#059669'),
('Legal', 'legal', 'Law, legal services, and compliance', 'Scale', '#7C3AED'),
('Other', 'other', 'Other job categories', 'Briefcase', '#64748B');