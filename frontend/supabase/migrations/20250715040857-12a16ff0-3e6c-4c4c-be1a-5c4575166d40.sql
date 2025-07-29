-- Create comprehensive civic events table for the Fusion Core
CREATE TABLE public.civic_fusion_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_title TEXT NOT NULL,
  event_description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('election', 'policy', 'economic', 'security', 'judicial', 'scandal', 'disaster', 'celebration', 'protest', 'speech', 'announcement')),
  event_category TEXT NOT NULL CHECK (event_category IN ('political', 'economic', 'social', 'security', 'judicial', 'cultural', 'environmental')),
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_duration_hours INTEGER DEFAULT 1,
  regions_affected TEXT[] DEFAULT ARRAY[]::TEXT[],
  participants TEXT[] DEFAULT ARRAY[]::TEXT[],
  government_level TEXT NOT NULL DEFAULT 'national' CHECK (government_level IN ('local', 'regional', 'national', 'international')),
  severity_level TEXT NOT NULL DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  source_url TEXT,
  source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'api', 'news_feed', 'official')),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'disputed')),
  metadata JSONB DEFAULT '{}'::JSONB,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emotion-event correlation analysis table
CREATE TABLE public.civic_fusion_correlations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  civic_event_id UUID NOT NULL REFERENCES public.civic_fusion_events(id) ON DELETE CASCADE,
  correlation_timeframe TEXT NOT NULL DEFAULT '24h' CHECK (correlation_timeframe IN ('1h', '3h', '6h', '12h', '24h', '48h', '72h')),
  baseline_emotion_score NUMERIC DEFAULT 0,
  peak_emotion_score NUMERIC DEFAULT 0,
  dominant_emotion TEXT NOT NULL,
  emotion_shift_intensity NUMERIC NOT NULL DEFAULT 0,
  correlation_strength NUMERIC NOT NULL DEFAULT 0 CHECK (correlation_strength >= 0 AND correlation_strength <= 1),
  sentiment_volume INTEGER DEFAULT 0,
  confidence_score NUMERIC NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  regions_analyzed TEXT[] DEFAULT ARRAY[]::TEXT[],
  platforms_analyzed TEXT[] DEFAULT ARRAY[]::TEXT[],
  key_phrases TEXT[] DEFAULT ARRAY[]::TEXT[],
  trending_hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  analysis_insights JSONB DEFAULT '{}'::JSONB,
  emotion_timeline JSONB DEFAULT '[]'::JSONB,
  anomaly_detected BOOLEAN DEFAULT FALSE,
  anomaly_severity TEXT CHECK (anomaly_severity IN ('low', 'medium', 'high', 'critical')),
  compared_to_historical BOOLEAN DEFAULT FALSE,
  historical_baseline NUMERIC DEFAULT 0,
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fusion alerts table
CREATE TABLE public.civic_fusion_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  civic_event_id UUID NOT NULL REFERENCES public.civic_fusion_events(id) ON DELETE CASCADE,
  correlation_id UUID REFERENCES public.civic_fusion_correlations(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('emotion_spike', 'unusual_reaction', 'historical_anomaly', 'volume_surge', 'negative_shift')),
  alert_severity TEXT NOT NULL CHECK (alert_severity IN ('low', 'medium', 'high', 'critical')),
  alert_title TEXT NOT NULL,
  alert_message TEXT NOT NULL,
  threshold_exceeded NUMERIC,
  baseline_comparison NUMERIC,
  affected_regions TEXT[] DEFAULT ARRAY[]::TEXT[],
  recommended_actions TEXT[] DEFAULT ARRAY[]::TEXT[],
  auto_generated BOOLEAN DEFAULT TRUE,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event templates for quick entry
CREATE TABLE public.civic_event_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  default_severity TEXT NOT NULL DEFAULT 'medium',
  template_description TEXT,
  default_duration_hours INTEGER DEFAULT 1,
  typical_regions TEXT[] DEFAULT ARRAY[]::TEXT[],
  expected_emotions TEXT[] DEFAULT ARRAY[]::TEXT[],
  template_metadata JSONB DEFAULT '{}'::JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.civic_fusion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_fusion_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_fusion_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_event_templates ENABLE ROW LEVEL SECURITY;

-- Policies for civic_fusion_events
CREATE POLICY "Admins can manage fusion events" ON public.civic_fusion_events
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ));

CREATE POLICY "Events are publicly readable" ON public.civic_fusion_events
  FOR SELECT USING (verification_status = 'verified');

-- Policies for civic_fusion_correlations
CREATE POLICY "Admins can manage correlations" ON public.civic_fusion_correlations
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ));

CREATE POLICY "Correlations are publicly readable" ON public.civic_fusion_correlations
  FOR SELECT USING (TRUE);

-- Policies for civic_fusion_alerts
CREATE POLICY "Admins can manage fusion alerts" ON public.civic_fusion_alerts
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ));

CREATE POLICY "Alerts are publicly readable" ON public.civic_fusion_alerts
  FOR SELECT USING (TRUE);

-- Policies for civic_event_templates
CREATE POLICY "Admins can manage event templates" ON public.civic_event_templates
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ));

CREATE POLICY "Templates are publicly readable" ON public.civic_event_templates
  FOR SELECT USING (is_active = TRUE);

-- Create indexes for performance
CREATE INDEX idx_civic_fusion_events_date ON public.civic_fusion_events(event_date);
CREATE INDEX idx_civic_fusion_events_type ON public.civic_fusion_events(event_type, event_category);
CREATE INDEX idx_civic_fusion_events_regions ON public.civic_fusion_events USING GIN(regions_affected);
CREATE INDEX idx_civic_fusion_correlations_event_id ON public.civic_fusion_correlations(civic_event_id);
CREATE INDEX idx_civic_fusion_correlations_analysis_date ON public.civic_fusion_correlations(analysis_date);
CREATE INDEX idx_civic_fusion_alerts_severity ON public.civic_fusion_alerts(alert_severity, acknowledged);
CREATE INDEX idx_civic_fusion_alerts_event_id ON public.civic_fusion_alerts(civic_event_id);

-- Create triggers for updated_at
CREATE TRIGGER update_civic_fusion_events_updated_at
  BEFORE UPDATE ON public.civic_fusion_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_civic_event_templates_updated_at
  BEFORE UPDATE ON public.civic_event_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();