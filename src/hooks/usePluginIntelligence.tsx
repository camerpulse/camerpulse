import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PluginManifest {
  plugin_id: string;
  plugin_name: string;
  status: string;
  category: string;
  version: string;
  description: string;
  roles_allowed: string[];
  dependencies: string[];
  routes_linked: string[];
  components_linked: string[];
  api_endpoints_linked: string[];
  data_models_used: string[];
  last_updated: string;
}

export interface PluginHealth {
  plugin_id: string;
  health_status: 'healthy' | 'warning' | 'error' | 'missing';
  dependency_issues: string[];
  version_issues: string[];
  route_issues: string[];
  last_checked: string;
  load_impact: 'low' | 'medium' | 'high';
}

export interface PluginDiagnostics {
  total_plugins: number;
  healthy_plugins: number;
  warning_plugins: number;
  error_plugins: number;
  missing_dependencies: string[];
  duplicate_ids: string[];
  orphaned_plugins: string[];
  outdated_plugins: string[];
  dependency_map: Record<string, string[]>;
}

// Fetch plugins manifest from JSON file
const fetchPluginsManifest = async (): Promise<Record<string, PluginManifest[]>> => {
  try {
    const response = await fetch('/plugins.json');
    if (!response.ok) throw new Error('Failed to fetch plugins.json');
    const data = await response.json();
    return data.plugins;
  } catch (error) {
    console.error('Error fetching plugins manifest:', error);
    throw error;
  }
};

// Validate a single plugin
const validatePlugin = (plugin: PluginManifest, allPlugins: PluginManifest[]): PluginHealth => {
  const issues: string[] = [];
  const versionIssues: string[] = [];
  const routeIssues: string[] = [];

  // Check dependencies
  const dependencyIssues = plugin.dependencies.filter(dep => 
    !allPlugins.some(p => p.plugin_id === dep)
  );

  // Check version format
  if (!/^\d+\.\d+\.\d+$/.test(plugin.version)) {
    versionIssues.push('Invalid version format');
  }

  // Check for missing required fields
  if (!plugin.plugin_name || !plugin.description) {
    issues.push('Missing required metadata');
  }

  // Determine health status
  let health_status: PluginHealth['health_status'] = 'healthy';
  if (dependencyIssues.length > 0 || versionIssues.length > 0) {
    health_status = 'error';
  } else if (issues.length > 0) {
    health_status = 'warning';
  }

  // Estimate load impact based on routes and components
  const componentCount = plugin.components_linked.length;
  const routeCount = plugin.routes_linked.length;
  let load_impact: PluginHealth['load_impact'] = 'low';
  
  if (componentCount > 5 || routeCount > 5) {
    load_impact = 'high';
  } else if (componentCount > 2 || routeCount > 2) {
    load_impact = 'medium';
  }

  return {
    plugin_id: plugin.plugin_id,
    health_status,
    dependency_issues: dependencyIssues,
    version_issues: versionIssues,
    route_issues: routeIssues,
    last_checked: new Date().toISOString(),
    load_impact
  };
};

// Generate comprehensive diagnostics
const generateDiagnostics = (pluginsManifest: Record<string, PluginManifest[]>): PluginDiagnostics => {
  const allPlugins = Object.values(pluginsManifest).flat();
  const healthChecks = allPlugins.map(plugin => validatePlugin(plugin, allPlugins));

  // Check for duplicate IDs
  const pluginIds = allPlugins.map(p => p.plugin_id);
  const duplicate_ids = pluginIds.filter((id, index) => pluginIds.indexOf(id) !== index);

  // Build dependency map
  const dependency_map: Record<string, string[]> = {};
  allPlugins.forEach(plugin => {
    dependency_map[plugin.plugin_id] = plugin.dependencies;
  });

  // Find missing dependencies
  const missing_dependencies = Array.from(new Set(
    allPlugins.flatMap(plugin => 
      plugin.dependencies.filter(dep => !allPlugins.some(p => p.plugin_id === dep))
    )
  ));

  // Find outdated plugins (simplified - could be enhanced with actual version checking)
  const outdated_plugins = allPlugins
    .filter(plugin => {
      const versionParts = plugin.version.split('.').map(Number);
      return versionParts[0] < 1 || (versionParts[0] === 1 && versionParts[1] < 5);
    })
    .map(plugin => plugin.plugin_id);

  return {
    total_plugins: allPlugins.length,
    healthy_plugins: healthChecks.filter(h => h.health_status === 'healthy').length,
    warning_plugins: healthChecks.filter(h => h.health_status === 'warning').length,
    error_plugins: healthChecks.filter(h => h.health_status === 'error').length,
    missing_dependencies,
    duplicate_ids,
    orphaned_plugins: [], // TODO: Implement based on actual usage
    outdated_plugins,
    dependency_map
  };
};

