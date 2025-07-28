-- Phase 7: Advanced Analytics & Reporting
-- Create analytics and reporting tables

-- Analytics Reports table
CREATE TABLE public.analytics_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'custom', 'scheduled', 'template'
  description TEXT,
  configuration JSONB NOT NULL DEFAULT '{}',
  data_sources JSONB NOT NULL DEFAULT '[]',
  filters JSONB NOT NULL DEFAULT '{}',
  visualization_config JSONB NOT NULL DEFAULT '{}',
  schedule_config JSONB, -- for scheduled reports
  is_public BOOLEAN NOT NULL DEFAULT false,
  shared_with UUID[], -- array of user IDs
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'archived', 'draft'
  last_generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Report Executions table
CREATE TABLE public.report_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL,
  user_id UUID NOT NULL,
  execution_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  execution_time_ms INTEGER,
  result_data JSONB,
  result_metadata JSONB NOT NULL DEFAULT '{}',
  error_message TEXT,
  file_path TEXT, -- for exported reports
  file_format TEXT, -- 'pdf', 'csv', 'xlsx', 'json'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Real-time Analytics Events table
CREATE TABLE public.realtime_analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  event_label TEXT,
  event_value NUMERIC,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country TEXT,
  region TEXT,
  city TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,
  custom_properties JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance Metrics table
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_category TEXT NOT NULL, -- 'page_load', 'api_response', 'database', 'user_action'
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL, -- 'ms', 'seconds', 'count', 'percentage'
  dimensions JSONB NOT NULL DEFAULT '{}', -- additional dimensions like page, endpoint, etc.
  user_id UUID,
  session_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Data Export Jobs table
CREATE TABLE public.data_export_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  export_name TEXT NOT NULL,
  export_type TEXT NOT NULL, -- 'analytics', 'users', 'content', 'custom'
  data_query JSONB NOT NULL, -- query configuration
  filters JSONB NOT NULL DEFAULT '{}',
  format TEXT NOT NULL DEFAULT 'csv', -- 'csv', 'xlsx', 'json', 'pdf'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  total_records INTEGER,
  processed_records INTEGER,
  file_path TEXT,
  file_size_bytes BIGINT,
  error_message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Analytics Dashboards (extend existing table if needed)
-- This table already exists, so we'll add some indexes and functions

-- Create indexes for better performance
CREATE INDEX idx_analytics_reports_user_id ON public.analytics_reports(user_id);
CREATE INDEX idx_analytics_reports_type ON public.analytics_reports(report_type);
CREATE INDEX idx_analytics_reports_status ON public.analytics_reports(status);
CREATE INDEX idx_report_executions_report_id ON public.report_executions(report_id);
CREATE INDEX idx_report_executions_user_id ON public.report_executions(user_id);
CREATE INDEX idx_report_executions_status ON public.report_executions(execution_status);
CREATE INDEX idx_realtime_analytics_events_user_id ON public.realtime_analytics_events(user_id);
CREATE INDEX idx_realtime_analytics_events_timestamp ON public.realtime_analytics_events(timestamp);
CREATE INDEX idx_realtime_analytics_events_event_type ON public.realtime_analytics_events(event_type);
CREATE INDEX idx_realtime_analytics_events_session_id ON public.realtime_analytics_events(session_id);
CREATE INDEX idx_performance_metrics_category ON public.performance_metrics(metric_category);
CREATE INDEX idx_performance_metrics_timestamp ON public.performance_metrics(timestamp);
CREATE INDEX idx_performance_metrics_user_id ON public.performance_metrics(user_id);
CREATE INDEX idx_data_export_jobs_user_id ON public.data_export_jobs(user_id);
CREATE INDEX idx_data_export_jobs_status ON public.data_export_jobs(status);

-- Enable RLS
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_reports
CREATE POLICY "Users can manage their own reports" ON public.analytics_reports
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared reports" ON public.analytics_reports
  FOR SELECT USING (
    auth.uid() = user_id OR 
    is_public = true OR 
    auth.uid() = ANY(shared_with)
  );

-- RLS Policies for report_executions
CREATE POLICY "Users can manage their own report executions" ON public.report_executions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for realtime_analytics_events
CREATE POLICY "Users can view their own events" ON public.realtime_analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert events" ON public.realtime_analytics_events
  FOR INSERT WITH CHECK (true);

-- RLS Policies for performance_metrics
CREATE POLICY "Users can view their own metrics" ON public.performance_metrics
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can insert metrics" ON public.performance_metrics
  FOR INSERT WITH CHECK (true);

-- RLS Policies for data_export_jobs
CREATE POLICY "Users can manage their own export jobs" ON public.data_export_jobs
  FOR ALL USING (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE public.report_executions 
  ADD CONSTRAINT fk_report_executions_report_id 
  FOREIGN KEY (report_id) REFERENCES public.analytics_reports(id) ON DELETE CASCADE;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analytics_reports_updated_at
  BEFORE UPDATE ON public.analytics_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_analytics_updated_at();

-- Function to aggregate analytics data
CREATE OR REPLACE FUNCTION public.get_analytics_summary(
  p_user_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_events BIGINT,
  unique_sessions BIGINT,
  avg_session_duration NUMERIC,
  top_pages JSONB,
  device_breakdown JSONB,
  hourly_activity JSONB
) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH event_stats AS (
    SELECT 
      COUNT(*) as total_events,
      COUNT(DISTINCT session_id) as unique_sessions
    FROM public.realtime_analytics_events 
    WHERE user_id = p_user_id 
      AND timestamp::date BETWEEN p_start_date AND p_end_date
  ),
  page_stats AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'page', page_url,
        'views', view_count
      ) ORDER BY view_count DESC
    ) as top_pages
    FROM (
      SELECT page_url, COUNT(*) as view_count
      FROM public.realtime_analytics_events 
      WHERE user_id = p_user_id 
        AND timestamp::date BETWEEN p_start_date AND p_end_date
        AND page_url IS NOT NULL
      GROUP BY page_url
      LIMIT 10
    ) t
  ),
  device_stats AS (
    SELECT jsonb_object_agg(device_type, device_count) as device_breakdown
    FROM (
      SELECT 
        COALESCE(device_type, 'unknown') as device_type,
        COUNT(*) as device_count
      FROM public.realtime_analytics_events 
      WHERE user_id = p_user_id 
        AND timestamp::date BETWEEN p_start_date AND p_end_date
      GROUP BY device_type
    ) t
  ),
  hourly_stats AS (
    SELECT jsonb_object_agg(hour_bucket, event_count) as hourly_activity
    FROM (
      SELECT 
        EXTRACT(HOUR FROM timestamp) as hour_bucket,
        COUNT(*) as event_count
      FROM public.realtime_analytics_events 
      WHERE user_id = p_user_id 
        AND timestamp::date BETWEEN p_start_date AND p_end_date
      GROUP BY EXTRACT(HOUR FROM timestamp)
      ORDER BY hour_bucket
    ) t
  )
  SELECT 
    es.total_events,
    es.unique_sessions,
    0::NUMERIC as avg_session_duration, -- placeholder
    ps.top_pages,
    ds.device_breakdown,
    hs.hourly_activity
  FROM event_stats es
  CROSS JOIN page_stats ps
  CROSS JOIN device_stats ds
  CROSS JOIN hourly_stats hs;
END;
$$;