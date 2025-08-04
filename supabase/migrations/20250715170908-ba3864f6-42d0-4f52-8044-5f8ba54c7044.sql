-- Add alert configuration to ashen_monitoring_config
INSERT INTO public.ashen_monitoring_config (config_key, config_value, is_active) VALUES
  ('alerts_enabled', 'true', true),
  ('alerts_sound_enabled', 'true', true),
  ('alerts_silence_duration', '60', true),
  ('alerts_priority_filter', 'all', true)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = now();

-- Enable realtime for ashen_error_logs table
ALTER TABLE public.ashen_error_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ashen_error_logs;

-- Enable realtime for ashen_auto_healing_history table  
ALTER TABLE public.ashen_auto_healing_history REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ashen_auto_healing_history;