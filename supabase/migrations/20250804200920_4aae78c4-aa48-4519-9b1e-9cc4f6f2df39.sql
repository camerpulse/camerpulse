-- Create notification analytics table
CREATE TABLE IF NOT EXISTS public.notification_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('notification_viewed', 'notification_clicked', 'notification_dismissed', 'preference_updated')),
    notification_id UUID,
    notification_type TEXT,
    device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
    user_agent TEXT,
    engagement_time_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user push tokens table
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('web', 'android', 'ios')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, token)
);

-- Add RLS policies
ALTER TABLE public.notification_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Analytics policies
CREATE POLICY "Users can create their analytics events" ON public.notification_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" ON public.notification_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Push tokens policies
CREATE POLICY "Users can manage their push tokens" ON public.user_push_tokens
    FOR ALL USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_analytics_user_event ON public.notification_analytics(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_notification ON public.notification_analytics(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_created_at ON public.notification_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_active ON public.user_push_tokens(user_id, is_active);

-- Add updated_at trigger for push tokens
CREATE TRIGGER update_user_push_tokens_updated_at
    BEFORE UPDATE ON public.user_push_tokens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add new preferences to existing table
DO $$
BEGIN
    -- Add email preferences if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_notification_preferences' 
                   AND column_name = 'email_enabled') THEN
        ALTER TABLE public.user_notification_preferences 
        ADD COLUMN email_enabled BOOLEAN NOT NULL DEFAULT true,
        ADD COLUMN push_enabled BOOLEAN NOT NULL DEFAULT true,
        ADD COLUMN sms_enabled BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN in_app_enabled BOOLEAN NOT NULL DEFAULT true,
        ADD COLUMN email_frequency TEXT NOT NULL DEFAULT 'immediate' CHECK (email_frequency IN ('immediate', 'daily', 'weekly', 'never')),
        ADD COLUMN digest_time TIME NOT NULL DEFAULT '09:00:00',
        ADD COLUMN quiet_hours_start TIME NOT NULL DEFAULT '22:00:00',
        ADD COLUMN quiet_hours_end TIME NOT NULL DEFAULT '07:00:00',
        ADD COLUMN priority_threshold INTEGER NOT NULL DEFAULT 2;
    END IF;
END $$;