-- Phase 1: Disable Ashen AI and artist systems
UPDATE system_feature_flags 
SET is_enabled = false, 
    disabled_reason = 'Phase 1: Simplification - Feature temporarily disabled',
    disabled_at = now()
WHERE feature_name IN (
  'ashen_ai_system',
  'artist_registration', 
  'fan_registration',
  'plugin_installation',
  'artist_platform'
);