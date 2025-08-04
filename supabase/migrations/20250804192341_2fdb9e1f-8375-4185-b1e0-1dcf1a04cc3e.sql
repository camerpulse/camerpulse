-- Unified Notification System for CamerPulse
-- 1. Create comprehensive notifications table that unifies all notification types
CREATE TABLE IF NOT EXISTS public.unified_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    recipient_id UUID NOT NULL,
    sender_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Classification and routing
    source_module TEXT NOT NULL DEFAULT 'system',
    category TEXT DEFAULT 'general',
    priority INTEGER NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    
    -- Delivery configuration
    delivery_channels TEXT[] DEFAULT ARRAY['in-app'],
    delivery_status JSONB DEFAULT '{}',
    
    -- Targeting and personalization
    language TEXT DEFAULT 'en',
    region_specific TEXT[],
    user_type_specific TEXT[],
    
    -- Action and navigation
    action_url TEXT,
    action_data JSONB DEFAULT '{}',
    requires_action BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Tracking and analytics
    interaction_count INTEGER DEFAULT 0,
    last_interaction_at TIMESTAMP WITH TIME ZONE,
    delivery_attempts INTEGER DEFAULT 0,
    
    -- Status and management
    is_active BOOLEAN DEFAULT true,
    is_system_generated BOOLEAN DEFAULT true,
    batch_id UUID,
    template_id UUID
);

-- 2. User notification preferences table
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    
    -- Channel preferences
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    in_app_enabled BOOLEAN DEFAULT true,
    
    -- Type preferences (comprehensive coverage)
    civic_alerts BOOLEAN DEFAULT true,
    political_updates BOOLEAN DEFAULT true,
    village_updates BOOLEAN DEFAULT true,
    petition_updates BOOLEAN DEFAULT true,
    job_notifications BOOLEAN DEFAULT true,
    marketplace_updates BOOLEAN DEFAULT true,
    community_messages BOOLEAN DEFAULT true,
    admin_notices BOOLEAN DEFAULT true,
    security_alerts BOOLEAN DEFAULT true,
    
    -- Frequency preferences
    email_frequency TEXT DEFAULT 'immediate' CHECK (email_frequency IN ('immediate', 'daily', 'weekly', 'never')),
    digest_time TIME DEFAULT '08:00:00',
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '07:00:00',
    
    -- Geographic and contextual
    region_notifications TEXT[] DEFAULT ARRAY[]::TEXT[],
    language_preference TEXT DEFAULT 'en',
    
    -- Advanced settings
    priority_threshold INTEGER DEFAULT 1 CHECK (priority_threshold BETWEEN 1 AND 5),
    auto_mark_read_after_days INTEGER DEFAULT 30,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(user_id)
);

-- 3. Notification templates for consistency and reusability
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    template_key TEXT NOT NULL UNIQUE,
    template_name TEXT NOT NULL,
    
    -- Template content
    title_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    email_template TEXT,
    push_template TEXT,
    
    -- Template configuration
    default_priority INTEGER DEFAULT 3,
    default_channels TEXT[] DEFAULT ARRAY['in-app'],
    requires_action BOOLEAN DEFAULT false,
    
    -- Categorization
    category TEXT NOT NULL,
    source_module TEXT NOT NULL,
    
    -- Localization
    supported_languages TEXT[] DEFAULT ARRAY['en', 'fr'],
    
    -- Metadata
    variables JSONB DEFAULT '{}', -- Expected template variables
    example_data JSONB DEFAULT '{}',
    description TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Notification delivery log for tracking and analytics
CREATE TABLE IF NOT EXISTS public.notification_delivery_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    notification_id UUID NOT NULL REFERENCES public.unified_notifications(id) ON DELETE CASCADE,
    
    channel TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    
    -- Delivery details
    attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    
    -- Technical details
    provider TEXT,
    provider_id TEXT,
    provider_response JSONB DEFAULT '{}',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Tracking
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Notification batches for bulk operations
CREATE TABLE IF NOT EXISTS public.notification_batches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_name TEXT NOT NULL,
    
    -- Targeting
    target_criteria JSONB NOT NULL DEFAULT '{}',
    estimated_recipients INTEGER DEFAULT 0,
    actual_recipients INTEGER DEFAULT 0,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'processing', 'completed', 'failed', 'cancelled')),
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID NOT NULL,
    template_id UUID REFERENCES public.notification_templates(id),
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Enable RLS on all tables
ALTER TABLE public.unified_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_batches ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for unified_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.unified_notifications FOR SELECT 
USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
ON public.unified_notifications FOR UPDATE 
USING (recipient_id = auth.uid());

