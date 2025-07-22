-- Enable realtime for senators table
ALTER TABLE public.senators REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.senators;

-- Enable realtime for approval_ratings table  
ALTER TABLE public.approval_ratings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.approval_ratings;

-- Create senator_followers table for following system
CREATE TABLE public.senator_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  senator_id UUID NOT NULL REFERENCES public.senators(id) ON DELETE CASCADE,
  notification_preferences JSONB NOT NULL DEFAULT '{"new_bills": true, "ratings_change": true, "activity_updates": true}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, senator_id)
);

-- Enable RLS for senator_followers
ALTER TABLE public.senator_followers ENABLE ROW LEVEL SECURITY;

-- Policies for senator_followers
CREATE POLICY "Users can manage their own senator follows" 
ON public.senator_followers 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view follow counts" 
ON public.senator_followers 
FOR SELECT 
USING (true);

-- Enable realtime for senator_followers
ALTER TABLE public.senator_followers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.senator_followers;

-- Create senator_notifications table
CREATE TABLE public.senator_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  senator_id UUID NOT NULL REFERENCES public.senators(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('new_bill', 'rating_change', 'activity_update', 'performance_milestone')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for senator_notifications
ALTER TABLE public.senator_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for senator_notifications
CREATE POLICY "Users can manage their own notifications" 
ON public.senator_notifications 
FOR ALL 
USING (auth.uid() = user_id);

-- Enable realtime for senator_notifications
ALTER TABLE public.senator_notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.senator_notifications;

-- Create senator_analytics table for advanced analytics
CREATE TABLE public.senator_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  senator_id UUID NOT NULL REFERENCES public.senators(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('profile_views', 'rating_trend', 'follower_growth', 'engagement_score')),
  metric_value NUMERIC NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for senator_analytics
ALTER TABLE public.senator_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for senator_analytics
CREATE POLICY "Public can view senator analytics" 
ON public.senator_analytics 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage senator analytics" 
ON public.senator_analytics 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create indexes for performance
CREATE INDEX idx_senator_followers_user_id ON public.senator_followers(user_id);
CREATE INDEX idx_senator_followers_senator_id ON public.senator_followers(senator_id);
CREATE INDEX idx_senator_notifications_user_id ON public.senator_notifications(user_id);
CREATE INDEX idx_senator_notifications_created_at ON public.senator_notifications(created_at DESC);
CREATE INDEX idx_senator_analytics_senator_id ON public.senator_analytics(senator_id);
CREATE INDEX idx_senator_analytics_period ON public.senator_analytics(period_start, period_end);