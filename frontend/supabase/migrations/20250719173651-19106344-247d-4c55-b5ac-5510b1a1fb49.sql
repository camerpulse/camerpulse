-- Add missing tables for complete notification system

-- User notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for user notifications
CREATE POLICY "Users can view their own notifications" ON public.user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.user_notifications
  FOR INSERT WITH CHECK (true);

-- Notification campaign table for bulk notifications
CREATE TABLE IF NOT EXISTS public.notification_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  description TEXT,
  target_audience JSONB DEFAULT '{}',
  template_id UUID REFERENCES notification_templates(id),
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  successful_sends INTEGER DEFAULT 0,
  failed_sends INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for campaigns
ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaigns
CREATE POLICY "Admins can manage campaigns" ON public.notification_campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Notification queue table for scheduled/delayed notifications
CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES notification_flows(id),
  recipient_id UUID NOT NULL,
  event_type notification_event_type NOT NULL,
  channel notification_channel NOT NULL,
  template_data JSONB DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for queue
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for queue
CREATE POLICY "Admins can view queue" ON public.notification_queue
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Function to process notification queue
CREATE OR REPLACE FUNCTION public.process_notification_queue()
RETURNS INTEGER AS $$
DECLARE
  queue_item RECORD;
  processed_count INTEGER := 0;
BEGIN
  -- Process items that are due
  FOR queue_item IN
    SELECT * FROM public.notification_queue
    WHERE status = 'pending'
    AND scheduled_at <= NOW()
    AND retry_count < max_retries
    ORDER BY scheduled_at
    LIMIT 100
  LOOP
    -- Call centralized notification engine
    PERFORM net.http_post(
      url := 'https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/centralized-notification-engine',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODE3ODAsImV4cCI6MjA2Nzg1Nzc4MH0.4GKFhQTxlEzj6oTcfnAZQpPxPHW0nqGDEfBe-gVGoNE"}'::jsonb,
      body := jsonb_build_object(
        'event_type', queue_item.event_type,
        'recipient_id', queue_item.recipient_id,
        'recipient_type', CASE 
          WHEN EXISTS(SELECT 1 FROM artist_memberships WHERE user_id = queue_item.recipient_id::uuid) THEN 'artist'
          ELSE 'fan'
        END,
        'data', queue_item.template_data
      )
    );
    
    -- Mark as processed
    UPDATE public.notification_queue
    SET status = 'processed', processed_at = NOW()
    WHERE id = queue_item.id;
    
    processed_count := processed_count + 1;
  END LOOP;
  
  RETURN processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);

-- Update existing notification functions to use centralized engine

-- Update artist welcome email trigger
CREATE OR REPLACE FUNCTION public.send_artist_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Call centralized notification engine instead of direct email
  PERFORM net.http_post(
    url := 'https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/centralized-notification-engine',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODE3ODAsImV4cCI6MjA2Nzg1Nzc4MH0.4GKFhQTxlEzj6oTcfnAZQpPxPHW0nqGDEfBe-gVGoNE"}'::jsonb,
    body := jsonb_build_object(
      'event_type', 'artist_profile_submitted',
      'recipient_id', NEW.user_id,
      'recipient_type', 'artist',
      'data', jsonb_build_object(
        'artist_name', NEW.stage_name,
        'real_name', NEW.real_name
      )
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;