CREATE POLICY "System can create notifications" 
ON public.unified_notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications" 
ON public.unified_notifications FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- 8. RLS Policies for user_notification_preferences
CREATE POLICY "Users can manage their own preferences" 
ON public.user_notification_preferences FOR ALL 
USING (user_id = auth.uid());

-- 9. RLS Policies for notification_templates
CREATE POLICY "Templates are viewable by all authenticated users" 
ON public.notification_templates FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage templates" 
ON public.notification_templates FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- 10. RLS Policies for delivery log
CREATE POLICY "Users can view delivery logs for their notifications" 
ON public.notification_delivery_log FOR SELECT 
USING (notification_id IN (SELECT id FROM unified_notifications WHERE recipient_id = auth.uid()));

CREATE POLICY "System can manage delivery logs" 
ON public.notification_delivery_log FOR ALL 
USING (true);

-- 11. RLS Policies for batches
CREATE POLICY "Admins can manage notification batches" 
ON public.notification_batches FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- 12. Create indexes for performance
CREATE INDEX idx_unified_notifications_recipient ON public.unified_notifications(recipient_id);
CREATE INDEX idx_unified_notifications_type ON public.unified_notifications(type);
CREATE INDEX idx_unified_notifications_created_at ON public.unified_notifications(created_at DESC);
CREATE INDEX idx_unified_notifications_priority ON public.unified_notifications(priority);
CREATE INDEX idx_unified_notifications_read_status ON public.unified_notifications(recipient_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_unified_notifications_source_module ON public.unified_notifications(source_module);

CREATE INDEX idx_delivery_log_notification ON public.notification_delivery_log(notification_id);
CREATE INDEX idx_delivery_log_status ON public.notification_delivery_log(status);
CREATE INDEX idx_delivery_log_channel ON public.notification_delivery_log(channel);

-- 13. Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_unified_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_unified_notifications_updated_at
    BEFORE UPDATE ON public.unified_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_unified_notification_updated_at();

CREATE TRIGGER trigger_user_notification_preferences_updated_at
    BEFORE UPDATE ON public.user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_unified_notification_updated_at();

CREATE TRIGGER trigger_notification_templates_updated_at
    BEFORE UPDATE ON public.notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_unified_notification_updated_at();

CREATE TRIGGER trigger_notification_batches_updated_at
    BEFORE UPDATE ON public.notification_batches
    FOR EACH ROW
    EXECUTE FUNCTION update_unified_notification_updated_at();

-- 14. Create function to automatically create user preferences on signup
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Insert default notification templates
INSERT INTO public.notification_templates (template_key, template_name, title_template, body_template, category, source_module, variables) VALUES
('civic_alert_general', 'General Civic Alert', 'Civic Alert: {{title}}', '{{message}}', 'civic', 'civic_alerts', '{"title": "string", "message": "string"}'),
('petition_milestone', 'Petition Milestone', 'Your petition reached {{milestone}} signatures!', 'Congratulations! Your petition "{{petition_title}}" has reached {{milestone}} signatures.', 'civic', 'petitions', '{"milestone": "number", "petition_title": "string"}'),
('job_application_update', 'Job Application Update', 'Update on your application', 'Your application for {{job_title}} at {{company}} has been {{status}}.', 'jobs', 'jobs', '{"job_title": "string", "company": "string", "status": "string"}'),
('village_announcement', 'Village Announcement', 'New announcement from {{village_name}}', '{{announcement_text}}', 'community', 'villages', '{"village_name": "string", "announcement_text": "string"}'),
('marketplace_order_update', 'Order Update', 'Your order #{{order_number}} has been {{status}}', 'Your order from {{vendor_name}} has been {{status}}.', 'marketplace', 'marketplace', '{"order_number": "string", "vendor_name": "string", "status": "string"}'),
('admin_notice', 'Administrative Notice', 'Important Notice: {{subject}}', '{{message}}', 'admin', 'admin', '{"subject": "string", "message": "string"}'),
('security_alert', 'Security Alert', 'Security Alert: {{alert_type}}', '{{alert_message}}', 'security', 'security', '{"alert_type": "string", "alert_message": "string"}');

-- 16. Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.unified_notifications;
ALTER TABLE public.unified_notifications REPLICA IDENTITY FULL;