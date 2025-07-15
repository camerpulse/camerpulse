-- Create election timeline management tables
CREATE TABLE IF NOT EXISTS public.election_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_type TEXT NOT NULL CHECK (election_type IN ('presidential', 'legislative', 'municipal', 'regional', 'senatorial')),
  election_date DATE NOT NULL,
  registration_deadline DATE,
  campaign_start_date DATE,
  campaign_end_date DATE,
  affected_regions TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  official_source_url TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'postponed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create election interference alerts table
CREATE TABLE IF NOT EXISTS public.election_interference_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_calendar_id UUID REFERENCES public.election_calendars(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('disinformation', 'violence_threat', 'voter_suppression', 'network_blackout', 'illegal_influence', 'ballot_tampering', 'intimidation')),
  phase TEXT NOT NULL CHECK (phase IN ('pre_election', 'election_week', 'post_election')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  affected_regions TEXT[],
  source_type TEXT DEFAULT 'automated' CHECK (source_type IN ('automated', 'manual', 'citizen_report', 'observer_report')),
  evidence_urls TEXT[],
  related_content_ids UUID[],
  threat_indicators JSONB DEFAULT '{}',
  sentiment_impact_data JSONB DEFAULT '{}',
  escalation_status TEXT DEFAULT 'monitoring' CHECK (escalation_status IN ('monitoring', 'investigating', 'escalated', 'resolved', 'false_positive')),
  responsible_agency TEXT,
  action_taken TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create election threat index table for regional scoring
CREATE TABLE IF NOT EXISTS public.election_threat_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_calendar_id UUID REFERENCES public.election_calendars(id),
  region TEXT NOT NULL,
  division TEXT,
  date_recorded DATE DEFAULT CURRENT_DATE,
  overall_threat_score NUMERIC CHECK (overall_threat_score >= 0 AND overall_threat_score <= 100),
  disinformation_score NUMERIC DEFAULT 0,
  violence_risk_score NUMERIC DEFAULT 0,
  suppression_risk_score NUMERIC DEFAULT 0,
  sentiment_volatility_score NUMERIC DEFAULT 0,
  network_interference_score NUMERIC DEFAULT 0,
  contributing_factors JSONB DEFAULT '{}',
  threat_level TEXT DEFAULT 'low' CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  escalation_triggers TEXT[],
  recommended_actions TEXT[],
  last_incident_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(election_calendar_id, region, date_recorded)
);

-- Create voter suppression tracking table
CREATE TABLE IF NOT EXISTS public.voter_suppression_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_calendar_id UUID REFERENCES public.election_calendars(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('network_shutdown', 'rally_prevented', 'media_blackout', 'ngo_obstruction', 'journalist_harassment', 'ballot_seizure', 'polling_disruption', 'transportation_blocked')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_region TEXT NOT NULL,
  location_city TEXT,
  coordinates JSONB,
  severity_level TEXT DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  estimated_affected_voters INTEGER,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'disputed', 'false_report')),
  evidence_urls TEXT[],
  witness_reports TEXT[],
  reporter_type TEXT DEFAULT 'anonymous' CHECK (reporter_type IN ('anonymous', 'citizen', 'observer', 'media', 'ngo', 'official')),
  reporter_contact TEXT,
  response_actions TEXT[],
  resolution_status TEXT DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'investigating', 'resolved', 'escalated')),
  incident_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create election disinformation tracking table (specialized for elections)
CREATE TABLE IF NOT EXISTS public.election_disinformation_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_calendar_id UUID REFERENCES public.election_calendars(id),
  content_id TEXT,
  content_text TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video', 'audio', 'mixed')),
  platform TEXT NOT NULL,
  author_handle TEXT,
  target_candidate TEXT,
  target_party TEXT,
  disinformation_category TEXT NOT NULL CHECK (disinformation_category IN ('fake_results', 'candidate_defamation', 'process_manipulation', 'voter_intimidation', 'false_procedures', 'electoral_fraud_claims', 'hate_speech')),
  credibility_score NUMERIC CHECK (credibility_score >= 0 AND credibility_score <= 1),
  virality_score NUMERIC DEFAULT 0,
  emotional_manipulation_detected BOOLEAN DEFAULT FALSE,
  amplification_indicators JSONB DEFAULT '{}',
  fact_check_status TEXT DEFAULT 'pending' CHECK (fact_check_status IN ('pending', 'verified_false', 'verified_true', 'misleading', 'disputed')),
  fact_check_sources TEXT[],
  regions_affected TEXT[],
  estimated_reach INTEGER DEFAULT 0,
  engagement_metrics JSONB DEFAULT '{}',
  takedown_requested BOOLEAN DEFAULT FALSE,
  takedown_status TEXT DEFAULT 'none' CHECK (takedown_status IN ('none', 'requested', 'pending', 'removed', 'rejected')),
  counter_narrative_deployed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create election phase configurations table
