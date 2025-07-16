-- Create tables for autonomous poll intelligence system

-- Sentiment trends tracking
CREATE TABLE public.sentiment_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  platform TEXT NOT NULL, -- twitter, facebook, tiktok, civic_complaints
  sentiment_score NUMERIC NOT NULL DEFAULT 0.0, -- -1 to 1
  trend_strength NUMERIC NOT NULL DEFAULT 0.0, -- 0 to 1
  keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  region TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() + INTERVAL '7 days',
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Autonomous poll generation logs
CREATE TABLE public.autonomous_polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  trigger_sentiment_id UUID REFERENCES public.sentiment_trends(id),
  generation_method TEXT NOT NULL DEFAULT 'ai_trending', -- ai_trending, civic_complaint, political_moment
  topic_category TEXT NOT NULL, -- humor, governance, public_interest, emergency
  confidence_score NUMERIC NOT NULL DEFAULT 0.0,
  auto_published BOOLEAN NOT NULL DEFAULT false,
  admin_approved BOOLEAN DEFAULT NULL,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  generation_prompt TEXT,
  ai_reasoning JSONB DEFAULT '{}'::JSONB,
  performance_metrics JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin controls for autonomous system
CREATE TABLE public.autonomous_poll_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Civic complaints for sentiment analysis
CREATE TABLE public.civic_complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_type TEXT NOT NULL, -- fuel_scarcity, power_outage, water_shortage, transport, education
  title TEXT NOT NULL,
  description TEXT,
  region TEXT NOT NULL,
  severity_level TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  reported_by UUID,
  verified_status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, false_report
  sentiment_score NUMERIC DEFAULT 0.0,
  trending_score NUMERIC DEFAULT 0.0,
  related_polls UUID[] DEFAULT ARRAY[]::UUID[],
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sentiment_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autonomous_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autonomous_poll_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_complaints ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Sentiment trends - viewable by everyone, manageable by admins
CREATE POLICY "Sentiment trends are viewable by everyone" 
ON public.sentiment_trends FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage sentiment trends" 
ON public.sentiment_trends FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Autonomous polls - viewable by everyone, manageable by admins
CREATE POLICY "Autonomous polls are viewable by everyone" 
ON public.autonomous_polls FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage autonomous polls" 
ON public.autonomous_polls FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Autonomous config - admin only
CREATE POLICY "Admins can manage autonomous config" 
ON public.autonomous_poll_config FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Civic complaints - users can create and view, admins can moderate
CREATE POLICY "Anyone can view civic complaints" 
ON public.civic_complaints FOR SELECT 
USING (true);

CREATE POLICY "Users can create civic complaints" 
ON public.civic_complaints FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own complaints" 
ON public.civic_complaints FOR UPDATE 
USING (reported_by = auth.uid())
WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Admins can manage all civic complaints" 
ON public.civic_complaints FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create indexes for performance
CREATE INDEX idx_sentiment_trends_topic ON public.sentiment_trends(topic);
CREATE INDEX idx_sentiment_trends_platform ON public.sentiment_trends(platform);
CREATE INDEX idx_sentiment_trends_detected_at ON public.sentiment_trends(detected_at);
CREATE INDEX idx_sentiment_trends_region ON public.sentiment_trends(region);
CREATE INDEX idx_autonomous_polls_poll_id ON public.autonomous_polls(poll_id);
CREATE INDEX idx_autonomous_polls_topic_category ON public.autonomous_polls(topic_category);
CREATE INDEX idx_civic_complaints_region ON public.civic_complaints(region);
CREATE INDEX idx_civic_complaints_complaint_type ON public.civic_complaints(complaint_type);
CREATE INDEX idx_civic_complaints_trending_score ON public.civic_complaints(trending_score);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_autonomous_polls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_autonomous_polls_updated_at
  BEFORE UPDATE ON public.autonomous_polls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_autonomous_polls_updated_at();

CREATE TRIGGER update_autonomous_poll_config_updated_at
  BEFORE UPDATE ON public.autonomous_poll_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_autonomous_polls_updated_at();

CREATE TRIGGER update_civic_complaints_updated_at
  BEFORE UPDATE ON public.civic_complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_autonomous_polls_updated_at();

-- Insert default configuration
INSERT INTO public.autonomous_poll_config (config_key, config_value) VALUES
('system_enabled', '{"enabled": true, "description": "Master switch for autonomous poll generation"}'),
('generation_schedule', '{"frequency": "weekly", "max_per_week": 2, "min_confidence": 0.7}'),
('auto_publish', '{"enabled": false, "require_admin_approval": true}'),
('topic_weights', '{"humor": 0.3, "governance": 0.5, "public_interest": 0.8, "emergency": 1.0}'),
('style_mapping', '{"humor": "card", "governance": "ballot", "public_interest": "chart", "emergency": "card"}'),
('sentiment_thresholds', '{"trending": 0.6, "viral": 0.8, "critical": 0.9}'),
('regional_boost', '{"enabled": true, "boost_factor": 1.5, "affected_regions_only": true}');