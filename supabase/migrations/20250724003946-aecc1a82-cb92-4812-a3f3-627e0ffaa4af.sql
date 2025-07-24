-- Phase 2: Advanced Job Posting & Management (missing components)

-- Check if columns exist before adding them
DO $$ 
BEGIN
  -- Add company reference to jobs table if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'company_id') THEN
    ALTER TABLE public.jobs ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;
  END IF;
  
  -- Add job posting management columns if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'posting_status') THEN
    ALTER TABLE public.jobs 
      ADD COLUMN posting_status TEXT DEFAULT 'draft' CHECK (posting_status IN ('draft', 'published', 'paused', 'archived')),
      ADD COLUMN featured BOOLEAN DEFAULT false,
      ADD COLUMN urgent BOOLEAN DEFAULT false,
      ADD COLUMN posting_expires_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN auto_renewal BOOLEAN DEFAULT false,
      ADD COLUMN posting_package TEXT DEFAULT 'basic' CHECK (posting_package IN ('basic', 'premium', 'featured')),
      ADD COLUMN recruiter_notes TEXT,
      ADD COLUMN interview_process JSONB DEFAULT '[]',
      ADD COLUMN benefits JSONB DEFAULT '[]',
      ADD COLUMN required_documents JSONB DEFAULT '[]';
  END IF;
  
  -- Add application tracking enhancements if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_applications' AND column_name = 'application_status') THEN
    ALTER TABLE public.job_applications
      ADD COLUMN application_status TEXT DEFAULT 'pending' CHECK (application_status IN ('pending', 'reviewing', 'shortlisted', 'interview_scheduled', 'interviewed', 'rejected', 'hired')),
      ADD COLUMN recruiter_notes TEXT,
      ADD COLUMN interview_scheduled_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN rejection_reason TEXT,
      ADD COLUMN salary_offered BIGINT,
      ADD COLUMN application_score INTEGER CHECK (application_score >= 0 AND application_score <= 100),
      ADD COLUMN documents_submitted JSONB DEFAULT '[]',
      ADD COLUMN follow_up_date DATE;
  END IF;
END $$;

-- Company team members (for multi-user company accounts)
CREATE TABLE IF NOT EXISTS public.company_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'recruiter', 'member')),
  permissions JSONB DEFAULT '{"can_post_jobs": false, "can_manage_applications": false, "can_edit_company": false}',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(company_id, user_id)
);

-- Job posting analytics
CREATE TABLE IF NOT EXISTS public.job_posting_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(job_id, metric_date)
);

-- Indexes for performance (create if not exists)
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_posting_status ON public.jobs(posting_status);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON public.jobs(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_jobs_posting_expires_at ON public.jobs(posting_expires_at);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_company_team_members_company_id ON public.company_team_members(company_id);
CREATE INDEX IF NOT EXISTS idx_job_posting_analytics_job_id ON public.job_posting_analytics(job_id);
CREATE INDEX IF NOT EXISTS idx_job_posting_analytics_date ON public.job_posting_analytics(metric_date);

-- Enable RLS
ALTER TABLE public.company_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_posting_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company team members
CREATE POLICY "Team members can view their company teams" 
ON public.company_team_members FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE id = company_team_members.company_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Company admins can manage team members" 
ON public.company_team_members FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE id = company_team_members.company_id 
    AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.company_team_members ctm
    WHERE ctm.company_id = company_team_members.company_id 
    AND ctm.user_id = auth.uid() 
    AND ctm.role = 'admin'
    AND ctm.is_active = true
  )
);

-- RLS Policies for job posting analytics
CREATE POLICY "Company members can view their analytics" 
ON public.job_posting_analytics FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE id = job_posting_analytics.company_id 
    AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.company_team_members 
    WHERE company_id = job_posting_analytics.company_id 
    AND user_id = auth.uid() 
    AND is_active = true
  )
);

-- Function to auto-expire job postings
CREATE OR REPLACE FUNCTION public.auto_expire_job_postings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.jobs 
  SET posting_status = 'archived'
  WHERE posting_expires_at < now() 
    AND posting_status = 'published'
    AND auto_renewal = false;
    
  -- Auto-renew jobs if enabled
  UPDATE public.jobs 
  SET posting_expires_at = posting_expires_at + INTERVAL '30 days'
  WHERE posting_expires_at < now() 
    AND posting_status = 'published'
    AND auto_renewal = true;
END;
$$;

-- Function to calculate application conversion rate
CREATE OR REPLACE FUNCTION public.calculate_job_conversion_rate(p_job_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_views INTEGER;
  total_applications INTEGER;
  conversion_rate NUMERIC := 0.00;
BEGIN
  SELECT COUNT(*) INTO total_views 
  FROM public.job_views 
  WHERE job_id = p_job_id;
  
  SELECT COUNT(*) INTO total_applications 
  FROM public.job_applications 
  WHERE job_id = p_job_id;
  
  IF total_views > 0 THEN
    conversion_rate := (total_applications::NUMERIC / total_views::NUMERIC) * 100;
  END IF;
  
  RETURN ROUND(conversion_rate, 2);
END;
$$;