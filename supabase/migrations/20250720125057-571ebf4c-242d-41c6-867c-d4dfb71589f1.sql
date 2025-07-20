-- Phase 4B: Advanced Analytics & AI-Powered Features (Fixed Version)

-- AI Insights and Predictions Tables
CREATE TABLE public.ai_insight_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL, -- 'classification', 'regression', 'prediction', 'sentiment'
  model_version TEXT NOT NULL DEFAULT 'v1.0',
  training_data_sources JSONB NOT NULL DEFAULT '[]',
  accuracy_score NUMERIC DEFAULT NULL,
  last_trained_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  model_parameters JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES ai_insight_models(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL,
  input_data JSONB NOT NULL,
  prediction_result JSONB NOT NULL,
  confidence_score NUMERIC NOT NULL DEFAULT 0.0,
  actual_outcome JSONB DEFAULT NULL,
  prediction_accuracy NUMERIC DEFAULT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Advanced Analytics Tables
CREATE TABLE public.analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_category TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT DEFAULT NULL,
  dimensions JSONB DEFAULT '{}',
  aggregation_period TEXT NOT NULL DEFAULT 'hour',
  data_source TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.analytics_widget_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL, -- 'chart', 'metric', 'table', 'map', 'gauge'
  widget_title TEXT NOT NULL,
  widget_position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "w": 6, "h": 4}',
  data_query JSONB NOT NULL,
  visualization_config JSONB DEFAULT '{}',
  refresh_interval_seconds INTEGER DEFAULT 300,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced Notification System (only new tables)
CREATE TABLE public.notification_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
  target_audience JSONB NOT NULL DEFAULT '{}',
  scheduling_config JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- External API Integration
CREATE TABLE public.external_api_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_name TEXT NOT NULL,
  api_provider TEXT NOT NULL, -- 'openai', 'twitter', 'slack', 'zapier', 'webhook'
  connection_config JSONB NOT NULL DEFAULT '{}',
  auth_config JSONB DEFAULT '{}',
  rate_limit_config JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  health_status TEXT DEFAULT 'unknown',
  last_health_check TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES external_api_connections(id) ON DELETE CASCADE,
  request_method TEXT NOT NULL,
  request_url TEXT NOT NULL,
  request_headers JSONB DEFAULT '{}',
  request_body JSONB DEFAULT NULL,
  response_status INTEGER DEFAULT NULL,
  response_body JSONB DEFAULT NULL,
  response_time_ms INTEGER DEFAULT NULL,
  error_message TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance Optimization
