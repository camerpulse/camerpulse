-- Create user watchlist and notification tables
CREATE TABLE public.user_tender_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tender_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  alert_enabled BOOLEAN NOT NULL DEFAULT true,
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
  UNIQUE(user_id, tender_id)
);

CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'info',
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tender_id UUID,
  notification_type TEXT NOT NULL,
  channels TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  results JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_user_tender_watchlist_user_id ON public.user_tender_watchlist(user_id);
CREATE INDEX idx_user_tender_watchlist_tender_id ON public.user_tender_watchlist(tender_id);
CREATE INDEX idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON public.user_notifications(user_id, read);
CREATE INDEX idx_notification_logs_user_id ON public.notification_logs(user_id);

-- Enable RLS
ALTER TABLE public.user_tender_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_tender_watchlist
CREATE POLICY "Users can manage their own watchlist" 
ON public.user_tender_watchlist 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for user_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.user_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.user_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.user_notifications 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for notification_logs
CREATE POLICY "Users can view their notification logs" 
ON public.notification_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notification logs" 
ON public.notification_logs 
FOR INSERT 
WITH CHECK (true);

-- Realtime subscriptions
ALTER TABLE public.user_tender_watchlist REPLICA IDENTITY FULL;
ALTER TABLE public.user_notifications REPLICA IDENTITY FULL;

INSERT INTO supabase_realtime.subscription VALUES 
('realtime', 'public', 'user_tender_watchlist', '*', NULL, '[]'::jsonb),
('realtime', 'public', 'user_notifications', '*', NULL, '[]'::jsonb);