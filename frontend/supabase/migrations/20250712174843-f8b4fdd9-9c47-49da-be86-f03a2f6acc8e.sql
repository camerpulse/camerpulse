-- Create tables for Lux Aeterna AI sentiment analysis system

-- Core sentiment analysis logs
CREATE TABLE public.lux_aeterna_sentiment_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL, -- twitter, facebook, tiktok, whatsapp, instagram, google_trends
  content_id TEXT, -- original post/content ID from platform
  content_text TEXT NOT NULL,
  language_detected TEXT DEFAULT 'unknown', -- en, fr, pidgin
  sentiment_polarity TEXT NOT NULL, -- positive, negative, neutral
  sentiment_score NUMERIC(3,2), -- -1.0 to 1.0
  emotional_tone TEXT[], -- anger, joy, fear, sadness, pride, sarcasm, hope, indifference
  confidence_score NUMERIC(3,2), -- 0.0 to 1.0
  content_category TEXT[], -- election, governance, security, economy, youth, infrastructure
  keywords_detected TEXT[],
  hashtags TEXT[],
  mentions TEXT[],
  region_detected TEXT, -- Centre, Littoral, Southwest, etc.
  author_handle TEXT,
  author_influence_score NUMERIC(3,2) DEFAULT 0,
  engagement_metrics JSONB, -- likes, shares, comments, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  flagged_for_review BOOLEAN DEFAULT false,
  threat_level TEXT DEFAULT 'none' -- none, low, medium, high, critical
);

-- AI learning and evolution tracking
CREATE TABLE public.lux_aeterna_learning_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_type TEXT NOT NULL, -- pattern_detection, language_evolution, category_expansion
  input_data JSONB NOT NULL,
  pattern_identified TEXT,
  confidence_improvement NUMERIC(3,2),
  model_adjustment JSONB,
  validation_score NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  applied_at TIMESTAMP WITH TIME ZONE
);

-- Trending topics and hashtag monitoring
CREATE TABLE public.lux_aeterna_trending_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_text TEXT NOT NULL,
  category TEXT, -- election, governance, security, economy, youth, infrastructure
  sentiment_score NUMERIC(3,2),
  volume_score INTEGER DEFAULT 0,
  growth_rate NUMERIC(5,2),
  platform_breakdown JSONB, -- {twitter: 45, facebook: 30, tiktok: 25}
  related_hashtags TEXT[],
  emotional_breakdown JSONB, -- {anger: 30, joy: 20, fear: 25, etc}
  regional_breakdown JSONB, -- sentiment per region
  influencer_mentions TEXT[],
  threat_indicators BOOLEAN DEFAULT false,
  first_detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  trend_status TEXT DEFAULT 'rising' -- rising, stable, declining, viral
);

-- Regional sentiment tracking
CREATE TABLE public.lux_aeterna_regional_sentiment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL, -- Centre, Littoral, Southwest, Northwest, etc.
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_sentiment NUMERIC(3,2), -- -1.0 to 1.0
  sentiment_breakdown JSONB, -- {positive: 40, negative: 35, neutral: 25}
  dominant_emotions TEXT[],
  top_concerns TEXT[],
  trending_hashtags TEXT[],
  content_volume INTEGER DEFAULT 0,
  threat_level TEXT DEFAULT 'none',
  notable_events TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(region, date_recorded)
);

-- Influencer impact tracking
CREATE TABLE public.lux_aeterna_influencers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  handle TEXT NOT NULL,
  platform TEXT NOT NULL,
  influence_score NUMERIC(3,2) DEFAULT 0, -- 0.0 to 1.0
  follower_count INTEGER,
  engagement_rate NUMERIC(3,2),
  sentiment_impact NUMERIC(3,2), -- how much their posts affect public sentiment
  content_categories TEXT[],
  political_leaning TEXT, -- left, right, center, unknown
  credibility_score NUMERIC(3,2), -- 0.0 to 1.0
  manipulation_risk NUMERIC(3,2), -- 0.0 to 1.0 (likelihood of spreading misinformation)
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(handle, platform)
);

-- AI configuration and self-evolution settings
CREATE TABLE public.lux_aeterna_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  config_type TEXT NOT NULL, -- system, learning, alert, filter
  description TEXT,
  auto_updated BOOLEAN DEFAULT false,
  last_evolution_update TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Alert and threat monitoring
CREATE TABLE public.lux_aeterna_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL, -- threat, viral_negative, manipulation_detected, civil_unrest
  severity TEXT NOT NULL, -- low, medium, high, critical
  title TEXT NOT NULL,
  description TEXT,
  affected_regions TEXT[],
  related_content_ids UUID[],
  sentiment_data JSONB,
  recommended_actions TEXT[],
  auto_generated BOOLEAN DEFAULT true,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS policies
