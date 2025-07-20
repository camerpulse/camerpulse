-- CamerPulse Government Project Tracker System

-- Create enum types
CREATE TYPE project_status AS ENUM ('planned', 'in_progress', 'completed', 'paused', 'failed', 'abandoned');
CREATE TYPE funding_source_type AS ENUM ('national_budget', 'world_bank', 'afdb', 'eu', 'china', 'private', 'ngo', 'other');
CREATE TYPE corruption_tag AS ENUM ('verified', 'alleged', 'cleared', 'under_investigation');
CREATE TYPE project_sector AS ENUM ('education', 'health', 'infrastructure', 'agriculture', 'energy', 'water_sanitation', 'transport', 'telecommunications', 'environment', 'social_protection', 'governance', 'other');

-- Main government projects table
CREATE TABLE public.government_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  sector project_sector NOT NULL,
  budget_allocated_fcfa BIGINT NOT NULL,
  budget_allocated_usd NUMERIC,
  funding_source funding_source_type NOT NULL,
  funding_partner TEXT,
  implementing_body TEXT NOT NULL,
  supervising_official TEXT,
  supervising_agency TEXT,
  procurement_entity TEXT,
  contractor_name TEXT,
  contractor_id TEXT,
  locations JSONB DEFAULT '[]', -- Array of locations/regions
  coordinates JSONB, -- Geographic coordinates
  start_date DATE,
  expected_completion_date DATE,
  actual_completion_date DATE,
  status project_status DEFAULT 'planned',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  timeline_slippage_days INTEGER DEFAULT 0,
  corruption_index NUMERIC DEFAULT 0.0 CHECK (corruption_index >= 0 AND corruption_index <= 10),
  corruption_tag corruption_tag,
  transparency_score NUMERIC DEFAULT 5.0 CHECK (transparency_score >= 0 AND transparency_score <= 10),
  community_satisfaction_score NUMERIC DEFAULT 0.0,
  total_community_reports INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  source_type TEXT DEFAULT 'government_announcement',
  source_url TEXT,
  submitted_by UUID,
  project_documents JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_progress_update TIMESTAMP WITH TIME ZONE,
  budget_utilization_percentage NUMERIC DEFAULT 0.0,
  funds_disbursed_fcfa BIGINT DEFAULT 0,
  alert_timeline_slippage BOOLEAN DEFAULT false,
  ministry_responsible TEXT,
  project_code TEXT UNIQUE,
  metadata JSONB DEFAULT '{}'
);

-- Project status updates and progress tracking
CREATE TABLE public.project_status_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.government_projects(id) ON DELETE CASCADE,
  previous_status project_status,
  new_status project_status NOT NULL,
  completion_percentage INTEGER NOT NULL,
  update_description TEXT,
  evidence_photos JSONB DEFAULT '[]',
  updated_by UUID,
  updater_type TEXT DEFAULT 'citizen', -- citizen, official, moderator, admin
  verification_status TEXT DEFAULT 'pending',
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  location_verified BOOLEAN DEFAULT false,
  progress_notes TEXT,
  budget_update JSONB DEFAULT '{}'
);

-- Project milestones and phases
CREATE TABLE public.project_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.government_projects(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  milestone_description TEXT,
  planned_date DATE,
  actual_date DATE,
  completion_percentage INTEGER DEFAULT 0,
  budget_allocated BIGINT DEFAULT 0,
  budget_used BIGINT DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, delayed
  milestone_order INTEGER DEFAULT 1,
  is_critical BOOLEAN DEFAULT false,
  evidence_required BOOLEAN DEFAULT false,
  evidence_submitted JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Corruption flags and audit trails
CREATE TABLE public.project_corruption_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.government_projects(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL, -- overpricing, duplicate_contract, ghost_project, substandard_work
  flag_description TEXT NOT NULL,
  evidence_files JSONB DEFAULT '[]',
  reported_by UUID,
  reporter_type TEXT DEFAULT 'citizen',
  flag_severity TEXT DEFAULT 'medium', -- low, medium, high, critical
  investigation_status TEXT DEFAULT 'pending',
  investigated_by UUID,
  investigation_notes TEXT,
  resolution_status TEXT DEFAULT 'open', -- open, resolved, dismissed
  resolution_date TIMESTAMP WITH TIME ZONE,
  corruption_amount_estimated BIGINT,
  whistleblower_protected BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  public_visibility BOOLEAN DEFAULT true
);

-- Budget disbursement tracking
CREATE TABLE public.project_budget_disbursements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.government_projects(id) ON DELETE CASCADE,
  disbursement_date DATE NOT NULL,
  amount_fcfa BIGINT NOT NULL,
  amount_usd NUMERIC,
  disbursement_purpose TEXT,
  recipient_entity TEXT,
  disbursement_method TEXT,
  supporting_documents JSONB DEFAULT '[]',
  verified_by_treasury BOOLEAN DEFAULT false,
  verification_documents JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  cumulative_disbursed BIGINT DEFAULT 0,
  remaining_budget BIGINT DEFAULT 0
);

