-- Create notification templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'moderate',
  category TEXT NOT NULL DEFAULT 'system',
  supports_variables BOOLEAN DEFAULT true,
  variables_schema JSONB DEFAULT '[]'::jsonb,
  default_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scheduled notifications table
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

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_templates
CREATE POLICY "Admins can manage notification templates" ON public.notification_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can view active templates" ON public.notification_templates
  FOR SELECT USING (is_active = true);

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
      SELECT 1 FROM pulse_notifications pn 
      WHERE pn.id::text = notification_attachments.notification_id::text 
      AND pn.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage attachments" ON public.notification_attachments
  FOR ALL USING (true);

-- RLS Policies for notification_actions  
CREATE POLICY "Users can view actions for their notifications" ON public.notification_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pulse_notifications pn 
      WHERE pn.id::text = notification_actions.notification_id::text 
      AND pn.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage actions" ON public.notification_actions
  FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for ON public.scheduled_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status ON public.scheduled_notifications(status);
CREATE INDEX IF NOT EXISTS idx_notification_attachments_notification_id ON public.notification_attachments(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_actions_notification_id ON public.notification_actions(notification_id);

-- Create function to process scheduled notifications
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
      -- Insert the notification
      INSERT INTO public.pulse_notifications (
        user_id, notification_type, priority, title, message, 
        data, action_url, icon, target_regions
      ) VALUES (
        scheduled_notification.user_id,
        scheduled_notification.notification_type,
        scheduled_notification.priority,
        scheduled_notification.title,
        scheduled_notification.message,
        scheduled_notification.data,
        scheduled_notification.action_url,
        scheduled_notification.icon,
        scheduled_notification.target_regions
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

-- Insert default notification templates
INSERT INTO public.notification_templates (name, title_template, message_template, notification_type, priority, category, variables_schema) VALUES
('welcome_message', 'Welcome {{user_name}}!', 'Welcome to our platform, {{user_name}}! We''re excited to have you join us.', 'system', 'moderate', 'onboarding', '[{"name": "user_name", "type": "string", "required": true}]'),
('milestone_achievement', 'Congratulations {{user_name}}!', 'You''ve reached {{milestone_name}}! Keep up the great work.', 'achievement', 'moderate', 'engagement', '[{"name": "user_name", "type": "string", "required": true}, {"name": "milestone_name", "type": "string", "required": true}]'),
('security_alert', 'Security Alert', 'Unusual activity detected on your account. Please review your recent activity.', 'security', 'critical', 'security', '[]'),
('reminder_notification', 'Reminder: {{task_name}}', 'Don''t forget about {{task_name}} scheduled for {{task_time}}.', 'reminder', 'moderate', 'productivity', '[{"name": "task_name", "type": "string", "required": true}, {"name": "task_time", "type": "string", "required": true}]')
ON CONFLICT (name) DO NOTHING;