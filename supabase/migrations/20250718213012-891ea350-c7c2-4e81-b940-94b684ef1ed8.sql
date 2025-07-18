-- PulseNotify v3.5: Comprehensive Notification System Upgrade (Part 2)
-- Skip existing types and create remaining infrastructure

-- Create notification priority enum (if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM ('low', 'moderate', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create comprehensive notifications table (using existing notification_type)
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  priority notification_priority DEFAULT 'moderate',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  action_url TEXT,
  icon TEXT,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  geo_targeted BOOLEAN DEFAULT false,
  target_regions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Create notification settings table
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Message notifications
  enable_message_notifications BOOLEAN DEFAULT true,
  enable_message_popups BOOLEAN DEFAULT true,
  enable_message_push BOOLEAN DEFAULT false,
  enable_message_email BOOLEAN DEFAULT false,
  enable_message_sms BOOLEAN DEFAULT false,
  
  -- Civic engagement notifications
  enable_civic_notifications BOOLEAN DEFAULT true,
  enable_event_notifications BOOLEAN DEFAULT true,
  enable_poll_notifications BOOLEAN DEFAULT true,
  enable_government_notifications BOOLEAN DEFAULT true,
  enable_policy_notifications BOOLEAN DEFAULT true,
  
  -- Intelligence notifications
  enable_intelligence_notifications BOOLEAN DEFAULT true,
  enable_promise_tracking BOOLEAN DEFAULT true,
  enable_sentiment_alerts BOOLEAN DEFAULT true,
  enable_election_updates BOOLEAN DEFAULT true,
  
  -- System notifications
  enable_system_notifications BOOLEAN DEFAULT true,
  enable_verification_notifications BOOLEAN DEFAULT true,
  enable_security_notifications BOOLEAN DEFAULT true,
  
  -- Delivery preferences
  enable_email_digest BOOLEAN DEFAULT false,
  email_digest_frequency TEXT DEFAULT 'weekly',
  enable_push_notifications BOOLEAN DEFAULT false,
  
  -- Privacy and filtering
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  snooze_until TIMESTAMP WITH TIME ZONE,
  geo_filter_enabled BOOLEAN DEFAULT true,
  preferred_regions TEXT[],
  
  -- Muted entities
  muted_conversations UUID[],
  muted_users UUID[],
  muted_politicians UUID[],
  muted_parties UUID[],
  muted_categories TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create broadcast notifications table for admin use
CREATE TABLE IF NOT EXISTS public.broadcast_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type notification_type NOT NULL,
  priority notification_priority DEFAULT 'moderate',
  icon TEXT,
  action_url TEXT,
  target_type TEXT NOT NULL, -- 'all', 'region', 'followers', 'custom'
  target_criteria JSONB DEFAULT '{}',
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_count INTEGER DEFAULT 0,
  delivery_started_at TIMESTAMP WITH TIME ZONE,
  delivery_completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_unread ON public.user_notifications(user_id, is_read, created_at DESC) WHERE NOT is_read;
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON public.user_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_user_notifications_priority ON public.user_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_user_notifications_geo ON public.user_notifications(geo_targeted, target_regions) WHERE geo_targeted;

-- Enable RLS
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.user_notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.user_notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON public.user_notifications;
CREATE POLICY "System can insert notifications"
  ON public.user_notifications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can mark notifications as read" ON public.user_notifications;
CREATE POLICY "Users can mark notifications as read"
  ON public.user_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for notification settings
DROP POLICY IF EXISTS "Users can manage their notification settings" ON public.user_notification_settings;
CREATE POLICY "Users can manage their notification settings"
  ON public.user_notification_settings FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for broadcast notifications (admin only)
DROP POLICY IF EXISTS "Admins can manage broadcast notifications" ON public.broadcast_notifications;
CREATE POLICY "Admins can manage broadcast notifications"
  ON public.broadcast_notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to auto-create default notification settings
CREATE OR REPLACE FUNCTION public.create_default_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created_notification_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_notification_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_notification_settings();

-- Function to send notification to user
CREATE OR REPLACE FUNCTION public.send_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_priority notification_priority DEFAULT 'moderate',
  p_data JSONB DEFAULT '{}',
  p_action_url TEXT DEFAULT NULL,
  p_icon TEXT DEFAULT NULL,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  user_settings RECORD;
BEGIN
  -- Get user notification settings
  SELECT * INTO user_settings 
  FROM public.user_notification_settings 
  WHERE user_id = p_user_id;
  
  -- Check if user wants this type of notification
  IF user_settings IS NULL OR 
     (p_type = 'message' AND NOT user_settings.enable_message_notifications) OR
     (p_type IN ('event_nearby', 'poll_new', 'government_notice', 'policy_update') AND NOT user_settings.enable_civic_notifications) OR
     (p_type IN ('promise_update', 'sentiment_alert', 'election_update') AND NOT user_settings.enable_intelligence_notifications) OR
     (p_type IN ('verification_approved', 'post_deleted', 'profile_issue', 'feature_unlocked') AND NOT user_settings.enable_system_notifications) THEN
    RETURN NULL;
  END IF;
  
  -- Check quiet hours
  IF user_settings.quiet_hours_start IS NOT NULL AND user_settings.quiet_hours_end IS NOT NULL THEN
    IF EXTRACT(HOUR FROM now()) >= EXTRACT(HOUR FROM user_settings.quiet_hours_start) AND
       EXTRACT(HOUR FROM now()) <= EXTRACT(HOUR FROM user_settings.quiet_hours_end) THEN
      RETURN NULL;
    END IF;
  END IF;
  
  -- Check snooze
  IF user_settings.snooze_until IS NOT NULL AND user_settings.snooze_until > now() THEN
    RETURN NULL;
  END IF;
  
  -- Insert notification
  INSERT INTO public.user_notifications (
    user_id, notification_type, priority, title, message, data, action_url, icon, expires_at
  ) VALUES (
    p_user_id, p_type, p_priority, p_title, p_message, p_data, p_action_url, p_icon, p_expires_at
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;