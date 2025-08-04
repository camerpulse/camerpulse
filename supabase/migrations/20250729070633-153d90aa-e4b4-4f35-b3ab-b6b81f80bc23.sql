-- Phase 7: Advanced Analytics & Intelligence - Complete Database Schema

-- Sentiment Analysis Tables
CREATE TABLE public.sentiment_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  sentiment_score NUMERIC NOT NULL CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  sentiment_label TEXT NOT NULL CHECK (sentiment_label IN ('positive', 'negative', 'neutral')),
  mention_count INTEGER NOT NULL DEFAULT 0,
  trend_direction TEXT NOT NULL CHECK (trend_direction IN ('rising', 'falling', 'stable')),
  confidence_score NUMERIC NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  data_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  region TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.sentiment_spikes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  spike_type TEXT NOT NULL CHECK (spike_type IN ('positive', 'negative', 'volume')),
  magnitude NUMERIC NOT NULL,
  baseline_value NUMERIC NOT NULL,
  spike_value NUMERIC NOT NULL,
  duration_minutes INTEGER NOT NULL,
  region TEXT,
  triggered_alerts INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Predictive Analytics Tables
CREATE TABLE public.predictive_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('classification', 'regression', 'forecasting', 'clustering')),
  description TEXT,
  accuracy_score NUMERIC CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
  training_data_size INTEGER,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  hyperparameters JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'training' CHECK (status IN ('training', 'active', 'deprecated', 'failed')),
  version TEXT NOT NULL DEFAULT '1.0',
  model_path TEXT,
  created_by UUID REFERENCES auth.users(id),
  trained_at TIMESTAMP WITH TIME ZONE,
  last_prediction_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.prediction_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES public.predictive_models(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL,
  input_data JSONB NOT NULL,
  predicted_value JSONB NOT NULL,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  actual_value JSONB,
  accuracy_score NUMERIC CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
  execution_time_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real-time Analytics Tables
CREATE TABLE public.realtime_analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_source TEXT NOT NULL,
  event_data JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  region TEXT,
  processed BOOLEAN DEFAULT FALSE,
  processing_errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.real_time_data_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_name TEXT NOT NULL UNIQUE,
  stream_type TEXT NOT NULL CHECK (stream_type IN ('social_media', 'news', 'government', 'economic', 'custom')),
  source_url TEXT,
  api_config JSONB DEFAULT '{}'::jsonb,
  processing_config JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error', 'maintenance')),
  events_per_minute NUMERIC DEFAULT 0,
  last_event_at TIMESTAMP WITH TIME ZONE,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Insights Tables
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('trend_analysis', 'anomaly_detection', 'sentiment_shift', 'predictive_alert', 'pattern_recognition')),
  description TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  priority_level TEXT NOT NULL DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  affected_entities JSONB DEFAULT '{}'::jsonb,
  supporting_data JSONB DEFAULT '{}'::jsonb,
  data_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  actionable_recommendations TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  feedback_score NUMERIC CHECK (feedback_score >= 1 AND feedback_score <= 5),
  expires_at TIMESTAMP WITH TIME ZONE,
  insight_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_generation_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  frequency TEXT NOT NULL CHECK (frequency IN ('continuous', 'hourly', 'daily', 'weekly', 'monthly', 'on_demand')),
  scan_sources TEXT[] NOT NULL DEFAULT ARRAY['civic_complaints', 'sentiment_trends', 'social_media', 'news'],
  generation_rules JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  performance_stats JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Intelligence Alerts Tables
CREATE TABLE public.intelligence_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('security', 'political', 'economic', 'social', 'environmental')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  region TEXT,
  affected_entities JSONB DEFAULT '{}'::jsonb,
  source_data JSONB DEFAULT '{}'::jsonb,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'dismissed')),
  assigned_to UUID REFERENCES auth.users(id),
  escalated BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.camerpulse_intelligence_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_category TEXT NOT NULL CHECK (alert_category IN ('civic_unrest', 'election_anomaly', 'corruption_indicator', 'economic_instability', 'infrastructure_failure')),
  alert_severity TEXT NOT NULL CHECK (alert_severity IN ('info', 'warning', 'critical', 'emergency')),
  alert_title TEXT NOT NULL,
  alert_description TEXT NOT NULL,
  detection_method TEXT NOT NULL,
  source_systems TEXT[] NOT NULL,
  affected_regions TEXT[],
  confidence_level NUMERIC NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 1),
  raw_data JSONB DEFAULT '{}'::jsonb,
  processed_indicators JSONB DEFAULT '{}'::jsonb,
  recommended_actions TEXT[],
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'investigating', 'resolved', 'false_positive')),
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  investigation_notes TEXT,
  resolution_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trend Detection Tables
