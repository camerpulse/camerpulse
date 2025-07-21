import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PluginVersion {
  id: string;
  plugin_id: string;
  version: string;
  changelog: string;
  released_on: string;
  is_current: boolean;
  manifest_data: any;
  bundle_url?: string;
  download_count: number;
  compatibility_info: {
    min_app_version: string;
    max_app_version?: string;
    deprecated_apis: string[];
    breaking_changes: boolean;
  };
  created_at: string;
}

export interface PluginSnapshot {
  id: string;
  plugin_id: string;
  version_id: string;
  snapshot_data: any;
  created_before_update: boolean;
  created_at: string;
}

export interface UpdateCheckResult {
  plugin_id: string;
  current_version: string;
  latest_version: string;
  has_update: boolean;
  compatibility_issues: string[];
  changelog: string;
  released_on: string;
}

// Hook to get plugin versions
export const usePluginVersions = (pluginId: string) => {
  return useQuery({
    queryKey: ['plugin-versions', pluginId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plugin_versions')
        .select('*')
        .eq('plugin_id', pluginId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PluginVersion[];
    },
    enabled: !!pluginId
  });
};

// Hook to check for plugin updates
export const usePluginUpdateChecker = () => {
  const queryClient = useQueryClient();

  const checkForUpdates = useQuery({
    queryKey: ['plugin-update-check'],
    queryFn: async () => {
      // Get all installed plugins
      const { data: installedPlugins, error: installedError } = await supabase
        .from('plugin_registry')
        .select('id, plugin_name, plugin_version');

      if (installedError) throw installedError;

      // Check each plugin for updates
      const updateChecks: UpdateCheckResult[] = [];

      for (const plugin of installedPlugins || []) {
        const { data: latestVersion } = await supabase
          .from('plugin_versions')
          .select('*')
          .eq('plugin_id', plugin.id)
          .eq('is_current', true)
          .single();

        if (latestVersion && latestVersion.version !== plugin.plugin_version) {
          updateChecks.push({
            plugin_id: plugin.id,
            current_version: plugin.plugin_version,
            latest_version: latestVersion.version,
            has_update: true,
            compatibility_issues: [],
            changelog: latestVersion.changelog,
            released_on: latestVersion.released_on
          });
        }
      }

      return updateChecks;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchInterval: 24 * 60 * 60 * 1000, // Auto-check daily
  });

  const manualCheck = useMutation({
    mutationFn: async () => {
      return await checkForUpdates.refetch();
    },
    onSuccess: (result) => {
      const updates = result.data?.length || 0;
      if (updates > 0) {
        toast.success(`Found ${updates} plugin update(s) available`);
      } else {
        toast.success('All plugins are up to date');
      }
    },
    onError: () => {
      toast.error('Failed to check for updates');
    }
  });

  return {
    updates: checkForUpdates.data || [],
    isChecking: checkForUpdates.isLoading || manualCheck.isPending,
    manualCheck: manualCheck.mutate,
    lastChecked: checkForUpdates.dataUpdatedAt
  };
};

// Hook to update a plugin
export const usePluginUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      pluginId, 
      newVersionId,
      createSnapshot = true 
    }: { 
      pluginId: string; 
      newVersionId: string;
      createSnapshot?: boolean;
    }) => {
      // Create snapshot before update if requested
      if (createSnapshot) {
        const { data: currentPlugin } = await supabase
          .from('plugin_registry')
          .select('*')
          .eq('id', pluginId)
          .single();

        if (currentPlugin) {
          const { error: snapshotError } = await supabase
            .from('plugin_snapshots')
            .insert({
              plugin_id: pluginId,
              version_id: currentPlugin.plugin_version,
              snapshot_data: currentPlugin,
              created_before_update: true
            });

          if (snapshotError) throw snapshotError;
        }
      }

      // Get new version data
      const { data: newVersion, error: versionError } = await supabase
        .from('plugin_versions')
        .select('*')
        .eq('id', newVersionId)
        .single();

      if (versionError) throw versionError;

      // Update plugin registry
      const { error: updateError } = await supabase
        .from('plugin_registry')
        .update({
          plugin_version: newVersion.version,
          last_updated: new Date().toISOString(),
          metadata: {
            ...newVersion.manifest_data,
            updated_from: 'version_control'
          }
        })
        .eq('id', pluginId);

      if (updateError) throw updateError;

      // Log the update
      const { error: historyError } = await supabase
        .from('plugin_activation_history')
        .insert({
          plugin_id: pluginId,
          action_type: 'updated',
          new_status: 'enabled',
          reason: `Updated to version ${newVersion.version}`,
          metadata: {
            from_version: 'previous',
            to_version: newVersion.version,
            changelog: newVersion.changelog
          }
        });

      if (historyError) console.warn('Failed to log update history:', historyError);

      return { success: true, version: newVersion.version };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      queryClient.invalidateQueries({ queryKey: ['plugin-update-check'] });
      toast.success(`Plugin updated to version ${data.version}`);
    },
    onError: (error) => {
      toast.error(`Failed to update plugin: ${error.message}`);
    }
  });
};

