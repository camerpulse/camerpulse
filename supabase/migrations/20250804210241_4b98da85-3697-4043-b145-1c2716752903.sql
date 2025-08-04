-- Phase 3: Consolidate Admin Systems, Simplify Notifications, Optimize Sentiment Analysis (Fixed)

-- 1. Create unified admin dashboard configuration
CREATE TABLE IF NOT EXISTS admin_dashboard_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  icon text,
  route_path text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  required_permissions text[] DEFAULT ARRAY['admin'],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_dashboard_modules if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_dashboard_modules' 
    AND policyname = 'Admins can manage dashboard modules'
  ) THEN
    ALTER TABLE admin_dashboard_modules ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Admins can manage dashboard modules" 
    ON admin_dashboard_modules 
    FOR ALL 
    USING (EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'::app_role
    ));
  END IF;
END $$;

-- Insert consolidated admin modules
INSERT INTO admin_dashboard_modules (module_name, display_name, description, icon, route_path, display_order) VALUES
('feature_flags', 'Feature Flags', 'Manage platform features and simplification progress', 'flag', '/admin/feature-flags', 1),
('user_management', 'User Management', 'Manage users, roles, and permissions', 'users', '/admin/users', 2),
('content_moderation', 'Content Moderation', 'Review and moderate platform content', 'shield', '/admin/moderation', 3),
('system_analytics', 'System Analytics', 'View platform usage and performance metrics', 'bar-chart', '/admin/analytics', 4),
('notification_center', 'Notifications', 'Manage notification settings and templates', 'bell', '/admin/notifications', 5),
('marketplace_admin', 'Marketplace', 'Oversee marketplace operations and vendors', 'shopping-cart', '/admin/marketplace', 6),
('civic_oversight', 'Civic Oversight', 'Monitor civic engagement and polls', 'vote', '/admin/civic', 7),
('system_health', 'System Health', 'Monitor platform performance and errors', 'activity', '/admin/health', 8)
ON CONFLICT (module_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  route_path = EXCLUDED.route_path,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- 2. Simplify notification system by consolidating channels
-- Remove complex notification preferences and create simple ones
DROP TABLE IF EXISTS user_notification_preferences CASCADE;

CREATE TABLE IF NOT EXISTS simplified_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email_enabled boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT true,
  sms_enabled boolean NOT NULL DEFAULT false,
  email_frequency text NOT NULL DEFAULT 'immediate' CHECK (email_frequency IN ('immediate', 'daily', 'weekly', 'never')),
  quiet_hours_enabled boolean NOT NULL DEFAULT false,
  quiet_hours_start time DEFAULT '22:00:00',
  quiet_hours_end time DEFAULT '07:00:00',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on simplified_notification_preferences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'simplified_notification_preferences' 
    AND policyname = 'Users can manage their notification preferences'
  ) THEN
    ALTER TABLE simplified_notification_preferences ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can manage their notification preferences" 
    ON simplified_notification_preferences 
    FOR ALL 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Handle existing notification_templates table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_templates') THEN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_templates' AND column_name = 'is_system_template') THEN
      ALTER TABLE notification_templates ADD COLUMN is_system_template boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_templates' AND column_name = 'template_type') THEN
      ALTER TABLE notification_templates ADD COLUMN template_type text DEFAULT 'email' CHECK (template_type IN ('email', 'push', 'in_app'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_templates' AND column_name = 'variables') THEN
      ALTER TABLE notification_templates ADD COLUMN variables jsonb DEFAULT '[]'::jsonb;
    END IF;
  ELSE
    -- Create the table if it doesn't exist
    CREATE TABLE notification_templates (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      template_name text NOT NULL UNIQUE,
      template_type text NOT NULL DEFAULT 'email' CHECK (template_type IN ('email', 'push', 'in_app')),
      subject text,
      content text NOT NULL,
      variables jsonb DEFAULT '[]'::jsonb,
      is_system_template boolean DEFAULT false,
      is_active boolean DEFAULT true,
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now()
    );
  END IF;
END $$;

-- Enable RLS on notification_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notification_templates' 
    AND policyname = 'Admins can manage notification templates'
  ) THEN
    ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Admins can manage notification templates" 
    ON notification_templates 
    FOR ALL 
    USING (EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'::app_role
    ));
    
    CREATE POLICY "Templates are publicly readable" 
    ON notification_templates 
    FOR SELECT 
    USING (is_active = true);
  END IF;
