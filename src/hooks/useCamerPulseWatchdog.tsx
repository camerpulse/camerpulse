import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CamerPulseModule {
  id: string;
  module_name: string;
  module_id: string;
  file_path: string;
  route_path: string;
  component_type: string;
  health_status: string;
  error_count: number;
  last_error_at: string | null;
  monitoring_enabled: boolean;
  metadata: any;
}

interface WatchdogLog {
  id: string;
  module_id: string;
  event_type: string;
  severity: string;
  event_message: string;
  error_details: any;
  fix_attempted: boolean;
  fix_success: boolean;
  fix_confidence_score: number;
  auto_repaired: boolean;
  admin_notified: boolean;
  created_at: string;
}

interface SimulationTest {
  id: string;
  test_name: string;
  test_type: string;
  target_module: string;
  test_scenario: any;
  test_result: string;
  execution_time_ms: number | null;
  error_details: any | null;
  success_metrics: any | null;
  scheduled: boolean;
  executed_at: string;
}

interface WatchdogConfig {
  camerpulse_watchdog_enabled: boolean;
  camerpulse_auto_repair_threshold: number;
  camerpulse_simulation_tests_enabled: boolean;
  camerpulse_patch_notifications_enabled: boolean;
  camerpulse_real_time_monitoring: boolean;
}

