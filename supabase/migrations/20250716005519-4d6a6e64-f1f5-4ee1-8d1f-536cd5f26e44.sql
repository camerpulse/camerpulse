-- Create tables for Civic Integrity Monitor module

-- Main alerts table for integrity flags
CREATE TABLE public.integrity_alert_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL, -- 'behavioral_inconsistency', 'spending_red_flag', 'broken_promise', 'power_shift'
  alert_title text NOT NULL,
  alert_description text NOT NULL,
  target_entity_type text NOT NULL, -- 'politician', 'ministry', 'project', 'budget'
  target_entity_id uuid,
  target_entity_name text NOT NULL,
  severity_level text NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  risk_score integer NOT NULL DEFAULT 50, -- 0-100
  suggested_cause text,
  civil_implications text,
  requires_review boolean NOT NULL DEFAULT true,
  is_public_visible boolean NOT NULL DEFAULT false,
  source_data jsonb NOT NULL DEFAULT '{}',
  evidence_links text[] DEFAULT ARRAY[]::text[],
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'under_review', 'resolved', 'dismissed'
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  review_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Data sources being monitored
CREATE TABLE public.integrity_scan_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL,
  source_type text NOT NULL, -- 'budget_database', 'promise_tracker', 'politician_votes', 'appointment_records'
  source_url text,
  last_scanned_at timestamp with time zone,
  scan_frequency_hours integer NOT NULL DEFAULT 24,
  is_active boolean NOT NULL DEFAULT true,
  scan_parameters jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Risk assessment patterns and thresholds
CREATE TABLE public.integrity_risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_name text NOT NULL,
  risk_category text NOT NULL, -- 'corruption_risk', 'inconsistency_risk', 'transparency_risk'
  risk_indicators jsonb NOT NULL, -- conditions that trigger alerts
  threshold_values jsonb NOT NULL, -- numerical thresholds
  auto_alert_enabled boolean NOT NULL DEFAULT true,
  severity_mapping jsonb NOT NULL DEFAULT '{}', -- how to calculate severity
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Admin review actions and decisions
CREATE TABLE public.integrity_review_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES public.integrity_alert_log(id) ON DELETE CASCADE,
  action_type text NOT NULL, -- 'approved_public', 'dismissed', 'escalated', 'investigation_needed'
  action_reason text,
  admin_id uuid NOT NULL,
  admin_notes text,
  public_release_approved boolean NOT NULL DEFAULT false,
  external_sharing_approved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.integrity_alert_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrity_scan_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrity_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrity_review_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only access for security
CREATE POLICY "Admins can manage integrity alerts" 
ON public.integrity_alert_log 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Admins can manage scan sources" 
ON public.integrity_scan_sources 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Admins can manage risk assessments" 
ON public.integrity_risk_assessments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Admins can manage review actions" 
ON public.integrity_review_actions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Indexes for performance
CREATE INDEX idx_integrity_alerts_severity ON public.integrity_alert_log(severity_level);
CREATE INDEX idx_integrity_alerts_status ON public.integrity_alert_log(status);
CREATE INDEX idx_integrity_alerts_target_entity ON public.integrity_alert_log(target_entity_type, target_entity_id);
CREATE INDEX idx_integrity_alerts_created_at ON public.integrity_alert_log(created_at);
CREATE INDEX idx_integrity_scan_sources_active ON public.integrity_scan_sources(is_active);
CREATE INDEX idx_integrity_review_actions_alert_id ON public.integrity_review_actions(alert_id);

-- Triggers for updated_at
CREATE TRIGGER update_integrity_alert_log_updated_at
  BEFORE UPDATE ON public.integrity_alert_log
  FOR EACH ROW EXECUTE FUNCTION public.update_ashen_timestamp();

CREATE TRIGGER update_integrity_scan_sources_updated_at
  BEFORE UPDATE ON public.integrity_scan_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_ashen_timestamp();

CREATE TRIGGER update_integrity_risk_assessments_updated_at
  BEFORE UPDATE ON public.integrity_risk_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_ashen_timestamp();

-- Function to get integrity monitor dashboard stats
CREATE OR REPLACE FUNCTION public.get_integrity_monitor_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}';
  active_alerts INTEGER;
  high_risk_alerts INTEGER;
  pending_review INTEGER;
  public_visible INTEGER;
  recent_alerts INTEGER;
  scan_sources_count INTEGER;
