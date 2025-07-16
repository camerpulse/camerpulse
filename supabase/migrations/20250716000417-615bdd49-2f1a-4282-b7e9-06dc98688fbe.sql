-- Pan-African Civic Mesh Expansion (PACME) Infrastructure

-- Table to store civic mesh nodes (countries with their civic infrastructure)
CREATE TABLE public.pan_africa_civic_mesh_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  flag_emoji TEXT NOT NULL,
  region TEXT NOT NULL,
  primary_language TEXT NOT NULL DEFAULT 'en',
  supported_languages TEXT[] DEFAULT ARRAY['en'],
  currency_code TEXT NOT NULL,
  capital_city TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  mesh_status TEXT DEFAULT 'pending', -- pending, active, maintenance, disabled
  
  -- Data source configuration
  data_sources JSONB DEFAULT '{}',
  scraper_config JSONB DEFAULT '{}',
  api_endpoints JSONB DEFAULT '{}',
  
  -- Civic infrastructure tracking
  ministers_count INTEGER DEFAULT 0,
  parties_count INTEGER DEFAULT 0,
  legislators_count INTEGER DEFAULT 0,
  civic_issues_count INTEGER DEFAULT 0,
  
  -- Performance metrics
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency_hours INTEGER DEFAULT 24,
  data_quality_score NUMERIC DEFAULT 0.0,
  
  -- Mesh connectivity
  cross_border_enabled BOOLEAN DEFAULT true,
  intelligence_sharing_enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for cross-border civic analytics and insights
CREATE TABLE public.pan_africa_cross_border_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_type TEXT NOT NULL, -- sentiment_comparison, corruption_signals, election_patterns, youth_engagement
  countries_analyzed TEXT[] NOT NULL,
  region_scope TEXT, -- specific region or 'continental'
  
  -- Analysis data
  analysis_results JSONB NOT NULL DEFAULT '{}',
  insights JSONB DEFAULT '{}',
  anomalies_detected JSONB DEFAULT '[]',
  risk_indicators JSONB DEFAULT '{}',
  
  -- Metrics
  confidence_score NUMERIC DEFAULT 0.0,
  urgency_level TEXT DEFAULT 'low', -- low, medium, high, critical
  
  -- Tracking
  generated_by TEXT DEFAULT 'mesh_engine',
  analysis_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Indexes for performance
  CONSTRAINT valid_urgency_level CHECK (urgency_level IN ('low', 'medium', 'high', 'critical'))
);

-- Table for mesh-wide alerts and notifications
CREATE TABLE public.pan_africa_mesh_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- democratic_backsliding, election_interference, corruption_spike, civil_unrest
  affected_countries TEXT[] NOT NULL,
  region TEXT,
  
  -- Alert content
  alert_title TEXT NOT NULL,
  alert_description TEXT NOT NULL,
  severity_level TEXT DEFAULT 'medium', -- low, medium, high, critical
  
  -- Evidence and context
  evidence_data JSONB DEFAULT '{}',
  related_events JSONB DEFAULT '[]',
  recommended_actions JSONB DEFAULT '[]',
  
  -- Status tracking
  status TEXT DEFAULT 'active', -- active, acknowledged, resolved, escalated
  acknowledged_by UUID[], -- admin user IDs
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Auto-resolution
  auto_resolve_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_severity_level CHECK (severity_level IN ('low', 'medium', 'high', 'critical'))
);

-- Table for tracking mesh synchronization operations
CREATE TABLE public.pan_africa_mesh_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  sync_type TEXT NOT NULL, -- full_sync, incremental, manual, emergency
  sync_operation TEXT NOT NULL, -- ministers, parties, legislators, civic_issues, sentiment
  
  -- Sync results
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  records_processed INTEGER DEFAULT 0,
  records_added INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  
  -- Performance tracking
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  
  -- Error handling
  error_message TEXT,
  error_details JSONB,
  
  -- Metadata
  triggered_by TEXT DEFAULT 'auto_scheduler',
  sync_config JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for mesh-wide configuration and settings
CREATE TABLE public.pan_africa_mesh_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_category TEXT NOT NULL, -- global, regional, country_specific
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL,
  
  -- Scope
  applies_to_countries TEXT[], -- if null, applies globally
  applies_to_regions TEXT[], -- if null, applies globally
  
  -- Metadata
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  updated_by UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(config_category, config_key)
);

-- Enable RLS on all tables
ALTER TABLE public.pan_africa_civic_mesh_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pan_africa_cross_border_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pan_africa_mesh_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pan_africa_mesh_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pan_africa_mesh_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage mesh nodes" ON public.pan_africa_civic_mesh_nodes FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage cross-border analytics" ON public.pan_africa_cross_border_analytics FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage mesh alerts" ON public.pan_africa_mesh_alerts FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can view sync logs" ON public.pan_africa_mesh_sync_logs FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage mesh config" ON public.pan_africa_mesh_config FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Indexes for performance
CREATE INDEX idx_mesh_nodes_country ON public.pan_africa_civic_mesh_nodes(country_code);
CREATE INDEX idx_mesh_nodes_region ON public.pan_africa_civic_mesh_nodes(region);
CREATE INDEX idx_mesh_nodes_active ON public.pan_africa_civic_mesh_nodes(is_active);

