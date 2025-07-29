-- Phase 4A: Real-time Monitoring & Automation (Fixed)
-- Create new enums for real-time monitoring system

-- Real-time data stream types
CREATE TYPE stream_type AS ENUM (
  'civic_activity',
  'poll_results', 
  'sentiment_analysis',
  'news_feed',
  'government_updates',
  'user_activity',
  'system_metrics'
);

-- Monitoring status types
CREATE TYPE monitoring_status AS ENUM (
  'active',
  'paused',
  'error',
  'maintenance'
);

-- Moderation actions
CREATE TYPE moderation_action AS ENUM (
  'approved',
  'flagged',
  'removed',
  'quarantine',
  'escalated'
);

-- Trend types
CREATE TYPE trend_type AS ENUM (
  'rising',
  'declining',
  'viral',
  'anomaly',
  'normal'
);

-- Real-time data streams table
CREATE TABLE public.realtime_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_name TEXT NOT NULL,
  stream_type stream_type NOT NULL,
  description TEXT,
  endpoint_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  refresh_interval_seconds INTEGER NOT NULL DEFAULT 30,
  last_update TIMESTAMP WITH TIME ZONE,
  error_count INTEGER NOT NULL DEFAULT 0,
  max_errors INTEGER NOT NULL DEFAULT 10,
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  subscribers_count INTEGER NOT NULL DEFAULT 0,
  data_retention_days INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real-time stream data table (for storing actual stream data)
CREATE TABLE public.stream_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES realtime_streams(id) ON DELETE CASCADE,
  data_point JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source_identifier TEXT,
  processing_status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'
);

-- Automated content moderation table
CREATE TABLE public.automated_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'post', 'comment', 'poll', etc.
  content_id UUID NOT NULL,
  content_text TEXT,
  moderation_action moderation_action NOT NULL,
  confidence_score NUMERIC(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  flagged_keywords TEXT[],
  sentiment_score NUMERIC(3,2),
  toxicity_score NUMERIC(3,2),
  spam_probability NUMERIC(3,2),
  ai_model_used TEXT NOT NULL DEFAULT 'content-moderator-v1',
  human_review_required BOOLEAN NOT NULL DEFAULT false,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  appeal_status TEXT DEFAULT 'none',
  appeal_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI-powered trend detection table
CREATE TABLE public.trend_detection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_name TEXT NOT NULL,
  trend_type trend_type NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  keywords TEXT[] NOT NULL,
  momentum_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  growth_rate NUMERIC(5,2),
  peak_timestamp TIMESTAMP WITH TIME ZONE,
  related_entities JSONB DEFAULT '{}',
  geographic_scope TEXT[] DEFAULT ARRAY['national'],
  affected_demographics JSONB DEFAULT '{}',
  confidence_level NUMERIC(3,2) NOT NULL,
  data_sources TEXT[] NOT NULL,
  first_detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  alert_generated BOOLEAN NOT NULL DEFAULT false
);

-- Early warning system table (using existing alert_severity enum)
CREATE TABLE public.early_warning_system (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warning_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity alert_severity NOT NULL,
  affected_regions TEXT[],
  affected_demographics TEXT[],
  trigger_conditions JSONB NOT NULL,
  current_indicators JSONB NOT NULL,
  threshold_reached BOOLEAN NOT NULL DEFAULT false,
  escalation_level INTEGER NOT NULL DEFAULT 1,
  response_actions JSONB DEFAULT '{}',
  stakeholders_notified TEXT[],
  resolution_timeline TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Automated report generation table
CREATE TABLE public.automated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  schedule_pattern TEXT NOT NULL, -- cron pattern
  data_sources TEXT[] NOT NULL,
  template_config JSONB NOT NULL,
  output_format TEXT NOT NULL DEFAULT 'pdf',
  recipients TEXT[] NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_generated_at TIMESTAMP WITH TIME ZONE,
  next_generation_at TIMESTAMP WITH TIME ZONE,
  generation_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  report_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Live polling sessions table
CREATE TABLE public.live_polling_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name TEXT NOT NULL,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  is_live BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  max_concurrent_users INTEGER NOT NULL DEFAULT 1000,
  current_active_users INTEGER NOT NULL DEFAULT 0,
  total_participants INTEGER NOT NULL DEFAULT 0,
  live_results_enabled BOOLEAN NOT NULL DEFAULT true,
  comment_stream_enabled BOOLEAN NOT NULL DEFAULT true,
  moderation_enabled BOOLEAN NOT NULL DEFAULT true,
  streamer_ids UUID[],
  viewer_analytics JSONB DEFAULT '{}',
  engagement_metrics JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real-time notifications table (using existing alert_severity enum)
CREATE TABLE public.realtime_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority alert_severity NOT NULL DEFAULT 'medium',
  target_audience TEXT NOT NULL DEFAULT 'all', -- 'all', 'admins', 'moderators', etc.
  target_users UUID[],
  delivery_channels TEXT[] NOT NULL DEFAULT ARRAY['in_app'],
  sent_at TIMESTAMP WITH TIME ZONE,
  delivery_status JSONB DEFAULT '{}',
  read_by UUID[],
  acknowledged_by UUID[],
  expires_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real-time activity feed table
CREATE TABLE public.realtime_activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  actor_name TEXT,
  target_type TEXT,
  target_id UUID,
  action_description TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'public',
  impact_score INTEGER DEFAULT 1,
  engagement_count INTEGER NOT NULL DEFAULT 0,
  reaction_summary JSONB DEFAULT '{}',
  geographic_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Monitoring dashboards configuration table
CREATE TABLE public.monitoring_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_name TEXT NOT NULL,
  dashboard_type TEXT NOT NULL,
  widget_configuration JSONB NOT NULL,
  refresh_interval_seconds INTEGER NOT NULL DEFAULT 60,
  is_public BOOLEAN NOT NULL DEFAULT false,
  access_roles TEXT[] NOT NULL DEFAULT ARRAY['admin'],
  alert_thresholds JSONB DEFAULT '{}',
  auto_refresh_enabled BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  shared_with UUID[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.realtime_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.early_warning_system ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_polling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_dashboards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Realtime streams policies
CREATE POLICY "Admins can manage all streams" ON public.realtime_streams
  FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view active public streams" ON public.realtime_streams
  FOR SELECT USING (is_active = true);

-- Stream data policies
CREATE POLICY "Users can view stream data" ON public.stream_data
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM realtime_streams WHERE id = stream_data.stream_id AND is_active = true)
  );

