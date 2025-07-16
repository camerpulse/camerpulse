-- Create enum for media source types
CREATE TYPE public.media_source_type AS ENUM (
  'news_website',
  'youtube_channel',
  'podcast',
  'radio_stream',
  'blog',
  'social_feed'
);

-- Create enum for bias levels
CREATE TYPE public.bias_level AS ENUM (
  'none',
  'mild', 
  'moderate',
  'high'
);

-- Create enum for threat levels
CREATE TYPE public.threat_level AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- Create media sources table
CREATE TABLE public.media_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_type public.media_source_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  monitor_frequency TEXT NOT NULL DEFAULT 'daily', -- daily, hourly, weekly
  monitor_times TEXT[] DEFAULT ARRAY['06:00', '18:00'], -- times to check
  focus_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  bias_threshold INTEGER DEFAULT 70, -- alert if bias > this
  trust_threshold INTEGER DEFAULT 50, -- alert if trust < this
  threat_threshold public.threat_level DEFAULT 'medium',
  public_display BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_monitored_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create media content analysis table
CREATE TABLE public.media_content_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.media_sources(id) ON DELETE CASCADE,
  content_url TEXT,
  title TEXT,
  content_text TEXT,
  content_summary TEXT,
  
  -- Analysis results
  bias_score INTEGER DEFAULT 0, -- 0-100
  bias_level public.bias_level DEFAULT 'none',
  trust_score INTEGER DEFAULT 50, -- 0-100
  threat_level public.threat_level DEFAULT 'low',
  
  -- Entity mentions
  politicians_mentioned TEXT[] DEFAULT ARRAY[]::TEXT[],
  parties_mentioned TEXT[] DEFAULT ARRAY[]::TEXT[],
  regions_mentioned TEXT[] DEFAULT ARRAY[]::TEXT[],
  ministers_mentioned TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Classification
  tone TEXT, -- positive, negative, neutral, inflammatory
  agenda_detected TEXT, -- pro-government, anti-government, neutral, partisan
  disinformation_indicators TEXT[] DEFAULT ARRAY[]::TEXT[],
  propaganda_markers TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Metadata
  analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  content_date TIMESTAMP WITH TIME ZONE,
  language TEXT DEFAULT 'fr',
  source_credibility_score INTEGER DEFAULT 50,
  
  -- AI Analysis details
  ai_confidence NUMERIC DEFAULT 0.0,
  ai_model_used TEXT,
  processing_time_ms INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create media alerts table
CREATE TABLE public.media_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.media_content_analysis(id) ON DELETE CASCADE,
  source_id UUID REFERENCES public.media_sources(id) ON DELETE CASCADE,
  
  alert_type TEXT NOT NULL, -- bias_threshold, trust_threshold, threat_detected, entity_mention
  alert_severity public.threat_level DEFAULT 'medium',
  alert_title TEXT NOT NULL,
  alert_description TEXT,
  
  -- Threshold details
  threshold_breached TEXT, -- what threshold was breached
  actual_value INTEGER, -- the actual value that breached threshold
  threshold_value INTEGER, -- the threshold that was set
  
  -- Entities involved
  entities_affected TEXT[] DEFAULT ARRAY[]::TEXT[],
  regions_affected TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Status
  status TEXT DEFAULT 'active', -- active, dismissed, resolved, escalated
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  
  -- Public visibility
  public_display BOOLEAN DEFAULT false,
  published_to_disinfo_map BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create media monitoring schedules table
CREATE TABLE public.media_monitoring_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.media_sources(id) ON DELETE CASCADE,
  schedule_name TEXT NOT NULL,
  cron_expression TEXT NOT NULL, -- for flexible scheduling
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_content_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_monitoring_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage media sources" ON public.media_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all content analysis" ON public.media_content_analysis
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can view published analysis" ON public.media_content_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.media_sources ms 
      WHERE ms.id = media_content_analysis.source_id 
      AND ms.public_display = true
    )
  );

CREATE POLICY "Admins can manage media alerts" ON public.media_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can view published alerts" ON public.media_alerts
  FOR SELECT USING (public_display = true);

CREATE POLICY "Admins can manage monitoring schedules" ON public.media_monitoring_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_media_sources_active ON public.media_sources(is_active);
CREATE INDEX idx_media_sources_type ON public.media_sources(source_type);
CREATE INDEX idx_media_content_analysis_source ON public.media_content_analysis(source_id);
CREATE INDEX idx_media_content_analysis_bias ON public.media_content_analysis(bias_score);
CREATE INDEX idx_media_content_analysis_trust ON public.media_content_analysis(trust_score);
CREATE INDEX idx_media_content_analysis_threat ON public.media_content_analysis(threat_level);
CREATE INDEX idx_media_content_analysis_date ON public.media_content_analysis(content_date);
CREATE INDEX idx_media_alerts_status ON public.media_alerts(status);
CREATE INDEX idx_media_alerts_severity ON public.media_alerts(alert_severity);
CREATE INDEX idx_media_alerts_public ON public.media_alerts(public_display);

-- Create triggers for updated_at
CREATE TRIGGER update_media_sources_updated_at
  BEFORE UPDATE ON public.media_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_alerts_updated_at
  BEFORE UPDATE ON public.media_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_monitoring_schedules_updated_at
  BEFORE UPDATE ON public.media_monitoring_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to analyze media content
CREATE OR REPLACE FUNCTION public.analyze_media_content(
  p_source_id UUID,
  p_content_url TEXT,
  p_title TEXT DEFAULT NULL,
  p_content_text TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{"status": "initiated", "analysis_id": null}';
  analysis_id UUID;
BEGIN
  -- Insert placeholder analysis record
  INSERT INTO public.media_content_analysis (
    source_id,
    content_url,
    title,
    content_text,
    bias_score,
    trust_score,
    ai_confidence
  ) VALUES (
    p_source_id,
    p_content_url,
    p_title,
    p_content_text,
    0, -- will be updated by AI analysis
    50, -- default trust score
    0.0 -- will be updated by AI
  ) RETURNING id INTO analysis_id;
  
  -- Update last monitored time for source
  UPDATE public.media_sources 
  SET last_monitored_at = now() 
  WHERE id = p_source_id;
  
  result := result || jsonb_build_object(
    'analysis_id', analysis_id,
    'source_id', p_source_id,
    'initiated_at', now()
  );
  
  RETURN result;
END;
$$;

-- Function to create media alert
CREATE OR REPLACE FUNCTION public.create_media_alert(
  p_analysis_id UUID,
  p_alert_type TEXT,
  p_alert_title TEXT,
  p_alert_description TEXT DEFAULT NULL,
  p_severity public.threat_level DEFAULT 'medium'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  alert_id UUID;
  analysis_record RECORD;
BEGIN
  -- Get analysis details
  SELECT * INTO analysis_record 
  FROM public.media_content_analysis 
  WHERE id = p_analysis_id;
  
  -- Create alert
  INSERT INTO public.media_alerts (
    analysis_id,
    source_id,
    alert_type,
    alert_severity,
    alert_title,
    alert_description,
    entities_affected,
    regions_affected
  ) VALUES (
    p_analysis_id,
    analysis_record.source_id,
    p_alert_type,
    p_severity,
    p_alert_title,
    p_alert_description,
    analysis_record.politicians_mentioned || analysis_record.parties_mentioned,
    analysis_record.regions_mentioned
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;