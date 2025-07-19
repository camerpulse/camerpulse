-- Add WhatsApp support to notification system
ALTER TYPE notification_channel ADD VALUE IF NOT EXISTS 'whatsapp';

-- Add WhatsApp preferences for users
CREATE TABLE IF NOT EXISTS public.user_whatsapp_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone_number TEXT,
  whatsapp_enabled BOOLEAN NOT NULL DEFAULT false,
  country_code TEXT DEFAULT '+237',
  verified_at TIMESTAMP WITH TIME ZONE,
  opt_in_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_whatsapp_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their WhatsApp preferences" ON public.user_whatsapp_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all WhatsApp preferences" ON public.user_whatsapp_preferences
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- API configuration table for admin settings
CREATE TABLE IF NOT EXISTS public.api_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  api_key TEXT,
  base_url TEXT,
  additional_config JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for API configs
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;

-- Only admins can manage API configurations
CREATE POLICY "Admins can manage API configurations" ON public.api_configurations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Insert WhatsApp service configuration placeholder
INSERT INTO public.api_configurations (service_name, base_url, additional_config, is_active)
VALUES (
  'sendchamp_whatsapp',
  'https://api.sendchamp.com/api/v1',
  '{"sender_id": "CamerPlay", "template_approval_required": true}',
  false
) ON CONFLICT (service_name) DO NOTHING;

-- WhatsApp message templates for approved content
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL UNIQUE,
  template_id TEXT, -- SendChamp template ID when approved
  event_type notification_event_type,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  approval_status TEXT DEFAULT 'pending',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for WhatsApp templates
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Admins can manage WhatsApp templates
CREATE POLICY "Admins can manage WhatsApp templates" ON public.whatsapp_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Insert WhatsApp templates for critical notifications
INSERT INTO public.whatsapp_templates (template_name, event_type, content, variables, approval_status) VALUES
('ticket_confirmation', 'ticket_purchased', 
'Hi {{user_name}}, your ticket for {{event_name}} is confirmed! 📍 Location: {{location}} 📅 Date: {{event_time}} 🎟️ View Ticket: {{ticket_url}} Thank you for supporting CamerPlay!',
'{"user_name": "string", "event_name": "string", "location": "string", "event_time": "string", "ticket_url": "string"}',
'pending'),

('event_reminder_24h', 'event_reminder_24h',
'⏰ Reminder: {{event_name}} is happening tomorrow! 🕒 {{event_time}} 📍 {{location}} Don''t miss it — CamerPlay will be there with you!',
'{"event_name": "string", "event_time": "string", "location": "string"}',
'pending'),

('award_voting_open', 'voting_opens',
'🏆 Voting is now open for {{award_name}}! Tap here to vote: {{voting_url}} Support your favorite artist on CamerPlay!',
'{"award_name": "string", "voting_url": "string"}',
'pending'),

('new_song_alert', 'new_song_uploaded',
'🎵 {{artist_name}} just dropped new music on CamerPlay! Listen now: {{song_url}} You''re getting this because you follow {{artist_name}}.',
'{"artist_name": "string", "song_url": "string"}',
'pending'),

('event_cancelled', 'event_cancelled',
'🛑 IMPORTANT: {{event_name}} scheduled for {{event_time}} has been cancelled. Refund details: {{refund_info}} We apologize for any inconvenience.',
'{"event_name": "string", "event_time": "string", "refund_info": "string"}',
'pending');

-- WhatsApp message logs for tracking
CREATE TABLE IF NOT EXISTS public.whatsapp_message_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  template_name TEXT,
  message_content TEXT,
  status TEXT DEFAULT 'pending',
  sendchamp_message_id TEXT,
  delivery_status TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS for message logs
ALTER TABLE public.whatsapp_message_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own message logs, admins can view all
CREATE POLICY "Users can view their WhatsApp logs" ON public.whatsapp_message_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all WhatsApp logs" ON public.whatsapp_message_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_whatsapp_preferences_user_id ON user_whatsapp_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_message_logs_user_id ON whatsapp_message_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_message_logs_status ON whatsapp_message_logs(status);