CREATE TABLE public.trend_detection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_name TEXT NOT NULL,
  trend_type TEXT NOT NULL CHECK (trend_type IN ('hashtag', 'topic', 'entity', 'sentiment', 'behavior')),
  detection_algorithm TEXT NOT NULL,
  base_threshold NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL,
  peak_value NUMERIC,
  trend_score NUMERIC NOT NULL CHECK (trend_score >= 0 AND trend_score <= 1),
  velocity NUMERIC, -- Rate of change
  acceleration NUMERIC, -- Change in velocity
  geographic_distribution JSONB DEFAULT '{}'::jsonb,
  demographic_breakdown JSONB DEFAULT '{}'::jsonb,
  related_trends TEXT[],
  status TEXT NOT NULL DEFAULT 'emerging' CHECK (status IN ('emerging', 'growing', 'peaking', 'declining', 'ended')),
  first_detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.trending_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('politics', 'economy', 'social', 'entertainment', 'sports', 'technology', 'health', 'education')),
  mention_count INTEGER NOT NULL DEFAULT 0,
  sentiment_score NUMERIC CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  trend_direction TEXT NOT NULL CHECK (trend_direction IN ('rising', 'falling', 'stable')),
  velocity_score NUMERIC NOT NULL DEFAULT 0,
  regions TEXT[] DEFAULT ARRAY[]::text[],
  languages TEXT[] DEFAULT ARRAY[]::text[],
  related_entities JSONB DEFAULT '[]'::jsonb,
  keywords TEXT[] DEFAULT ARRAY[]::text[],
  peak_mention_time TIMESTAMP WITH TIME ZONE,
  trend_duration_hours INTEGER,
  data_sources TEXT[] NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.sentiment_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_spikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_time_data_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camerpulse_intelligence_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_topics ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for Admin Access
CREATE POLICY "Admins can manage sentiment trends" ON public.sentiment_trends 
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage sentiment spikes" ON public.sentiment_spikes 
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage predictive models" ON public.predictive_models 
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage prediction results" ON public.prediction_results 
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "System can insert analytics events" ON public.realtime_analytics_events 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics events" ON public.realtime_analytics_events 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage data streams" ON public.real_time_data_streams 
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage AI insights" ON public.ai_insights 
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "System can insert AI insights" ON public.ai_insights 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage generation schedule" ON public.ai_generation_schedule 
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage intelligence alerts" ON public.intelligence_alerts 
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage camerpulse alerts" ON public.camerpulse_intelligence_alerts 
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage trend detection" ON public.trend_detection 
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "System can insert trend detection" ON public.trend_detection 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view trending topics" ON public.trending_topics 
FOR SELECT USING (true);

CREATE POLICY "Admins can manage trending topics" ON public.trending_topics 
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "System can insert trending topics" ON public.trending_topics 
FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_sentiment_trends_topic ON public.sentiment_trends(topic);
CREATE INDEX idx_sentiment_trends_created_at ON public.sentiment_trends(created_at);
CREATE INDEX idx_sentiment_trends_region ON public.sentiment_trends(region);

CREATE INDEX idx_sentiment_spikes_topic ON public.sentiment_spikes(topic);
CREATE INDEX idx_sentiment_spikes_detected_at ON public.sentiment_spikes(detected_at);

CREATE INDEX idx_predictive_models_status ON public.predictive_models(status);
CREATE INDEX idx_predictive_models_model_type ON public.predictive_models(model_type);

CREATE INDEX idx_prediction_results_model_id ON public.prediction_results(model_id);
CREATE INDEX idx_prediction_results_created_at ON public.prediction_results(created_at);

CREATE INDEX idx_realtime_events_type ON public.realtime_analytics_events(event_type);
CREATE INDEX idx_realtime_events_created_at ON public.realtime_analytics_events(created_at);
CREATE INDEX idx_realtime_events_processed ON public.realtime_analytics_events(processed);

CREATE INDEX idx_data_streams_status ON public.real_time_data_streams(status);
CREATE INDEX idx_data_streams_type ON public.real_time_data_streams(stream_type);

CREATE INDEX idx_ai_insights_type ON public.ai_insights(insight_type);
CREATE INDEX idx_ai_insights_priority ON public.ai_insights(priority_level);
CREATE INDEX idx_ai_insights_created_at ON public.ai_insights(created_at);

CREATE INDEX idx_intelligence_alerts_status ON public.intelligence_alerts(status);
CREATE INDEX idx_intelligence_alerts_severity ON public.intelligence_alerts(severity);

CREATE INDEX idx_camerpulse_alerts_status ON public.camerpulse_intelligence_alerts(status);
CREATE INDEX idx_camerpulse_alerts_severity ON public.camerpulse_intelligence_alerts(alert_severity);

CREATE INDEX idx_trend_detection_status ON public.trend_detection(status);
CREATE INDEX idx_trend_detection_type ON public.trend_detection(trend_type);

CREATE INDEX idx_trending_topics_category ON public.trending_topics(category);
CREATE INDEX idx_trending_topics_created_at ON public.trending_topics(created_at);

-- Create update triggers
CREATE TRIGGER update_sentiment_trends_updated_at
  BEFORE UPDATE ON public.sentiment_trends
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_predictive_models_updated_at
  BEFORE UPDATE ON public.predictive_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_streams_updated_at
  BEFORE UPDATE ON public.real_time_data_streams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at
  BEFORE UPDATE ON public.ai_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generation_schedule_updated_at
  BEFORE UPDATE ON public.ai_generation_schedule
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_intelligence_alerts_updated_at
  BEFORE UPDATE ON public.intelligence_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_camerpulse_alerts_updated_at
  BEFORE UPDATE ON public.camerpulse_intelligence_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trending_topics_updated_at
  BEFORE UPDATE ON public.trending_topics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();