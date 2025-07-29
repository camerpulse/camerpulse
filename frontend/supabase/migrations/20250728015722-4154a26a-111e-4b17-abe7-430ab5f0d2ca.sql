-- Create scheduled notifications table (fixing table references)
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_id UUID REFERENCES public.notification_templates(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'moderate',
  data JSONB DEFAULT '{}'::jsonb,
  action_url TEXT,
  icon TEXT,
  target_regions TEXT[],
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create rich notification attachments table
CREATE TABLE IF NOT EXISTS public.notification_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL,
  attachment_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notification actions table
CREATE TABLE IF NOT EXISTS public.notification_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  label TEXT NOT NULL,
  action_url TEXT,
  action_data JSONB DEFAULT '{}'::jsonb,
  style TEXT DEFAULT 'default',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_attachments ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.notification_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scheduled_notifications
CREATE POLICY "Users can manage their scheduled notifications" ON public.scheduled_notifications
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Admins can manage all scheduled notifications" ON public.scheduled_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for notification_attachments
CREATE POLICY "Users can view attachments for their notifications" ON public.notification_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.id::text = notification_attachments.notification_id::text 
      AND n.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage attachments" ON public.notification_attachments
  FOR ALL USING (true);

-- RLS Policies for notification_actions  
CREATE POLICY "Users can view actions for their notifications" ON public.notification_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.id::text = notification_actions.notification_id::text 
      AND n.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage actions" ON public.notification_actions
  FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for ON public.scheduled_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status ON public.scheduled_notifications(status);
CREATE INDEX IF NOT EXISTS idx_notification_attachments_notification_id ON public.notification_attachments(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_actions_notification_id ON public.notification_actions(notification_id);

-- Update the function to process scheduled notifications with correct table reference
CREATE OR REPLACE FUNCTION public.process_scheduled_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  scheduled_notification RECORD;
BEGIN
  FOR scheduled_notification IN 
    SELECT * FROM public.scheduled_notifications 
    WHERE status = 'pending' 
    AND scheduled_for <= now()
    AND retry_count < max_retries
  LOOP
    BEGIN
      -- Insert the notification into the correct table
      INSERT INTO public.notifications (
        user_id, notification_type, priority, title, message, 
        data, action_url, icon
      ) VALUES (
        scheduled_notification.user_id,
        scheduled_notification.notification_type,
        scheduled_notification.priority,
        scheduled_notification.title,
        scheduled_notification.message,
        scheduled_notification.data,
        scheduled_notification.action_url,
        scheduled_notification.icon
      );
      
      -- Mark as sent
      UPDATE public.scheduled_notifications 
      SET status = 'sent', sent_at = now(), updated_at = now()
      WHERE id = scheduled_notification.id;
      
    EXCEPTION WHEN OTHERS THEN
      -- Update retry count and error message
      UPDATE public.scheduled_notifications 
      SET 
        retry_count = retry_count + 1,
        error_message = SQLERRM,
        status = CASE 
          WHEN retry_count + 1 >= max_retries THEN 'failed'
          ELSE 'pending'
        END,
        updated_at = now()
      WHERE id = scheduled_notification.id;
    END;
  END LOOP;
END;
$$;