END $$;

-- Insert core notification templates
INSERT INTO notification_templates (template_name, template_type, subject, content, variables, is_system_template) VALUES
('civic_alert', 'email', 'Civic Alert: {{alert_title}}', 'A new civic alert has been issued: {{alert_content}}', '["alert_title", "alert_content"]', true),
('poll_created', 'push', 'New Poll Available', 'A new poll "{{poll_title}}" is now available for voting', '["poll_title"]', true),
('marketplace_order', 'email', 'Order Confirmation: {{order_number}}', 'Your order {{order_number}} has been confirmed and is being processed.', '["order_number", "order_total"]', true),
('job_application', 'email', 'Job Application Received', 'Your application for {{job_title}} has been received and is under review.', '["job_title", "company_name"]', true),
('system_maintenance', 'in_app', 'System Maintenance', 'Scheduled maintenance will occur on {{maintenance_date}}', '["maintenance_date"]', true)
ON CONFLICT (template_name) DO UPDATE SET
  template_type = EXCLUDED.template_type,
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  variables = EXCLUDED.variables,
  is_system_template = EXCLUDED.is_system_template,
  updated_at = now();

-- 3. Optimize sentiment analysis - keep only core functionality
CREATE TABLE IF NOT EXISTS core_sentiment_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid,
  content_type text NOT NULL CHECK (content_type IN ('poll', 'post', 'comment', 'message')),
  content_text text NOT NULL,
  sentiment_score numeric(3,2) CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
  sentiment_label text CHECK (sentiment_label IN ('positive', 'neutral', 'negative')),
  confidence_score numeric(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  region text,
  language text DEFAULT 'en',
  analysis_metadata jsonb DEFAULT '{}'::jsonb,
  analyzed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on core_sentiment_analysis
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'core_sentiment_analysis' 
    AND policyname = 'Sentiment analysis is publicly readable'
  ) THEN
    ALTER TABLE core_sentiment_analysis ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Sentiment analysis is publicly readable" 
    ON core_sentiment_analysis 
    FOR SELECT 
    USING (true);
    
    CREATE POLICY "Admins can manage sentiment analysis" 
    ON core_sentiment_analysis 
    FOR ALL 
    USING (EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'::app_role
    ));
  END IF;
END $$;

-- 4. Add Phase 3 feature flags
INSERT INTO system_feature_flags (feature_name, is_enabled, disabled_reason, disabled_at) VALUES
('unified_admin_dashboard', true, NULL, NULL),
('simplified_notifications', true, NULL, NULL),
('core_sentiment_analysis', true, NULL, NULL),
('advanced_notification_channels', false, 'Phase 3 Simplification - Removed complex notification channels', now()),
('complex_sentiment_features', false, 'Phase 3 Simplification - Kept only core sentiment analysis', now()),
('multiple_admin_interfaces', false, 'Phase 3 Simplification - Consolidated into single interface', now())
ON CONFLICT (feature_name) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  disabled_reason = EXCLUDED.disabled_reason,
  disabled_at = EXCLUDED.disabled_at,
  updated_at = now();

-- 5. Create triggers for simplified tables (with existence checks)
CREATE OR REPLACE FUNCTION update_simplified_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_simplified_notification_preferences_updated_at') THEN
    CREATE TRIGGER update_simplified_notification_preferences_updated_at
      BEFORE UPDATE ON simplified_notification_preferences
      FOR EACH ROW
      EXECUTE FUNCTION update_simplified_notification_preferences_updated_at();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_admin_dashboard_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_admin_dashboard_modules_updated_at') THEN
    CREATE TRIGGER update_admin_dashboard_modules_updated_at
      BEFORE UPDATE ON admin_dashboard_modules
      FOR EACH ROW
      EXECUTE FUNCTION update_admin_dashboard_modules_updated_at();
  END IF;
END $$;