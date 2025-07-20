-- Phase 3: Advanced Analytics & Intelligence Migration (Fixed)

-- Create enum for analytics data types
CREATE TYPE public.analytics_data_type AS ENUM ('poll_data', 'sentiment_data', 'engagement_data', 'performance_data', 'civic_education_data', 'user_behavior_data');

-- Create enum for prediction types
CREATE TYPE public.prediction_type AS ENUM ('sentiment_trend', 'engagement_forecast', 'performance_prediction', 'policy_outcome', 'voter_turnout', 'civic_participation');

-- Create enum for sentiment values
CREATE TYPE public.sentiment_value AS ENUM ('very_negative', 'negative', 'neutral', 'positive', 'very_positive');

-- Create enum for alert severities
CREATE TYPE public.alert_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Create enum for report types
CREATE TYPE public.report_type AS ENUM ('daily_summary', 'weekly_analysis', 'monthly_report', 'quarterly_review', 'annual_overview', 'custom_analysis');

-- AI-Powered Insights Dashboard Tables

-- Analytics dashboard configurations
CREATE TABLE public.analytics_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    dashboard_name TEXT NOT NULL,
    dashboard_type TEXT NOT NULL DEFAULT 'personal', -- 'personal', 'shared', 'public', 'administrative'
    widget_configuration JSONB NOT NULL DEFAULT '[]',
    layout_settings JSONB DEFAULT '{}',
    data_sources JSONB DEFAULT '{}',
    refresh_interval_minutes INTEGER DEFAULT 15,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    shared_with UUID[],
    access_permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI-generated insights and recommendations
