-- Create system API configurations table
CREATE TABLE IF NOT EXISTS public.system_api_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_api_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for system API configs
CREATE POLICY "Only admins can manage API configs" 
ON public.system_api_configs 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_api_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_api_configs_updated_at
  BEFORE UPDATE ON public.system_api_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_api_config_updated_at();