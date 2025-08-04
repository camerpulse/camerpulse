import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Plugin {
  id: string;
  plugin_name: string;
  plugin_author: string;
  plugin_version: string;
  plugin_status: 'enabled' | 'disabled' | 'maintenance';
  plugin_type: 'feature' | 'service' | 'integration';
  file_paths: string[];
  routes_introduced: string[];
  dependencies_used: Record<string, any>;
  api_endpoints: string[];
  database_migrations: string[];
  global_variables: string[];
  css_overrides: string[];
  component_overrides: string[];
  metadata: Record<string, any>;
  plugin_risk_score: number;
  install_date?: string;
  last_updated?: string;
  created_at: string;
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
        .order('plugin_name');

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
        .eq('plugin_status', 'enabled')
        .order('plugin_name');

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
        .select('plugin_status')
        .eq('plugin_name', pluginName)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return false; // Plugin not found
        throw error;
      }
      return data.plugin_status === 'enabled';
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
      // For now, use direct database update since RPC doesn't exist yet
      const { error } = await supabase
        .from('plugin_registry')
        .update({ plugin_status: newStatus })
        .eq('id', pluginId);

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

// Simple history tracking - later can be enhanced with proper audit tables
export const usePluginHistory = (pluginId?: string) => {
  return useQuery({
    queryKey: ['plugin-history', pluginId],
    queryFn: async () => {
      // Return empty array for now since we don't have the history table yet
      return [] as PluginActivationHistory[];
    }
  });
};

// Hook to check plugin access for current user
export const usePluginAccess = (pluginName: string, permission = 'can_access') => {
  return useQuery({
    queryKey: ['plugin-access', pluginName, permission],
    queryFn: async () => {
      // For now, check if plugin is enabled
      const { data, error } = await supabase
        .from('plugin_registry')
        .select('plugin_status')
        .eq('plugin_name', pluginName)
        .single();

      if (error || !data) return false;
      return data.plugin_status === 'enabled';
    }
  });
};

// Hook to install/register a new plugin
export const useInstallPlugin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plugin: Omit<Plugin, 'id' | 'created_at'>) => {
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
      plugin.routes_introduced.some(route => {
        const routePattern = route.replace(/\*/g, '.*');
        return new RegExp(`^${routePattern}$`).test(path);
      })
    );
  };

  return { isRouteAllowed, enabledPlugins };
};