CREATE TABLE public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_type TEXT NOT NULL, -- 'trend_analysis', 'anomaly_detection', 'recommendation', 'prediction'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    data_sources JSONB NOT NULL DEFAULT '[]',
    supporting_data JSONB DEFAULT '{}',
    insight_metadata JSONB DEFAULT '{}',
    affected_entities JSONB DEFAULT '{}', -- politicians, regions, topics, etc.
    actionable_recommendations TEXT[],
    priority_level TEXT NOT NULL DEFAULT 'medium',
    expires_at TIMESTAMPTZ,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    feedback_score NUMERIC(3,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Predictive Analytics Tables

-- Prediction models and their results
CREATE TABLE public.predictive_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    model_type public.prediction_type NOT NULL,
    model_version TEXT NOT NULL DEFAULT 'v1.0',
    model_description TEXT,
    input_features JSONB NOT NULL DEFAULT '[]',
    model_parameters JSONB DEFAULT '{}',
    training_data_period_start DATE,
    training_data_period_end DATE,
    accuracy_score NUMERIC(5,2),
    precision_score NUMERIC(5,2),
    recall_score NUMERIC(5,2),
    f1_score NUMERIC(5,2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_trained_at TIMESTAMPTZ,
    next_training_scheduled TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prediction results and forecasts
CREATE TABLE public.prediction_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES public.predictive_models(id),
    prediction_type public.prediction_type NOT NULL,
    target_entity_type TEXT NOT NULL, -- 'politician', 'region', 'policy', 'topic'
    target_entity_id UUID,
    prediction_value NUMERIC NOT NULL,
    prediction_confidence NUMERIC(5,2) NOT NULL,
    prediction_details JSONB DEFAULT '{}',
    input_data JSONB NOT NULL DEFAULT '{}',
    prediction_period_start DATE,
    prediction_period_end DATE,
    actual_value NUMERIC,
    accuracy_when_resolved NUMERIC(5,2),
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Real-time Data Visualization Tables

-- Data visualization configurations
CREATE TABLE public.data_visualizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    visualization_name TEXT NOT NULL,
    chart_type TEXT NOT NULL, -- 'line', 'bar', 'pie', 'scatter', 'heatmap', 'map', 'gauge'
    data_source_config JSONB NOT NULL,
    chart_configuration JSONB NOT NULL DEFAULT '{}',
    filter_settings JSONB DEFAULT '{}',
    refresh_settings JSONB DEFAULT '{}',
    is_real_time BOOLEAN NOT NULL DEFAULT false,
    is_public BOOLEAN NOT NULL DEFAULT false,
    shared_with UUID[],
    embed_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Real-time data streams
CREATE TABLE public.real_time_data_streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_name TEXT NOT NULL,
    data_type public.analytics_data_type NOT NULL,
    data_source TEXT NOT NULL,
    stream_configuration JSONB DEFAULT '{}',
    data_schema JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_data_point TIMESTAMPTZ,
    error_count INTEGER NOT NULL DEFAULT 0,
    last_error_message TEXT,
    subscribers UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sentiment Analysis Tables

-- Sentiment analysis results
CREATE TABLE public.advanced_sentiment_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_source TEXT NOT NULL, -- 'social_media', 'news', 'poll_comments', 'forum_posts'
    content_id UUID,
    content_text TEXT NOT NULL,
    content_url TEXT,
    sentiment_value public.sentiment_value NOT NULL,
    sentiment_score NUMERIC(5,2) NOT NULL, -- -1.0 to 1.0
    confidence_score NUMERIC(5,2) NOT NULL,
    emotions_detected JSONB DEFAULT '{}', -- joy, anger, fear, sadness, surprise, etc.
    topics_mentioned TEXT[],
    entities_mentioned JSONB DEFAULT '{}', -- politicians, parties, locations, etc.
    language_detected TEXT DEFAULT 'en',
    analysis_metadata JSONB DEFAULT '{}',
    processed_by TEXT DEFAULT 'ai_model',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Forecasting Tables

-- Performance forecasting models
CREATE TABLE public.performance_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID NOT NULL,
    forecast_type TEXT NOT NULL, -- 'approval_rating', 'election_performance', 'policy_effectiveness'
    forecast_period_start DATE NOT NULL,
    forecast_period_end DATE NOT NULL,
    predicted_value NUMERIC NOT NULL,
    confidence_interval_lower NUMERIC,
    confidence_interval_upper NUMERIC,
    confidence_score NUMERIC(5,2) NOT NULL,
    contributing_factors JSONB DEFAULT '{}',
    model_used TEXT,
    input_data JSONB DEFAULT '{}',
    scenario_assumptions JSONB DEFAULT '{}',
    actual_value NUMERIC,
    forecast_accuracy NUMERIC(5,2),
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data Export and Reporting Tables

-- Custom reports configuration
CREATE TABLE public.custom_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    report_name TEXT NOT NULL,
    report_type public.report_type NOT NULL,
    report_description TEXT,
    data_sources JSONB NOT NULL DEFAULT '[]',
    filter_criteria JSONB DEFAULT '{}',
    visualization_settings JSONB DEFAULT '{}',
    schedule_settings JSONB DEFAULT '{}', -- for automated reports
    export_format TEXT[] DEFAULT ARRAY['pdf', 'excel'],
    is_scheduled BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    recipients UUID[],
    last_generated_at TIMESTAMPTZ,
    next_generation_at TIMESTAMPTZ,
    generated_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Generated report instances
CREATE TABLE public.report_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custom_report_id UUID NOT NULL REFERENCES public.custom_reports(id),
    report_data JSONB NOT NULL,
    file_url TEXT,
    file_size_kb INTEGER,
    generation_duration_ms INTEGER,
    generated_by UUID,
    generation_status TEXT NOT NULL DEFAULT 'completed',
    error_message TEXT,
    download_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics alerts and notifications
CREATE TABLE public.analytics_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_name TEXT NOT NULL,
    alert_description TEXT,
    alert_type TEXT NOT NULL, -- 'threshold', 'anomaly', 'trend', 'prediction'
    severity public.alert_severity NOT NULL DEFAULT 'medium',
    trigger_conditions JSONB NOT NULL,
    data_source_config JSONB NOT NULL,
    recipients UUID[] NOT NULL,
    notification_channels TEXT[] DEFAULT ARRAY['dashboard', 'email'],
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    trigger_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Alert instances when triggered
CREATE TABLE public.analytics_alert_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES public.analytics_alerts(id),
    trigger_data JSONB NOT NULL,
    alert_message TEXT NOT NULL,
    severity public.alert_severity NOT NULL,
    affected_entities JSONB DEFAULT '{}',
    is_acknowledged BOOLEAN NOT NULL DEFAULT false,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMPTZ,
    acknowledgment_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data quality monitoring
CREATE TABLE public.data_quality_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source TEXT NOT NULL,
    table_name TEXT NOT NULL,
    metric_type TEXT NOT NULL, -- 'completeness', 'accuracy', 'consistency', 'timeliness', 'validity'
    metric_value NUMERIC(5,2) NOT NULL,
    threshold_value NUMERIC(5,2),
    is_passing BOOLEAN NOT NULL DEFAULT true,
    sample_size INTEGER,
    measurement_details JSONB DEFAULT '{}',
    measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_time_data_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advanced_sentiment_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_alert_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_quality_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Analytics Dashboard
CREATE POLICY "Users can manage their own dashboards" ON public.analytics_dashboards
FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared dashboards" ON public.analytics_dashboards
FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR 
    auth.uid() = ANY(shared_with) OR 
    dashboard_type = 'public'
);

-- RLS Policies for AI Insights
CREATE POLICY "Public can view verified insights" ON public.ai_insights
FOR SELECT USING (is_verified = true);

CREATE POLICY "Admins can manage all insights" ON public.ai_insights
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- RLS Policies for Predictive Models
CREATE POLICY "Public can view active prediction results" ON public.prediction_results
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.predictive_models 
        WHERE id = model_id AND is_active = true
    )
);

