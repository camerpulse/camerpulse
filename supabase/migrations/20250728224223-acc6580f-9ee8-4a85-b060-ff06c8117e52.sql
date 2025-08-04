-- Create content_reports table for moderation
CREATE TABLE public.content_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  reporter_id UUID NOT NULL,
  reported_user_id UUID,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  moderator_notes TEXT,
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by UUID,
  content_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_settings table for configuration
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_reports
CREATE POLICY "Admins and moderators can manage content reports"
ON public.content_reports
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Users can view reports they created"
ON public.content_reports
FOR SELECT
USING (reporter_id = auth.uid());

CREATE POLICY "Users can create reports"
ON public.content_reports
FOR INSERT
WITH CHECK (reporter_id = auth.uid());

-- RLS Policies for system_settings
CREATE POLICY "Admins can manage system settings"
ON public.system_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Public settings are viewable by all"
ON public.system_settings
FOR SELECT
USING (is_public = true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_reports_updated_at
    BEFORE UPDATE ON public.content_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES
('platform_name', '{"data": "CamerPulse"}', 'Platform name', 'general', true),
('platform_version', '{"data": "1.0.0"}', 'Platform version', 'general', true),
('platform_description', '{"data": "Civic engagement platform for Cameroon"}', 'Platform description', 'general', true),
('maintenance_mode', '{"data": false}', 'Maintenance mode toggle', 'general', false),
('default_language', '{"data": "French"}', 'Default platform language', 'general', true),
('default_currency', '{"data": "FCFA"}', 'Default currency', 'general', true),
('require_email_verification', '{"data": true}', 'Require email verification for new accounts', 'security', false),
('enable_2fa', '{"data": false}', 'Enable two-factor authentication', 'security', false),
('session_timeout', '{"data": 60}', 'Session timeout in minutes', 'security', false),
('auto_moderation_enabled', '{"data": true}', 'Enable automatic content moderation', 'moderation', false),
('content_filtering_enabled', '{"data": true}', 'Enable content filtering', 'moderation', false),
('email_notifications_enabled', '{"data": true}', 'Enable email notifications', 'notifications', false),
('push_notifications_enabled', '{"data": true}', 'Enable push notifications', 'notifications', false),
('sms_notifications_enabled', '{"data": false}', 'Enable SMS notifications', 'notifications', false),
('auto_backup_enabled', '{"data": true}', 'Enable automatic backups', 'database', false),
('backup_frequency_hours', '{"data": 24}', 'Backup frequency in hours', 'database', false),
('data_retention_days', '{"data": 365}', 'Data retention period in days', 'database', false),
('primary_color', '{"data": "#10b981"}', 'Primary brand color', 'appearance', true),
('secondary_color', '{"data": "#3b82f6"}', 'Secondary brand color', 'appearance', true),
('dark_mode_default', '{"data": false}', 'Enable dark mode by default', 'appearance', true),
('api_rate_limit', '{"data": 1000}', 'API rate limit per minute', 'api', false),
('api_logging_enabled', '{"data": true}', 'Enable API logging', 'api', false),
('api_analytics_enabled', '{"data": true}', 'Enable API analytics', 'api', false);