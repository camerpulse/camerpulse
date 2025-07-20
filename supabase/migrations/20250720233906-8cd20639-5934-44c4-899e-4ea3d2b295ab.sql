-- Create plugin system tables

-- Plugin registry table
CREATE TABLE public.plugin_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0',
  status TEXT DEFAULT 'disabled' CHECK (status IN ('enabled', 'disabled', 'maintenance')),
  plugin_type TEXT DEFAULT 'feature' CHECK (plugin_type IN ('feature', 'service', 'integration')),
  routes JSONB DEFAULT '[]'::jsonb,
  dependencies JSONB DEFAULT '[]'::jsonb,
  permissions JSONB DEFAULT '[]'::jsonb,
  configuration JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  admin_toggle BOOLEAN DEFAULT true,
  auto_load BOOLEAN DEFAULT false,
  sandbox_execution BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  last_modified_by UUID REFERENCES auth.users(id)
);

-- Plugin activation history
CREATE TABLE public.plugin_activation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID REFERENCES public.plugin_registry(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('enabled', 'disabled', 'installed', 'uninstalled', 'updated')),
  previous_status TEXT,
  new_status TEXT NOT NULL,
  admin_id UUID REFERENCES auth.users(id),
  admin_name TEXT,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Plugin user permissions
CREATE TABLE public.plugin_user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID REFERENCES public.plugin_registry(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_name TEXT NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(plugin_id, user_id, permission_name)
);

-- Plugin dependencies tracking
CREATE TABLE public.plugin_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID REFERENCES public.plugin_registry(id) ON DELETE CASCADE,
  depends_on_plugin_id UUID REFERENCES public.plugin_registry(id) ON DELETE CASCADE,
  dependency_type TEXT DEFAULT 'required' CHECK (dependency_type IN ('required', 'optional', 'recommended')),
  minimum_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(plugin_id, depends_on_plugin_id)
);

-- Enable RLS
ALTER TABLE public.plugin_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_activation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_dependencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all plugins" ON public.plugin_registry
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view enabled plugins" ON public.plugin_registry
  FOR SELECT USING (status = 'enabled' OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can view activation history" ON public.plugin_activation_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can insert activation history" ON public.plugin_activation_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage plugin permissions" ON public.plugin_user_permissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view their plugin permissions" ON public.plugin_user_permissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage dependencies" ON public.plugin_dependencies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_plugin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plugin_registry_updated_at
  BEFORE UPDATE ON public.plugin_registry
  FOR EACH ROW EXECUTE FUNCTION update_plugin_updated_at();

-- Function to toggle plugin status
CREATE OR REPLACE FUNCTION toggle_plugin_status(
  p_plugin_id UUID,
  p_new_status TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_status TEXT;
  plugin_name TEXT;
  admin_user_id UUID := auth.uid();
BEGIN
  -- Get current status
  SELECT status, plugin_name INTO current_status, plugin_name
  FROM public.plugin_registry 
  WHERE id = p_plugin_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plugin not found';
  END IF;
  
  -- Update status
  UPDATE public.plugin_registry 
  SET status = p_new_status, 
      last_modified_by = admin_user_id
  WHERE id = p_plugin_id;
  
  -- Log the change
  INSERT INTO public.plugin_activation_history (
    plugin_id, action_type, previous_status, new_status, 
    admin_id, reason
  ) VALUES (
    p_plugin_id, p_new_status, current_status, p_new_status,
    admin_user_id, p_reason
  );
  
  RETURN TRUE;
END;
$$;

-- Function to check plugin access
CREATE OR REPLACE FUNCTION has_plugin_access(
  p_plugin_name TEXT,
  p_user_id UUID DEFAULT auth.uid(),
  p_permission TEXT DEFAULT 'can_access'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plugin_enabled BOOLEAN := FALSE;
  has_permission BOOLEAN := FALSE;
BEGIN
  -- Check if plugin is enabled
  SELECT status = 'enabled' INTO plugin_enabled
  FROM public.plugin_registry 
  WHERE plugin_name = p_plugin_name;
  
  IF NOT plugin_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Check user permission
  SELECT EXISTS(
    SELECT 1 FROM public.plugin_user_permissions pup
    JOIN public.plugin_registry pr ON pup.plugin_id = pr.id
    WHERE pr.plugin_name = p_plugin_name 
    AND pup.user_id = p_user_id
    AND pup.permission_name = p_permission
    AND pup.is_active = TRUE
    AND (pup.expires_at IS NULL OR pup.expires_at > now())
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$;