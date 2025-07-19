-- Add missing tables for complete notification system (simplified)

-- User notifications table for in-app notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_notifications') THEN
    CREATE TABLE public.user_notifications (
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

    -- RLS policies
    CREATE POLICY "Users can view their own notifications" ON public.user_notifications
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can update their own notifications" ON public.user_notifications
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "System can create notifications" ON public.user_notifications
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Notification queue table for scheduled/delayed notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_queue') THEN
    CREATE TABLE public.notification_queue (
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

    -- Enable RLS
    ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

    -- RLS policies
    CREATE POLICY "Admins can view queue" ON public.notification_queue
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);