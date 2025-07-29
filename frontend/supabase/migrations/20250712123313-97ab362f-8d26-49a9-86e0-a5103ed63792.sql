-- Insert AI control configuration
INSERT INTO public.politica_ai_config (config_key, config_value, description, is_active)
VALUES 
('ai_enabled', 'true', 'Master switch to enable/disable Politica AI operations', true),
('auto_import_enabled', 'true', 'Enable automatic import from government sources', true),
('auto_verification_enabled', 'true', 'Enable automatic verification of political data', true)
ON CONFLICT (config_key) DO UPDATE SET
config_value = EXCLUDED.config_value,
description = EXCLUDED.description,
is_active = EXCLUDED.is_active;