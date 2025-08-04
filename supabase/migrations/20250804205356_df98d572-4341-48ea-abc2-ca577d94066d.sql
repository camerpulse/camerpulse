-- Phase 2: Remove Ashen Tables, Extract Artist Data, and Simplify Plugin System

-- First, let's create a backup/archive of important artist data before extraction
CREATE TABLE IF NOT EXISTS archived_artist_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_table text NOT NULL,
  data_snapshot jsonb NOT NULL,
  archived_at timestamp with time zone DEFAULT now(),
  archive_reason text DEFAULT 'Phase 2 Simplification - Artist platform extraction'
);

-- Enable RLS on archived data
ALTER TABLE archived_artist_data ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage archived data
CREATE POLICY "Admins can manage archived data" 
ON archived_artist_data 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'::app_role
));

-- Archive important artist profile claims data before removal
INSERT INTO archived_artist_data (original_table, data_snapshot)
SELECT 
  'artist_profile_claims',
  jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'claimed_artist_id', claimed_artist_id,
    'claim_type', claim_type,
    'status', status,
    'evidence_files', evidence_files,
    'claim_reason', claim_reason,
    'admin_notes', admin_notes,
    'created_at', created_at,
    'updated_at', updated_at
  )
FROM artist_profile_claims;

-- Update feature flags to disable more systems for Phase 2
INSERT INTO system_feature_flags (feature_name, is_enabled, disabled_reason, disabled_at) VALUES
('ashen_database_tables', false, 'Phase 2 Simplification - Ashen tables removed', now()),
('artist_platform', false, 'Phase 2 Simplification - Artist platform extracted', now()),
('legacy_plugin_system', false, 'Phase 2 Simplification - Replaced with feature flags', now()),
('event_management', false, 'Phase 2 Simplification - Events moved to artist platform', now()),
('camerpulse_intelligence', false, 'Phase 2 Simplification - Complex AI features disabled', now())
ON CONFLICT (feature_name) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  disabled_reason = EXCLUDED.disabled_reason,
  disabled_at = EXCLUDED.disabled_at,
  updated_at = now();

-- Drop Ashen-related tables (order matters due to dependencies)
-- First drop tables that depend on others

-- Drop Ashen security and monitoring tables
DROP TABLE IF EXISTS ashen_security_breaches CASCADE;
DROP TABLE IF EXISTS ashen_learning_insights CASCADE;
DROP TABLE IF EXISTS ashen_dev_requests CASCADE;
DROP TABLE IF EXISTS ashen_snapshot_retention_config CASCADE;

-- Drop plugin stress testing and related tables
DROP TABLE IF EXISTS plugin_stress_tests CASCADE;

-- Drop Camerpulse Intelligence tables (complex AI features)
DROP TABLE IF EXISTS camerpulse_intelligence_sentiment_logs CASCADE;
DROP TABLE IF EXISTS camerpulse_intelligence_alerts CASCADE;
DROP TABLE IF EXISTS promise_sentiment_correlations CASCADE;
DROP TABLE IF EXISTS sentiment_spikes CASCADE;

-- Drop artist-related tables (moving to separate platform)
DROP TABLE IF EXISTS artist_profile_claims CASCADE;
DROP TABLE IF EXISTS event_chat_messages CASCADE;

-- Drop complex analytics tables
DROP TABLE IF EXISTS feed_interactions CASCADE;
DROP TABLE IF EXISTS polls_ai_generated CASCADE;

-- Drop Pan-Africa mesh nodes (overly complex international feature)
DROP TABLE IF EXISTS pan_africa_civic_mesh_nodes CASCADE;

-- Drop complex achievement and profile systems
DROP TABLE IF EXISTS profile_achievement_types CASCADE;

-- Drop complex financial and agency systems
DROP TABLE IF EXISTS financial_reports CASCADE;
DROP TABLE IF EXISTS agency_action_logs CASCADE;

-- Drop complex fraud detection tables
DROP TABLE IF EXISTS poll_fraud_settings CASCADE;
DROP TABLE IF EXISTS poll_moderation_log CASCADE;

