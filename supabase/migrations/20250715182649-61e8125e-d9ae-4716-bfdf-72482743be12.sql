-- Add batch fix configuration to ashen monitoring config
INSERT INTO public.ashen_monitoring_config (config_key, config_value, is_active, updated_at)
VALUES 
  ('batch_fix_enabled', 'false', true, now())
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = EXCLUDED.updated_at;