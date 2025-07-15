-- Create Modular Civic Intelligence Missions (MCIMs) tables

-- Create civic missions table
CREATE TABLE public.civic_intelligence_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_title TEXT NOT NULL,
  mission_objective TEXT NOT NULL,
  mission_prompt TEXT NOT NULL,
  target_entities TEXT[] DEFAULT ARRAY[]::TEXT[], -- politician, party, institution, region
  data_sources TEXT[] DEFAULT ARRAY[]::TEXT[], -- sentiment, ratings, promises, budget, timeline
  regions TEXT[] DEFAULT ARRAY[]::TEXT[],
  timeframe_start DATE,
  timeframe_end DATE,
  priority_level TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  mission_type TEXT NOT NULL DEFAULT 'investigation', -- investigation, analysis, monitoring, audit
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed, cancelled
  output_type TEXT NOT NULL DEFAULT 'dashboard', -- dashboard, summary, alert, data_dump, report
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_autonomous BOOLEAN NOT NULL DEFAULT false, -- auto-suggested by Ashen
  created_by UUID NOT NULL,
  assigned_to TEXT DEFAULT 'ashen_ai',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  execution_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- Create mission findings table
CREATE TABLE public.civic_mission_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL,
  finding_type TEXT NOT NULL, -- anomaly, pattern, violation, trend, correlation
  finding_title TEXT NOT NULL,
  finding_description TEXT NOT NULL,
  severity_level TEXT NOT NULL DEFAULT 'low', -- low, medium, high, critical
  confidence_score NUMERIC NOT NULL DEFAULT 0.0, -- 0.0 to 1.0
  affected_entities JSONB DEFAULT '[]'::JSONB, -- people, places, institutions affected
  evidence_data JSONB DEFAULT '{}'::JSONB, -- charts, stats, proof
  source_tables TEXT[] DEFAULT ARRAY[]::TEXT[], -- which DB tables provided evidence
  correlation_strength NUMERIC DEFAULT 0.0, -- strength of correlations found
  regional_impact TEXT[] DEFAULT ARRAY[]::TEXT[],
  time_period TEXT,
  recommended_actions TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Create mission execution logs
CREATE TABLE public.civic_mission_execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL,
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL, -- data_collection, analysis, correlation, report_generation
  step_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed, skipped
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  data_processed JSONB DEFAULT '{}'::JSONB,
  results_found INTEGER DEFAULT 0,
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mission reports table
CREATE TABLE public.civic_mission_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL,
  report_title TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'investigation', -- investigation, audit, analysis, monitoring
  executive_summary TEXT NOT NULL,
  detailed_findings TEXT,
  visual_charts JSONB DEFAULT '[]'::JSONB, -- chart configurations
  data_visualizations JSONB DEFAULT '[]'::JSONB, -- graphs, maps, charts
  recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
  action_items TEXT[] DEFAULT ARRAY[]::TEXT[],
  public_summary TEXT, -- public-facing version
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  report_url TEXT,
  download_links JSONB DEFAULT '{}'::JSONB, -- PDF, CSV, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mission anomaly alerts table
CREATE TABLE public.civic_mission_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID,
  alert_type TEXT NOT NULL, -- anomaly_detected, pattern_found, violation_found, threshold_exceeded
  alert_title TEXT NOT NULL,
  alert_description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  entities_involved JSONB DEFAULT '[]'::JSONB,
  regions_affected TEXT[] DEFAULT ARRAY[]::TEXT[],
  confidence_level NUMERIC DEFAULT 0.0,
  requires_human_review BOOLEAN DEFAULT true,
  auto_actions_taken TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolution_status TEXT DEFAULT 'open', -- open, investigating, resolved, false_positive
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Enable RLS
ALTER TABLE public.civic_intelligence_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_mission_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_mission_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_mission_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_mission_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage civic missions" ON public.civic_intelligence_missions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can view published missions" ON public.civic_intelligence_missions
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage mission findings" ON public.civic_mission_findings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view execution logs" ON public.civic_mission_execution_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage mission reports" ON public.civic_mission_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can view published reports" ON public.civic_mission_reports
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage alerts" ON public.civic_mission_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX idx_civic_missions_status ON public.civic_intelligence_missions(status);
CREATE INDEX idx_civic_missions_priority ON public.civic_intelligence_missions(priority_level);
CREATE INDEX idx_civic_missions_type ON public.civic_intelligence_missions(mission_type);
CREATE INDEX idx_civic_missions_public ON public.civic_intelligence_missions(is_public);
CREATE INDEX idx_civic_missions_created_at ON public.civic_intelligence_missions(created_at);

CREATE INDEX idx_mission_findings_mission_id ON public.civic_mission_findings(mission_id);
CREATE INDEX idx_mission_findings_type ON public.civic_mission_findings(finding_type);
CREATE INDEX idx_mission_findings_severity ON public.civic_mission_findings(severity_level);