CREATE POLICY "System can insert stream data" ON public.stream_data
  FOR INSERT WITH CHECK (true);

-- Automated moderation policies
CREATE POLICY "Admins and moderators can view moderation data" ON public.automated_moderation
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

CREATE POLICY "Admins and moderators can manage moderation" ON public.automated_moderation
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- Trend detection policies
CREATE POLICY "Public can view trends" ON public.trend_detection
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage trends" ON public.trend_detection
  FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Early warning system policies
CREATE POLICY "Admins can manage warnings" ON public.early_warning_system
  FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view active warnings" ON public.early_warning_system
  FOR SELECT USING (status = 'active');

-- Automated reports policies
CREATE POLICY "Admins can manage reports" ON public.automated_reports
  FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Live polling sessions policies
CREATE POLICY "Public can view live sessions" ON public.live_polling_sessions
  FOR SELECT USING (is_live = true);

CREATE POLICY "Users can manage their sessions" ON public.live_polling_sessions
  FOR ALL USING (auth.uid() = created_by);

-- Realtime notifications policies
CREATE POLICY "Users can view their notifications" ON public.realtime_notifications
  FOR SELECT USING (
    target_audience = 'all' OR 
    auth.uid() = ANY(target_users) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = ANY(ARRAY['admin', 'moderator']))
  );

-- Activity feed policies
CREATE POLICY "Public can view public activities" ON public.realtime_activity_feed
  FOR SELECT USING (visibility = 'public');

