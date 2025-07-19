-- RLS policies for new moderator tables

-- Moderation Appeals policies
ALTER TABLE public.moderation_appeals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view appeals for their submissions"
ON public.moderation_appeals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.moderation_queue mq
    WHERE mq.id = submission_id AND mq.submitted_by = auth.uid()
  )
);

CREATE POLICY "Users can create appeals for their submissions"
ON public.moderation_appeals FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.moderation_queue mq
    WHERE mq.id = submission_id AND mq.submitted_by = auth.uid()
  )
);

CREATE POLICY "Moderators can view appeals for their decisions"
ON public.moderation_appeals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.civic_moderators cm
    JOIN public.moderation_queue mq ON mq.assigned_to = cm.id
    WHERE cm.user_id = auth.uid() AND mq.id = submission_id
  )
);

CREATE POLICY "Moderators can update appeals review"
ON public.moderation_appeals FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.civic_moderators cm
    WHERE cm.user_id = auth.uid() AND cm.id = reviewed_by
  )
);

CREATE POLICY "Admins can manage all appeals"
ON public.moderation_appeals FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Moderator Notifications policies
ALTER TABLE public.moderator_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can view their own notifications"
ON public.moderator_notifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.civic_moderators cm
    WHERE cm.id = moderator_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Moderators can update their notification read status"
ON public.moderator_notifications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.civic_moderators cm
    WHERE cm.id = moderator_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "System can create notifications"
ON public.moderator_notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications"
ON public.moderator_notifications FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Moderator Guidelines policies
ALTER TABLE public.moderator_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active guidelines are viewable by moderators"
ON public.moderator_guidelines FOR SELECT
USING (
  is_active = true AND (
    EXISTS (
      SELECT 1 FROM public.civic_moderators
      WHERE user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Admins can manage all guidelines"
ON public.moderator_guidelines FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Training Progress policies
ALTER TABLE public.moderator_training_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can view their own training progress"
ON public.moderator_training_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.civic_moderators cm
    WHERE cm.id = moderator_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Moderators can update their own training progress"
ON public.moderator_training_progress FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.civic_moderators cm
    WHERE cm.id = moderator_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all training progress"
ON public.moderator_training_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Analytics policies
ALTER TABLE public.moderation_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can view their own analytics"
ON public.moderation_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.civic_moderators cm
    WHERE cm.id = moderator_id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert analytics"
ON public.moderation_analytics FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all analytics"
ON public.moderation_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Helper functions for notifications and analytics
CREATE OR REPLACE FUNCTION public.create_moderator_notification(
  p_moderator_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'medium'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.moderator_notifications (
    moderator_id, notification_type, title, message, action_url, priority
  ) VALUES (
    p_moderator_id, p_type, p_title, p_message, p_action_url, p_priority
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.moderator_notifications
  SET read_at = now()
  WHERE id = p_notification_id
  AND EXISTS (
    SELECT 1 FROM public.civic_moderators cm
    WHERE cm.id = moderator_id AND cm.user_id = auth.uid()
  );
  
  RETURN FOUND;
END;
$$;

-- Trigger to create notification when appeal is filed
CREATE OR REPLACE FUNCTION public.notify_moderator_on_appeal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  assigned_moderator_id UUID;
BEGIN
  -- Get the moderator assigned to the submission
  SELECT assigned_to INTO assigned_moderator_id
  FROM public.moderation_queue
  WHERE id = NEW.submission_id;
  
  IF assigned_moderator_id IS NOT NULL THEN
    PERFORM public.create_moderator_notification(
      assigned_moderator_id,
      'appeal_filed',
      'New Appeal Filed',
      'An appeal has been filed for one of your moderation decisions.',
      '/moderators/appeals/' || NEW.id::text,
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_moderator_on_appeal
AFTER INSERT ON public.moderation_appeals
FOR EACH ROW
EXECUTE FUNCTION public.notify_moderator_on_appeal();