-- Community reports and field updates
CREATE TABLE public.project_community_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.government_projects(id) ON DELETE CASCADE,
  reporter_user_id UUID,
  report_type TEXT NOT NULL, -- delay, abandonment, quality_issue, completion, satisfaction
  report_title TEXT NOT NULL,
  report_description TEXT NOT NULL,
  evidence_photos JSONB DEFAULT '[]',
  location_coordinates JSONB,
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  verified_by_moderator BOOLEAN DEFAULT false,
  moderator_id UUID,
  moderator_notes TEXT,
  public_visibility BOOLEAN DEFAULT true,
  report_severity TEXT DEFAULT 'medium',
  community_impact_score INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'open' -- open, investigating, resolved
);

-- Project documents and transparency files
CREATE TABLE public.project_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.government_projects(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- contract, tender, audit, progress_report, completion_certificate
  document_title TEXT NOT NULL,
  document_description TEXT,
  file_url TEXT,
  file_size_bytes BIGINT,
  document_date DATE,
  uploaded_by UUID,
  verified_by UUID,
  verification_status TEXT DEFAULT 'pending',
  document_hash TEXT, -- For integrity verification
  access_level TEXT DEFAULT 'public', -- public, restricted, confidential
  language TEXT DEFAULT 'french',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Contractor history and performance tracking
CREATE TABLE public.project_contractors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_name TEXT NOT NULL,
  contractor_id TEXT UNIQUE,
  registration_number TEXT,
  company_type TEXT,
  specialization JSONB DEFAULT '[]',
  contact_information JSONB DEFAULT '{}',
  projects_completed INTEGER DEFAULT 0,
  projects_delayed INTEGER DEFAULT 0,
  projects_abandoned INTEGER DEFAULT 0,
  average_quality_score NUMERIC DEFAULT 0.0,
  corruption_flags_count INTEGER DEFAULT 0,
  blacklisted BOOLEAN DEFAULT false,
  blacklist_reason TEXT,
  performance_rating NUMERIC DEFAULT 5.0,
  total_contracts_value BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_contractor BOOLEAN DEFAULT false
);

-- Project contractor assignments
CREATE TABLE public.project_contractor_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.government_projects(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES public.project_contractors(id) ON DELETE CASCADE,
  contract_value BIGINT NOT NULL,
  contract_start_date DATE,
  contract_end_date DATE,
  contract_status TEXT DEFAULT 'active',
  performance_score NUMERIC DEFAULT 0.0,
  payment_schedule JSONB DEFAULT '[]',
  payments_made BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, contractor_id)
);