CREATE POLICY "Admins can manage predictive models" ON public.predictive_models
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- RLS Policies for Data Visualizations
CREATE POLICY "Users can manage their own visualizations" ON public.data_visualizations
FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared visualizations" ON public.data_visualizations
FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR 
    auth.uid() = ANY(shared_with) OR 
    is_public = true
);

-- RLS Policies for Real-time Data Streams
CREATE POLICY "Public can view active data streams" ON public.real_time_data_streams
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage data streams" ON public.real_time_data_streams
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- RLS Policies for Advanced Sentiment Analysis
CREATE POLICY "Public can view sentiment analysis" ON public.advanced_sentiment_analysis
FOR SELECT USING (true);

-- RLS Policies for Performance Forecasts
CREATE POLICY "Public can view performance forecasts" ON public.performance_forecasts
FOR SELECT USING (true);

CREATE POLICY "Admins can manage performance forecasts" ON public.performance_forecasts
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- RLS Policies for Custom Reports
CREATE POLICY "Users can manage their own reports" ON public.custom_reports
FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared report instances" ON public.report_instances
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.custom_reports 
        WHERE id = custom_report_id AND (
            user_id = auth.uid() OR 
            auth.uid() = ANY(recipients)
        )
    )
);

-- RLS Policies for Analytics Alerts
CREATE POLICY "Users can manage alerts they created" ON public.analytics_alerts
FOR ALL TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Users can view alerts they receive" ON public.analytics_alerts
FOR SELECT TO authenticated USING (
    auth.uid() = created_by OR 
    auth.uid() = ANY(recipients)
);

CREATE POLICY "Users can view alert instances for their alerts" ON public.analytics_alert_instances
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.analytics_alerts 
        WHERE id = alert_id AND (
            created_by = auth.uid() OR 
            auth.uid() = ANY(recipients)
        )
    )
);

