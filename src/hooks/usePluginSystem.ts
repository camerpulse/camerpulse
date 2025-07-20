import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Plugin {
  id: string;
  plugin_name: string;
  display_name: string;
  description?: string;
  version: string;
  status: 'enabled' | 'disabled' | 'maintenance';
  plugin_type: 'feature' | 'service' | 'integration';
  routes: string[];
  dependencies: string[];
  permissions: string[];
  configuration: Record<string, any>;
  metadata: Record<string, any>;
  admin_toggle: boolean;
  auto_load: boolean;
  sandbox_execution: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_modified_by?: string;
}

export interface PluginActivationHistory {
  id: string;
  plugin_id: string;
  action_type: 'enabled' | 'disabled' | 'installed' | 'uninstalled' | 'updated';
  previous_status?: string;
  new_status: string;
  admin_id?: string;
  admin_name?: string;
  reason?: string;
  metadata: Record<string, any>;
  created_at: string;
}

// Hook to get all plugins
export const usePlugins = () => {
  return useQuery({
    queryKey: ['plugins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plugin_registry')
        .select('*')
        .order('display_name');

      if (error) throw error;
      return data as Plugin[];
    }
  });
};

// Hook to get enabled plugins only
export const useEnabledPlugins = () => {
  return useQuery({
    queryKey: ['plugins', 'enabled'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plugin_registry')
        .select('*')
        .eq('status', 'enabled')
        .order('display_name');

      if (error) throw error;
      return data as Plugin[];
    }
  });
};

// Hook to check if a specific plugin is enabled
export const usePluginEnabled = (pluginName: string) => {
  return useQuery({
    queryKey: ['plugin-enabled', pluginName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plugin_registry')
        .select('status')
        .eq('plugin_name', pluginName)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return false; // Plugin not found
        throw error;
      }
      return data.status === 'enabled';
    }
  });
};

// Hook to toggle plugin status
export const useTogglePlugin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      pluginId, 
      newStatus, 
      reason 
    }: { 
      pluginId: string; 
      newStatus: 'enabled' | 'disabled' | 'maintenance'; 
      reason?: string;
    }) => {
      const { error } = await supabase.rpc('toggle_plugin_status', {
        p_plugin_id: pluginId,
        p_new_status: newStatus,
        p_reason: reason || null
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      queryClient.invalidateQueries({ queryKey: ['plugins', 'enabled'] });
      queryClient.invalidateQueries({ queryKey: ['plugin-activation-history'] });
      
      toast.success(`Plugin ${variables.newStatus === 'enabled' ? 'enabled' : 'disabled'} successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to toggle plugin: ${error.message}`);
    }
  });
};

// Hook to get plugin activation history
export const usePluginHistory = (pluginId?: string) => {
  return useQuery({
    queryKey: ['plugin-activation-history', pluginId],
    queryFn: async () => {
      let query = supabase
        .from('plugin_activation_history')
        .select(`
          *,
          plugin_registry(display_name, plugin_name)
        `)
        .order('created_at', { ascending: false });

      if (pluginId) {
        query = query.eq('plugin_id', pluginId);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as (PluginActivationHistory & { plugin_registry?: { display_name: string; plugin_name: string } })[];
    }
  });
};

// Hook to check plugin access for current user
export const usePluginAccess = (pluginName: string, permission = 'can_access') => {
  return useQuery({
    queryKey: ['plugin-access', pluginName, permission],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('has_plugin_access', {
        p_plugin_name: pluginName,
        p_permission: permission
      });

      if (error) throw error;
      return data as boolean;
    }
  });
};

// Hook to install/register a new plugin
export const useInstallPlugin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plugin: Omit<Plugin, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'last_modified_by'>) => {
      const { data, error } = await supabase
        .from('plugin_registry')
        .insert([plugin])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      toast.success('Plugin installed successfully');
    },
    onError: (error) => {
      toast.error(`Failed to install plugin: ${error.message}`);
    }
  });
};

// Plugin guard component
export const PluginGuard = ({ 
  pluginName, 
  children, 
  fallback = null,
  permission = 'can_access'
}: {
  pluginName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  permission?: string;
}) => {
  const { data: hasAccess, isLoading } = usePluginAccess(pluginName, permission);

  if (isLoading) return null;
  if (!hasAccess) return fallback;

  return <>{children}</>;
};

// Route guard hook
export const useRouteGuard = () => {
  const { data: enabledPlugins } = useEnabledPlugins();

  const isRouteAllowed = (path: string) => {
    if (!enabledPlugins) return false;

    return enabledPlugins.some(plugin => 
      plugin.routes.some(route => {
        const routePattern = route.replace(/\*/g, '.*');
        return new RegExp(`^${routePattern}$`).test(path);
      })
    );
  };

  return { isRouteAllowed, enabledPlugins };
};