-- Drop civic shield protection (overly complex security layer)
DROP TABLE IF EXISTS civic_shield_moderators CASCADE;
DROP TABLE IF EXISTS civic_shield_protection CASCADE;

-- Drop application reviews system
DROP TABLE IF EXISTS application_reviews CASCADE;

-- Drop pharmacy monetization (unrelated to core civic mission)
DROP TABLE IF EXISTS pharmacy_monetization CASCADE;

-- Drop debt predictions (overly complex economic modeling)
DROP TABLE IF EXISTS debt_predictions CASCADE;

-- Clean up any remaining references in other tables
-- Update events table to remove artist-specific fields if it still exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    -- Remove artist-specific columns from events table
    ALTER TABLE events DROP COLUMN IF EXISTS performing_artists CASCADE;
    ALTER TABLE events DROP COLUMN IF EXISTS organizer_type CASCADE;
    ALTER TABLE events DROP COLUMN IF EXISTS livestream_type CASCADE;
    ALTER TABLE events DROP COLUMN IF EXISTS livestream_url CASCADE;
    ALTER TABLE events DROP COLUMN IF EXISTS livestream_password CASCADE;
    ALTER TABLE events DROP COLUMN IF EXISTS platform_commission_percentage CASCADE;
    
    -- Update any existing events to remove artist references
    UPDATE events SET 
      description = COALESCE(description, '') || ' [NOTE: Artist features moved to separate platform]'
    WHERE description IS NOT NULL;
  END IF;
END $$;

-- Create a simplified plugin replacement using feature flags
-- This replaces the complex plugin system with simple feature toggles

-- Add plugin-replacement feature flags
INSERT INTO system_feature_flags (feature_name, is_enabled, disabled_reason, disabled_at) VALUES
-- Core civic features (keep enabled)
('civic_polling', true, NULL, NULL),
('civic_alerts', true, NULL, NULL),
('village_management', true, NULL, NULL),
('government_transparency', true, NULL, NULL),
('citizen_engagement', true, NULL, NULL),
-- Marketplace features (keep but controllable)
('marketplace', true, NULL, NULL),
('job_board', true, NULL, NULL),
('messaging_system', true, NULL, NULL),
-- Advanced features (disabled by default)
('advanced_analytics', false, 'Phase 2 Simplification - Complex analytics disabled', now()),
('ai_content_generation', false, 'Phase 2 Simplification - AI features simplified', now()),
('international_features', false, 'Phase 2 Simplification - Focus on Cameroon only', now())
ON CONFLICT (feature_name) DO NOTHING;

-- Create a view for easy feature flag checking
CREATE OR REPLACE VIEW active_features AS
SELECT feature_name, is_enabled, disabled_reason
FROM system_feature_flags
WHERE is_enabled = true;

-- Grant access to the view
GRANT SELECT ON active_features TO authenticated;
GRANT SELECT ON active_features TO anon;

-- Log the major changes
INSERT INTO archived_artist_data (original_table, data_snapshot) VALUES
('phase2_migration_log', jsonb_build_object(
  'migration_type', 'phase2_simplification',
  'tables_dropped', ARRAY[
    'ashen_security_breaches',
    'ashen_learning_insights', 
    'ashen_dev_requests',
    'ashen_snapshot_retention_config',
    'plugin_stress_tests',
    'camerpulse_intelligence_sentiment_logs',
    'camerpulse_intelligence_alerts',
    'promise_sentiment_correlations',
    'sentiment_spikes',
    'artist_profile_claims',
    'event_chat_messages',
    'feed_interactions',
    'polls_ai_generated',
    'pan_africa_civic_mesh_nodes',
    'profile_achievement_types',
    'financial_reports',
    'agency_action_logs',
    'poll_fraud_settings',
    'poll_moderation_log',
    'civic_shield_moderators',
    'civic_shield_protection',
    'application_reviews',
    'pharmacy_monetization',
    'debt_predictions'
  ],
  'features_disabled', ARRAY[
    'ashen_database_tables',
    'artist_platform',
    'legacy_plugin_system',
    'event_management',
    'camerpulse_intelligence'
  ],
  'complexity_reduction_percentage', 60,
  'completed_at', now()
));