-- Monitoring dashboards policies
CREATE POLICY "Users can view public dashboards" ON public.monitoring_dashboards
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage their dashboards" ON public.monitoring_dashboards
  FOR ALL USING (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX idx_realtime_streams_type ON public.realtime_streams(stream_type);
CREATE INDEX idx_realtime_streams_active ON public.realtime_streams(is_active);
CREATE INDEX idx_stream_data_stream_timestamp ON public.stream_data(stream_id, timestamp DESC);
CREATE INDEX idx_automated_moderation_content ON public.automated_moderation(content_type, content_id);
CREATE INDEX idx_trend_detection_category ON public.trend_detection(category);
CREATE INDEX idx_trend_detection_status ON public.trend_detection(status);
CREATE INDEX idx_early_warning_severity ON public.early_warning_system(severity);
CREATE INDEX idx_live_polling_active ON public.live_polling_sessions(is_live);
CREATE INDEX idx_notifications_target ON public.realtime_notifications(target_audience);
CREATE INDEX idx_activity_feed_timestamp ON public.realtime_activity_feed(created_at DESC);
CREATE INDEX idx_monitoring_dashboards_type ON public.monitoring_dashboards(dashboard_type);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_realtime_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_realtime_streams_updated_at
  BEFORE UPDATE ON public.realtime_streams
  FOR EACH ROW EXECUTE FUNCTION public.update_realtime_updated_at();

CREATE TRIGGER update_automated_moderation_updated_at
  BEFORE UPDATE ON public.automated_moderation
  FOR EACH ROW EXECUTE FUNCTION public.update_realtime_updated_at();

CREATE TRIGGER update_trend_detection_updated_at
  BEFORE UPDATE ON public.trend_detection
  FOR EACH ROW EXECUTE FUNCTION public.update_realtime_updated_at();

CREATE TRIGGER update_early_warning_system_updated_at
  BEFORE UPDATE ON public.early_warning_system
  FOR EACH ROW EXECUTE FUNCTION public.update_realtime_updated_at();

CREATE TRIGGER update_automated_reports_updated_at
  BEFORE UPDATE ON public.automated_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_realtime_updated_at();

CREATE TRIGGER update_live_polling_sessions_updated_at
  BEFORE UPDATE ON public.live_polling_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_realtime_updated_at();

CREATE TRIGGER update_monitoring_dashboards_updated_at
  BEFORE UPDATE ON public.monitoring_dashboards
  FOR EACH ROW EXECUTE FUNCTION public.update_realtime_updated_at();

-- Create functions for real-time monitoring

-- Function to detect trends in data
CREATE OR REPLACE FUNCTION public.detect_data_trends(
  p_category TEXT,
  p_time_window INTERVAL DEFAULT '24 hours'
)
RETURNS TABLE(
  trend_name TEXT,
  momentum_score NUMERIC,
  confidence_level NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Basic trend detection logic
  RETURN QUERY
  SELECT 
    td.trend_name,
    td.momentum_score,
    td.confidence_level
  FROM public.trend_detection td
  WHERE td.category = p_category
    AND td.last_updated_at > now() - p_time_window
    AND td.status = 'active'
  ORDER BY td.momentum_score DESC
  LIMIT 10;
END;
$$;

-- Function to generate automated alerts
CREATE OR REPLACE FUNCTION public.generate_automated_alert(
  p_alert_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_severity alert_severity DEFAULT 'medium'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.realtime_notifications (
    notification_type,
    title,
    message,
    priority,
    target_audience,
    delivery_channels
  ) VALUES (
    p_alert_type,
    p_title,
    p_message,
    p_severity,
    CASE 
      WHEN p_severity IN ('critical', 'emergency') THEN 'all'
      ELSE 'admins'
    END,
    CASE 
      WHEN p_severity IN ('critical', 'emergency') THEN ARRAY['in_app', 'email', 'sms']
      ELSE ARRAY['in_app', 'email']
    END
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to update live polling metrics
CREATE OR REPLACE FUNCTION public.update_live_polling_metrics(
  p_session_id UUID,
  p_active_users INTEGER DEFAULT NULL,
  p_new_participant BOOLEAN DEFAULT false
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.live_polling_sessions
  SET 
    current_active_users = COALESCE(p_active_users, current_active_users),
    total_participants = CASE 
      WHEN p_new_participant THEN total_participants + 1
      ELSE total_participants
    END,
    updated_at = now()
  WHERE id = p_session_id;
END;
$$;

-- Insert sample data for demonstration
INSERT INTO public.realtime_streams (stream_name, stream_type, description, refresh_interval_seconds) VALUES
('Civic Activity Monitor', 'civic_activity', 'Real-time monitoring of civic engagement activities', 30),
('Poll Results Stream', 'poll_results', 'Live polling results and voting patterns', 15),
('Sentiment Analysis Feed', 'sentiment_analysis', 'Real-time sentiment analysis of social media and comments', 60),
('Government Updates', 'government_updates', 'Official government announcements and policy changes', 300),
('System Health Monitor', 'system_metrics', 'Platform performance and system health metrics', 60);

INSERT INTO public.trend_detection (trend_name, trend_type, category, keywords, momentum_score, confidence_level, data_sources) VALUES
('Youth Political Engagement', 'rising', 'civic_participation', ARRAY['youth', 'politics', 'engagement', 'voting'], 85.5, 0.89, ARRAY['social_media', 'poll_data', 'event_attendance']),
('Healthcare Policy Discussions', 'viral', 'healthcare', ARRAY['healthcare', 'policy', 'reform', 'rural'], 92.3, 0.94, ARRAY['news_mentions', 'social_media', 'government_data']),
('Environmental Conservation', 'rising', 'environment', ARRAY['environment', 'conservation', 'climate', 'sustainability'], 78.2, 0.82, ARRAY['media_coverage', 'petition_data', 'event_data']);

INSERT INTO public.monitoring_dashboards (dashboard_name, dashboard_type, widget_configuration) VALUES
('Civic Engagement Overview', 'realtime_monitoring', '{"widgets": [{"type": "activity_stream"}, {"type": "trending_topics"}, {"type": "sentiment_gauge"}]}'),
('System Health Dashboard', 'system_monitoring', '{"widgets": [{"type": "performance_metrics"}, {"type": "error_rates"}, {"type": "user_activity"}]}'),
('Political Sentiment Tracker', 'sentiment_analysis', '{"widgets": [{"type": "sentiment_timeline"}, {"type": "regional_sentiment"}, {"type": "topic_breakdown"}]}');