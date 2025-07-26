-- Extend village reputation system with transparency and corruption reporting

-- First, add 'village' to the civic_entity_type enum
ALTER TYPE civic_entity_type ADD VALUE 'village';

-- Create village corruption reports table
CREATE TABLE IF NOT EXISTS public.village_corruption_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id UUID NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
  reporter_user_id UUID REFERENCES auth.users(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('fake_project', 'embezzlement', 'ghost_budget', 'power_abuse', 'development_delay', 'unfulfilled_promise')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  related_project_id UUID,
  related_official_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'verified', 'escalated', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  severity_level TEXT NOT NULL DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  anonymous_report BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create village transparency metrics table
CREATE TABLE IF NOT EXISTS public.village_transparency_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id UUID NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
  project_completion_rate NUMERIC DEFAULT 0 CHECK (project_completion_rate >= 0 AND project_completion_rate <= 100),
  corruption_reports_count INTEGER DEFAULT 0,
  verified_corruption_count INTEGER DEFAULT 0,
  citizen_satisfaction_score NUMERIC DEFAULT 0 CHECK (citizen_satisfaction_score >= 0 AND citizen_satisfaction_score <= 100),
  transparency_score NUMERIC DEFAULT 0 CHECK (transparency_score >= 0 AND transparency_score <= 100),
  development_progress_score NUMERIC DEFAULT 0 CHECK (development_progress_score >= 0 AND development_progress_score <= 100),
  civic_engagement_score NUMERIC DEFAULT 0 CHECK (civic_engagement_score >= 0 AND civic_engagement_score <= 100),
  official_performance_score NUMERIC DEFAULT 0 CHECK (official_performance_score >= 0 AND official_performance_score <= 100),
  overall_reputation_score NUMERIC DEFAULT 0 CHECK (overall_reputation_score >= 0 AND overall_reputation_score <= 100),
  reputation_badge TEXT DEFAULT 'under_assessment' CHECK (reputation_badge IN ('excellent', 'good', 'average', 'poor', 'under_assessment')),
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create village monthly votes table for citizen feedback
CREATE TABLE IF NOT EXISTS public.village_monthly_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id UUID NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
  voter_user_id UUID NOT NULL REFERENCES auth.users(id),
  vote_month DATE NOT NULL DEFAULT DATE_TRUNC('month', CURRENT_DATE),
  development_progress_rating INTEGER CHECK (development_progress_rating >= 1 AND development_progress_rating <= 5),
  leadership_transparency_rating INTEGER CHECK (leadership_transparency_rating >= 1 AND leadership_transparency_rating <= 5),
  village_unity_rating INTEGER CHECK (village_unity_rating >= 1 AND village_unity_rating <= 5),
  access_to_services_rating INTEGER CHECK (access_to_services_rating >= 1 AND access_to_services_rating <= 5),
  overall_satisfaction_rating INTEGER CHECK (overall_satisfaction_rating >= 1 AND overall_satisfaction_rating <= 5),
  comment TEXT,
  is_diaspora_vote BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(village_id, voter_user_id, vote_month)
);

-- Create indexes for performance
CREATE INDEX idx_village_corruption_reports_village_id ON public.village_corruption_reports(village_id);
CREATE INDEX idx_village_corruption_reports_status ON public.village_corruption_reports(status);
CREATE INDEX idx_village_transparency_metrics_village_id ON public.village_transparency_metrics(village_id);
CREATE INDEX idx_village_monthly_votes_village_id ON public.village_monthly_votes(village_id);
CREATE INDEX idx_village_monthly_votes_month ON public.village_monthly_votes(vote_month);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_village_corruption_reports_updated_at
    BEFORE UPDATE ON public.village_corruption_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_village_transparency_metrics_updated_at
    BEFORE UPDATE ON public.village_transparency_metrics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_village_monthly_votes_updated_at
    BEFORE UPDATE ON public.village_monthly_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate village reputation index
CREATE OR REPLACE FUNCTION public.calculate_village_reputation_index(p_village_id UUID)
RETURNS VOID AS $$
DECLARE
  v_project_completion_rate NUMERIC := 0;
  v_corruption_penalty NUMERIC := 0;
  v_citizen_satisfaction NUMERIC := 0;
  v_infrastructure_index NUMERIC := 0;
  v_civic_engagement NUMERIC := 0;
  v_official_performance NUMERIC := 0;
  v_overall_score NUMERIC := 0;
  v_reputation_badge TEXT := 'under_assessment';
  v_total_projects INTEGER := 0;
  v_completed_projects INTEGER := 0;
  v_total_corruption_reports INTEGER := 0;
  v_verified_corruption INTEGER := 0;
