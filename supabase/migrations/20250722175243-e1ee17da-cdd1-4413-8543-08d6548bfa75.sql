-- Create senator notifications table for email tracking
CREATE TABLE public.senator_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  senator_id UUID,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID,
  notification_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_id TEXT, -- Resend email ID
  delivery_status TEXT DEFAULT 'sent',
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email preferences table
CREATE TABLE public.senator_email_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  senator_claim_notifications BOOLEAN DEFAULT true,
  senator_report_notifications BOOLEAN DEFAULT true,
  senator_message_notifications BOOLEAN DEFAULT true,
  general_notifications BOOLEAN DEFAULT true,
  email_frequency TEXT DEFAULT 'immediate', -- immediate, daily, weekly
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.senator_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senator_email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for senator_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.senator_notifications 
FOR SELECT 
USING (recipient_user_id = auth.uid() OR recipient_email = (
  SELECT email FROM auth.users WHERE id = auth.uid()
));

CREATE POLICY "Admins can view all notifications" 
ON public.senator_notifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System can create notifications" 
ON public.senator_notifications 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for senator_email_preferences
CREATE POLICY "Users can manage their own email preferences" 
ON public.senator_email_preferences 
FOR ALL 
USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_senator_notifications_senator_id ON public.senator_notifications(senator_id);
CREATE INDEX idx_senator_notifications_recipient_email ON public.senator_notifications(recipient_email);
CREATE INDEX idx_senator_notifications_type ON public.senator_notifications(notification_type);
CREATE INDEX idx_senator_notifications_sent_at ON public.senator_notifications(sent_at);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_senator_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_senator_notifications_updated_at
BEFORE UPDATE ON public.senator_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_senator_email_updated_at();

CREATE TRIGGER update_senator_email_preferences_updated_at
BEFORE UPDATE ON public.senator_email_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_senator_email_updated_at();