-- Create plugin_versions table for version history
CREATE TABLE public.plugin_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id UUID NOT NULL,
  version TEXT NOT NULL,
  changelog TEXT NOT NULL,
  released_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_current BOOLEAN NOT NULL DEFAULT false,
  manifest_data JSONB NOT NULL DEFAULT '{}',
  bundle_url TEXT,
  download_count INTEGER NOT NULL DEFAULT 0,
  compatibility_info JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create plugin_snapshots table for rollback functionality
CREATE TABLE public.plugin_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id UUID NOT NULL,
  version_id TEXT NOT NULL,
  snapshot_data JSONB NOT NULL,
  created_before_update BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create plugin_activation_history table for tracking changes
CREATE TABLE public.plugin_activation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  admin_id UUID,
  admin_name TEXT,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_plugin_versions_plugin_id ON public.plugin_versions(plugin_id);
CREATE INDEX idx_plugin_versions_current ON public.plugin_versions(plugin_id, is_current) WHERE is_current = true;
CREATE INDEX idx_plugin_snapshots_plugin_id ON public.plugin_snapshots(plugin_id);
CREATE INDEX idx_plugin_activation_history_plugin_id ON public.plugin_activation_history(plugin_id);
CREATE INDEX idx_plugin_activation_history_created_at ON public.plugin_activation_history(created_at DESC);

-- Add updated_at trigger for plugin_versions
CREATE OR REPLACE FUNCTION public.update_plugin_versions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plugin_versions_updated_at
  BEFORE UPDATE ON public.plugin_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_plugin_versions_updated_at();

-- Enable RLS on tables
ALTER TABLE public.plugin_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_activation_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for plugin_versions
CREATE POLICY "Admins can manage all plugin versions" 
ON public.plugin_versions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Public can view approved plugin versions" 
ON public.plugin_versions 
FOR SELECT 
USING (true);

-- RLS policies for plugin_snapshots
CREATE POLICY "Admins can manage all plugin snapshots" 
ON public.plugin_snapshots 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS policies for plugin_activation_history
CREATE POLICY "Admins can manage all plugin history" 
ON public.plugin_activation_history 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Users can view plugin history" 
ON public.plugin_activation_history 
FOR SELECT 
USING (true);