-- Create table for Pan-African configuration and admin controls
CREATE TABLE public.pan_africa_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL DEFAULT '{}',
  config_type TEXT NOT NULL DEFAULT 'system',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pan_africa_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Pan-Africa config is publicly readable for active configs" 
ON public.pan_africa_config 
FOR SELECT 
USING (is_active = true AND config_type = 'public');

CREATE POLICY "Admins can manage pan-africa config" 
ON public.pan_africa_config 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create trigger for auto-updating timestamps
CREATE TRIGGER update_pan_africa_config_updated_at
BEFORE UPDATE ON public.pan_africa_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default Pan-African configuration
INSERT INTO public.pan_africa_config (config_key, config_value, config_type, description) VALUES 
  ('enable_pan_africa', '{"enabled": true}', 'system', 'Master toggle for Pan-African mode'),
  ('enabled_countries', '{"countries": ["CM", "NG", "GH", "KE", "ZA", "EG"]}', 'system', 'List of enabled countries for Pan-African intelligence'),
  ('default_country', '{"country_code": "CM"}', 'system', 'Default country when user first visits'),
  ('restrict_access_by_role', '{"enabled": false}', 'system', 'Whether to restrict Pan-African access to specific roles'),
  ('cross_country_analytics', '{"enabled": true}', 'system', 'Enable cross-country comparison analytics'),
  ('country_routing', '{"enabled": true, "prefix": "camerpulse"}', 'system', 'Enable dynamic country-based routing');

-- Add a function to get active Pan-African configuration
CREATE OR REPLACE FUNCTION public.get_pan_africa_config(p_config_key TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}';
  config_record RECORD;
BEGIN
  IF p_config_key IS NOT NULL THEN
    -- Get specific config
    SELECT config_value INTO result
    FROM public.pan_africa_config
    WHERE config_key = p_config_key AND is_active = true;
    
    RETURN COALESCE(result, '{}');
  ELSE
    -- Get all active configs
    FOR config_record IN 
      SELECT config_key, config_value
      FROM public.pan_africa_config
      WHERE is_active = true
    LOOP
      result := result || jsonb_build_object(config_record.config_key, config_record.config_value);
    END LOOP;
    
    RETURN result;
  END IF;
END;
$$;