-- Timeline slippage alerts
CREATE TABLE public.project_timeline_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.government_projects(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- timeline_slippage, no_updates, budget_overrun, corruption_flag
  alert_severity TEXT DEFAULT 'medium',
  alert_message TEXT NOT NULL,
  days_overdue INTEGER DEFAULT 0,
  automated BOOLEAN DEFAULT true,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_government_projects_status ON public.government_projects(status);
CREATE INDEX idx_government_projects_sector ON public.government_projects(sector);
CREATE INDEX idx_government_projects_funding ON public.government_projects(funding_source);
CREATE INDEX idx_government_projects_location ON public.government_projects USING GIN(locations);
CREATE INDEX idx_government_projects_completion ON public.government_projects(expected_completion_date);
CREATE INDEX idx_government_projects_budget ON public.government_projects(budget_allocated_fcfa);
CREATE INDEX idx_government_projects_corruption ON public.government_projects(corruption_index);
CREATE INDEX idx_project_status_updates_project ON public.project_status_updates(project_id);
CREATE INDEX idx_project_corruption_flags_project ON public.project_corruption_flags(project_id);
CREATE INDEX idx_project_community_reports_project ON public.project_community_reports(project_id);
CREATE INDEX idx_project_documents_project ON public.project_documents(project_id);
CREATE INDEX idx_project_contractors_performance ON public.project_contractors(performance_rating);

-- Enable RLS
ALTER TABLE public.government_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_corruption_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_budget_disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_contractor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_timeline_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for government projects
CREATE POLICY "Public can view verified projects" 
ON public.government_projects FOR SELECT USING (is_verified = true);

CREATE POLICY "Admins can manage all projects" 
ON public.government_projects FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can submit new projects" 
ON public.government_projects FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Project submitters can update their projects" 
ON public.government_projects FOR UPDATE USING (auth.uid() = submitted_by AND is_verified = false);

-- RLS Policies for status updates
CREATE POLICY "Public can view verified status updates" 
ON public.project_status_updates FOR SELECT USING (verification_status = 'verified');

CREATE POLICY "Users can submit status updates" 
ON public.project_status_updates FOR INSERT WITH CHECK (auth.uid() = updated_by);

CREATE POLICY "Admins can manage all status updates" 
ON public.project_status_updates FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for corruption flags
CREATE POLICY "Public can view non-sensitive corruption flags" 
ON public.project_corruption_flags FOR SELECT USING (public_visibility = true);

CREATE POLICY "Users can report corruption" 
ON public.project_corruption_flags FOR INSERT WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Admins can manage corruption investigations" 
ON public.project_corruption_flags FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for community reports
CREATE POLICY "Public can view community reports" 
ON public.project_community_reports FOR SELECT USING (public_visibility = true);

CREATE POLICY "Users can submit community reports" 
ON public.project_community_reports FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Users can update their own reports" 
ON public.project_community_reports FOR UPDATE USING (auth.uid() = reporter_user_id);

-- RLS Policies for other tables
CREATE POLICY "Public can view project milestones" 
ON public.project_milestones FOR SELECT USING (true);

CREATE POLICY "Public can view budget disbursements" 
ON public.project_budget_disbursements FOR SELECT USING (true);

CREATE POLICY "Public can view project documents" 
ON public.project_documents FOR SELECT USING (access_level = 'public');

CREATE POLICY "Public can view contractor information" 
ON public.project_contractors FOR SELECT USING (true);

CREATE POLICY "Public can view contractor assignments" 
ON public.project_contractor_assignments FOR SELECT USING (true);

CREATE POLICY "Public can view timeline alerts" 
ON public.project_timeline_alerts FOR SELECT USING (true);

-- Triggers for automated updates
CREATE OR REPLACE FUNCTION update_project_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_government_projects_updated_at
  BEFORE UPDATE ON public.government_projects
  FOR EACH ROW EXECUTE FUNCTION update_project_timestamps();

CREATE TRIGGER update_project_status_updates_updated_at
  BEFORE UPDATE ON public.project_status_updates
  FOR EACH ROW EXECUTE FUNCTION update_project_timestamps();

-- Function to calculate corruption index
CREATE OR REPLACE FUNCTION calculate_project_corruption_index(p_project_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  corruption_score NUMERIC := 0.0;
  flag_count INTEGER;
  high_severity_count INTEGER;
  budget_ratio NUMERIC;
  timeline_factor NUMERIC;
BEGIN
  -- Count corruption flags
  SELECT COUNT(*), COUNT(*) FILTER (WHERE flag_severity IN ('high', 'critical'))
  INTO flag_count, high_severity_count
  FROM public.project_corruption_flags
  WHERE project_id = p_project_id AND resolution_status != 'dismissed';
  
  -- Base score from flags
  corruption_score := (flag_count * 1.0) + (high_severity_count * 2.0);
  
  -- Add timeline factor
  SELECT COALESCE(timeline_slippage_days, 0) / 30.0
  INTO timeline_factor
  FROM public.government_projects
  WHERE id = p_project_id;
  
  corruption_score := corruption_score + LEAST(timeline_factor, 2.0);
  
  -- Normalize to 0-10 scale
  RETURN LEAST(corruption_score, 10.0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update project statistics
CREATE OR REPLACE FUNCTION update_project_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update community reports count
  UPDATE public.government_projects
  SET 
    total_community_reports = (
      SELECT COUNT(*) FROM public.project_community_reports 
      WHERE project_id = NEW.project_id
    ),
    community_satisfaction_score = (
      SELECT COALESCE(AVG(satisfaction_rating), 0.0) 
      FROM public.project_community_reports 
      WHERE project_id = NEW.project_id AND satisfaction_rating IS NOT NULL
    ),
    corruption_index = calculate_project_corruption_index(NEW.project_id),
    last_progress_update = now()
  WHERE id = NEW.project_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic updates
CREATE TRIGGER update_project_stats_on_community_report
  AFTER INSERT OR UPDATE ON public.project_community_reports
  FOR EACH ROW EXECUTE FUNCTION update_project_statistics();

CREATE TRIGGER update_project_stats_on_corruption_flag
  AFTER INSERT OR UPDATE ON public.project_corruption_flags
  FOR EACH ROW EXECUTE FUNCTION update_project_statistics();

-- Function to detect timeline slippage
CREATE OR REPLACE FUNCTION detect_timeline_slippage()
RETURNS INTEGER AS $$
DECLARE
  project_record RECORD;
  alert_count INTEGER := 0;
BEGIN
  FOR project_record IN
    SELECT id, title, expected_completion_date, status, last_progress_update
    FROM public.government_projects
    WHERE status IN ('planned', 'in_progress')
    AND expected_completion_date < CURRENT_DATE
    AND NOT alert_timeline_slippage
  LOOP
    -- Create timeline alert
    INSERT INTO public.project_timeline_alerts (
      project_id, alert_type, alert_severity, alert_message, days_overdue
    ) VALUES (
      project_record.id,
      'timeline_slippage',
      CASE 
        WHEN CURRENT_DATE - project_record.expected_completion_date > 90 THEN 'high'
        WHEN CURRENT_DATE - project_record.expected_completion_date > 30 THEN 'medium'
        ELSE 'low'
      END,
      'Project "' || project_record.title || '" is ' || 
      (CURRENT_DATE - project_record.expected_completion_date) || ' days past its expected completion date.',
      CURRENT_DATE - project_record.expected_completion_date
    );
    
    -- Mark project as having timeline alert
    UPDATE public.government_projects
    SET 
      alert_timeline_slippage = true,
      timeline_slippage_days = CURRENT_DATE - expected_completion_date
    WHERE id = project_record.id;
    
    alert_count := alert_count + 1;
  END LOOP;
  
  RETURN alert_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;