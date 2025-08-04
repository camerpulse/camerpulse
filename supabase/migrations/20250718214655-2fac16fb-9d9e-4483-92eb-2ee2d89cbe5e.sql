-- Update notification_type enum to include civic engagement types
DROP TYPE IF EXISTS notification_type CASCADE;

CREATE TYPE notification_type AS ENUM (
  -- User account notifications
  'message',
  'follow', 
  'profile_view',
  'tag',
  
  -- Civic engagement notifications  
  'event_nearby',
  'poll_new',
  'government_notice',
  'policy_update',
  
  -- Intelligence notifications
  'promise_update',
  'sentiment_alert', 
  'election_update',
  
  -- Platform system notifications
  'verification_approved',
  'post_deleted',
  'profile_issue', 
  'feature_unlocked',
  'broadcast'
);

-- Update existing tables to use the new enum
ALTER TABLE user_notifications ALTER COLUMN notification_type TYPE notification_type USING notification_type::text::notification_type;
ALTER TABLE user_notification_settings ALTER COLUMN muted_categories TYPE text[] USING muted_categories::text[];
ALTER TABLE broadcast_notifications ALTER COLUMN notification_type TYPE notification_type USING notification_type::text::notification_type;

-- Add missing columns to user_notification_settings to match interface
ALTER TABLE user_notification_settings 
ADD COLUMN IF NOT EXISTS enable_message_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_message_push BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_message_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_message_sms BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_civic_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_event_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_government_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_policy_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_intelligence_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_promise_tracking BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_sentiment_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_system_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_verification_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_security_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_email_digest BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_digest_frequency TEXT DEFAULT 'weekly',
ADD COLUMN IF NOT EXISTS quiet_hours_start TIME,
ADD COLUMN IF NOT EXISTS quiet_hours_end TIME,
ADD COLUMN IF NOT EXISTS snooze_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS geo_filter_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS preferred_regions TEXT[],
ADD COLUMN IF NOT EXISTS muted_users UUID[],
ADD COLUMN IF NOT EXISTS muted_politicians UUID[],
ADD COLUMN IF NOT EXISTS muted_parties UUID[],
ADD COLUMN IF NOT EXISTS muted_categories TEXT[];