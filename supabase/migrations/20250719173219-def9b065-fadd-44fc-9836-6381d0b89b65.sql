-- Create notification flow chart system

-- Notification channels enum
CREATE TYPE notification_channel AS ENUM ('email', 'in_app', 'push', 'sms', 'whatsapp');

-- Notification status enum  
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'retrying');

-- User types enum
CREATE TYPE user_type AS ENUM ('artist', 'fan', 'admin', 'event_attendee');

-- Notification event types
CREATE TYPE notification_event_type AS ENUM (
  'artist_profile_submitted',
  'artist_verified', 
  'artist_denied',
  'artist_new_follower',
  'artist_award_nomination',
  'artist_award_win',
  'new_song_uploaded',
  'song_milestone_reached',
  'new_event_published',
  'ticket_purchased',
  'event_reminder_24h',
  'event_cancelled',
  'voting_opens',
  'voting_closes'
);

-- Notification flow definitions table
CREATE TABLE public.notification_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_name TEXT NOT NULL,
  event_type notification_event_type NOT NULL,
  recipient_type user_type NOT NULL,
  channel notification_channel NOT NULL,
  template_id UUID,
  condition_logic JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 5,
  delay_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Notification templates table
CREATE TABLE public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  channel notification_channel NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User notification preferences
CREATE TABLE public.user_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type notification_event_type NOT NULL,
  channel notification_channel NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_type, channel)
);

-- Notification logs table
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES notification_flows(id),
  recipient_id UUID NOT NULL,
  event_type notification_event_type NOT NULL,
  channel notification_channel NOT NULL,
  status notification_status NOT NULL DEFAULT 'pending',
  template_data JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notification metrics table
CREATE TABLE public.notification_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  log_id UUID NOT NULL REFERENCES notification_logs(id),
  event_type TEXT NOT NULL,
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.notification_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification flows
CREATE POLICY "Admins can manage flows" ON public.notification_flows
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can view active flows" ON public.notification_flows
  FOR SELECT USING (is_active = true);

-- RLS policies for templates
CREATE POLICY "Admins can manage templates" ON public.notification_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- RLS policies for user preferences
CREATE POLICY "Users can manage their preferences" ON public.user_notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for logs
CREATE POLICY "Admins can view all logs" ON public.notification_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view their own logs" ON public.notification_logs
  FOR SELECT USING (auth.uid() = recipient_id);

-- RLS policies for metrics
CREATE POLICY "Admins can view metrics" ON public.notification_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create indexes for performance
CREATE INDEX idx_notification_flows_event_type ON notification_flows(event_type);
CREATE INDEX idx_notification_logs_recipient ON notification_logs(recipient_id);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_user_preferences_user_event ON user_notification_preferences(user_id, event_type);

-- Insert default notification templates
INSERT INTO public.notification_templates (template_name, channel, subject, content, variables) VALUES
('artist_welcome', 'email', 'Welcome to CamerPlay!', 'Hi {{ artist_name }}, welcome to CamerPlay! Your profile is being reviewed.', '["artist_name"]'),
('artist_verified', 'email', '🎉 You''re Verified on CamerPlay!', 'Congratulations {{ artist_name }}! Your CamerPlay artist profile has been verified.', '["artist_name"]'),
('new_song_notification', 'email', '🎧 {{ artist_name }} Just Dropped Something New!', 'Hey {{ fan_name }}, {{ artist_name }} just released "{{ song_title }}"!', '["fan_name", "artist_name", "song_title"]'),
('ticket_confirmation', 'email', '🎟️ Your CamerPlay Ticket', 'Hi {{ full_name }}, your ticket for {{ event_name }} is confirmed!', '["full_name", "event_name"]'),
('award_nomination', 'email', '🏆 Congratulations! You''ve Been Nominated', 'Hi {{ artist_name }}, you''ve been nominated for {{ award_category }}!', '["artist_name", "award_category"]');

-- Insert default notification flows
INSERT INTO public.notification_flows (flow_name, event_type, recipient_type, channel, template_id, priority) 
SELECT 
  'Artist Welcome Email',
  'artist_profile_submitted',
  'artist',
  'email',
  (SELECT id FROM notification_templates WHERE template_name = 'artist_welcome'),
  10;

INSERT INTO public.notification_flows (flow_name, event_type, recipient_type, channel, template_id, priority)
SELECT
  'Artist Verification Email', 
  'artist_verified',
  'artist',
  'email',
  (SELECT id FROM notification_templates WHERE template_name = 'artist_verified'),
  10;

INSERT INTO public.notification_flows (flow_name, event_type, recipient_type, channel, template_id, priority)
SELECT
  'New Song Fan Notification',
  'new_song_uploaded', 
  'fan',
  'email',
  (SELECT id FROM notification_templates WHERE template_name = 'new_song_notification'),
  8;