export const useCamerPulseWatchdog = () => {
  const [modules, setModules] = useState<CamerPulseModule[]>([]);
  const [watchdogLogs, setWatchdogLogs] = useState<WatchdogLog[]>([]);
  const [simulationTests, setSimulationTests] = useState<SimulationTest[]>([]);
  const [config, setConfig] = useState<WatchdogConfig>({
    camerpulse_watchdog_enabled: true,
    camerpulse_auto_repair_threshold: 85,
    camerpulse_simulation_tests_enabled: true,
    camerpulse_patch_notifications_enabled: true,
    camerpulse_real_time_monitoring: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Refresh every 10 seconds for real-time monitoring
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Load CamerPulse modules
      const { data: modulesData } = await supabase
        .from('camerpulse_module_registry')
        .select('*')
        .order('module_name');

      // Load watchdog logs
      const { data: logsData } = await supabase
        .from('camerpulse_watchdog_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Load simulation tests
      const { data: testsData } = await supabase
        .from('camerpulse_simulation_tests')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(50);

      // Load configuration
      const { data: configData } = await supabase
        .from('ashen_monitoring_config')
        .select('config_key, config_value')
        .in('config_key', [
          'camerpulse_watchdog_enabled',
          'camerpulse_auto_repair_threshold',
          'camerpulse_simulation_tests_enabled',
          'camerpulse_patch_notifications_enabled',
          'camerpulse_real_time_monitoring'
        ]);

      // Parse configuration
      const configObj = configData?.reduce((acc, item) => {
        const value = item.config_key === 'camerpulse_auto_repair_threshold' 
          ? parseInt(item.config_value as string) 
          : item.config_value === 'true';
        acc[item.config_key as keyof WatchdogConfig] = value;
        return acc;
      }, {} as any) || {};

      setModules(modulesData || []);
      setWatchdogLogs(logsData || []);
      setSimulationTests(testsData || []);
      setConfig({ ...config, ...configObj });
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading CamerPulse watchdog data:', error);
      setIsLoading(false);
    }
  };

  const updateConfig = async (key: keyof WatchdogConfig, value: boolean | number) => {
    try {
      await supabase
        .from('ashen_monitoring_config')
        .upsert({
          config_key: key,
          config_value: value.toString(),
          is_active: true,
        });

      setConfig(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error updating watchdog config:', error);
    }
  };

  const logWatchdogEvent = async (
    moduleId: string,
    eventType: 'error' | 'warning' | 'recovery' | 'simulation_test' | 'auto_fix',
    severity: 'low' | 'medium' | 'high' | 'critical',
    eventMessage: string,
    errorDetails: any = {},
    fixAttempted: boolean = false,
    fixSuccess: boolean = false,
    fixConfidenceScore: number = 0,
    autoRepaired: boolean = false
  ) => {
    try {
      await supabase
        .from('camerpulse_watchdog_logs')
        .insert({
          module_id: moduleId,
          event_type: eventType,
          severity,
          event_message: eventMessage,
          error_details: errorDetails,
          fix_attempted: fixAttempted,
          fix_success: fixSuccess,
          fix_confidence_score: fixConfidenceScore,
          auto_repaired: autoRepaired,
          admin_notified: severity === 'critical' || severity === 'high',
        });

      // Update module health status
      await updateModuleHealth(moduleId, eventType === 'error' ? 'unhealthy' : 'healthy');
      
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error logging watchdog event:', error);
    }
  };

  const updateModuleHealth = async (moduleId: string, healthStatus: 'healthy' | 'unhealthy' | 'warning') => {
    try {
      const updateData: any = { 
        health_status: healthStatus,
        last_health_check: new Date().toISOString()
      };

      if (healthStatus === 'healthy') {
        updateData.error_count = 0;
      } else if (healthStatus === 'unhealthy') {
        // Get current error count and increment
        const { data: currentModule } = await supabase
          .from('camerpulse_module_registry')
          .select('error_count')
          .eq('module_id', moduleId)
          .single();
        
        updateData.error_count = (currentModule?.error_count || 0) + 1;
        updateData.last_error_at = new Date().toISOString();
      }

      await supabase
        .from('camerpulse_module_registry')
        .update(updateData)
        .eq('module_id', moduleId);
    } catch (error) {
      console.error('Error updating module health:', error);
    }
  };

  const runSimulationTest = async (
    testName: string,
    testType: 'user_flow' | 'component_test' | 'api_test',
    targetModule: string,
    testScenario: any
  ) => {
    const startTime = Date.now();
    
    try {
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 3000));
      
      const executionTime = Date.now() - startTime;
      const success = Math.random() > 0.1; // 90% success rate for simulation
      
      await supabase
        .from('camerpulse_simulation_tests')
        .insert({
          test_name: testName,
          test_type: testType,
          target_module: targetModule,
          test_scenario: testScenario,
          test_result: success ? 'passed' : 'failed',
          execution_time_ms: executionTime,
          error_details: success ? null : { error: 'Simulated test failure' },
          success_metrics: success ? { response_time: executionTime, status: 'ok' } : null,
          scheduled: false,
        });

      // Log the test result
      await logWatchdogEvent(
        targetModule,
        'simulation_test',
        success ? 'low' : 'medium',
        `Simulation test "${testName}" ${success ? 'passed' : 'failed'}`,
        { test_type: testType, execution_time: executionTime }
      );

      loadData();
      return { success, executionTime };
    } catch (error) {
      console.error('Error running simulation test:', error);
      return { success: false, executionTime: Date.now() - startTime };
    }
  };

  const runWeeklySimulations = async () => {
    const testScenarios = [
      {
        name: 'Search Political Party Flow',
        type: 'user_flow' as const,
        module: 'civic-feed',
        scenario: { action: 'search', target: 'political_party', keyword: 'CPDM' }
      },
      {
        name: 'Rate Politician Component',
        type: 'component_test' as const,
        module: 'sentiment-dashboard',
        scenario: { action: 'rate', target: 'politician', rating: 4 }
      },
      {
        name: 'Comment on Civic Issue',
        type: 'user_flow' as const,
        module: 'civic-voice-agent',
        scenario: { action: 'comment', target: 'civic_issue', content: 'Test comment' }
      },
      {
        name: 'Report Public Threat',
        type: 'api_test' as const,
        module: 'civic-alert-bot',
        scenario: { action: 'report', target: 'threat', severity: 'medium' }
      },
      {
        name: 'Load Regional Heatmap',
        type: 'component_test' as const,
        module: 'regional-heatmap',
        scenario: { action: 'load', target: 'heatmap', region: 'Centre' }
      }
    ];

    for (const test of testScenarios) {
      await runSimulationTest(test.name, test.type, test.module, test.scenario);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const simulateModuleError = async (moduleId: string, errorType: string = 'runtime_error') => {
    const errorMessages = [
      'Component render failed: Cannot read property of undefined',
      'API request timeout: Sentiment analysis service unavailable',
      'Memory leak detected: Component cleanup failed',
      'Form validation error: Invalid input data format',
      'Data fetching error: Database connection timeout'
    ];

    const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    
    await logWatchdogEvent(
      moduleId,
      'error',
      'medium',
      randomError,
      { 
        error_type: errorType,
        timestamp: new Date().toISOString(),
        stack_trace: 'Simulated error for testing purposes'
      }
    );
  };

  const attemptAutoRepair = async (moduleId: string, errorDetails: any) => {
    if (!config.camerpulse_watchdog_enabled) return false;

    const confidenceScore = Math.floor(Math.random() * 100);
    const shouldAttemptRepair = confidenceScore >= config.camerpulse_auto_repair_threshold;

    if (shouldAttemptRepair) {
      // Simulate repair attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
      const repairSuccess = Math.random() > 0.2; // 80% success rate

      await logWatchdogEvent(
        moduleId,
        'auto_fix',
        repairSuccess ? 'low' : 'high',
        `Auto-repair ${repairSuccess ? 'succeeded' : 'failed'} for module ${moduleId}`,
        errorDetails,
        true,
        repairSuccess,
        confidenceScore,
        repairSuccess
      );

      if (repairSuccess) {
        await updateModuleHealth(moduleId, 'healthy');
      }

      return repairSuccess;
    }

    return false;
  };

  return {
    modules,
    watchdogLogs,
    simulationTests,
    config,
    isLoading,
    updateConfig,
    logWatchdogEvent,
    updateModuleHealth,
    runSimulationTest,
    runWeeklySimulations,
    simulateModuleError,
    attemptAutoRepair,
    refreshData: loadData
  };
};