import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Plugin {
  id: string;
  plugin_name: string;
  plugin_author: string;
  plugin_version: string;
  plugin_status: string;
  plugin_type: string;
  plugin_risk_score: number;
  file_paths: string[];
  routes_introduced: string[];
  dependencies_used: any;
  api_endpoints: string[];
  database_migrations: string[];
  global_variables: string[];
  component_overrides: string[];
  css_overrides: string[];
  install_date: string;
  created_at: string;
}

interface PluginConflict {
  id: string;
  plugin_a_id: string;
  plugin_b_id: string;
  conflict_type: string;
  conflict_severity: string;
  conflict_description: string;
  affected_resources: string[];
  resolution_suggestion: string;
  auto_resolvable: boolean;
  detected_at: string;
  resolved_at?: string;
}

interface StressTest {
  id: string;
  plugin_id: string;
  test_type: string;
  test_scenario: string;
  device_type: string;
  network_condition: string;
  test_result: string;
  performance_score: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
  render_time_ms: number;
  error_count: number;
  crash_detected: boolean;
  memory_leak_detected: boolean;
  executed_at: string;
}

interface RiskAssessment {
  id: string;
  plugin_id: string;
  security_score: number;
  stability_score: number;
  performance_score: number;
  compatibility_score: number;
  overall_risk_score: number;
  risk_factors: any;
  recommendations: any;
  assessed_by: string;
  created_at: string;
}

interface WatchdogConfig {
  plugin_watchdog_enabled: boolean;
  block_high_risk_plugins: boolean;
  auto_simulation_after_install: boolean;
  plugin_risk_threshold: number;
  stress_test_frequency_hours: number;
  conflict_detection_enabled: boolean;
}

