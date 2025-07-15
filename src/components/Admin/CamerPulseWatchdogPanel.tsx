import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Activity, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Play, 
  Wrench,
  Clock,
  Settings,
  Eye,
  TestTube,
  Zap,
  Target,
  RefreshCw,
  Bell,
  BarChart3
} from 'lucide-react';
import { useCamerPulseWatchdog } from '@/hooks/useCamerPulseWatchdog';

const CamerPulseWatchdogPanel = () => {
  const {
    modules,
    watchdogLogs,
    simulationTests,
    config,
    isLoading,
    updateConfig,
    runSimulationTest,
    runWeeklySimulations,
    simulateModuleError,
    attemptAutoRepair,
    refreshData
  } = useCamerPulseWatchdog();

  const [isRunningTests, setIsRunningTests] = useState(false);

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'unhealthy': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTestResultColor = (result: string) => {
    switch (result) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'error': return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  const runTestSuite = async () => {
    setIsRunningTests(true);
    try {
      await runWeeklySimulations();
    } finally {
      setIsRunningTests(false);
    }
  };

  const healthyModules = modules.filter(m => m.health_status === 'healthy').length;
  const unhealthyModules = modules.filter(m => m.health_status === 'unhealthy').length;
  const warningModules = modules.filter(m => m.health_status === 'warning').length;
  
  const recentErrors = watchdogLogs.filter(log => log.event_type === 'error').length;
  const autoRepairedCount = watchdogLogs.filter(log => log.auto_repaired).length;
  const passedTests = simulationTests.filter(test => test.test_result === 'passed').length;
  const failedTests = simulationTests.filter(test => test.test_result === 'failed').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 animate-pulse" />
          <div className="h-6 bg-muted animate-pulse rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">CamerPulse Intelligence Watchdog</h2>
            <p className="text-sm text-muted-foreground">
              Real-time stability monitoring and auto-repair for CamerPulse modules
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={runTestSuite}
            disabled={isRunningTests}
            size="sm"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isRunningTests ? 'Running Tests...' : 'Run Test Suite'}
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Module Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthyModules}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Healthy</span>
              {warningModules > 0 && <span className="text-yellow-600">• {warningModules} Warning</span>}
              {unhealthyModules > 0 && <span className="text-red-600">• {unhealthyModules} Unhealthy</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Repairs</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{autoRepairedCount}</div>
            <div className="text-xs text-muted-foreground">
              Fixed automatically
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Results</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{passedTests}</div>
            <div className="text-xs text-muted-foreground">
              Passed • {failedTests} Failed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{recentErrors}</div>
            <div className="text-xs text-muted-foreground">
              Last 24 hours
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Watchdog Status */}
      {config.camerpulse_watchdog_enabled && (
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription>
            <strong>CamerPulse Watchdog Active:</strong> Monitoring {modules.length} modules with 
            {config.camerpulse_auto_repair_threshold}% auto-repair threshold. 
            {config.camerpulse_simulation_tests_enabled && 'Weekly simulation tests enabled.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="logs">Event Logs</TabsTrigger>
          <TabsTrigger value="tests">Simulation Tests</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="controls">Test Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CamerPulse Module Registry</CardTitle>
              <CardDescription>
                Real-time monitoring status of all CamerPulse Intelligence modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getHealthStatusColor(module.health_status)}`}>
                        {module.health_status === 'healthy' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : module.health_status === 'warning' ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{module.module_name}</div>
                        <div className="text-sm text-muted-foreground">{module.file_path}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{module.component_type}</Badge>
                          {module.route_path && (
                            <Badge variant="outline">{module.route_path}</Badge>
                          )}
                          <Badge variant={getSeverityColor(module.metadata?.priority || 'low')}>
                            {module.metadata?.criticality || 'unknown'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        Errors: <span className="font-semibold">{module.error_count}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last check: {new Date(module.last_error_at || Date.now()).toLocaleTimeString()}
                      </div>
                      <Button
                        onClick={() => simulateModuleError(module.module_id)}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        Test Error
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Watchdog Event Logs</CardTitle>
              <CardDescription>
                Real-time monitoring events and auto-repair activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {watchdogLogs.map((log) => (
                  <div key={log.id} className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                        <Badge variant="outline">
                          {log.event_type}
                        </Badge>
                        {log.auto_repaired && (
                          <Badge variant="default">
                            <Zap className="h-3 w-3 mr-1" />
                            Auto-Fixed
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-1">{log.event_message}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      Module: {log.module_id}
                      {log.fix_confidence_score > 0 && (
                        <span className="ml-2">
                          Confidence: {log.fix_confidence_score}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulation Test Results</CardTitle>
              <CardDescription>
                Automated user flow and component testing results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {simulationTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-semibold">{test.test_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Target: {test.target_module} • Type: {test.test_type}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={test.test_result === 'passed' ? 'default' : 'destructive'}>
                          {test.test_result}
                        </Badge>
                        {test.execution_time_ms && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {test.execution_time_ms}ms
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${getTestResultColor(test.test_result)}`}>
                        {test.test_result.toUpperCase()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(test.executed_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Watchdog Configuration</CardTitle>
              <CardDescription>
                Configure CamerPulse Intelligence monitoring and auto-repair settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="watchdog-enabled">Real-Time Module Watchdog</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable continuous monitoring of CamerPulse modules
                  </p>
                </div>
                <Switch
                  id="watchdog-enabled"
                  checked={config.camerpulse_watchdog_enabled}
                  onCheckedChange={(checked) => updateConfig('camerpulse_watchdog_enabled', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="repair-threshold">Auto-Repair Threshold</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="repair-threshold"
                    type="number"
                    min="0"
                    max="100"
                    value={config.camerpulse_auto_repair_threshold}
                    onChange={(e) => updateConfig('camerpulse_auto_repair_threshold', parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm">%</span>
                  <Progress value={config.camerpulse_auto_repair_threshold} className="flex-1" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Minimum confidence score required for automatic repairs (default: 85%)
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="simulation-tests">Weekly Simulation Tests</Label>
                  <p className="text-sm text-muted-foreground">
                    Run automated user flow tests weekly
                  </p>
                </div>
                <Switch
                  id="simulation-tests"
                  checked={config.camerpulse_simulation_tests_enabled}
                  onCheckedChange={(checked) => updateConfig('camerpulse_simulation_tests_enabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="patch-notifications">Patch Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify admin when patches are available
                  </p>
                </div>
                <Switch
                  id="patch-notifications"
                  checked={config.camerpulse_patch_notifications_enabled}
                  onCheckedChange={(checked) => updateConfig('camerpulse_patch_notifications_enabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="real-time-monitoring">Real-Time Monitoring</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable live monitoring and instant alerts
                  </p>
                </div>
                <Switch
                  id="real-time-monitoring"
                  checked={config.camerpulse_real_time_monitoring}
                  onCheckedChange={(checked) => updateConfig('camerpulse_real_time_monitoring', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
              <CardDescription>
                Manual testing and simulation controls for CamerPulse modules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={runTestSuite}
                  disabled={isRunningTests}
                  className="w-full"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {isRunningTests ? 'Running Full Test Suite...' : 'Run Full Test Suite'}
                </Button>

                <Button
                  onClick={() => runSimulationTest(
                    'Manual Component Test',
                    'component_test',
                    'sentiment-dashboard',
                    { action: 'manual_test' }
                  )}
                  variant="outline"
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Single Test
                </Button>

                <Button
                  onClick={() => simulateModuleError('sentiment-dashboard', 'manual_test')}
                  variant="outline"
                  className="w-full"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Simulate Error
                </Button>

                <Button
                  onClick={() => attemptAutoRepair('sentiment-dashboard', { test: 'manual' })}
                  variant="outline"
                  className="w-full"
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Test Auto-Repair
                </Button>
              </div>

              <Alert>
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  <strong>Testing Mode:</strong> These controls are for testing the watchdog system. 
                  They simulate real scenarios without affecting actual CamerPulse modules.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CamerPulseWatchdogPanel;