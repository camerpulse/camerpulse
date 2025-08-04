-- Phase 1: Disable Ashen AI System and Archive Complex Features

-- 1. Disable all Ashen AI autonomous operations
UPDATE ashen_snapshot_retention_config 
SET 
  auto_cleanup_enabled = false,
  auto_snapshot_enabled = false,
  auto_rollback_on_critical_error = false,
  is_active = false,
  updated_at = now()
WHERE is_active = true;

-- 2. Disable Ashen learning insights
UPDATE ashen_learning_insights 
SET 
  is_active = false,
  updated_at = now()
WHERE is_active = true;

-- 3. Archive artist profile claims (make read-only by updating status)
UPDATE artist_profile_claims 
SET 
  status = 'archived',
  admin_notes = COALESCE(admin_notes, '') || ' [ARCHIVED - Phase 1 Simplification]',
  updated_at = now()
WHERE status = 'pending';

-- 4. Create system configuration table to manage feature flags
CREATE TABLE IF NOT EXISTS system_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name text NOT NULL UNIQUE,
  is_enabled boolean NOT NULL DEFAULT true,
  disabled_reason text,
  disabled_at timestamp with time zone,
  disabled_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on feature flags
ALTER TABLE system_feature_flags ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage feature flags
CREATE POLICY "Admins can manage feature flags" 
ON system_feature_flags 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'::app_role
));

-- Create policy for public read access to feature flags
CREATE POLICY "Feature flags are publicly readable" 
ON system_feature_flags 
FOR SELECT 
USING (true);

-- 5. Insert feature flags for Phase 1 disabled systems
INSERT INTO system_feature_flags (feature_name, is_enabled, disabled_reason, disabled_at) VALUES
('ashen_ai_system', false, 'Phase 1 Simplification - Disabled autonomous AI operations', now()),
('artist_registration', false, 'Phase 1 Simplification - Artist features archived', now()),
('fan_registration', false, 'Phase 1 Simplification - Fan features archived', now()),
('plugin_installation', false, 'Phase 1 Simplification - Plugin system frozen', now()),
('ashen_autonomous_monitor', false, 'Phase 1 Simplification - Autonomous monitoring disabled', now()),
('ashen_learning_engine', false, 'Phase 1 Simplification - AI learning disabled', now()),
('plugin_stress_testing', false, 'Phase 1 Simplification - Plugin stress testing disabled', now()),
('artist_approval_system', false, 'Phase 1 Simplification - Artist approval system disabled', now())
ON CONFLICT (feature_name) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  disabled_reason = EXCLUDED.disabled_reason,
  disabled_at = EXCLUDED.disabled_at,
  updated_at = now();

-- 6. Disable plugin stress testing by updating test results
UPDATE plugin_stress_tests 
SET 
  test_result = 'disabled_phase1',
  error_logs = jsonb_set(
    COALESCE(error_logs, '[]'::jsonb),
    '{-1}',
    '{"message": "Plugin system frozen during Phase 1 simplification", "timestamp": "' || now() || '"}'
  )
WHERE test_result = 'pending';

-- 7. Create trigger to update feature flags timestamp
CREATE OR REPLACE FUNCTION update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON system_feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_flags_updated_at();

-- 8. Archive AI-generated polls by setting a flag
UPDATE polls_ai_generated 
SET 
  admin_edited = true,
  edit_history = jsonb_set(
    COALESCE(edit_history, '[]'::jsonb),
    '{-1}',
    jsonb_build_object(
      'action', 'phase1_archive',
      'timestamp', now(),
      'reason', 'Phase 1 Simplification - AI poll generation disabled'
    )
  ),
  updated_at = now();

-- 9. Disable Camerpulse Intelligence alerts auto-generation
UPDATE camerpulse_intelligence_alerts 
SET 
  auto_generated = false,
  acknowledged = true,
  acknowledged_at = now(),
  description = COALESCE(description, '') || ' [ARCHIVED - Phase 1 Simplification]'
WHERE auto_generated = true AND acknowledged = false;