CREATE INDEX idx_cross_border_analytics_countries ON public.pan_africa_cross_border_analytics USING GIN(countries_analyzed);
CREATE INDEX idx_cross_border_analytics_type ON public.pan_africa_cross_border_analytics(analysis_type);
CREATE INDEX idx_cross_border_analytics_date ON public.pan_africa_cross_border_analytics(analysis_date);

CREATE INDEX idx_mesh_alerts_countries ON public.pan_africa_mesh_alerts USING GIN(affected_countries);
CREATE INDEX idx_mesh_alerts_severity ON public.pan_africa_mesh_alerts(severity_level);
CREATE INDEX idx_mesh_alerts_status ON public.pan_africa_mesh_alerts(status);

CREATE INDEX idx_mesh_sync_country ON public.pan_africa_mesh_sync_logs(country_code);
CREATE INDEX idx_mesh_sync_status ON public.pan_africa_mesh_sync_logs(status);
CREATE INDEX idx_mesh_sync_date ON public.pan_africa_mesh_sync_logs(started_at);

-- Triggers for updated_at
CREATE TRIGGER update_mesh_nodes_updated_at BEFORE UPDATE ON public.pan_africa_civic_mesh_nodes 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mesh_alerts_updated_at BEFORE UPDATE ON public.pan_africa_mesh_alerts 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mesh_config_updated_at BEFORE UPDATE ON public.pan_africa_mesh_config 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial mesh nodes for major African countries
INSERT INTO public.pan_africa_civic_mesh_nodes (
  country_code, country_name, flag_emoji, region, primary_language, 
  supported_languages, currency_code, capital_city, data_sources, scraper_config
) VALUES 
-- Central Africa
('CM', 'Cameroon', '🇨🇲', 'Central Africa', 'fr', ARRAY['fr', 'en'], 'XAF', 'Yaoundé', 
 '{"government": "gov.cm", "parliament": "assnat.cm", "parties": "minat.gov.cm"}',
 '{"enabled": true, "frequency_hours": 6, "priority": "high"}'),

-- West Africa  
('NG', 'Nigeria', '🇳🇬', 'West Africa', 'en', ARRAY['en', 'ha', 'yo', 'ig'], 'NGN', 'Abuja',
 '{"government": "gov.ng", "parliament": "nass.gov.ng", "elections": "inec.gov.ng"}',
 '{"enabled": true, "frequency_hours": 4, "priority": "high"}'),

('GH', 'Ghana', '🇬🇭', 'West Africa', 'en', ARRAY['en', 'tw', 'ha'], 'GHS', 'Accra',
 '{"government": "gov.gh", "parliament": "parliament.gh", "elections": "ec.gov.gh"}',
 '{"enabled": true, "frequency_hours": 8, "priority": "medium"}'),

('SN', 'Senegal', '🇸🇳', 'West Africa', 'fr', ARRAY['fr', 'wo'], 'XOF', 'Dakar',
 '{"government": "gouv.sn", "parliament": "assemblee-nationale.sn"}',
 '{"enabled": true, "frequency_hours": 12, "priority": "medium"}'),

-- East Africa
('KE', 'Kenya', '🇰🇪', 'East Africa', 'sw', ARRAY['sw', 'en'], 'KES', 'Nairobi',
 '{"government": "gov.ke", "parliament": "parliament.go.ke", "elections": "iebc.or.ke"}',
 '{"enabled": true, "frequency_hours": 6, "priority": "high"}'),

('TZ', 'Tanzania', '🇹🇿', 'East Africa', 'sw', ARRAY['sw', 'en'], 'TZS', 'Dodoma',
 '{"government": "gov.tz", "parliament": "parliament.go.tz"}',
 '{"enabled": true, "frequency_hours": 12, "priority": "medium"}'),

('UG', 'Uganda', '🇺🇬', 'East Africa', 'en', ARRAY['en', 'sw'], 'UGX', 'Kampala',
 '{"government": "gov.ug", "parliament": "parliament.go.ug"}',
 '{"enabled": true, "frequency_hours": 12, "priority": "medium"}'),

('RW', 'Rwanda', '🇷🇼', 'East Africa', 'rw', ARRAY['rw', 'en', 'fr'], 'RWF', 'Kigali',
 '{"government": "gov.rw", "parliament": "parliament.gov.rw"}',
 '{"enabled": true, "frequency_hours": 8, "priority": "medium"}'),

