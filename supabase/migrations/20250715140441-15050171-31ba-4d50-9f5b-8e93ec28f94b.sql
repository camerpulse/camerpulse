-- Create cache management tables
CREATE TABLE public.cache_flush_operations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type TEXT NOT NULL,
  cache_layers TEXT[] NOT NULL,
  initiated_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_details JSONB DEFAULT '{}'::jsonb,
  success_details JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE public.cache_status_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_layer TEXT NOT NULL,
  operation_id UUID REFERENCES cache_flush_operations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  items_cleared INTEGER DEFAULT 0,
  size_cleared_mb NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE public.system_cache_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_layer TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  auto_flush_enabled BOOLEAN DEFAULT false,
  auto_flush_interval_hours INTEGER DEFAULT 24,
  max_size_mb INTEGER DEFAULT 1000,
  retention_hours INTEGER DEFAULT 168,
  flush_priority INTEGER DEFAULT 5,
  config_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cache_flush_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_status_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_cache_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage cache operations" 
ON public.cache_flush_operations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Admins can manage cache status" 
ON public.cache_status_tracking 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Admins can manage cache config" 
ON public.system_cache_config 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Insert default cache layer configurations
INSERT INTO public.system_cache_config (cache_layer, flush_priority, max_size_mb, retention_hours, config_metadata) VALUES
('component_cache', 1, 500, 24, '{"description": "UI modules, reusable blocks, dashboard widgets", "endpoints": ["/api/components", "/api/widgets"]}'),
('ai_memory_cache', 2, 1000, 12, '{"description": "AI session memory, response logs, prompt results", "endpoints": ["/api/ai-memory", "/api/ai-logs"]}'),
('api_cache', 3, 2000, 48, '{"description": "Government sites, third-party APIs, sentiment feeds", "endpoints": ["/api/external", "/api/sentiment"]}'),
('cdn_asset_cache', 4, 5000, 168, '{"description": "Static files, images, CSS, profile images", "endpoints": ["/api/assets", "/api/media"]}'),
('security_role_cache', 5, 100, 6, '{"description": "User sessions, admin roles, access levels", "endpoints": ["/api/auth", "/api/roles"]}');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_cache_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cache config
CREATE TRIGGER update_cache_config_updated_at
  BEFORE UPDATE ON public.system_cache_config
  FOR EACH ROW
  EXECUTE FUNCTION update_cache_config_updated_at();