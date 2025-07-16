-- CivicAIPollGenerator Enhanced Database Schema
-- Add polls_ai_generated table for detailed AI generation tracking

CREATE TABLE public.polls_ai_generated (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  generation_trigger TEXT NOT NULL, -- 'trending_topic', 'social_media', 'civic_complaint', 'manual'
  source_platform TEXT, -- 'twitter', 'facebook', 'tiktok', 'civic_complaints'
  trending_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  sentiment_analysis JSONB DEFAULT '{}'::JSONB,
  urgency_level TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  topic_category TEXT NOT NULL, -- humor, governance, public_interest, emergency
  ai_confidence_score NUMERIC NOT NULL DEFAULT 0.0,
  generation_prompt TEXT,
  ai_reasoning JSONB DEFAULT '{}'::JSONB,
  social_metrics JSONB DEFAULT '{}'::JSONB, -- hashtag counts, mention counts, etc
  regional_data JSONB DEFAULT '{}'::JSONB,
  duplicate_check_passed BOOLEAN NOT NULL DEFAULT true,
  security_clearance BOOLEAN NOT NULL DEFAULT true,
  admin_edited BOOLEAN NOT NULL DEFAULT false,
  original_question TEXT,
  original_options TEXT[],
  edit_history JSONB DEFAULT '[]'::JSONB,
  performance_metrics JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Social media trends tracking table
CREATE TABLE public.social_media_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL, -- twitter, facebook, tiktok, instagram
  hashtag TEXT,
  mention_count INTEGER NOT NULL DEFAULT 0,
  sentiment_score NUMERIC NOT NULL DEFAULT 0.0,
  trend_strength NUMERIC NOT NULL DEFAULT 0.0, -- 0 to 1
  engagement_rate NUMERIC DEFAULT 0.0,
  geographic_data JSONB DEFAULT '{}'::JSONB,
  age_demographics JSONB DEFAULT '{}'::JSONB,
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  raw_data JSONB DEFAULT '{}'::JSONB,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() + INTERVAL '7 days',
  poll_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI generation schedule and logs
CREATE TABLE public.ai_generation_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  frequency TEXT NOT NULL DEFAULT 'daily', -- 6_hours, daily, weekly, manual
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  scan_sources TEXT[] DEFAULT ARRAY['civic_complaints', 'sentiment_trends']::TEXT[],
  generation_rules JSONB DEFAULT '{}'::JSONB,
  performance_stats JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.polls_ai_generated ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_schedule ENABLE ROW LEVEL SECURITY;

-- RLS Policies for polls_ai_generated
CREATE POLICY "AI generated polls are viewable by everyone" 
ON public.polls_ai_generated FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage AI generated polls" 
ON public.polls_ai_generated FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS Policies for social_media_trends
CREATE POLICY "Social media trends are viewable by everyone" 
ON public.social_media_trends FOR SELECT 
USING (true);

CREATE POLICY "System can manage social media trends" 
ON public.social_media_trends FOR ALL 
USING (true);

-- RLS Policies for ai_generation_schedule
CREATE POLICY "Admins can manage AI generation schedule" 
ON public.ai_generation_schedule FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create indexes for performance
CREATE INDEX idx_polls_ai_generated_poll_id ON public.polls_ai_generated(poll_id);
CREATE INDEX idx_polls_ai_generated_trigger ON public.polls_ai_generated(generation_trigger);
CREATE INDEX idx_polls_ai_generated_urgency ON public.polls_ai_generated(urgency_level);
CREATE INDEX idx_polls_ai_generated_created_at ON public.polls_ai_generated(created_at);

CREATE INDEX idx_social_media_trends_platform ON public.social_media_trends(platform);
CREATE INDEX idx_social_media_trends_hashtag ON public.social_media_trends(hashtag);
CREATE INDEX idx_social_media_trends_detected_at ON public.social_media_trends(detected_at);
CREATE INDEX idx_social_media_trends_trend_strength ON public.social_media_trends(trend_strength);

CREATE INDEX idx_ai_generation_schedule_next_run ON public.ai_generation_schedule(next_run_at);

-- Create triggers for updated_at
CREATE TRIGGER update_polls_ai_generated_updated_at
  BEFORE UPDATE ON public.polls_ai_generated
  FOR EACH ROW
  EXECUTE FUNCTION public.update_autonomous_polls_updated_at();

CREATE TRIGGER update_ai_generation_schedule_updated_at
  BEFORE UPDATE ON public.ai_generation_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.update_autonomous_polls_updated_at();

-- Insert enhanced default configuration
INSERT INTO public.autonomous_poll_config (config_key, config_value) VALUES
('social_monitoring', '{
  "enabled": true, 
  "platforms": ["twitter", "facebook"], 
  "hashtag_threshold": 100,
  "sentiment_threshold": 0.6,
  "engagement_threshold": 0.7
}'),
('ai_safety_rules', '{
  "avoid_sensitive_topics": true,
  "require_admin_approval_for_political": true,
  "ban_keywords": ["security", "military", "classified"],
  "duplicate_prevention": true,
  "fact_check_enabled": true
}'),
('generation_frequency', '{
  "default": "daily",
  "emergency_mode": "6_hours",
  "max_daily": 3,
  "max_weekly": 10,
  "cooldown_hours": 4
}'),
('poll_customization', '{
  "auto_banner_generation": true,
  "hashtag_integration": true,
  "regional_targeting": true,
  "demographic_insights": true
}')
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = now();

-- Insert initial generation schedule
INSERT INTO public.ai_generation_schedule (
  frequency, 
  next_run_at, 
  scan_sources,
  generation_rules
) VALUES (
  'daily',
  now() + INTERVAL '1 day',
  ARRAY['civic_complaints', 'sentiment_trends', 'social_media_trends'],
  '{
    "min_confidence": 0.7,
    "max_per_day": 3,
    "require_approval": true,
    "emergency_auto_publish": false
  }'::JSONB
);