-- Create plugin registry table with correct column names
CREATE TABLE IF NOT EXISTS public.plugin_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_name TEXT NOT NULL UNIQUE,
  plugin_author TEXT DEFAULT 'CamerPulse Team',
  plugin_version TEXT DEFAULT '1.0.0',
  plugin_status TEXT DEFAULT 'disabled' CHECK (plugin_status IN ('enabled', 'disabled', 'maintenance')),
  plugin_type TEXT DEFAULT 'feature' CHECK (plugin_type IN ('core', 'feature', 'integration', 'theme', 'service')),
  file_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
  routes_introduced TEXT[] DEFAULT ARRAY[]::TEXT[],
  dependencies_used JSONB DEFAULT '{}',
  api_endpoints TEXT[] DEFAULT ARRAY[]::TEXT[],
  database_migrations TEXT[] DEFAULT ARRAY[]::TEXT[],
  global_variables TEXT[] DEFAULT ARRAY[]::TEXT[],
  css_overrides TEXT[] DEFAULT ARRAY[]::TEXT[],
  component_overrides TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}',
  plugin_risk_score NUMERIC DEFAULT 0.0,
  install_date TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.plugin_registry ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view enabled plugins" 
ON public.plugin_registry 
FOR SELECT 
USING (plugin_status = 'enabled' OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage plugins" 
ON public.plugin_registry 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Insert Camer Logistics as a plugin
INSERT INTO public.plugin_registry (
  plugin_name,
  plugin_author,
  plugin_version,
  plugin_status,
  plugin_type,
  routes_introduced,
  dependencies_used,
  api_endpoints,
  metadata
) VALUES (
  'camer-logistics',
  'CamerPulse Team',
  '1.0.0',
  'enabled',
  'feature',
  ARRAY['/logistics', '/logistics/tracking', '/logistics/tracking/:trackingNumber', '/logistics/companies', '/logistics/join-company', '/logistics/dashboard'],
  '{"authentication": true}',
  ARRAY['/api/logistics/tracking', '/api/logistics/companies'],
  '{
    "display_name": "Camer Logistics",
    "description": "Comprehensive logistics and delivery management platform for Cameroon",
    "icon": "Truck",
    "category": "Business Services",
    "public_routes": ["/logistics", "/logistics/tracking", "/logistics/companies", "/logistics/join-company"],
    "auth_routes": ["/logistics/dashboard"],
    "features": ["package_tracking", "company_directory", "delivery_management"],
    "integration_points": ["public_homepage", "main_navigation"]
  }'::jsonb
) ON CONFLICT (plugin_name) DO UPDATE SET
  plugin_status = EXCLUDED.plugin_status,
  routes_introduced = EXCLUDED.routes_introduced,
  metadata = EXCLUDED.metadata,
  last_updated = now();