-- Allow public read access for active theme configuration
CREATE POLICY "Active theme config is publicly readable" 
ON public.politica_ai_config 
FOR SELECT 
USING (config_key = 'active_theme');