BEGIN
  -- Calculate project completion rate (25% weight)
  SELECT 
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*)
  INTO v_completed_projects, v_total_projects
  FROM village_projects 
  WHERE village_id = p_village_id;
  
  IF v_total_projects > 0 THEN
    v_project_completion_rate := (v_completed_projects::NUMERIC / v_total_projects) * 100;
  ELSE
    v_project_completion_rate := 50; -- Default neutral score
  END IF;
  
  -- Calculate corruption penalty (20% weight)
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'verified')
  INTO v_total_corruption_reports, v_verified_corruption
  FROM village_corruption_reports 
  WHERE village_id = p_village_id;
  
  -- Corruption penalty: more verified reports = lower score
  v_corruption_penalty := GREATEST(0, 100 - (v_verified_corruption * 10));
  
  -- Calculate citizen satisfaction (20% weight)
  SELECT COALESCE(AVG(overall_satisfaction_rating) * 20, 50)
  INTO v_citizen_satisfaction
  FROM village_monthly_votes
  WHERE village_id = p_village_id 
    AND vote_month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months');
  
  -- Calculate infrastructure index (15% weight)
  SELECT 
    COALESCE(
      (COALESCE(infrastructure_score, 5) + 
       COALESCE(education_score, 5) + 
       COALESCE(health_score, 5)) / 3 * 10, 50
    )
  INTO v_infrastructure_index
  FROM villages
  WHERE id = p_village_id;
  
  -- Calculate civic engagement (10% weight)
  SELECT 
    COALESCE(civic_participation_score * 10, 50)
  INTO v_civic_engagement
  FROM villages
  WHERE id = p_village_id;
  
  -- Calculate official performance (10% weight - placeholder)
  v_official_performance := 75; -- Default score, can be enhanced with actual official ratings
  
  -- Calculate weighted overall score
  v_overall_score := (
    v_project_completion_rate * 0.25 +
    v_corruption_penalty * 0.20 +
    v_citizen_satisfaction * 0.20 +
    v_infrastructure_index * 0.15 +
    v_civic_engagement * 0.10 +
    v_official_performance * 0.10
  );
  
  -- Ensure score is within bounds
  v_overall_score := GREATEST(0, LEAST(100, v_overall_score));
  
  -- Determine reputation badge
  IF v_overall_score >= 85 THEN
    v_reputation_badge := 'excellent';
  ELSIF v_overall_score >= 70 THEN
    v_reputation_badge := 'good';
  ELSIF v_overall_score >= 50 THEN
    v_reputation_badge := 'average';
  ELSE
    v_reputation_badge := 'poor';
  END IF;
  
  -- Insert or update transparency metrics
  INSERT INTO village_transparency_metrics (
    village_id,
    project_completion_rate,
    corruption_reports_count,
    verified_corruption_count,
    citizen_satisfaction_score,
    transparency_score,
    development_progress_score,
    civic_engagement_score,
    official_performance_score,
    overall_reputation_score,
    reputation_badge,
    last_calculated_at
  ) VALUES (
    p_village_id,
    v_project_completion_rate,
    v_total_corruption_reports,
    v_verified_corruption,
    v_citizen_satisfaction,
    v_corruption_penalty,
    v_project_completion_rate,
    v_civic_engagement,
    v_official_performance,
    v_overall_score,
    v_reputation_badge,
    now()
  )
  ON CONFLICT (village_id) DO UPDATE SET
    project_completion_rate = EXCLUDED.project_completion_rate,
    corruption_reports_count = EXCLUDED.corruption_reports_count,
    verified_corruption_count = EXCLUDED.verified_corruption_count,
    citizen_satisfaction_score = EXCLUDED.citizen_satisfaction_score,
    transparency_score = EXCLUDED.transparency_score,
    development_progress_score = EXCLUDED.development_progress_score,
    civic_engagement_score = EXCLUDED.civic_engagement_score,
    official_performance_score = EXCLUDED.official_performance_score,
    overall_reputation_score = EXCLUDED.overall_reputation_score,
    reputation_badge = EXCLUDED.reputation_badge,
    last_calculated_at = EXCLUDED.last_calculated_at,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint on village_id for transparency metrics
ALTER TABLE public.village_transparency_metrics ADD CONSTRAINT unique_village_transparency UNIQUE (village_id);

-- Enable RLS on all new tables
ALTER TABLE public.village_corruption_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_transparency_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_monthly_votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for village_corruption_reports
CREATE POLICY "Anyone can view corruption reports" ON public.village_corruption_reports
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reports" ON public.village_corruption_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Users can update their own reports" ON public.village_corruption_reports
  FOR UPDATE USING (auth.uid() = reporter_user_id);

CREATE POLICY "Admins can manage all reports" ON public.village_corruption_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for village_transparency_metrics
CREATE POLICY "Anyone can view transparency metrics" ON public.village_transparency_metrics
  FOR SELECT USING (true);

CREATE POLICY "System can manage transparency metrics" ON public.village_transparency_metrics
  FOR ALL USING (true);

-- Create RLS policies for village_monthly_votes
CREATE POLICY "Anyone can view vote statistics" ON public.village_monthly_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own votes" ON public.village_monthly_votes
  FOR ALL USING (auth.uid() = voter_user_id);

-- Insert initial transparency metrics for existing villages
INSERT INTO village_transparency_metrics (village_id)
SELECT id FROM villages
ON CONFLICT (village_id) DO NOTHING;