CREATE TABLE public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- 'page_load', 'api_response', 'database_query', 'memory_usage'
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL, -- 'ms', 'mb', 'percent', 'count'
  page_url TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  user_id UUID DEFAULT NULL,
  session_id TEXT DEFAULT NULL,
  additional_data JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.performance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_name TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  threshold_operator TEXT NOT NULL, -- 'gt', 'lt', 'eq', 'gte', 'lte'
  time_window_minutes INTEGER NOT NULL DEFAULT 5,
  alert_severity TEXT NOT NULL DEFAULT 'medium',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.optimization_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_type TEXT NOT NULL, -- 'performance', 'security', 'ux', 'accessibility'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  impact_score INTEGER NOT NULL DEFAULT 5, -- 1-10 scale
  implementation_effort TEXT NOT NULL DEFAULT 'medium',
  affected_components TEXT[] DEFAULT ARRAY[]::TEXT[],
  metrics_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to UUID DEFAULT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_insight_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_widget_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_api_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimization_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage AI models" ON public.ai_insight_models 
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can view AI predictions" ON public.ai_predictions 
FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage analytics" ON public.analytics_metrics 
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view their widget configs" ON public.analytics_widget_configs 
FOR ALL USING (EXISTS (SELECT 1 FROM analytics_dashboards WHERE id = dashboard_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage their campaigns" ON public.notification_campaigns 
FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Admins can manage API connections" ON public.external_api_connections 
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can view API logs" ON public.api_request_logs 
FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "System can insert performance metrics" ON public.performance_metrics 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view performance metrics" ON public.performance_metrics 
FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage performance alerts" ON public.performance_alerts 
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage optimization recommendations" ON public.optimization_recommendations 
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Indexes for Performance
CREATE INDEX idx_analytics_metrics_recorded_at ON public.analytics_metrics(recorded_at DESC);
CREATE INDEX idx_analytics_metrics_category_time ON public.analytics_metrics(metric_category, recorded_at DESC);
CREATE INDEX idx_ai_predictions_model_id ON public.ai_predictions(model_id);
CREATE INDEX idx_ai_predictions_created_at ON public.ai_predictions(created_at DESC);
CREATE INDEX idx_performance_metrics_type_time ON public.performance_metrics(metric_type, recorded_at DESC);
CREATE INDEX idx_api_request_logs_connection_time ON public.api_request_logs(connection_id, created_at DESC);
CREATE INDEX idx_notification_campaigns_status ON public.notification_campaigns(status);

-- Functions
CREATE OR REPLACE FUNCTION public.generate_ai_insights(
  p_insight_type TEXT,
  p_data_sources TEXT[] DEFAULT ARRAY['civic_complaints', 'polls', 'social_sentiment']
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  insight_result JSONB := '{"insights": [], "recommendations": [], "confidence": 0.0}';
  data_points INTEGER := 0;
  sentiment_trends JSONB;
  civic_trends JSONB;
BEGIN
  -- Analyze sentiment trends
  IF 'social_sentiment' = ANY(p_data_sources) THEN
    SELECT jsonb_build_object(
      'positive_trend', COUNT(*) FILTER (WHERE sentiment_score > 0.6),
      'negative_trend', COUNT(*) FILTER (WHERE sentiment_score < 0.4),
      'neutral_trend', COUNT(*) FILTER (WHERE sentiment_score BETWEEN 0.4 AND 0.6),
      'avg_sentiment', COALESCE(AVG(sentiment_score), 0.5)
    ) INTO sentiment_trends
    FROM public.advanced_sentiment_analysis
    WHERE created_at > NOW() - INTERVAL '7 days';
    
    data_points := data_points + 1;
  END IF;
  
  -- Analyze civic complaint trends
  IF 'civic_complaints' = ANY(p_data_sources) THEN
    SELECT jsonb_build_object(
      'total_complaints', COUNT(*),
      'urgent_complaints', COUNT(*) FILTER (WHERE urgency_level = 'high'),
      'trending_issues', array_agg(DISTINCT issue_category ORDER BY issue_category)
    ) INTO civic_trends
    FROM public.civic_complaints
    WHERE created_at > NOW() - INTERVAL '7 days';
    
    data_points := data_points + 1;
  END IF;
  
  -- Generate insights based on data
  insight_result := jsonb_build_object(
    'insights', jsonb_build_array(
      jsonb_build_object(
        'type', 'sentiment_analysis',
        'data', sentiment_trends,
        'generated_at', now()
      ),
      jsonb_build_object(
        'type', 'civic_trends',
        'data', civic_trends,
        'generated_at', now()
      )
    ),
    'recommendations', jsonb_build_array(
      'Monitor high-urgency civic complaints for immediate action',
      'Focus on improving sentiment in areas with negative trends',
      'Implement proactive measures for trending issues'
    ),
    'confidence', CASE 
      WHEN data_points >= 2 THEN 0.85
      WHEN data_points = 1 THEN 0.65
      ELSE 0.3
    END,
    'data_quality', jsonb_build_object(
      'sources_analyzed', data_points,
      'analysis_date', now()
    )
  );
  
  RETURN insight_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_performance_metric(
  p_metric_type TEXT,
  p_metric_name TEXT,
  p_metric_value NUMERIC,
  p_metric_unit TEXT,
  p_additional_data JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO public.performance_metrics (
    metric_type, metric_name, metric_value, metric_unit,
    additional_data, recorded_at
  ) VALUES (
    p_metric_type, p_metric_name, p_metric_value, p_metric_unit,
    p_additional_data, now()
  ) RETURNING id INTO metric_id;
  
  -- Check for performance alerts
  PERFORM public.check_performance_alerts(p_metric_type, p_metric_value);
  
  RETURN metric_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_performance_alerts(
  p_metric_type TEXT,
  p_metric_value NUMERIC
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  alert_record RECORD;
BEGIN
  FOR alert_record IN
    SELECT * FROM public.performance_alerts
    WHERE metric_type = p_metric_type 
    AND is_active = true
  LOOP
    IF (alert_record.threshold_operator = 'gt' AND p_metric_value > alert_record.threshold_value) OR
       (alert_record.threshold_operator = 'lt' AND p_metric_value < alert_record.threshold_value) OR
       (alert_record.threshold_operator = 'gte' AND p_metric_value >= alert_record.threshold_value) OR
       (alert_record.threshold_operator = 'lte' AND p_metric_value <= alert_record.threshold_value) OR
       (alert_record.threshold_operator = 'eq' AND p_metric_value = alert_record.threshold_value) THEN
      
      -- Trigger alert
      UPDATE public.performance_alerts 
      SET 
        last_triggered_at = now(),
        trigger_count = trigger_count + 1
      WHERE id = alert_record.id;
      
      -- Generate notification
      INSERT INTO public.realtime_notifications (
        notification_type, title, message, priority, 
        target_audience, metadata
      ) VALUES (
        'performance_alert',
        'Performance Alert: ' || alert_record.alert_name,
        'Metric ' || p_metric_type || ' exceeded threshold: ' || p_metric_value || ' vs ' || alert_record.threshold_value,
        alert_record.alert_severity,
        'admins',
        jsonb_build_object(
          'alert_id', alert_record.id,
          'metric_type', p_metric_type,
          'current_value', p_metric_value,
          'threshold', alert_record.threshold_value
        )
      );
    END IF;
  END LOOP;
END;
$$;

-- Sample Data
INSERT INTO public.ai_insight_models (model_name, model_type, accuracy_score, is_active) VALUES
('Sentiment Predictor', 'sentiment', 0.87, true),
('Civic Issue Classifier', 'classification', 0.92, true),
('Engagement Forecaster', 'prediction', 0.78, true);

INSERT INTO public.external_api_connections (connection_name, api_provider, is_active) VALUES
('OpenAI GPT', 'openai', true),
('Twitter Integration', 'twitter', false),
('Slack Notifications', 'slack', true),
('Zapier Automation', 'zapier', false);

INSERT INTO public.performance_alerts (alert_name, metric_type, threshold_value, threshold_operator, alert_severity) VALUES
('High Page Load Time', 'page_load', 3000, 'gt', 'high'),
('API Response Slow', 'api_response', 1000, 'gt', 'medium'),
('High Memory Usage', 'memory_usage', 85, 'gt', 'high'),
('Database Query Slow', 'database_query', 500, 'gt', 'medium');

INSERT INTO public.optimization_recommendations (recommendation_type, title, description, priority, impact_score, implementation_effort) VALUES
('performance', 'Optimize Database Queries', 'Several queries are taking longer than 500ms. Consider adding indexes or optimizing query structure.', 'high', 8, 'medium'),
('ux', 'Improve Mobile Responsiveness', 'Some components are not fully responsive on mobile devices.', 'medium', 6, 'low'),
('security', 'Enable Rate Limiting', 'Add rate limiting to API endpoints to prevent abuse.', 'high', 7, 'medium'),
('accessibility', 'Add ARIA Labels', 'Improve accessibility by adding proper ARIA labels to interactive elements.', 'medium', 5, 'low');