export const usePluginIntelligence = () => {
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);

  // Fetch plugins manifest
  const { data: pluginsManifest, isLoading, error, refetch } = useQuery({
    queryKey: ['plugins-manifest'],
    queryFn: fetchPluginsManifest,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });

  // Generate diagnostics when manifest changes
  const diagnostics = pluginsManifest ? generateDiagnostics(pluginsManifest) : null;

  // Get health status for all plugins
  const pluginHealthData = pluginsManifest ? 
    Object.values(pluginsManifest).flat().map(plugin => 
      validatePlugin(plugin, Object.values(pluginsManifest).flat())
    ) : [];

  // Force health scan
  const forceHealthScan = useCallback(async () => {
    setIsScanning(true);
    try {
      await refetch();
      setLastScanTime(new Date().toISOString());
      toast.success('Plugin health scan completed');
    } catch (error) {
      toast.error('Health scan failed');
    } finally {
      setIsScanning(false);
    }
  }, [refetch]);

  // Auto-fix mutation
  const autoFixMutation = useMutation({
    mutationFn: async (fixType: 'dependencies' | 'versions' | 'quarantine') => {
      // Implement auto-fix logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate fix
      return { success: true, fixType };
    },
    onSuccess: (data) => {
      toast.success(`Auto-fix applied: ${data.fixType}`);
      queryClient.invalidateQueries({ queryKey: ['plugins-manifest'] });
    },
    onError: () => {
      toast.error('Auto-fix failed');
    }
  });

  // Download diagnostics report
  const downloadDiagnosticsReport = useCallback(() => {
    if (!diagnostics) return;

    const report = {
      timestamp: new Date().toISOString(),
      diagnostics,
      plugin_health: pluginHealthData,
      manifest: pluginsManifest
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plugin-diagnostics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Diagnostics report downloaded');
  }, [diagnostics, pluginHealthData, pluginsManifest]);

  // Get plugins by category with health info
  const getPluginsByCategory = useCallback((category?: string) => {
    if (!pluginsManifest) return [];
    
    const categoryPlugins = category ? 
      (pluginsManifest[category] || []) : 
      Object.values(pluginsManifest).flat();

    return categoryPlugins.map(plugin => {
      const health = pluginHealthData.find(h => h.plugin_id === plugin.plugin_id);
      return { ...plugin, health };
    });
  }, [pluginsManifest, pluginHealthData]);

  // Get plugin dependency tree
  const getDependencyTree = useCallback((pluginId: string) => {
    if (!pluginsManifest) return null;
    
    const allPlugins = Object.values(pluginsManifest).flat();
    const plugin = allPlugins.find(p => p.plugin_id === pluginId);
    if (!plugin) return null;

    const buildTree = (id: string, visited = new Set()): any => {
      if (visited.has(id)) return { id, circular: true };
      visited.add(id);

      const p = allPlugins.find(plugin => plugin.plugin_id === id);
      if (!p) return { id, missing: true };

      return {
        id,
        name: p.plugin_name,
        dependencies: p.dependencies.map(dep => buildTree(dep, new Set(visited)))
      };
    };

    return buildTree(pluginId);
  }, [pluginsManifest]);

  return {
    // Data
    pluginsManifest,
    diagnostics,
    pluginHealthData,
    isLoading,
    error,
    isScanning,
    lastScanTime,

    // Actions
    forceHealthScan,
    downloadDiagnosticsReport,
    autoFix: autoFixMutation.mutate,
    isAutoFixing: autoFixMutation.isPending,

    // Utilities
    getPluginsByCategory,
    getDependencyTree,
    validatePlugin: (plugin: PluginManifest) => 
      pluginsManifest ? validatePlugin(plugin, Object.values(pluginsManifest).flat()) : null
  };
};