-- RLS Policies for Data Quality
CREATE POLICY "Admins can view data quality metrics" ON public.data_quality_metrics
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Create indexes for better performance
CREATE INDEX idx_analytics_dashboards_user_active ON public.analytics_dashboards(user_id) WHERE is_active = true;
CREATE INDEX idx_ai_insights_type_verified ON public.ai_insights(insight_type, is_verified);
CREATE INDEX idx_ai_insights_priority_expires ON public.ai_insights(priority_level, expires_at);
CREATE INDEX idx_predictive_models_type_active ON public.predictive_models(model_type) WHERE is_active = true;
CREATE INDEX idx_prediction_results_model_entity ON public.prediction_results(model_id, target_entity_type, target_entity_id);
CREATE INDEX idx_prediction_results_period ON public.prediction_results(prediction_period_start, prediction_period_end);
CREATE INDEX idx_data_visualizations_user_public ON public.data_visualizations(user_id, is_public);
CREATE INDEX idx_real_time_streams_type_active ON public.real_time_data_streams(data_type) WHERE is_active = true;
CREATE INDEX idx_advanced_sentiment_analysis_source_created ON public.advanced_sentiment_analysis(content_source, created_at);
CREATE INDEX idx_advanced_sentiment_analysis_entities ON public.advanced_sentiment_analysis USING GIN(entities_mentioned);
CREATE INDEX idx_performance_forecasts_politician_period ON public.performance_forecasts(politician_id, forecast_period_start, forecast_period_end);
CREATE INDEX idx_custom_reports_user_active ON public.custom_reports(user_id) WHERE is_active = true;
CREATE INDEX idx_custom_reports_scheduled ON public.custom_reports(next_generation_at) WHERE is_scheduled = true;
CREATE INDEX idx_report_instances_report_created ON public.report_instances(custom_report_id, created_at);
CREATE INDEX idx_analytics_alerts_active ON public.analytics_alerts(id) WHERE is_active = true;
CREATE INDEX idx_alert_instances_alert_created ON public.analytics_alert_instances(alert_id, created_at);
CREATE INDEX idx_alert_instances_unacknowledged ON public.analytics_alert_instances(created_at) WHERE is_acknowledged = false;
CREATE INDEX idx_data_quality_source_table ON public.data_quality_metrics(data_source, table_name, measured_at);

-- Create functions and triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_analytics_dashboards_updated_at
  BEFORE UPDATE ON public.analytics_dashboards
  FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();

CREATE TRIGGER update_ai_insights_updated_at
  BEFORE UPDATE ON public.ai_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();

CREATE TRIGGER update_predictive_models_updated_at
  BEFORE UPDATE ON public.predictive_models
  FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();

CREATE TRIGGER update_data_visualizations_updated_at
  BEFORE UPDATE ON public.data_visualizations
  FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();

CREATE TRIGGER update_real_time_data_streams_updated_at
  BEFORE UPDATE ON public.real_time_data_streams
  FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();

CREATE TRIGGER update_performance_forecasts_updated_at
  BEFORE UPDATE ON public.performance_forecasts
  FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();

CREATE TRIGGER update_custom_reports_updated_at
  BEFORE UPDATE ON public.custom_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();

CREATE TRIGGER update_analytics_alerts_updated_at
  BEFORE UPDATE ON public.analytics_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();

-- Insert sample data for demonstration

-- Sample AI insights
INSERT INTO public.ai_insights (
  insight_type, title, description, confidence_score, data_sources, supporting_data, 
  actionable_recommendations, priority_level, is_verified
) VALUES
  (
    'trend_analysis',
    'Rising Civic Engagement in Urban Areas',
    'Analysis shows a 23% increase in civic participation among urban youth over the past 3 months, particularly in polling and educational activities.',
    85.5,
    '["poll_data", "civic_education_data", "user_behavior_data"]'::jsonb,
    '{"regional_breakdown": {"douala": 28, "yaounde": 31, "bamenda": 18}, "age_groups": {"18-25": 35, "26-35": 28, "36-45": 15}}'::jsonb,
    ARRAY['Increase targeted campaigns in rural areas', 'Expand youth-focused civic programs', 'Develop mobile-first engagement tools'],
    'high',
    true
  ),
  (
    'anomaly_detection',
    'Unusual Polling Pattern Detected',
    'Detected anomalous voting patterns in Region X that deviate significantly from historical norms and demographic expectations.',
    92.3,
    '["poll_data", "sentiment_data"]'::jsonb,
    '{"anomaly_score": 8.7, "affected_polls": 3, "geographic_concentration": "Centre Region"}'::jsonb,
    ARRAY['Investigate poll security measures', 'Review participant verification', 'Conduct additional validation'],
    'critical',
    false
  );

