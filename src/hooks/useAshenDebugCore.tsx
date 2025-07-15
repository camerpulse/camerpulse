import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AshenConfig {
  auto_healing_enabled: boolean;
  scan_interval_hours: number;
  confidence_threshold: number;
  max_auto_fixes_per_day: number;
  monitoring_enabled: boolean;
  background_healing_enabled: boolean;
  fix_type_filter: 'all' | 'layout' | 'backend' | 'security';
  emergency_alert_threshold: number;
  healing_modes_enabled: string[];
  human_simulation_enabled: boolean;
  browser_emulation_enabled: boolean;
}

interface AshenStatus {
  system_health: 'healthy' | 'warning' | 'critical';
  active_errors: number;
  fixes_today: number;
  last_scan: string | null;
  auto_healing: boolean;
  background_healing: boolean;
  emergency_fixes_in_last_hour: number;
  healing_queue_size: number;
}

export const useAshenDebugCore = () => {
  const [config, setConfig] = useState<AshenConfig>({
    auto_healing_enabled: false,
    scan_interval_hours: 6,
    confidence_threshold: 0.85,
    max_auto_fixes_per_day: 10,
    monitoring_enabled: true,
    background_healing_enabled: false,
    fix_type_filter: 'all',
    emergency_alert_threshold: 3,
    healing_modes_enabled: [],
    human_simulation_enabled: false,
    browser_emulation_enabled: false
  });

  const [status, setStatus] = useState<AshenStatus>({
    system_health: 'healthy',
    active_errors: 0,
    fixes_today: 0,
    last_scan: null,
    auto_healing: false,
    background_healing: false,
    emergency_fixes_in_last_hour: 0,
    healing_queue_size: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load configuration and status
  const loadData = useCallback(async () => {
    try {
      // Load configuration
      const { data: configData } = await supabase
        .from('ashen_monitoring_config')
        .select('*')
        .eq('is_active', true);

      if (configData) {
        const configMap: Record<string, any> = {};
        configData.forEach(item => {
          configMap[item.config_key] = item.config_value;
        });

        setConfig({
          auto_healing_enabled: configMap.auto_healing_enabled === 'true',
          scan_interval_hours: parseInt(configMap.scan_interval_hours || '6'),
          confidence_threshold: parseFloat(configMap.confidence_threshold || '0.85'),
          max_auto_fixes_per_day: parseInt(configMap.max_auto_fixes_per_day || '10'),
          monitoring_enabled: configMap.monitoring_enabled === 'true',
          background_healing_enabled: configMap.background_healing_enabled === 'true',
          fix_type_filter: configMap.fix_type_filter || 'all',
          emergency_alert_threshold: parseInt(configMap.emergency_alert_threshold || '3'),
          healing_modes_enabled: Array.isArray(configMap.healing_modes_enabled) ? configMap.healing_modes_enabled : [],
          human_simulation_enabled: configMap.human_simulation_enabled === 'true',
          browser_emulation_enabled: configMap.browser_emulation_enabled === 'true'
        });
      }

      // Load current status
      const today = new Date().toISOString().split('T')[0];
      
      // Count active errors
      const { count: activeErrors } = await supabase
        .from('ashen_error_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Count today's fixes
      const { count: todayFixes } = await supabase
        .from('ashen_error_logs')
        .select('*', { count: 'exact', head: true })
        .in('status', ['auto_fixed', 'resolved'])
        .gte('resolved_at', `${today}T00:00:00Z`);

      // Count emergency fixes in last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count: emergencyFixes } = await supabase
        .from('ashen_error_logs')
        .select('*', { count: 'exact', head: true })
        .in('status', ['auto_fixed', 'resolved'])
        .gte('resolved_at', oneHourAgo);

      // Count pending items in healing queue
      const { count: queueSize } = await supabase
        .from('ashen_error_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')
        .gte('confidence_score', config.confidence_threshold);

      // Get critical errors
      const { count: criticalErrors } = await supabase
        .from('ashen_error_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')
        .eq('severity', 'high');

      // Determine system health
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (criticalErrors && criticalErrors > 5) {
        systemHealth = 'critical';
      } else if (activeErrors && activeErrors > 10) {
        systemHealth = 'warning';
      }

      setStatus({
        system_health: systemHealth,
        active_errors: activeErrors || 0,
        fixes_today: todayFixes || 0,
        last_scan: null, // We'd need to track this separately
        auto_healing: config.auto_healing_enabled,
        background_healing: config.background_healing_enabled,
        emergency_fixes_in_last_hour: emergencyFixes || 0,
        healing_queue_size: queueSize || 0
      });

    } catch (error) {
      console.error('Error loading Ashen Debug Core data:', error);
      toast.error('Failed to load debug core status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update configuration
  const updateConfig = useCallback(async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('ashen_monitoring_config')
        .update({ 
          config_value: value.toString(),
          updated_at: new Date().toISOString()
        })
        .eq('config_key', key);

      if (error) throw error;

      setConfig(prev => ({ ...prev, [key]: value }));
      toast.success('Configuration updated');
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Failed to update configuration');
    }
  }, []);

  // Run manual analysis
  const runAnalysis = useCallback(async (type: 'analyze' | 'fix' | 'test' | 'monitor') => {
    try {
      const response = await supabase.functions.invoke('ashen-debug-core', {
        body: { action: type, options: { manual_trigger: true } }
      });

      if (response.error) throw response.error;

      toast.success(`${type} completed successfully`);
      loadData(); // Refresh data
      return response.data;
    } catch (error) {
      console.error(`Error running ${type}:`, error);
      toast.error(`Failed to run ${type}`);
      throw error;
    }
  }, [loadData]);

  // Run monitoring service
  const runMonitoringService = useCallback(async () => {
    try {
      const response = await supabase.functions.invoke('ashen-monitoring-service');
      
      if (response.error) throw response.error;

      toast.success('Monitoring cycle completed');
      loadData(); // Refresh data
      return response.data;
    } catch (error) {
      console.error('Error running monitoring service:', error);
      toast.error('Failed to run monitoring service');
      throw error;
    }
  }, [loadData]);

  // Run background healing cycle
  const runBackgroundHealing = useCallback(async () => {
    try {
      const response = await supabase.functions.invoke('ashen-auto-healer');
      
      if (response.error) throw response.error;

      toast.success(`Background healing completed: ${response.data.healed} fixes applied`);
      loadData(); // Refresh data
      return response.data;
    } catch (error) {
      console.error('Error running background healing:', error);
      toast.error('Failed to run background healing');
      throw error;
    }
  }, [loadData]);

  // Emergency alert check
  const checkEmergencyAlert = useCallback(() => {
    if (status.emergency_fixes_in_last_hour >= config.emergency_alert_threshold) {
      toast.error(`⚠️ Emergency Alert: ${status.emergency_fixes_in_last_hour} auto-fixes in the last hour. Possible system instability detected.`);
      
      // Log emergency alert
      supabase
        .from('camerpulse_activity_timeline')
        .insert({
          module: 'ashen_emergency_alert',
          activity_type: 'emergency_alert',
          activity_summary: `Emergency alert triggered: ${status.emergency_fixes_in_last_hour} fixes in 1 hour`,
          status: 'warning',
          details: {
            fixes_count: status.emergency_fixes_in_last_hour,
            threshold: config.emergency_alert_threshold,
            triggered_at: new Date().toISOString()
          }
        });
    }
  }, [status.emergency_fixes_in_last_hour, config.emergency_alert_threshold]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('ashen-debug-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ashen_error_logs'
        },
        () => {
          loadData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ashen_monitoring_config'
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check for emergency alerts when status changes
  useEffect(() => {
    if (!isLoading) {
      checkEmergencyAlert();
    }
  }, [status.emergency_fixes_in_last_hour, checkEmergencyAlert, isLoading]);

  // Plugin detection helper
  const scanForPlugins = async () => {
    try {
      // This would scan filesystem for known plugin patterns
      // For now, return detected plugins from component paths
      const detectedPlugins = [
        'CivicImportCore',
        'Politicians Module', 
        'Promise Tracker',
        'Polls System',
        'Sentiment Analysis',
        'Public Feedback',
        'Officials Directory'
      ];
      
      return detectedPlugins;
    } catch (error) {
      console.error('Plugin scan failed:', error);
      return [];
    }
  };

  return {
    config,
    status,
    isLoading,
    updateConfig,
    runAnalysis,
    runMonitoringService,
    runBackgroundHealing,
    checkEmergencyAlert,
    scanForPlugins,
    refreshData: loadData
  };
};