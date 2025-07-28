-- Create notification analytics table
CREATE TABLE IF NOT EXISTS public.notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- sent, delivered, opened, clicked, dismissed, expired
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  device_info JSONB DEFAULT '{}'::jsonb,
  location_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user engagement metrics table
CREATE TABLE IF NOT EXISTS public.user_engagement_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date_tracked DATE NOT NULL,
  total_notifications_received INTEGER DEFAULT 0,
  notifications_opened INTEGER DEFAULT 0,
  notifications_clicked INTEGER DEFAULT 0,
  notifications_dismissed INTEGER DEFAULT 0,
  avg_response_time_seconds INTEGER DEFAULT 0,
  engagement_score NUMERIC DEFAULT 0,
  session_duration_minutes INTEGER DEFAULT 0,
  actions_taken INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date_tracked)
);

-- Create notification performance metrics table  
CREATE TABLE IF NOT EXISTS public.notification_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL,
  template_id UUID,
  date_tracked DATE NOT NULL,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_dismissed INTEGER DEFAULT 0,
  total_expired INTEGER DEFAULT 0,
  avg_open_time_seconds INTEGER DEFAULT 0,
  avg_click_time_seconds INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(notification_type, template_id, date_tracked)
);

-- Create real-time analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  page_url TEXT
);

-- Enable RLS
ALTER TABLE public.notification_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_analytics
CREATE POLICY "Users can view their own notification analytics" ON public.notification_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage notification analytics" ON public.notification_analytics
  FOR ALL USING (true);

-- RLS Policies for user_engagement_metrics
CREATE POLICY "Users can view their own engagement metrics" ON public.user_engagement_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage engagement metrics" ON public.user_engagement_metrics
  FOR ALL USING (true);

-- RLS Policies for notification_performance_metrics
CREATE POLICY "Public can view performance metrics" ON public.notification_performance_metrics
  FOR SELECT USING (true);

CREATE POLICY "System can manage performance metrics" ON public.notification_performance_metrics
  FOR ALL USING (true);

-- RLS Policies for analytics_events
CREATE POLICY "Users can view their own analytics events" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage analytics events" ON public.analytics_events
  FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_analytics_user_id ON public.notification_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_notification_id ON public.notification_analytics(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_event_type ON public.notification_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_timestamp ON public.notification_analytics(event_timestamp);

CREATE INDEX IF NOT EXISTS idx_user_engagement_metrics_user_date ON public.user_engagement_metrics(user_id, date_tracked);
CREATE INDEX IF NOT EXISTS idx_notification_performance_type_date ON public.notification_performance_metrics(notification_type, date_tracked);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_timestamp ON public.analytics_events(user_id, timestamp);

-- Function to update engagement metrics
CREATE OR REPLACE FUNCTION public.update_user_engagement_metrics(
  p_user_id UUID,
  p_event_type TEXT,
  p_response_time_seconds INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
BEGIN
  INSERT INTO public.user_engagement_metrics (
    user_id, date_tracked, total_notifications_received,
    notifications_opened, notifications_clicked, notifications_dismissed,
    avg_response_time_seconds
  ) VALUES (
    p_user_id, current_date, 
    CASE WHEN p_event_type = 'sent' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'opened' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'clicked' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'dismissed' THEN 1 ELSE 0 END,
    p_response_time_seconds
  )
  ON CONFLICT (user_id, date_tracked) DO UPDATE SET
    total_notifications_received = CASE 
      WHEN p_event_type = 'sent' THEN user_engagement_metrics.total_notifications_received + 1
      ELSE user_engagement_metrics.total_notifications_received
    END,
    notifications_opened = CASE 
      WHEN p_event_type = 'opened' THEN user_engagement_metrics.notifications_opened + 1
      ELSE user_engagement_metrics.notifications_opened
    END,
    notifications_clicked = CASE 
      WHEN p_event_type = 'clicked' THEN user_engagement_metrics.notifications_clicked + 1
      ELSE user_engagement_metrics.notifications_clicked
    END,
    notifications_dismissed = CASE 
      WHEN p_event_type = 'dismissed' THEN user_engagement_metrics.notifications_dismissed + 1
      ELSE user_engagement_metrics.notifications_dismissed
    END,
    avg_response_time_seconds = (
      (user_engagement_metrics.avg_response_time_seconds + p_response_time_seconds) / 2
    ),
    engagement_score = (
      (user_engagement_metrics.notifications_opened + user_engagement_metrics.notifications_clicked) * 100.0 / 
      GREATEST(user_engagement_metrics.total_notifications_received, 1)
    ),
    updated_at = now();
END;
$$;

-- Function to update performance metrics
CREATE OR REPLACE FUNCTION public.update_notification_performance_metrics(
  p_notification_type TEXT,
  p_template_id UUID,
  p_event_type TEXT,
  p_response_time_seconds INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
BEGIN
  INSERT INTO public.notification_performance_metrics (
    notification_type, template_id, date_tracked,
    total_sent, total_delivered, total_opened, total_clicked,
    total_dismissed, total_expired, avg_open_time_seconds, avg_click_time_seconds
  ) VALUES (
    p_notification_type, p_template_id, current_date,
    CASE WHEN p_event_type = 'sent' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'delivered' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'opened' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'clicked' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'dismissed' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'expired' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'opened' THEN p_response_time_seconds ELSE 0 END,
    CASE WHEN p_event_type = 'clicked' THEN p_response_time_seconds ELSE 0 END
  )
  ON CONFLICT (notification_type, template_id, date_tracked) DO UPDATE SET
    total_sent = CASE 
      WHEN p_event_type = 'sent' THEN notification_performance_metrics.total_sent + 1
      ELSE notification_performance_metrics.total_sent
    END,
    total_delivered = CASE 
      WHEN p_event_type = 'delivered' THEN notification_performance_metrics.total_delivered + 1
      ELSE notification_performance_metrics.total_delivered
    END,
    total_opened = CASE 
      WHEN p_event_type = 'opened' THEN notification_performance_metrics.total_opened + 1
      ELSE notification_performance_metrics.total_opened
    END,
    total_clicked = CASE 
      WHEN p_event_type = 'clicked' THEN notification_performance_metrics.total_clicked + 1
      ELSE notification_performance_metrics.total_clicked
    END,
    total_dismissed = CASE 
      WHEN p_event_type = 'dismissed' THEN notification_performance_metrics.total_dismissed + 1
      ELSE notification_performance_metrics.total_dismissed
    END,
    total_expired = CASE 
      WHEN p_event_type = 'expired' THEN notification_performance_metrics.total_expired + 1
      ELSE notification_performance_metrics.total_expired
    END,
    avg_open_time_seconds = CASE 
      WHEN p_event_type = 'opened' THEN 
        (notification_performance_metrics.avg_open_time_seconds + p_response_time_seconds) / 2
      ELSE notification_performance_metrics.avg_open_time_seconds
    END,
    avg_click_time_seconds = CASE 
      WHEN p_event_type = 'clicked' THEN 
        (notification_performance_metrics.avg_click_time_seconds + p_response_time_seconds) / 2
      ELSE notification_performance_metrics.avg_click_time_seconds
    END,
    engagement_rate = (
      (notification_performance_metrics.total_opened + notification_performance_metrics.total_clicked) * 100.0 /
      GREATEST(notification_performance_metrics.total_delivered, 1)
    ),
    conversion_rate = (
      notification_performance_metrics.total_clicked * 100.0 /
      GREATEST(notification_performance_metrics.total_opened, 1)
    ),
    updated_at = now();
END;
$$;