CREATE TABLE IF NOT EXISTS public.election_phase_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_calendar_id UUID REFERENCES public.election_calendars(id),
  phase TEXT NOT NULL CHECK (phase IN ('pre_election', 'election_week', 'post_election')),
  monitoring_intensity TEXT DEFAULT 'standard' CHECK (monitoring_intensity IN ('low', 'standard', 'high', 'maximum')),
  alert_thresholds JSONB DEFAULT '{}',
  automated_responses JSONB DEFAULT '{}',
  escalation_rules JSONB DEFAULT '{}',
  monitoring_keywords TEXT[],
  sensitive_regions TEXT[],
  special_instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(election_calendar_id, phase)
);

-- Enable RLS on all tables
ALTER TABLE public.election_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_interference_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_threat_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_suppression_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_disinformation_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_phase_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Election calendars are publicly readable" ON public.election_calendars FOR SELECT USING (true);
CREATE POLICY "Admins can manage election calendars" ON public.election_calendars FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

CREATE POLICY "Election interference alerts are publicly readable" ON public.election_interference_alerts FOR SELECT USING (true);
CREATE POLICY "Admins can manage interference alerts" ON public.election_interference_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

CREATE POLICY "Election threat index is publicly readable" ON public.election_threat_index FOR SELECT USING (true);
CREATE POLICY "Admins can manage threat index" ON public.election_threat_index FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

CREATE POLICY "Suppression reports are publicly readable" ON public.voter_suppression_reports FOR SELECT USING (true);
CREATE POLICY "Users can submit suppression reports" ON public.voter_suppression_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage suppression reports" ON public.voter_suppression_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

CREATE POLICY "Election disinformation alerts are publicly readable" ON public.election_disinformation_alerts FOR SELECT USING (true);
CREATE POLICY "Admins can manage disinformation alerts" ON public.election_disinformation_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

CREATE POLICY "Election phase configs are publicly readable" ON public.election_phase_configs FOR SELECT USING (true);
CREATE POLICY "Admins can manage phase configs" ON public.election_phase_configs FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

-- Add updated_at triggers
CREATE TRIGGER update_election_calendars_updated_at
  BEFORE UPDATE ON public.election_calendars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_election_interference_alerts_updated_at
  BEFORE UPDATE ON public.election_interference_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_election_threat_index_updated_at
  BEFORE UPDATE ON public.election_threat_index
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voter_suppression_reports_updated_at
  BEFORE UPDATE ON public.voter_suppression_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_election_disinformation_alerts_updated_at
  BEFORE UPDATE ON public.election_disinformation_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_election_phase_configs_updated_at
  BEFORE UPDATE ON public.election_phase_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_election_calendars_date ON public.election_calendars(election_date);
CREATE INDEX IF NOT EXISTS idx_election_calendars_status ON public.election_calendars(status);

CREATE INDEX IF NOT EXISTS idx_interference_alerts_type ON public.election_interference_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_interference_alerts_phase ON public.election_interference_alerts(phase);
CREATE INDEX IF NOT EXISTS idx_interference_alerts_severity ON public.election_interference_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_interference_alerts_regions ON public.election_interference_alerts USING GIN(affected_regions);

CREATE INDEX IF NOT EXISTS idx_threat_index_region ON public.election_threat_index(region);
CREATE INDEX IF NOT EXISTS idx_threat_index_date ON public.election_threat_index(date_recorded);
CREATE INDEX IF NOT EXISTS idx_threat_index_score ON public.election_threat_index(overall_threat_score);

CREATE INDEX IF NOT EXISTS idx_suppression_reports_type ON public.voter_suppression_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_suppression_reports_region ON public.voter_suppression_reports(location_region);
CREATE INDEX IF NOT EXISTS idx_suppression_reports_datetime ON public.voter_suppression_reports(incident_datetime);

CREATE INDEX IF NOT EXISTS idx_disinformation_alerts_category ON public.election_disinformation_alerts(disinformation_category);
CREATE INDEX IF NOT EXISTS idx_disinformation_alerts_platform ON public.election_disinformation_alerts(platform);
CREATE INDEX IF NOT EXISTS idx_disinformation_alerts_regions ON public.election_disinformation_alerts USING GIN(regions_affected);