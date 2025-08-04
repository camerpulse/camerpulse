-- Create analytics and recommendations tables
CREATE TABLE public.village_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL,
  user_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.village_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  village_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL,
  confidence_score NUMERIC(3,2) DEFAULT 0.5,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  is_clicked BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferred_regions TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  activity_level TEXT DEFAULT 'moderate',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.village_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Analytics policies (system can insert, users can view their own)
CREATE POLICY "System can insert analytics" ON public.village_analytics
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their analytics" ON public.village_analytics
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all analytics" ON public.village_analytics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Recommendations policies
CREATE POLICY "Users can view their recommendations" ON public.village_recommendations
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their recommendations" ON public.village_recommendations
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert recommendations" ON public.village_recommendations
FOR INSERT WITH CHECK (true);

-- Preferences policies
CREATE POLICY "Users can manage their preferences" ON public.user_preferences
FOR ALL USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_village_analytics_village_id ON public.village_analytics(village_id);
CREATE INDEX idx_village_analytics_user_id ON public.village_analytics(user_id);
CREATE INDEX idx_village_analytics_event_type ON public.village_analytics(event_type);
CREATE INDEX idx_village_analytics_created_at ON public.village_analytics(created_at);

CREATE INDEX idx_village_recommendations_user_id ON public.village_recommendations(user_id);
CREATE INDEX idx_village_recommendations_village_id ON public.village_recommendations(village_id);
CREATE INDEX idx_village_recommendations_expires_at ON public.village_recommendations(expires_at);

-- Create analytics aggregation function
CREATE OR REPLACE FUNCTION get_village_analytics_summary(p_village_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}';
  total_visits INTEGER;
  unique_visitors INTEGER;
  avg_session_duration NUMERIC;
  top_events JSONB;
BEGIN
  -- Get total visits
  SELECT COUNT(*) INTO total_visits
  FROM village_analytics
  WHERE village_id = p_village_id
    AND event_type = 'village_view'
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  -- Get unique visitors
  SELECT COUNT(DISTINCT user_id) INTO unique_visitors
  FROM village_analytics
  WHERE village_id = p_village_id
    AND user_id IS NOT NULL
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  -- Get top events
  SELECT jsonb_agg(
    jsonb_build_object(
      'event_type', event_type,
      'count', event_count
    )
  ) INTO top_events
  FROM (
    SELECT event_type, COUNT(*) as event_count
    FROM village_analytics
    WHERE village_id = p_village_id
      AND created_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY event_type
    ORDER BY event_count DESC
    LIMIT 10
  ) events;
  
  result := jsonb_build_object(
    'total_visits', total_visits,
    'unique_visitors', unique_visitors,
    'top_events', COALESCE(top_events, '[]'::jsonb),
    'period_days', p_days
  );
  
  RETURN result;
END;
$$;