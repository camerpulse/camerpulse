-- Create only the missing watchlist table
CREATE TABLE public.user_tender_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tender_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  alert_enabled BOOLEAN NOT NULL DEFAULT true,
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
  UNIQUE(user_id, tender_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_tender_watchlist_user_id ON public.user_tender_watchlist(user_id);
CREATE INDEX idx_user_tender_watchlist_tender_id ON public.user_tender_watchlist(tender_id);

-- Enable RLS
ALTER TABLE public.user_tender_watchlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_tender_watchlist
CREATE POLICY "Users can manage their own watchlist" 
ON public.user_tender_watchlist 
FOR ALL 
USING (auth.uid() = user_id);

-- Realtime subscriptions
ALTER TABLE public.user_tender_watchlist REPLICA IDENTITY FULL;

INSERT INTO supabase_realtime.subscription VALUES 
('realtime', 'public', 'user_tender_watchlist', '*', NULL, '[]'::jsonb);