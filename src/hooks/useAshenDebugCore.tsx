import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AshenConfig {
  auto_healing_enabled: boolean;
  scan_interval_hours: number;
  confidence_threshold: number;
  max_auto_fixes_per_day: number;
  monitoring_enabled: boolean;
}

interface AshenStatus {
  system_health: 'healthy' | 'warning' | 'critical';
  active_errors: number;
  fixes_today: number;
  last_scan: string | null;
  auto_healing: boolean;
}

export const useAshenDebugCore = () => {
  const [config, setConfig] = useState<AshenConfig>({
    auto_healing_enabled: false,
    scan_interval_hours: 6,
    confidence_threshold: 0.85,
    max_auto_fixes_per_day: 10,
    monitoring_enabled: true
  });

  const [status, setStatus] = useState<AshenStatus>({
    system_health: 'healthy',
    active_errors: 0,
    fixes_today: 0,
    last_scan: null,
    auto_healing: false
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
          monitoring_enabled: configMap.monitoring_enabled === 'true'
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
        .eq('status', 'auto_fixed')
        .gte('resolved_at', `${today}T00:00:00Z`);

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
        auto_healing: config.auto_healing_enabled
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

  return {
    config,
    status,
    isLoading,
    updateConfig,
    runAnalysis,
    runMonitoringService,
    refreshData: loadData
  };
};