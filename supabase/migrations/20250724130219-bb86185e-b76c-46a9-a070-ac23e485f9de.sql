-- Create profile analytics tables
CREATE TABLE IF NOT EXISTS public.profile_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value BIGINT NOT NULL DEFAULT 0,
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profile_view_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  viewer_id UUID,
  viewer_ip INET,
  user_agent TEXT,
  referrer TEXT,
  session_id TEXT,
  view_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_analytics_profile_id ON public.profile_analytics(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_date ON public.profile_analytics(date_recorded);
CREATE INDEX IF NOT EXISTS idx_profile_view_logs_profile_id ON public.profile_view_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_view_logs_created_at ON public.profile_view_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.profile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_view_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for profile_analytics
CREATE POLICY "Users can view their own analytics"
ON public.profile_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = profile_analytics.profile_id 
    AND profiles.user_id = auth.uid()
  )
);

-- RLS policies for profile_view_logs  
CREATE POLICY "Users can view their own view logs"
ON public.profile_view_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = profile_view_logs.profile_id 
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert view logs"
ON public.profile_view_logs
FOR INSERT
WITH CHECK (true);