-- Sample advanced sentiment analysis
INSERT INTO public.advanced_sentiment_analysis (
  content_source, content_text, sentiment_value, sentiment_score, confidence_score,
  topics_mentioned, entities_mentioned
) VALUES
  (
    'social_media',
    'The new healthcare policy seems promising for rural communities',
    'positive',
    0.75,
    88.5,
    ARRAY['healthcare', 'policy', 'rural'],
    '{"policies": ["healthcare_reform"], "regions": ["rural_areas"]}'::jsonb
  ),
  (
    'news',
    'Citizens express concerns about the proposed education budget cuts',
    'negative',
    -0.45,
    92.1,
    ARRAY['education', 'budget', 'cuts'],
    '{"topics": ["education_funding"], "sentiment_drivers": ["budget_concerns"]}'::jsonb
  );

-- Create analytics aggregation functions
CREATE OR REPLACE FUNCTION public.calculate_engagement_metrics(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- This would be enhanced with actual user engagement calculations
  -- For now, returning sample data structure
  
  result := jsonb_build_object(
    'period_start', p_start_date,
    'period_end', p_end_date,
    'total_users', 1250,
    'active_users', 847,
    'poll_participation_rate', 68.5,
    'education_completion_rate', 42.3,
    'average_session_duration_minutes', 18.7,
    'top_engagement_activities', ARRAY['polling', 'education', 'performance_tracking']
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create prediction generation function
CREATE OR REPLACE FUNCTION public.generate_civic_predictions()
RETURNS INTEGER AS $$
DECLARE
  predictions_created INTEGER := 0;
  sample_model_id UUID;
BEGIN
  -- Create a sample predictive model if none exists
  INSERT INTO public.predictive_models (
    model_name, model_type, model_description, input_features, is_active
  ) VALUES (
    'Civic Participation Predictor',
    'civic_participation',
    'Predicts future civic engagement levels based on historical trends',
    '["historical_engagement", "demographic_data", "seasonal_patterns"]'::jsonb,
    true
  ) 
  ON CONFLICT DO NOTHING
  RETURNING id INTO sample_model_id;
  
  -- Get existing model if insert was skipped
  IF sample_model_id IS NULL THEN
    SELECT id INTO sample_model_id 
    FROM public.predictive_models 
    WHERE model_type = 'civic_participation' AND is_active = true 
    LIMIT 1;
  END IF;
  
  -- Generate sample predictions if we have a model
  IF sample_model_id IS NOT NULL THEN
    INSERT INTO public.prediction_results (
      model_id, prediction_type, target_entity_type, prediction_value, 
      prediction_confidence, prediction_details, prediction_period_start, prediction_period_end
    ) 
    SELECT 
      sample_model_id,
      'civic_participation',
      'region',
      65.0 + (RANDOM() * 20.0), -- Random prediction between 65-85%
      80.0 + (RANDOM() * 15.0), -- Random confidence between 80-95%
      '{"prediction_factors": ["historical_trends", "demographic_data", "seasonal_patterns"]}'::jsonb,
      CURRENT_DATE + INTERVAL '1 day',
      CURRENT_DATE + INTERVAL '30 days'
    FROM generate_series(1, 5);
    
    predictions_created := 5;
  END IF;
  
  RETURN predictions_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.analytics_dashboards IS 'User-configurable analytics dashboards';
COMMENT ON TABLE public.ai_insights IS 'AI-generated insights and recommendations';
COMMENT ON TABLE public.predictive_models IS 'Machine learning models for civic predictions';
COMMENT ON TABLE public.prediction_results IS 'Results from predictive analytics models';
COMMENT ON TABLE public.data_visualizations IS 'Configuration for data visualization widgets';
COMMENT ON TABLE public.advanced_sentiment_analysis IS 'Advanced sentiment analysis results from various sources';
COMMENT ON TABLE public.performance_forecasts IS 'Forecasted performance metrics for politicians';
COMMENT ON TABLE public.custom_reports IS 'User-defined custom report configurations';
COMMENT ON TABLE public.analytics_alerts IS 'Automated alerts based on analytics thresholds';