export const usePluginWatchdog = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [conflicts, setConflicts] = useState<PluginConflict[]>([]);
  const [stressTests, setStressTests] = useState<StressTest[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [config, setConfig] = useState<WatchdogConfig>({
    plugin_watchdog_enabled: true,
    block_high_risk_plugins: true,
    auto_simulation_after_install: true,
    plugin_risk_threshold: 70,
    stress_test_frequency_hours: 168,
    conflict_detection_enabled: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load configuration
      const { data: configData } = await supabase
        .from('ashen_monitoring_config')
        .select('config_key, config_value')
        .in('config_key', [
          'plugin_watchdog_enabled',
          'block_high_risk_plugins', 
          'auto_simulation_after_install',
          'plugin_risk_threshold',
          'stress_test_frequency_hours',
          'conflict_detection_enabled'
        ]);

      if (configData) {
        const configMap: Record<string, any> = {};
        configData.forEach(item => {
          configMap[item.config_key] = item.config_value;
        });

        setConfig({
          plugin_watchdog_enabled: configMap.plugin_watchdog_enabled === 'true',
          block_high_risk_plugins: configMap.block_high_risk_plugins === 'true',
          auto_simulation_after_install: configMap.auto_simulation_after_install === 'true',
          plugin_risk_threshold: parseInt(configMap.plugin_risk_threshold || '70'),
          stress_test_frequency_hours: parseInt(configMap.stress_test_frequency_hours || '168'),
          conflict_detection_enabled: configMap.conflict_detection_enabled === 'true'
        });
      }

      // Load plugins
      const { data: pluginsData, error: pluginsError } = await supabase
        .from('plugin_registry')
        .select('*')
        .order('plugin_risk_score', { ascending: false });

      if (pluginsError) throw pluginsError;
      setPlugins(pluginsData || []);

      // Load conflicts
      const { data: conflictsData, error: conflictsError } = await supabase
        .from('plugin_conflicts')
        .select('*')
        .is('resolved_at', null)
        .order('conflict_severity', { ascending: false });

      if (conflictsError) throw conflictsError;
      setConflicts(conflictsData || []);

      // Load recent stress tests
      const { data: testsData, error: testsError } = await supabase
        .from('plugin_stress_tests')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(50);

      if (testsError) throw testsError;
      setStressTests(testsData || []);

      // Load risk assessments
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('plugin_risk_assessments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (assessmentsError) throw assessmentsError;
      setRiskAssessments(assessmentsData || []);

    } catch (error) {
      console.error('Error loading plugin watchdog data:', error);
      toast.error('Failed to load plugin data');
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

  // Scan for plugins
  const scanPlugins = useCallback(async () => {
    try {
      setIsScanning(true);
      
      const response = await supabase.functions.invoke('plugin-stress-watchdog', {
        body: { action: 'scan' }
      });

      if (response.error) throw response.error;

      toast.success(`Plugin scan completed - found ${response.data.plugins_scanned} plugins`);
      loadData(); // Refresh data
      return response.data;
    } catch (error) {
      console.error('Error scanning plugins:', error);
      toast.error('Failed to scan plugins');
      throw error;
    } finally {
      setIsScanning(false);
    }
  }, [loadData]);

  // Analyze specific plugin
  const analyzePlugin = useCallback(async (pluginId: string) => {
    try {
      const response = await supabase.functions.invoke('plugin-stress-watchdog', {
        body: { action: 'analyze', plugin_id: pluginId }
      });

      if (response.error) throw response.error;

      toast.success('Plugin analysis completed');
      loadData(); // Refresh data
      return response.data;
    } catch (error) {
      console.error('Error analyzing plugin:', error);
      toast.error('Failed to analyze plugin');
      throw error;
    }
  }, [loadData]);

  // Run stress tests
  const runStressTest = useCallback(async (pluginId: string) => {
    try {
      const response = await supabase.functions.invoke('plugin-stress-watchdog', {
        body: { action: 'stress_test', plugin_id: pluginId }
      });

      if (response.error) throw response.error;

      toast.success(`Stress tests completed - ${response.data.tests_run} tests run`);
      loadData(); // Refresh data
      return response.data;
    } catch (error) {
      console.error('Error running stress tests:', error);
      toast.error('Failed to run stress tests');
      throw error;
    }
  }, [loadData]);

  // Detect conflicts
  const detectConflicts = useCallback(async () => {
    try {
      const response = await supabase.functions.invoke('plugin-stress-watchdog', {
        body: { action: 'conflict_check' }
      });

      if (response.error) throw response.error;

      toast.success(`Conflict detection completed - ${response.data.conflicts_detected} conflicts found`);
      loadData(); // Refresh data
      return response.data;
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      toast.error('Failed to detect conflicts');
      throw error;
    }
  }, [loadData]);

  // Assess plugin risk
  const assessRisk = useCallback(async (pluginId: string) => {
    try {
      const response = await supabase.functions.invoke('plugin-stress-watchdog', {
        body: { action: 'risk_assess', plugin_id: pluginId }
      });

      if (response.error) throw response.error;

      toast.success(`Risk assessment completed - Score: ${response.data.risk_score}/100`);
      loadData(); // Refresh data
      return response.data;
    } catch (error) {
      console.error('Error assessing risk:', error);
      toast.error('Failed to assess risk');
      throw error;
    }
  }, [loadData]);

  // Resolve conflict
  const resolveConflict = useCallback(async (conflictId: string, resolutionNotes: string) => {
    try {
      const { error } = await supabase
        .from('plugin_conflicts')
        .update({
          resolved_at: new Date().toISOString(),
          resolution_notes: resolutionNotes
        })
        .eq('id', conflictId);

      if (error) throw error;

      toast.success('Conflict marked as resolved');
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast.error('Failed to resolve conflict');
    }
  }, [loadData]);

  // Change plugin status
  const updatePluginStatus = useCallback(async (pluginId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('plugin_registry')
        .update({ plugin_status: status })
        .eq('id', pluginId);

      if (error) throw error;

      toast.success(`Plugin status updated to ${status}`);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error updating plugin status:', error);
      toast.error('Failed to update plugin status');
    }
  }, [loadData]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('plugin-watchdog-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'plugin_registry'
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
          table: 'plugin_conflicts'
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
          table: 'plugin_stress_tests'
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
    plugins,
    conflicts,
    stressTests,
    riskAssessments,
    config,
    isLoading,
    isScanning,
    updateConfig,
    scanPlugins,
    analyzePlugin,
    runStressTest,
    detectConflicts,
    assessRisk,
    resolveConflict,
    updatePluginStatus,
    refreshData: loadData
  };
};