-- Create poll reports table for user flagging
CREATE TABLE public.poll_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  reported_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  report_reason TEXT NOT NULL CHECK (report_reason IN ('offensive_content', 'misinformation', 'hate_speech', 'fake_identity', 'spam_or_bot')),
  report_message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create poll moderation log table for admin actions
CREATE TABLE public.poll_moderation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  report_id UUID REFERENCES public.poll_reports(id) ON DELETE SET NULL,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('hide_poll', 'ban_poll', 'warn_creator', 'dismiss_report', 'approve_report')),
  action_reason TEXT,
  creator_notified BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll moderation settings table
CREATE TABLE public.poll_moderation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_hide_after_reports INTEGER DEFAULT 5,
  require_admin_review BOOLEAN DEFAULT true,
  notify_creator_on_action BOOLEAN DEFAULT true,
  ban_duration_days INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default moderation settings
INSERT INTO public.poll_moderation_settings (auto_hide_after_reports, require_admin_review, notify_creator_on_action) 
VALUES (5, true, true);

-- Enable RLS on all tables
ALTER TABLE public.poll_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_moderation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_moderation_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for poll_reports
CREATE POLICY "Anyone can report polls" ON public.poll_reports
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their own reports" ON public.poll_reports
FOR SELECT TO authenticated
USING (reported_by_user_id = auth.uid());

CREATE POLICY "Admins can view all reports" ON public.poll_reports
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can update reports" ON public.poll_reports
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for poll_moderation_log
CREATE POLICY "Admins can manage moderation log" ON public.poll_moderation_log
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for poll_moderation_settings
CREATE POLICY "Admins can manage moderation settings" ON public.poll_moderation_settings
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Function to auto-hide polls after reaching report threshold
CREATE OR REPLACE FUNCTION public.check_poll_report_threshold()
RETURNS TRIGGER AS $$
DECLARE
  report_count INTEGER;
  threshold INTEGER;
  poll_record RECORD;
BEGIN
  -- Get current settings
  SELECT auto_hide_after_reports INTO threshold 
  FROM public.poll_moderation_settings 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Count reports for this poll
  SELECT COUNT(*) INTO report_count
  FROM public.poll_reports
  WHERE poll_id = NEW.poll_id 
  AND status = 'pending';
  
  -- Auto-hide if threshold reached
  IF report_count >= threshold THEN
    -- Get poll details
    SELECT * INTO poll_record FROM public.polls WHERE id = NEW.poll_id;
    
    -- Hide the poll
    UPDATE public.polls 
    SET is_active = false 
    WHERE id = NEW.poll_id;
    
    -- Log the action
    INSERT INTO public.poll_moderation_log (
      poll_id, admin_id, action_type, action_reason, metadata
    ) VALUES (
      NEW.poll_id, 
      '00000000-0000-0000-0000-000000000000'::UUID, -- System user
      'hide_poll', 
      'Auto-hidden after reaching report threshold',
      jsonb_build_object('report_count', report_count, 'threshold', threshold)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check report threshold
CREATE TRIGGER trigger_check_poll_report_threshold
  AFTER INSERT ON public.poll_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.check_poll_report_threshold();

-- Function to get moderation statistics
CREATE OR REPLACE FUNCTION public.get_moderation_stats()
RETURNS JSONB AS $$
DECLARE
  pending_reports INTEGER;
  total_reports INTEGER;
  hidden_polls INTEGER;
  banned_polls INTEGER;
  result JSONB;
BEGIN
  -- Get counts
  SELECT COUNT(*) INTO pending_reports FROM public.poll_reports WHERE status = 'pending';
  SELECT COUNT(*) INTO total_reports FROM public.poll_reports;
  SELECT COUNT(*) INTO hidden_polls FROM public.polls WHERE is_active = false;
  SELECT COUNT(*) INTO banned_polls FROM public.poll_moderation_log WHERE action_type = 'ban_poll';
  
  result := jsonb_build_object(
    'pending_reports', pending_reports,
    'total_reports', total_reports,
    'hidden_polls', hidden_polls,
    'banned_polls', banned_polls,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;