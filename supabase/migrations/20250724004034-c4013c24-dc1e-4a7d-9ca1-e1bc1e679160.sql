-- Phase 2: Create missing tables only

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