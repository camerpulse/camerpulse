-- Economic Features Database Schema

-- Economic indicators table
CREATE TABLE public.economic_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_name TEXT NOT NULL,
  indicator_type TEXT NOT NULL, -- 'gdp', 'inflation', 'unemployment', 'poverty', 'development'
  region TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL, -- '%', 'FCFA', 'people', etc.
  measurement_date DATE NOT NULL,
  data_source TEXT NOT NULL,
  reliability_score INTEGER DEFAULT 7 CHECK (reliability_score >= 1 AND reliability_score <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Government budget tracking
CREATE TABLE public.budget_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_year INTEGER NOT NULL,
  ministry_department TEXT NOT NULL,
  sector TEXT NOT NULL, -- 'health', 'education', 'infrastructure', 'agriculture', etc.
  region TEXT,
  allocated_amount BIGINT NOT NULL, -- in FCFA
  spent_amount BIGINT DEFAULT 0,
  execution_percentage NUMERIC GENERATED ALWAYS AS (
    CASE WHEN allocated_amount > 0 THEN (spent_amount::NUMERIC / allocated_amount::NUMERIC) * 100 ELSE 0 END
  ) STORED,
  project_name TEXT,
  beneficiaries_target INTEGER,
  beneficiaries_reached INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planned', -- 'planned', 'ongoing', 'completed', 'suspended'
  transparency_score INTEGER DEFAULT 5 CHECK (transparency_score >= 1 AND transparency_score <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Development projects tracking
CREATE TABLE public.development_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL, -- 'infrastructure', 'social', 'economic', 'environmental'
  description TEXT,
  implementing_agency TEXT NOT NULL,
  funding_source TEXT NOT NULL, -- 'government', 'world_bank', 'african_dev_bank', 'bilateral', etc.
  region TEXT NOT NULL,
  communities_affected TEXT[],
  total_budget BIGINT NOT NULL,
  disbursed_amount BIGINT DEFAULT 0,
  start_date DATE,
  expected_completion_date DATE,
  actual_completion_date DATE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_status TEXT DEFAULT 'planning', -- 'planning', 'ongoing', 'completed', 'delayed', 'suspended'
  impact_metrics JSONB DEFAULT '{}',
  citizen_feedback_score NUMERIC DEFAULT 0,
  total_feedback_count INTEGER DEFAULT 0,
  transparency_rating INTEGER DEFAULT 5 CHECK (transparency_rating >= 1 AND transparency_rating <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Local business directory
CREATE TABLE public.local_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  sector TEXT NOT NULL, -- 'agriculture', 'manufacturing', 'services', 'technology', etc.
  description TEXT,
  owner_name TEXT,
  registration_number TEXT,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  phone_number TEXT,
  email TEXT,
  website_url TEXT,
  employees_count INTEGER,
  annual_revenue_range TEXT, -- 'under_1m', '1m_5m', '5m_10m', '10m_50m', 'over_50m' (FCFA)
  founding_year INTEGER,
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  economic_impact_score INTEGER DEFAULT 5 CHECK (economic_impact_score >= 1 AND economic_impact_score <= 10),
  sustainability_rating INTEGER DEFAULT 5 CHECK (sustainability_rating >= 1 AND sustainability_rating <= 10),
  created_by UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Economic alerts and thresholds
CREATE TABLE public.economic_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- 'budget_overrun', 'project_delay', 'economic_decline', 'threshold_breach'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_region TEXT,
  related_indicator TEXT,
  current_value NUMERIC,
  threshold_value NUMERIC,
  trend_direction TEXT, -- 'improving', 'stable', 'declining'
  action_required TEXT,
  responsible_agency TEXT,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Economic insights and analysis
CREATE TABLE public.economic_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_title TEXT NOT NULL,
  insight_type TEXT NOT NULL, -- 'trend_analysis', 'comparative_study', 'impact_assessment', 'forecast'
  region_focus TEXT,
  sector_focus TEXT,
  analysis_period_start DATE,
  analysis_period_end DATE,
  key_findings TEXT NOT NULL,
  methodology TEXT,
  data_sources TEXT[],
  confidence_level INTEGER DEFAULT 7 CHECK (confidence_level >= 1 AND confidence_level <= 10),
  policy_recommendations TEXT,
  economic_impact_rating INTEGER DEFAULT 5 CHECK (economic_impact_rating >= 1 AND economic_impact_rating <= 10),
  created_by UUID,
  is_published BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.economic_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economic_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economic_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Economic indicators - Public read access
CREATE POLICY "Economic indicators are publicly viewable"
ON public.economic_indicators FOR SELECT
USING (true);

CREATE POLICY "Admins can manage economic indicators"
ON public.economic_indicators FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Budget allocations - Public read access
CREATE POLICY "Budget allocations are publicly viewable"
ON public.budget_allocations FOR SELECT
USING (true);

CREATE POLICY "Admins can manage budget allocations"
ON public.budget_allocations FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Development projects - Public read access
CREATE POLICY "Development projects are publicly viewable"
ON public.development_projects FOR SELECT
USING (true);

CREATE POLICY "Admins can manage development projects"
ON public.development_projects FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Local businesses - Public read for verified businesses
CREATE POLICY "Verified businesses are publicly viewable"
ON public.local_businesses FOR SELECT
USING (verification_status = 'verified' AND is_active = true);

CREATE POLICY "Users can create their own business listings"
ON public.local_businesses FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own business listings"
ON public.local_businesses FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all businesses"
ON public.local_businesses FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Economic alerts - Public read access
CREATE POLICY "Economic alerts are publicly viewable"
ON public.economic_alerts FOR SELECT
USING (true);

CREATE POLICY "Admins can manage economic alerts"
ON public.economic_alerts FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Economic insights - Public read for published insights
CREATE POLICY "Published insights are publicly viewable"
ON public.economic_insights FOR SELECT
USING (is_published = true);

CREATE POLICY "Users can create insights"
ON public.economic_insights FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own insights"
ON public.economic_insights FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all insights"
ON public.economic_insights FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create indexes for better performance
CREATE INDEX idx_economic_indicators_region_date ON public.economic_indicators(region, measurement_date DESC);
CREATE INDEX idx_economic_indicators_type ON public.economic_indicators(indicator_type);
CREATE INDEX idx_budget_allocations_year_region ON public.budget_allocations(budget_year, region);
CREATE INDEX idx_budget_allocations_sector ON public.budget_allocations(sector);
CREATE INDEX idx_development_projects_region_status ON public.development_projects(region, current_status);
CREATE INDEX idx_development_projects_type ON public.development_projects(project_type);
CREATE INDEX idx_local_businesses_region_sector ON public.local_businesses(region, sector);
CREATE INDEX idx_local_businesses_verification ON public.local_businesses(verification_status, is_active);
CREATE INDEX idx_economic_alerts_severity_created ON public.economic_alerts(severity, created_at DESC);
CREATE INDEX idx_economic_insights_published ON public.economic_insights(is_published, created_at DESC);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_economic_indicators_updated_at
  BEFORE UPDATE ON public.economic_indicators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_allocations_updated_at
  BEFORE UPDATE ON public.budget_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_development_projects_updated_at
  BEFORE UPDATE ON public.development_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_local_businesses_updated_at
  BEFORE UPDATE ON public.local_businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_economic_insights_updated_at
  BEFORE UPDATE ON public.economic_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Utility functions for economic analysis
CREATE OR REPLACE FUNCTION get_economic_summary(p_region TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}';
  total_projects INTEGER;
  completed_projects INTEGER;
  total_budget BIGINT;
  active_businesses INTEGER;
  critical_alerts INTEGER;
BEGIN
  -- Get project statistics
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE current_status = 'completed'),
    COALESCE(SUM(total_budget), 0)
  INTO total_projects, completed_projects, total_budget
  FROM public.development_projects
  WHERE p_region IS NULL OR region = p_region;
  
  -- Get business count
  SELECT COUNT(*)
  INTO active_businesses
  FROM public.local_businesses
  WHERE is_active = true 
    AND verification_status = 'verified'
    AND (p_region IS NULL OR region = p_region);
  
  -- Get critical alerts
  SELECT COUNT(*)
  INTO critical_alerts
  FROM public.economic_alerts
  WHERE severity IN ('high', 'critical')
    AND NOT is_acknowledged
    AND (p_region IS NULL OR affected_region = p_region);
  
  result := jsonb_build_object(
    'total_projects', total_projects,
    'completed_projects', completed_projects,
    'completion_rate', CASE WHEN total_projects > 0 THEN 
      ROUND((completed_projects::NUMERIC / total_projects::NUMERIC) * 100, 2) 
      ELSE 0 END,
    'total_budget_fcfa', total_budget,
    'active_businesses', active_businesses,
    'critical_alerts', critical_alerts,
    'region', COALESCE(p_region, 'National'),
    'last_updated', now()
  );
  
  RETURN result;
END;
$$;