BEGIN
  -- Count active alerts
  SELECT COUNT(*) INTO active_alerts
  FROM public.integrity_alert_log
  WHERE status IN ('pending', 'under_review');
  
  -- Count high risk alerts
  SELECT COUNT(*) INTO high_risk_alerts
  FROM public.integrity_alert_log
  WHERE severity_level IN ('high', 'critical') AND status != 'resolved';
  
  -- Count pending review
  SELECT COUNT(*) INTO pending_review
  FROM public.integrity_alert_log
  WHERE requires_review = true AND status = 'pending';
  
  -- Count public visible alerts
  SELECT COUNT(*) INTO public_visible
  FROM public.integrity_alert_log
  WHERE is_public_visible = true;
  
  -- Count recent alerts (last 7 days)
  SELECT COUNT(*) INTO recent_alerts
  FROM public.integrity_alert_log
  WHERE created_at > CURRENT_DATE - INTERVAL '7 days';
  
  -- Count active scan sources
  SELECT COUNT(*) INTO scan_sources_count
  FROM public.integrity_scan_sources
  WHERE is_active = true;
  
  result := jsonb_build_object(
    'active_alerts', active_alerts,
    'high_risk_alerts', high_risk_alerts,
    'pending_review', pending_review,
    'public_visible', public_visible,
    'recent_alerts', recent_alerts,
    'scan_sources_count', scan_sources_count,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$;

-- Function to flag behavioral inconsistency
CREATE OR REPLACE FUNCTION public.flag_behavioral_inconsistency(
  p_entity_type text,
  p_entity_id uuid,
  p_entity_name text,
  p_inconsistency_details text,
  p_evidence_data jsonb DEFAULT '{}'::jsonb,
  p_severity text DEFAULT 'medium'::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  alert_id UUID;
  risk_score INTEGER := 50;
BEGIN
  -- Calculate risk score based on severity
  risk_score := CASE p_severity
    WHEN 'low' THEN 25
    WHEN 'medium' THEN 50
    WHEN 'high' THEN 75
    WHEN 'critical' THEN 90
    ELSE 50
  END;
  
  -- Create integrity alert
  INSERT INTO public.integrity_alert_log (
    alert_type,
    alert_title,
    alert_description,
    target_entity_type,
    target_entity_id,
    target_entity_name,
    severity_level,
    risk_score,
    suggested_cause,
    source_data
  ) VALUES (
    'behavioral_inconsistency',
    'Behavioral Inconsistency Detected',
    p_inconsistency_details,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_severity,
    risk_score,
    'Contradictory actions or statements detected through automated analysis',
    p_evidence_data
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;

-- Insert default scan sources
INSERT INTO public.integrity_scan_sources (source_name, source_type, scan_parameters) VALUES
('Promise Tracker Database', 'promise_tracker', '{"check_broken_promises": true, "timeline_threshold_days": 90}'),
('Budget Allocation Records', 'budget_database', '{"spending_variance_threshold": 20, "missing_reports_threshold": 30}'),
('Political Voting Records', 'politician_votes', '{"inconsistency_threshold": 3, "timeframe_days": 180}'),
('Government Appointment Records', 'appointment_records', '{"sudden_change_threshold": 7, "family_connection_check": true}');

-- Insert default risk assessment patterns
INSERT INTO public.integrity_risk_assessments (assessment_name, risk_category, risk_indicators, threshold_values) VALUES
('Corruption Risk Pattern', 'corruption_risk', 
 '{"repeated_contracts": true, "budget_overruns": true, "missing_documentation": true}',
 '{"contract_repetition_threshold": 3, "budget_variance_percent": 25, "documentation_missing_days": 60}'),
('Promise Breaking Pattern', 'inconsistency_risk',
 '{"broken_commitments": true, "timeline_extensions": true, "policy_reversals": true}',
 '{"broken_promise_threshold": 2, "timeline_extension_days": 180, "reversal_timeframe_days": 90}'),
('Transparency Risk Pattern', 'transparency_risk',
 '{"missing_reports": true, "delayed_publications": true, "incomplete_data": true}',
 '{"missing_report_threshold": 2, "delay_threshold_days": 30, "data_completeness_percent": 80}');