// Hook to rollback a plugin
export const usePluginRollback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pluginId }: { pluginId: string }) => {
      // Get latest snapshot
      const { data: snapshot, error: snapshotError } = await supabase
        .from('plugin_snapshots')
        .select('*')
        .eq('plugin_id', pluginId)
        .eq('created_before_update', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (snapshotError || !snapshot) {
        throw new Error('No rollback snapshot available');
      }

      // Restore from snapshot
      const { error: rollbackError } = await supabase
        .from('plugin_registry')
        .update({
          ...snapshot.snapshot_data,
          last_updated: new Date().toISOString(),
          metadata: {
            ...snapshot.snapshot_data.metadata,
            rolled_back_at: new Date().toISOString(),
            rolled_back_from_snapshot: snapshot.id
          }
        })
        .eq('id', pluginId);

      if (rollbackError) throw rollbackError;

      // Log the rollback
      const { error: historyError } = await supabase
        .from('plugin_activation_history')
        .insert({
          plugin_id: pluginId,
          action_type: 'updated',
          new_status: 'enabled',
          reason: 'Plugin rolled back to previous version',
          metadata: {
            rollback: true,
            snapshot_id: snapshot.id,
            restored_version: snapshot.snapshot_data.plugin_version
          }
        });

      if (historyError) console.warn('Failed to log rollback history:', historyError);

      return { 
        success: true, 
        restoredVersion: snapshot.snapshot_data.plugin_version 
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      queryClient.invalidateQueries({ queryKey: ['plugin-update-check'] });
      toast.success(`Plugin rolled back to version ${data.restoredVersion}`);
    },
    onError: (error) => {
      toast.error(`Failed to rollback plugin: ${error.message}`);
    }
  });
};

// Hook to get plugin snapshots
export const usePluginSnapshots = (pluginId: string) => {
  return useQuery({
    queryKey: ['plugin-snapshots', pluginId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plugin_snapshots')
        .select('*')
        .eq('plugin_id', pluginId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PluginSnapshot[];
    },
    enabled: !!pluginId
  });
};

// Hook to check version compatibility
export const useVersionCompatibility = () => {
  return useMutation({
    mutationFn: async ({ 
      pluginId, 
      targetVersion 
    }: { 
      pluginId: string; 
      targetVersion: string;
    }) => {
      // Get plugin's current dependencies and requirements
      const { data: plugin, error: pluginError } = await supabase
        .from('plugin_registry')
        .select('dependencies_used, metadata')
        .eq('id', pluginId)
        .single();

      if (pluginError) throw pluginError;

      // Get target version details
      const { data: version, error: versionError } = await supabase
        .from('plugin_versions')
        .select('compatibility_info, manifest_data')
        .eq('plugin_id', pluginId)
        .eq('version', targetVersion)
        .single();

      if (versionError) throw versionError;

      // Check compatibility
      const issues: string[] = [];
      
      // Check breaking changes
      if (version.compatibility_info.breaking_changes) {
        issues.push('This update contains breaking changes');
      }

      // Check deprecated APIs
      if (version.compatibility_info.deprecated_apis?.length > 0) {
        issues.push(`Uses deprecated APIs: ${version.compatibility_info.deprecated_apis.join(', ')}`);
      }

      // Check app version compatibility
      const currentAppVersion = '1.0.0'; // This would come from app config
      if (version.compatibility_info.min_app_version > currentAppVersion) {
        issues.push(`Requires app version ${version.compatibility_info.min_app_version} or higher`);
      }

      return {
        compatible: issues.length === 0,
        issues,
        canUpdate: issues.length === 0 || !version.compatibility_info.breaking_changes
      };
    }
  });
};