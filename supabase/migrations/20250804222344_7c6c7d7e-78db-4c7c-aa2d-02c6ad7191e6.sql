-- Phase 3: Consolidate admin systems and simplify notifications

-- Remove redundant admin tables that are no longer needed
DROP TABLE IF EXISTS admin_dashboard_modules CASCADE;
DROP TABLE IF EXISTS camerpulse_module_registry CASCADE;
DROP TABLE IF EXISTS cache_status_tracking CASCADE;

-- Simplify notification system - keep only essential tables
DROP TABLE IF EXISTS scheduled_notifications CASCADE;
DROP TABLE IF EXISTS notification_templates CASCADE;
DROP TABLE IF EXISTS notification_template_variables CASCADE;
DROP TABLE IF EXISTS audit_watchlist CASCADE;
DROP TABLE IF EXISTS audit_watchlist_notifications CASCADE;
DROP TABLE IF EXISTS whatsapp_message_logs CASCADE;
DROP TABLE IF EXISTS claim_notifications CASCADE;

-- Create unified notification system
CREATE TABLE IF NOT EXISTS unified_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on unified notifications
ALTER TABLE unified_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for unified notifications
CREATE POLICY "Users can view their own notifications" 
ON unified_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON unified_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON unified_notifications 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_unified_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_unified_notifications_updated_at
  BEFORE UPDATE ON unified_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_unified_notifications_updated_at();

-- Simplify admin roles - keep only essential
UPDATE user_roles SET role = 'admin' WHERE role IN ('super_admin', 'moderator', 'content_manager');

-- Clean up unused admin-related data
DELETE FROM system_feature_flags WHERE feature_name LIKE '%admin%' AND feature_name NOT IN ('admin_access', 'admin_dashboard');