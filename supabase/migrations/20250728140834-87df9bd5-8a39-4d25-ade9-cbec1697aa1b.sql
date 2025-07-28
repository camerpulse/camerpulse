-- Create plugin registry if it doesn't exist
CREATE TABLE IF NOT EXISTS public.plugin_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  author TEXT DEFAULT 'CamerPulse Team',
  version TEXT DEFAULT '1.0.0',
  status TEXT DEFAULT 'disabled' CHECK (status IN ('enabled', 'disabled', 'maintenance')),
  plugin_type TEXT DEFAULT 'feature' CHECK (plugin_type IN ('core', 'feature', 'integration', 'theme')),
  entry_point TEXT,
  config_schema JSONB,
  routes TEXT[],
  dependencies TEXT[],
  api_endpoints TEXT[],
  permissions TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.plugin_registry ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view enabled plugins" 
ON public.plugin_registry 
FOR SELECT 
USING (status = 'enabled' OR auth.role() = 'authenticated');

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
  display_name,
  description,
  author,
  version,
  status,
  plugin_type,
  entry_point,
  routes,
  dependencies,
  api_endpoints,
  permissions,
  metadata
) VALUES (
  'camer-logistics',
  'Camer Logistics',
  'Comprehensive logistics and delivery management platform for Cameroon',
  'CamerPulse Team',
  '1.0.0',
  'enabled',
  'feature',
  '/logistics',
  ARRAY['/logistics', '/logistics/tracking', '/logistics/tracking/:trackingNumber', '/logistics/companies', '/logistics/join-company', '/logistics/dashboard'],
  ARRAY['authentication'],
  ARRAY['/api/logistics/tracking', '/api/logistics/companies'],
  ARRAY['logistics_access', 'logistics_admin'],
  '{
    "icon": "Truck",
    "category": "Business Services",
    "sidebar_section": "Services",
    "public_routes": ["/logistics", "/logistics/tracking", "/logistics/companies", "/logistics/join-company"],
    "auth_routes": ["/logistics/dashboard"],
    "features": ["package_tracking", "company_directory", "delivery_management"],
    "integration_points": ["public_homepage", "main_navigation"]
  }'::jsonb
) ON CONFLICT (plugin_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  routes = EXCLUDED.routes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Create plugin activation history table
CREATE TABLE IF NOT EXISTS public.plugin_activation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id UUID NOT NULL REFERENCES public.plugin_registry(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('enabled', 'disabled', 'installed', 'uninstalled', 'updated')),
  previous_status TEXT,
  new_status TEXT,
  triggered_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on history table
ALTER TABLE public.plugin_activation_history ENABLE ROW LEVEL SECURITY;

-- History policies
CREATE POLICY "Admins can view plugin history" 
ON public.plugin_activation_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can insert plugin history" 
ON public.plugin_activation_history 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);