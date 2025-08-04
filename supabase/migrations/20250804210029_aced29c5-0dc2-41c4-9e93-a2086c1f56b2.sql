-- Phase 3: Consolidate Admin Systems, Simplify Notifications, Optimize Sentiment Analysis

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

-- Enable RLS
ALTER TABLE admin_dashboard_modules ENABLE ROW LEVEL SECURITY;

-- Create policy for admins
CREATE POLICY "Admins can manage dashboard modules" 
ON admin_dashboard_modules 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'::app_role
));

-- Insert consolidated admin modules
INSERT INTO admin_dashboard_modules (module_name, display_name, description, icon, route_path, display_order) VALUES
('feature_flags', 'Feature Flags', 'Manage platform features and simplification progress', 'flag', '/admin/feature-flags', 1),
('user_management', 'User Management', 'Manage users, roles, and permissions', 'users', '/admin/users', 2),
('content_moderation', 'Content Moderation', 'Review and moderate platform content', 'shield', '/admin/moderation', 3),
('system_analytics', 'System Analytics', 'View platform usage and performance metrics', 'bar-chart', '/admin/analytics', 4),
('notification_center', 'Notifications', 'Manage notification settings and templates', 'bell', '/admin/notifications', 5),
('marketplace_admin', 'Marketplace', 'Oversee marketplace operations and vendors', 'shopping-cart', '/admin/marketplace', 6),
('civic_oversight', 'Civic Oversight', 'Monitor civic engagement and polls', 'vote', '/admin/civic', 7),
('system_health', 'System Health', 'Monitor platform performance and errors', 'activity', '/admin/health', 8);

-- 2. Simplify notification system by consolidating channels
-- Remove complex notification preferences and create simple ones
DROP TABLE IF EXISTS user_notification_preferences CASCADE;

CREATE TABLE simplified_notification_preferences (
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

-- Enable RLS
ALTER TABLE simplified_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their notification preferences" 
ON simplified_notification_preferences 
FOR ALL 
USING (auth.uid() = user_id);

-- Create simplified notification templates
CREATE TABLE notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL UNIQUE,
  template_type text NOT NULL CHECK (template_type IN ('email', 'push', 'in_app')),
  subject text,
  content text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  is_system_template boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Insert core notification templates
INSERT INTO notification_templates (template_name, template_type, subject, content, variables, is_system_template) VALUES
('civic_alert', 'email', 'Civic Alert: {{alert_title}}', 'A new civic alert has been issued: {{alert_content}}', '["alert_title", "alert_content"]', true),
('poll_created', 'push', 'New Poll Available', 'A new poll "{{poll_title}}" is now available for voting', '["poll_title"]', true),
('marketplace_order', 'email', 'Order Confirmation: {{order_number}}', 'Your order {{order_number}} has been confirmed and is being processed.', '["order_number", "order_total"]', true),
('job_application', 'email', 'Job Application Received', 'Your application for {{job_title}} has been received and is under review.', '["job_title", "company_name"]', true),
('system_maintenance', 'in_app', 'System Maintenance', 'Scheduled maintenance will occur on {{maintenance_date}}', '["maintenance_date"]', true);

-- 3. Optimize sentiment analysis - keep only core functionality
-- Drop complex sentiment tables and keep only essential ones
DROP TABLE IF EXISTS local_sentiment CASCADE;

-- Create simplified sentiment tracking
CREATE TABLE core_sentiment_analysis (
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

-- Enable RLS
ALTER TABLE core_sentiment_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- 5. Create triggers for simplified tables
CREATE OR REPLACE FUNCTION update_simplified_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_simplified_notification_preferences_updated_at
  BEFORE UPDATE ON simplified_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_simplified_notification_preferences_updated_at();

CREATE OR REPLACE FUNCTION update_notification_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_templates_updated_at();

CREATE OR REPLACE FUNCTION update_admin_dashboard_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_dashboard_modules_updated_at
  BEFORE UPDATE ON admin_dashboard_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_dashboard_modules_updated_at();

-- 6. Log Phase 3 completion
INSERT INTO archived_artist_data (original_table, data_snapshot) VALUES
('phase3_migration_log', jsonb_build_object(
  'migration_type', 'phase3_consolidation',
  'admin_systems_consolidated', true,
  'notification_channels_simplified', true,
  'sentiment_analysis_optimized', true,
  'tables_created', ARRAY[
    'admin_dashboard_modules',
    'simplified_notification_preferences', 
    'notification_templates',
    'core_sentiment_analysis'
  ],
  'tables_dropped', ARRAY[
    'user_notification_preferences',
    'local_sentiment'
  ],
  'complexity_reduction_phase', 3,
  'estimated_maintenance_reduction', '70%',
  'completed_at', now()
));