ALTER TABLE public.lux_aeterna_sentiment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lux_aeterna_learning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lux_aeterna_trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lux_aeterna_regional_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lux_aeterna_influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lux_aeterna_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lux_aeterna_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access and public reading
CREATE POLICY "Admins can manage all Lux Aeterna data" 
ON public.lux_aeterna_sentiment_logs 
FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role));

CREATE POLICY "Sentiment data is publicly readable" 
ON public.lux_aeterna_sentiment_logs 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage learning logs" 
ON public.lux_aeterna_learning_logs 
FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role));

CREATE POLICY "Trending topics are publicly readable" 
ON public.lux_aeterna_trending_topics 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage trending topics" 
ON public.lux_aeterna_trending_topics 
FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role));

CREATE POLICY "Regional sentiment is publicly readable" 
ON public.lux_aeterna_regional_sentiment 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage regional sentiment" 
ON public.lux_aeterna_regional_sentiment 
FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role));

CREATE POLICY "Influencer data is publicly readable" 
ON public.lux_aeterna_influencers 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage influencer data" 
ON public.lux_aeterna_influencers 
FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role));

CREATE POLICY "Admins can manage config" 
ON public.lux_aeterna_config 
FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role));

CREATE POLICY "Public config is readable" 
ON public.lux_aeterna_config 
FOR SELECT 
USING (config_type = 'public');

CREATE POLICY "Alerts are publicly readable" 
ON public.lux_aeterna_alerts 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage alerts" 
ON public.lux_aeterna_alerts 
FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_sentiment_logs_platform ON public.lux_aeterna_sentiment_logs(platform);
CREATE INDEX idx_sentiment_logs_created_at ON public.lux_aeterna_sentiment_logs(created_at);
CREATE INDEX idx_sentiment_logs_region ON public.lux_aeterna_sentiment_logs(region_detected);
CREATE INDEX idx_sentiment_logs_category ON public.lux_aeterna_sentiment_logs USING GIN(content_category);
CREATE INDEX idx_sentiment_logs_hashtags ON public.lux_aeterna_sentiment_logs USING GIN(hashtags);

CREATE INDEX idx_trending_topics_category ON public.lux_aeterna_trending_topics(category);
CREATE INDEX idx_trending_topics_volume ON public.lux_aeterna_trending_topics(volume_score);
CREATE INDEX idx_trending_topics_updated ON public.lux_aeterna_trending_topics(last_updated_at);

CREATE INDEX idx_regional_sentiment_region ON public.lux_aeterna_regional_sentiment(region);
CREATE INDEX idx_regional_sentiment_date ON public.lux_aeterna_regional_sentiment(date_recorded);

CREATE INDEX idx_influencers_platform_handle ON public.lux_aeterna_influencers(platform, handle);
CREATE INDEX idx_influencers_influence_score ON public.lux_aeterna_influencers(influence_score);

CREATE INDEX idx_alerts_created_at ON public.lux_aeterna_alerts(created_at);
CREATE INDEX idx_alerts_severity ON public.lux_aeterna_alerts(severity);

-- Insert initial configuration
INSERT INTO public.lux_aeterna_config (config_key, config_value, config_type, description) VALUES
('sentiment_categories', '["election", "governance", "security", "economy", "youth", "infrastructure", "corruption", "education"]', 'system', 'Active sentiment analysis categories'),
('supported_languages', '["en", "fr", "pidgin"]', 'system', 'Languages supported for sentiment analysis'),
('cameroon_regions', '["Centre", "Littoral", "Southwest", "Northwest", "West", "East", "Adamawa", "North", "Far North", "South"]', 'system', 'Cameroon regions for sentiment tracking'),
('emotional_tones', '["anger", "joy", "fear", "sadness", "pride", "sarcasm", "hope", "indifference", "frustration", "optimism"]', 'system', 'Emotional tones to detect'),
('threat_keywords', '["violence", "protest", "strike", "riot", "unrest", "conflict", "boycott", "demonstration"]', 'system', 'Keywords that indicate potential threats'),
('update_frequency', '{"sentiment_analysis": "5min", "trending_topics": "15min", "regional_summary": "1hour", "learning": "1day"}', 'system', 'Update frequencies for different modules'),
('ai_learning_enabled', 'true', 'learning', 'Enable AI self-learning capabilities'),
('auto_alert_threshold', '{"critical": 0.9, "high": 0.7, "medium": 0.5}', 'alert', 'Thresholds for automatic alert generation'),
('platform_weights', '{"twitter": 0.3, "facebook": 0.25, "tiktok": 0.2, "instagram": 0.15, "google_trends": 0.1}', 'system', 'Weight given to each platform in overall sentiment calculation');