CREATE INDEX idx_mission_logs_mission_id ON public.civic_mission_execution_logs(mission_id);
CREATE INDEX idx_mission_logs_status ON public.civic_mission_execution_logs(status);

CREATE INDEX idx_mission_reports_mission_id ON public.civic_mission_reports(mission_id);
CREATE INDEX idx_mission_reports_published ON public.civic_mission_reports(is_published);

CREATE INDEX idx_mission_alerts_severity ON public.civic_mission_alerts(severity);
CREATE INDEX idx_mission_alerts_acknowledged ON public.civic_mission_alerts(is_acknowledged);

-- Add foreign key constraints
ALTER TABLE public.civic_mission_findings 
ADD CONSTRAINT fk_mission_findings_mission 
FOREIGN KEY (mission_id) REFERENCES public.civic_intelligence_missions(id) ON DELETE CASCADE;

ALTER TABLE public.civic_mission_execution_logs 
ADD CONSTRAINT fk_mission_logs_mission 
FOREIGN KEY (mission_id) REFERENCES public.civic_intelligence_missions(id) ON DELETE CASCADE;

ALTER TABLE public.civic_mission_reports 
ADD CONSTRAINT fk_mission_reports_mission 
FOREIGN KEY (mission_id) REFERENCES public.civic_intelligence_missions(id) ON DELETE CASCADE;

ALTER TABLE public.civic_mission_alerts 
ADD CONSTRAINT fk_mission_alerts_mission 
FOREIGN KEY (mission_id) REFERENCES public.civic_intelligence_missions(id) ON DELETE SET NULL;

-- Create triggers for updated_at
CREATE TRIGGER update_civic_missions_updated_at
  BEFORE UPDATE ON public.civic_intelligence_missions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mission_reports_updated_at
  BEFORE UPDATE ON public.civic_mission_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to execute civic intelligence mission
CREATE OR REPLACE FUNCTION public.execute_civic_mission(
  p_mission_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  mission_record RECORD;
  execution_result JSONB := '{"status": "initiated", "findings": [], "alerts": []}';
  findings_count INTEGER := 0;
BEGIN
  -- Get mission details
  SELECT * INTO mission_record 
  FROM public.civic_intelligence_missions 
  WHERE id = p_mission_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission not found: %', p_mission_id;
  END IF;
  
  -- Update mission status to running
  UPDATE public.civic_intelligence_missions
  SET 
    status = 'running',
    started_at = now(),
    updated_at = now()
  WHERE id = p_mission_id;
  
  -- Log execution start
  INSERT INTO public.civic_mission_execution_logs (
    mission_id, step_name, step_type, step_order, status, started_at
  ) VALUES (
    p_mission_id, 'Mission Initiated', 'initialization', 1, 'completed', now()
  );
  
  -- This would be expanded by the edge function to actually analyze data
  -- For now, we'll create a sample finding to demonstrate the structure
  INSERT INTO public.civic_mission_findings (
    mission_id,
    finding_type,
    finding_title,
    finding_description,
    severity_level,
    confidence_score,
    evidence_data
  ) VALUES (
    p_mission_id,
    'analysis_started',
    'Mission Analysis Initiated',
    'Civic intelligence mission has been started and is analyzing available data sources.',
    'low',
    1.0,
    jsonb_build_object(
      'timestamp', now(),
      'data_sources_available', mission_record.data_sources,
      'target_entities', mission_record.target_entities
    )
  );
  
  findings_count := 1;
  
  execution_result := execution_result || jsonb_build_object(
    'mission_id', p_mission_id,
    'findings_created', findings_count,
    'execution_started', now()
  );
  
  RETURN execution_result;
END;
$$;

-- Insert sample civic mission templates
INSERT INTO public.ashen_civic_memory (pattern_name, pattern_type, pattern_description, pattern_data, tags) VALUES
('Political Promise Tracker Mission', 'civic_mission', 'Template for tracking political promise fulfillment', '{"mission_type": "investigation", "data_sources": ["promises", "timeline", "sentiment"], "output_type": "dashboard", "target_entities": ["politician", "party"]}', ARRAY['promises', 'politicians', 'tracking']),
('Budget Audit Mission', 'civic_mission', 'Template for auditing government budget allocation and usage', '{"mission_type": "audit", "data_sources": ["budget", "complaints", "timeline"], "output_type": "report", "target_entities": ["institution", "region"]}', ARRAY['budget', 'audit', 'government']),
('Regional Sentiment Analysis Mission', 'civic_mission', 'Template for analyzing public sentiment by region', '{"mission_type": "analysis", "data_sources": ["sentiment", "ratings", "timeline"], "output_type": "dashboard", "target_entities": ["region", "politician"]}', ARRAY['sentiment', 'regional', 'analysis']),
('Election Integrity Mission', 'civic_mission', 'Template for monitoring election-related activities and anomalies', '{"mission_type": "monitoring", "data_sources": ["sentiment", "ratings", "timeline", "complaints"], "output_type": "alert", "target_entities": ["politician", "party", "region"]}', ARRAY['election', 'integrity', 'monitoring']);