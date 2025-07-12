-- Insert the active theme configuration
INSERT INTO politica_ai_config (config_key, config_value, description, is_active)
VALUES ('active_theme', '"emergence-2035"', 'Active theme: Emergence 2035', true)
ON CONFLICT (config_key) 
DO UPDATE SET 
  config_value = EXCLUDED.config_value,
  description = EXCLUDED.description,
  updated_at = now();