import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityTest {
  id: string;
  test_name: string;
  test_type: string;
  target_endpoint: string;
  attack_vector: string;
  test_result: string;
  exploit_risk_score: number;
  vulnerability_found: boolean;
  patch_suggested: boolean;
  patch_applied: boolean;
  executed_at: string;
  metadata?: any;
}

interface SecurityBreach {
  id: string;
  breach_name: string;
  breach_type: string;
  target_module: string;
  exploit_method: string;
  replay_result: string;
  current_risk_level: string;
  patch_status: string;
  last_replayed_at: string;
  fix_suggestions?: any;
  original_date?: string;
  replay_details?: any;
  created_at?: string;
}

interface SecurityLog {
  id: string;
  module_name: string;
  vulnerability_type: string;
  attack_vector: string;
  severity: string;
  exploit_risk_score: number;
  status: string;
  detection_method: string;
  created_at: string;
  remediation_steps?: string[];
}

interface SecurityConfig {
  id: string;
  config_key: string;
  config_value: any;
  description?: string;
  is_active: boolean;
}

interface SecurityStatus {
  security_grade: string;
  security_score: number;
  total_tests_run: number;
  failed_tests: number;
  open_vulnerabilities: number;
  critical_vulnerabilities: number;
  high_vulnerabilities: number;
  last_scan: string | null;
}

export const useAshenSecurity = () => {
  const [securityTests, setSecurityTests] = useState<SecurityTest[]>([]);
  const [securityBreaches, setSecurityBreaches] = useState<SecurityBreach[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig[]>([]);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSecurityData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load security tests
      const { data: tests } = await supabase
        .from('ashen_security_tests')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(50);

      // Load security breaches
      const { data: breaches } = await supabase
        .from('ashen_security_breaches')
        .select('*')
        .order('last_replayed_at', { ascending: false })
        .limit(20);

      // Load security logs
      const { data: logs } = await supabase
        .from('ashen_security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      // Load security config
      const { data: config } = await supabase
        .from('ashen_security_config')
        .select('*')
        .eq('is_active', true)
        .order('config_key');

      setSecurityTests(tests || []);
      setSecurityBreaches(breaches || []);
      setSecurityLogs(logs || []);
      setSecurityConfig(config || []);

      // Get security status via edge function
      await loadSecurityStatus();
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSecurityStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ashen-security-engine', {
        body: { action: 'get_security_status' }
      });

      if (error) throw error;

      if (data?.security_status) {
        setSecurityStatus(data.security_status);
      }
    } catch (error) {
      console.error('Failed to load security status:', error);
    }
  }, []);

  const runPenetrationTests = useCallback(async (target?: string, testTypes?: string[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('ashen-security-engine', {
        body: {
          action: 'run_penetration_tests',
          target,
          test_types: testTypes
        }
      });

      if (error) throw error;

      // Refresh data after running tests
      await loadSecurityData();
      
      return data;
    } catch (error) {
      console.error('Failed to run penetration tests:', error);
      throw error;
    }
  }, [loadSecurityData]);

  const replaySecurityBreaches = useCallback(async (targetModule?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ashen-security-engine', {
        body: {
          action: 'replay_breaches',
          target: targetModule
        }
      });

      if (error) throw error;

      // Refresh data after replay
      await loadSecurityData();
      
      return data;
    } catch (error) {
      console.error('Failed to replay security breaches:', error);
      throw error;
    }
  }, [loadSecurityData]);

  const updateSecurityConfig = useCallback(async (configKey: string, configValue: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('ashen-security-engine', {
        body: {
          action: 'update_config',
          config_updates: { [configKey]: configValue }
        }
      });

      if (error) throw error;

      // Update local config state
      setSecurityConfig(prev => prev.map(config => 
        config.config_key === configKey 
          ? { ...config, config_value: configValue }
          : config
      ));

      return data;
    } catch (error) {
      console.error('Failed to update security config:', error);
      throw error;
    }
  }, []);

  const applySecurityPatch = useCallback(async (vulnerabilityId: string, patchDetails: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('ashen-security-engine', {
        body: {
          action: 'apply_patch',
          patch_details: {
            vulnerability_id: vulnerabilityId,
            ...patchDetails
          }
        }
      });

      if (error) throw error;

      // Refresh data after applying patch
      await loadSecurityData();
      
      return data;
    } catch (error) {
      console.error('Failed to apply security patch:', error);
      throw error;
    }
  }, [loadSecurityData]);

  const acknowledgeVulnerability = useCallback(async (logId: string) => {
    try {
      const { error } = await supabase
        .from('ashen_security_logs')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', logId);

      if (error) throw error;

      // Update local state
      setSecurityLogs(prev => prev.map(log => 
        log.id === logId 
          ? { ...log, status: 'acknowledged' }
          : log
      ));
    } catch (error) {
      console.error('Failed to acknowledge vulnerability:', error);
      throw error;
    }
  }, []);

  const getConfigValue = useCallback((key: string) => {
    const config = securityConfig.find(c => c.config_key === key);
    return config ? config.config_value : null;
  }, [securityConfig]);

  const getVulnerabilityStats = useCallback(() => {
    const stats = {
      total: securityLogs.length,
      critical: securityLogs.filter(l => l.severity === 'critical').length,
      high: securityLogs.filter(l => l.severity === 'high').length,
      medium: securityLogs.filter(l => l.severity === 'medium').length,
      low: securityLogs.filter(l => l.severity === 'low').length,
      open: securityLogs.filter(l => l.status === 'open').length,
      patched: securityLogs.filter(l => l.status === 'patched').length
    };
    return stats;
  }, [securityLogs]);

  const getTestStats = useCallback(() => {
    const stats = {
      total: securityTests.length,
      passed: securityTests.filter(t => t.test_result === 'passed').length,
      failed: securityTests.filter(t => t.test_result === 'failed').length,
      with_vulnerabilities: securityTests.filter(t => t.vulnerability_found).length,
      patch_suggested: securityTests.filter(t => t.patch_suggested).length,
      patch_applied: securityTests.filter(t => t.patch_applied).length
    };
    return stats;
  }, [securityTests]);

  // Set up real-time subscriptions
  useEffect(() => {
    const securityTestsChannel = supabase
      .channel('security-tests-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ashen_security_tests' },
        () => loadSecurityData()
      )
      .subscribe();

    const securityLogsChannel = supabase
      .channel('security-logs-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ashen_security_logs' },
        () => loadSecurityData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(securityTestsChannel);
      supabase.removeChannel(securityLogsChannel);
    };
  }, [loadSecurityData]);

  // Load initial data
  useEffect(() => {
    loadSecurityData();
  }, [loadSecurityData]);

  return {
    // Data
    securityTests,
    securityBreaches,
    securityLogs,
    securityConfig,
    securityStatus,
    isLoading,

    // Actions
    runPenetrationTests,
    replaySecurityBreaches,
    updateSecurityConfig,
    applySecurityPatch,
    acknowledgeVulnerability,
    loadSecurityData,

    // Utilities
    getConfigValue,
    getVulnerabilityStats,
    getTestStats
  };
};