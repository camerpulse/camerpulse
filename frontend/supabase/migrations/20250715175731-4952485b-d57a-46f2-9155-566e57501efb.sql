-- Add enhanced auto-healing configurations
INSERT INTO public.ashen_monitoring_config (config_key, config_value, is_active)
VALUES 
  ('scan_frequency_hours', '6'::jsonb, true),
  ('fix_type_filter', '"all"'::jsonb, true),
  ('emergency_alert_threshold', '3'::jsonb, true),
  ('healing_modes_enabled', '["layout", "backend", "security"]'::jsonb, true),
  ('background_healing_enabled', 'true'::jsonb, true)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = now();

-- Migrate any existing self-healer logs into activity timeline
INSERT INTO public.camerpulse_activity_timeline (
  module,
  activity_type,
  activity_summary,
  status,
  details,
  confidence_score,
  timestamp
)
SELECT 
  'self_healer_migrated' as module,
  'healing_operation' as activity_type,
  CONCAT('Migrated: ', fix_method, ' - ', fix_description) as activity_summary,
  CASE 
    WHEN fix_applied THEN 'success'
    ELSE 'failed'
  END as status,
  jsonb_build_object(
    'migrated_from', 'self_healer',
    'original_fix_confidence', fix_confidence,
    'files_modified', files_modified,
    'result_status', result_status,
    'migration_timestamp', now()
  ) as details,
  fix_confidence as confidence_score,
  created_at as timestamp
FROM public.ashen_auto_healing_history
WHERE NOT EXISTS (
  SELECT 1 FROM public.camerpulse_activity_timeline 
  WHERE module = 'self_healer_migrated' 
  AND details->>'original_healing_id' = ashen_auto_healing_history.id::text
);

-- Create function to schedule background healing
CREATE OR REPLACE FUNCTION schedule_background_healing()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function would be called by a cron job or scheduled task
  -- For now, it just logs that it was called
  INSERT INTO public.camerpulse_activity_timeline (
    module,
    activity_type,
    activity_summary,
    status,
    details
  ) VALUES (
    'ashen_background_healer',
    'scheduled_scan',
    'Background healing scan initiated',
    'scheduled',
    jsonb_build_object(
      'scheduled_at', now(),
      'scan_type', 'automated_background'
    )
  );
END;
$$;