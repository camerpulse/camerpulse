-- Create institution analytics tracking tables
CREATE TABLE public.institution_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('school', 'hospital', 'pharmacy', 'village')),
  metric_type TEXT NOT NULL CHECK (metric_type IN ('profile_view', 'click_through', 'message_sent', 'rating_given', 'search_appearance')),
  metric_value INTEGER NOT NULL DEFAULT 1,
  user_id UUID,
  session_id TEXT,
  source_page TEXT,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics summaries table for performance
CREATE TABLE public.institution_analytics_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  institution_type TEXT NOT NULL,
  summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_views INTEGER NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_messages INTEGER NOT NULL DEFAULT 0,
  total_ratings INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2),
  search_appearances INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  engagement_score NUMERIC(5,2) DEFAULT 0,
  ranking_position INTEGER,
  sentiment_score NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(institution_id, summary_date)
);

-- Create analytics reports table
CREATE TABLE public.institution_analytics_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('weekly', 'monthly', 'custom')),
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  report_data JSONB NOT NULL DEFAULT '{}',
  generated_by UUID,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  download_url TEXT,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.institution_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_analytics_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institution_analytics
CREATE POLICY "System can insert analytics" 
ON public.institution_analytics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Institution owners can view their analytics" 
ON public.institution_analytics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.institution_claims ic
    WHERE ic.institution_id = institution_analytics.institution_id
    AND ic.user_id = auth.uid()
    AND ic.status = 'approved'
  )
);

CREATE POLICY "Admins can view all analytics" 
ON public.institution_analytics 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- RLS Policies for institution_analytics_summary
CREATE POLICY "Institution owners can view their summary" 
ON public.institution_analytics_summary 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.institution_claims ic
    WHERE ic.institution_id = institution_analytics_summary.institution_id
    AND ic.user_id = auth.uid()
    AND ic.status = 'approved'
  )
);

CREATE POLICY "Admins can manage all summaries" 
ON public.institution_analytics_summary 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "System can update summaries" 
ON public.institution_analytics_summary 
FOR ALL 
WITH CHECK (true);

-- RLS Policies for institution_analytics_reports
CREATE POLICY "Institution owners can view their reports" 
ON public.institution_analytics_reports 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.institution_claims ic
    WHERE ic.institution_id = institution_analytics_reports.institution_id
    AND ic.user_id = auth.uid()
    AND ic.status = 'approved'
  )
);

CREATE POLICY "Admins can manage all reports" 
ON public.institution_analytics_reports 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create indexes for performance
CREATE INDEX idx_institution_analytics_institution_id ON public.institution_analytics(institution_id);
CREATE INDEX idx_institution_analytics_recorded_at ON public.institution_analytics(recorded_at);
CREATE INDEX idx_institution_analytics_metric_type ON public.institution_analytics(metric_type);
CREATE INDEX idx_institution_analytics_summary_institution_date ON public.institution_analytics_summary(institution_id, summary_date);

-- Create function to update analytics summary
CREATE OR REPLACE FUNCTION public.update_institution_analytics_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert summary for the institution
  INSERT INTO public.institution_analytics_summary (
    institution_id,
    institution_type,
    summary_date,
    total_views,
    total_clicks,
    total_messages,
    total_ratings,
    search_appearances,
    unique_visitors
  )
  VALUES (
    NEW.institution_id,
    NEW.institution_type,
    CURRENT_DATE,
    CASE WHEN NEW.metric_type = 'profile_view' THEN 1 ELSE 0 END,
    CASE WHEN NEW.metric_type = 'click_through' THEN 1 ELSE 0 END,
    CASE WHEN NEW.metric_type = 'message_sent' THEN 1 ELSE 0 END,
    CASE WHEN NEW.metric_type = 'rating_given' THEN 1 ELSE 0 END,
    CASE WHEN NEW.metric_type = 'search_appearance' THEN 1 ELSE 0 END,
    CASE WHEN NEW.user_id IS NOT NULL THEN 1 ELSE 0 END
  )
  ON CONFLICT (institution_id, summary_date) 
  DO UPDATE SET
    total_views = institution_analytics_summary.total_views + CASE WHEN NEW.metric_type = 'profile_view' THEN 1 ELSE 0 END,
    total_clicks = institution_analytics_summary.total_clicks + CASE WHEN NEW.metric_type = 'click_through' THEN 1 ELSE 0 END,
    total_messages = institution_analytics_summary.total_messages + CASE WHEN NEW.metric_type = 'message_sent' THEN 1 ELSE 0 END,
    total_ratings = institution_analytics_summary.total_ratings + CASE WHEN NEW.metric_type = 'rating_given' THEN 1 ELSE 0 END,
    search_appearances = institution_analytics_summary.search_appearances + CASE WHEN NEW.metric_type = 'search_appearance' THEN 1 ELSE 0 END,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_analytics_summary_trigger
  AFTER INSERT ON public.institution_analytics
  FOR EACH ROW EXECUTE FUNCTION public.update_institution_analytics_summary();

-- Create function to calculate engagement score
CREATE OR REPLACE FUNCTION public.calculate_engagement_score(p_institution_id UUID, p_period_days INTEGER DEFAULT 30)
RETURNS NUMERIC AS $$
DECLARE
  view_count INTEGER;
  click_count INTEGER;
  message_count INTEGER;
  rating_count INTEGER;
  engagement_score NUMERIC := 0;
BEGIN
  -- Get metrics for the period
  SELECT 
    COALESCE(SUM(CASE WHEN metric_type = 'profile_view' THEN metric_value ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN metric_type = 'click_through' THEN metric_value ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN metric_type = 'message_sent' THEN metric_value ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN metric_type = 'rating_given' THEN metric_value ELSE 0 END), 0)
  INTO view_count, click_count, message_count, rating_count
  FROM public.institution_analytics
  WHERE institution_id = p_institution_id
  AND recorded_at >= CURRENT_DATE - INTERVAL '1 day' * p_period_days;
  
  -- Calculate weighted engagement score
  engagement_score := (
    (view_count * 1.0) +
    (click_count * 2.0) +
    (message_count * 5.0) +
    (rating_count * 3.0)
  ) / GREATEST(p_period_days, 1);
  
  RETURN COALESCE(engagement_score, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;