-- Southern Africa
('ZA', 'South Africa', '🇿🇦', 'Southern Africa', 'en', ARRAY['af', 'en', 'zu', 'xh'], 'ZAR', 'Cape Town',
 '{"government": "gov.za", "parliament": "parliament.gov.za", "elections": "elections.org.za"}',
 '{"enabled": true, "frequency_hours": 4, "priority": "high"}'),

('ZW', 'Zimbabwe', '🇿🇼', 'Southern Africa', 'en', ARRAY['en', 'sn', 'nd'], 'ZWL', 'Harare',
 '{"government": "zim.gov.zw", "parliament": "parlzim.gov.zw"}',
 '{"enabled": true, "frequency_hours": 12, "priority": "medium"}'),

('ZM', 'Zambia', '🇿🇲', 'Southern Africa', 'en', ARRAY['en'], 'ZMW', 'Lusaka',
 '{"government": "gov.zm", "parliament": "parliament.gov.zm", "elections": "ecz.org.zm"}',
 '{"enabled": true, "frequency_hours": 12, "priority": "medium"}'),

-- North Africa
('EG', 'Egypt', '🇪🇬', 'North Africa', 'ar', ARRAY['ar', 'en'], 'EGP', 'Cairo',
 '{"government": "egypt.gov.eg", "parliament": "parliament.gov.eg"}',
 '{"enabled": true, "frequency_hours": 8, "priority": "high"}'),

('MA', 'Morocco', '🇲🇦', 'North Africa', 'ar', ARRAY['ar', 'fr'], 'MAD', 'Rabat',
 '{"government": "gov.ma", "parliament": "chambredesrepresentants.ma"}',
 '{"enabled": true, "frequency_hours": 12, "priority": "medium"}'),

('TN', 'Tunisia', '🇹🇳', 'North Africa', 'ar', ARRAY['ar', 'fr'], 'TND', 'Tunis',
 '{"government": "gov.tn", "parliament": "arp.tn"}',
 '{"enabled": true, "frequency_hours": 12, "priority": "medium"}');

-- Insert initial mesh configuration
INSERT INTO public.pan_africa_mesh_config (config_category, config_key, config_value, description) VALUES
('global', 'mesh_enabled', '{"enabled": true}', 'Master switch for Pan-African Civic Mesh'),
('global', 'cross_border_analytics', '{"enabled": true, "frequency_hours": 6}', 'Cross-border analytics configuration'),
('global', 'mesh_alerts', '{"enabled": true, "auto_escalation": true}', 'Mesh-wide alert system configuration'),
('global', 'intelligence_sharing', '{"enabled": true, "anonymize_sensitive": true}', 'Intelligence sharing between countries'),
('global', 'sync_schedule', '{"default_frequency": 12, "peak_hours": [6, 12, 18]}', 'Default synchronization schedule'),

('regional', 'west_africa_focus', '{"priority_countries": ["NG", "GH", "SN"], "special_monitoring": ["elections", "governance"]}', 'West Africa specific configuration'),
('regional', 'east_africa_focus', '{"priority_countries": ["KE", "TZ", "UG", "RW"], "special_monitoring": ["development", "security"]}', 'East Africa specific configuration'),
('regional', 'southern_africa_focus', '{"priority_countries": ["ZA", "ZW", "ZM"], "special_monitoring": ["democracy", "economy"]}', 'Southern Africa specific configuration'),
('regional', 'north_africa_focus', '{"priority_countries": ["EG", "MA", "TN"], "special_monitoring": ["stability", "governance"]}', 'North Africa specific configuration'),
('regional', 'central_africa_focus', '{"priority_countries": ["CM"], "special_monitoring": ["governance", "security"]}', 'Central Africa specific configuration');

-- Function to get mesh status overview
CREATE OR REPLACE FUNCTION public.get_mesh_status_overview()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}';
  total_countries INTEGER;
  active_countries INTEGER;
  pending_syncs INTEGER;
  active_alerts INTEGER;
BEGIN
  -- Count total and active countries
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_active = true) 
  INTO total_countries, active_countries
  FROM public.pan_africa_civic_mesh_nodes;
  
  -- Count pending syncs
  SELECT COUNT(*) INTO pending_syncs
  FROM public.pan_africa_mesh_sync_logs
  WHERE status IN ('pending', 'running')
    AND started_at > now() - INTERVAL '24 hours';
  
  -- Count active alerts
  SELECT COUNT(*) INTO active_alerts
  FROM public.pan_africa_mesh_alerts
  WHERE status = 'active';
  
  result := jsonb_build_object(
    'total_countries', total_countries,
    'active_countries', active_countries,
    'pending_syncs', pending_syncs,
    'active_alerts', active_alerts,
    'mesh_health', CASE 
      WHEN active_countries >= total_countries * 0.8 THEN 'healthy'
      WHEN active_countries >= total_countries * 0.6 THEN 'warning'
      ELSE 'critical'
    END
  );
  
  RETURN result;
END;
$$;