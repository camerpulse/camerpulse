import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAshenSecurity } from '@/hooks/useAshenSecurity';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Target,
  Bug,
  Download,
  Settings,
  TrendingUp,
  Activity
} from 'lucide-react';

export const AshenSecurityPanel: React.FC = () => {
  const {
    securityTests,
    securityBreaches,
    securityLogs,
    securityConfig,
    securityStatus,
    isLoading,
    runPenetrationTests,
    replaySecurityBreaches,
    updateSecurityConfig,
    applySecurityPatch,
    acknowledgeVulnerability,
    getConfigValue,
    getVulnerabilityStats,
    getTestStats
  } = useAshenSecurity();

  const { toast } = useToast();
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isReplayingBreaches, setIsReplayingBreaches] = useState(false);

  const vulnStats = getVulnerabilityStats();
  const testStats = getTestStats();

  const handleRunPenetrationTests = async () => {
    try {
      setIsRunningTests(true);
      await runPenetrationTests();
      toast({
        title: "Penetration Tests Completed",
        description: "Security scan finished successfully",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to run penetration tests",
        variant: "destructive",
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleReplayBreaches = async () => {
    try {
      setIsReplayingBreaches(true);
      await replaySecurityBreaches();
      toast({
        title: "Breach Replay Completed",
        description: "Historical vulnerability replay finished",
      });
    } catch (error) {
      toast({
        title: "Replay Failed",
        description: "Failed to replay security breaches",
        variant: "destructive",
      });
    } finally {
      setIsReplayingBreaches(false);
    }
  };

  const handleConfigToggle = async (key: string, value: boolean) => {
    try {
      await updateSecurityConfig(key, value);
      toast({
        title: "Configuration Updated",
        description: `${key} has been ${value ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update configuration",
        variant: "destructive",
      });
    }
  };

  const handleApplyPatch = async (vulnerabilityId: string) => {
    try {
      await applySecurityPatch(vulnerabilityId, {
        patch_type: 'auto_fix',
        applied_by: 'ashen_security_engine'
      });
      toast({
        title: "Patch Applied",
        description: "Security vulnerability has been patched",
      });
    } catch (error) {
      toast({
        title: "Patch Failed",
        description: "Failed to apply security patch",
        variant: "destructive",
      });
    }
  };

  const handleAcknowledge = async (logId: string) => {
    try {
      await acknowledgeVulnerability(logId);
      toast({
        title: "Vulnerability Acknowledged",
        description: "Security issue has been acknowledged",
      });
    } catch (error) {
      toast({
        title: "Acknowledge Failed",
        description: "Failed to acknowledge vulnerability",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTestResultColor = (result: string) => {
    switch (result) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getSecurityGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      case 'F': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Grade</p>
                <p className={`text-3xl font-bold ${getSecurityGradeColor(securityStatus?.security_grade || 'F')}`}>
                  {securityStatus?.security_grade || 'F'}
                </p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-4">
              <Progress value={securityStatus?.security_score || 0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Score: {securityStatus?.security_score || 0}/100
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Vulnerabilities</p>
                <p className="text-3xl font-bold text-red-600">{vulnStats.open}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="mt-4">
              <div className="flex gap-2">
                <Badge variant="destructive" className="text-xs">
                  {vulnStats.critical} Critical
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {vulnStats.high} High
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Tests</p>
                <p className="text-3xl font-bold">{testStats.total}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">{testStats.passed} Passed</span>
                <span className="text-red-600">{testStats.failed} Failed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Scan</p>
                <p className="text-sm font-bold">
                  {securityStatus?.last_scan 
                    ? new Date(securityStatus.last_scan).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-4">
              <Button 
                size="sm" 
                onClick={handleRunPenetrationTests}
                disabled={isRunningTests}
                className="w-full"
              >
                {isRunningTests ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Scan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tests">Penetration Tests</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="breaches">Breach Replay</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Security Penetration Tests</CardTitle>
                  <CardDescription>
                    Automated security testing across all modules and endpoints
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleRunPenetrationTests}
                    disabled={isRunningTests}
                  >
                    {isRunningTests ? (
                      <>
                        <Activity className="mr-2 h-4 w-4 animate-spin" />
                        Running Tests...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run All Tests
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityTests.slice(0, 10).map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{test.test_name}</h4>
                        <Badge variant="outline">{test.test_type}</Badge>
                        {test.test_result === 'passed' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : test.test_result === 'failed' ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Target: {test.target_endpoint} | Risk Score: {test.exploit_risk_score}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {test.attack_vector}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${getTestResultColor(test.test_result)}`}>
                        {test.test_result.toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(test.executed_at).toLocaleString()}
                      </p>
                      {test.vulnerability_found && (
                        <Badge variant="destructive" className="mt-1">
                          Vulnerability Found
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Vulnerabilities</CardTitle>
              <CardDescription>
                Security issues requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityLogs.filter(log => log.status === 'open').slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(log.severity)}`}></div>
                        <h4 className="font-medium">{log.vulnerability_type}</h4>
                        <Badge variant="outline">{log.severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Module: {log.module_name} | Score: {log.exploit_risk_score}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.attack_vector}
                      </p>
                      {log.remediation_steps && log.remediation_steps.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium">Remediation Steps:</p>
                          <ul className="text-xs text-muted-foreground list-disc list-inside">
                            {log.remediation_steps.slice(0, 2).map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {log.exploit_risk_score > 75 && (
                        <Button 
                          size="sm" 
                          onClick={() => handleApplyPatch(log.id)}
                          className="text-xs"
                        >
                          Auto-Fix
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAcknowledge(log.id)}
                        className="text-xs"
                      >
                        Acknowledge
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breaches" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Security Breach Replay</CardTitle>
                  <CardDescription>
                    Test against historical vulnerabilities
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleReplayBreaches}
                  disabled={isReplayingBreaches}
                >
                  {isReplayingBreaches ? (
                    <>
                      <Activity className="mr-2 h-4 w-4 animate-spin" />
                      Replaying...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Replay All
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityBreaches.slice(0, 10).map((breach) => (
                  <div key={breach.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{breach.breach_name}</h4>
                        <Badge variant="outline">{breach.breach_type}</Badge>
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(breach.current_risk_level)}`}></div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Target: {breach.target_module} | Method: {breach.exploit_method}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Original Date: {breach.original_date ? new Date(breach.original_date).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={breach.replay_result === 'vulnerable' ? 'destructive' : 'secondary'}
                      >
                        {breach.replay_result}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(breach.last_replayed_at).toLocaleDateString()}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {breach.patch_status}
                      </Badge>
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
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>
                Manage security testing and monitoring settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="penetration-testing">Penetration Testing</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable automated penetration testing
                    </p>
                  </div>
                  <Switch
                    id="penetration-testing"
                    checked={getConfigValue('penetration_testing_enabled') === 'true'}
                    onCheckedChange={(checked) => handleConfigToggle('penetration_testing_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-fix">Auto-Fix Vulnerabilities</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically apply fixes for high-risk vulnerabilities
                    </p>
                  </div>
                  <Switch
                    id="auto-fix"
                    checked={getConfigValue('auto_fix_enabled') === 'true'}
                    onCheckedChange={(checked) => handleConfigToggle('auto_fix_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="breach-replay">Breach Replay</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable security breach replay testing
                    </p>
                  </div>
                  <Switch
                    id="breach-replay"
                    checked={getConfigValue('breach_replay_enabled') === 'true'}
                    onCheckedChange={(checked) => handleConfigToggle('breach_replay_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Security Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications for security findings
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={getConfigValue('notification_enabled') === 'true'}
                    onCheckedChange={(checked) => handleConfigToggle('notification_enabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Security Reports</CardTitle>
                  <CardDescription>
                    Generate and download security reports
                  </CardDescription>
                </div>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Vulnerability Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Critical:</span>
                      <span className="font-medium text-red-600">{vulnStats.critical}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>High:</span>
                      <span className="font-medium text-orange-600">{vulnStats.high}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medium:</span>
                      <span className="font-medium text-yellow-600">{vulnStats.medium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Low:</span>
                      <span className="font-medium text-green-600">{vulnStats.low}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Test Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Tests:</span>
                      <span className="font-medium">{testStats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passed:</span>
                      <span className="font-medium text-green-600">{testStats.passed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed:</span>
                      <span className="font-medium text-red-600">{testStats.failed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>With Vulnerabilities:</span>
                      <span className="font-medium text-orange-600">{testStats.with_vulnerabilities}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="mt-6">
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Security health trending {vulnStats.open > vulnStats.patched ? 'down' : 'up'} based on recent activity.
                  {vulnStats.critical > 0 && ' Critical vulnerabilities require immediate attention.'}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};