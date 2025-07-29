import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  Activity, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Clock,
  Shield,
  RefreshCw,
  Eye,
  Play,
  Pause,
  GitBranch,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AutonomousConfig {
  zero_input_mode: {
    config: { enabled: boolean; silent_mode: boolean; smart_mode: boolean };
    enabled: boolean;
    risk_threshold: number;
    scan_frequency: number;
  };
  auto_upgrade: {
    config: { enabled: boolean; check_frequency_hours: number; auto_apply: boolean };
    enabled: boolean;
    risk_threshold: number;
    scan_frequency: number;
  };
  monitoring_scope: {
    config: { 
      ui_elements: boolean; 
      api_failures: boolean; 
      permissions: boolean; 
      mobile_responsive: boolean; 
      data_integrity: boolean; 
    };
    enabled: boolean;
    risk_threshold: number;
    scan_frequency: number;
  };
}

interface SystemStatus {
  recentOperations: any[];
  pendingApprovals: any[];
  recentIssues: any[];
  configuration: any[];
  systemHealth: { score: number; status: string };
}

const ZeroInputMode: React.FC = () => {
  const [config, setConfig] = useState<AutonomousConfig | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadSystemStatus();
    const interval = setInterval(loadSystemStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ashen-autonomous-monitor', {
        body: { action: 'status' }
      });

      if (error) throw error;

      if (data.status) {
        setSystemStatus(data.status);
        
        // Parse configuration into typed format
        const configMap: any = {};
        data.status.configuration?.forEach((item: any) => {
          configMap[item.config_key] = {
            config: item.config_value,
            enabled: item.is_enabled,
            risk_threshold: item.risk_threshold,
            scan_frequency: item.scan_frequency_minutes
          };
        });
        setConfig(configMap);
      }
    } catch (error) {
      console.error('Error loading system status:', error);
      toast({
        title: "Error",
        description: "Failed to load system status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutonomousMode = async (enabled: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('ashen-autonomous-monitor', {
        body: {
          action: 'configure',
          options: {
            configKey: 'zero_input_mode',
            configValue: { ...config?.zero_input_mode.config, enabled },
            enabled,
            riskThreshold: config?.zero_input_mode.risk_threshold,
            scanFrequency: config?.zero_input_mode.scan_frequency
          }
        }
      });

      if (error) throw error;

      await loadSystemStatus();
      toast({
        title: "Success",
        description: `Zero Input Mode ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error toggling autonomous mode:', error);
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive"
      });
    }
  };

  const runManualScan = async () => {
    setIsScanning(true);
    setScanProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke('ashen-autonomous-monitor', {
        body: {
          action: 'scan',
          options: {
            scanTypes: ['ui', 'api', 'permissions', 'mobile', 'data_integrity']
          }
        }
      });

      clearInterval(progressInterval);
      setScanProgress(100);

      if (error) throw error;

      toast({
        title: "Scan Complete",
        description: `Found ${data.issuesFound} issues that need attention`,
      });

      await loadSystemStatus();
    } catch (error) {
      console.error('Error running scan:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to complete system scan",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const approveOperation = async (operationId: string) => {
    try {
      const { error } = await supabase.functions.invoke('ashen-autonomous-monitor', {
        body: {
          action: 'approve',
          target: operationId,
          options: { approvedBy: 'admin' }
        }
      });

      if (error) throw error;

      toast({
        title: "Operation Approved",
        description: "The autonomous operation has been executed",
      });

      await loadSystemStatus();
    } catch (error) {
      console.error('Error approving operation:', error);
      toast({
        title: "Error",
        description: "Failed to approve operation",
        variant: "destructive"
      });
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'requires_approval': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Bot className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Zero Input Mode</h2>
          <Badge variant="outline">Loading...</Badge>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Zero Input Mode</h2>
          <Badge variant={config?.zero_input_mode.enabled ? "default" : "outline"}>
            {config?.zero_input_mode.enabled ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Autonomous Mode</Label>
            <Switch
              checked={config?.zero_input_mode.enabled || false}
              onCheckedChange={toggleAutonomousMode}
            />
          </div>
          <Button 
            onClick={runManualScan} 
            disabled={isScanning}
            variant="outline"
          >
            {isScanning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Manual Scan
              </>
            )}
          </Button>
        </div>
      </div>

      {isScanning && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">System Scan Progress</span>
                <span className="text-sm text-muted-foreground">{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="font-medium">System Health</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {systemStatus?.systemHealth.score || 0}%
              </div>
              <Badge variant={
                (systemStatus?.systemHealth.status === 'healthy') ? 'default' :
                (systemStatus?.systemHealth.status === 'warning') ? 'secondary' : 'destructive'
              }>
                {systemStatus?.systemHealth.status || 'Unknown'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span className="font-medium">Pending Approvals</span>
            </div>
            <div className="text-2xl font-bold">
              {systemStatus?.pendingApprovals.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-success" />
              <span className="font-medium">Auto Fixes Applied</span>
            </div>
            <div className="text-2xl font-bold">
              {systemStatus?.recentOperations.filter(op => op.fix_applied && !op.human_approval_required).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="operations" className="w-full">
        <TabsList>
          <TabsTrigger value="operations">Recent Operations</TabsTrigger>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="issues">Detected Issues</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Recent Autonomous Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemStatus?.recentOperations.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No recent operations
                  </div>
                ) : (
                  systemStatus?.recentOperations.map((operation) => (
                    <div key={operation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(operation.status)}
                        <div>
                          <div className="font-medium capitalize">
                            {operation.operation_type} - {operation.target_module || 'System'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Risk Score: {operation.risk_score}/10 | {new Date(operation.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={operation.fix_applied ? 'default' : 'outline'}>
                          {operation.fix_applied ? 'Applied' : 'Pending'}
                        </Badge>
                        {operation.human_approval_required && (
                          <Badge variant="secondary">Requires Approval</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Operations Requiring Human Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemStatus?.pendingApprovals.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No pending approvals
                  </div>
                ) : (
                  systemStatus?.pendingApprovals.map((operation) => (
                    <div key={operation.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize">
                            {operation.operation_type} - {operation.target_module || 'System'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Risk Score: {operation.risk_score}/10 | {new Date(operation.created_at).toLocaleString()}
                          </div>
                        </div>
                        <Badge variant="secondary">High Risk</Badge>
                      </div>
                      
                      {operation.operation_details && (
                        <div className="text-sm bg-muted p-3 rounded">
                          <strong>Details:</strong> {JSON.stringify(operation.operation_details, null, 2)}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => approveOperation(operation.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve & Execute
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Review Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Recently Detected Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemStatus?.recentIssues.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No recent issues detected
                  </div>
                ) : (
                  systemStatus?.recentIssues.map((issue) => (
                    <div key={issue.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={getSeverityColor(issue.issue_severity)}>
                          {issue.issue_severity}
                        </Badge>
                        <span className="text-sm text-muted-foreground capitalize">
                          {issue.scan_type} scan
                        </span>
                      </div>
                      <div className="font-medium">{issue.issue_description}</div>
                      {issue.suggested_fix && (
                        <div className="text-sm text-muted-foreground mt-1">
                          <strong>Suggested Fix:</strong> {issue.suggested_fix}
                        </div>
                      )}
                      {issue.can_auto_fix && (
                        <Badge variant="outline" className="mt-2">
                          Auto-fixable
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Autonomous Mode Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Risk Threshold (1-10)</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={config?.zero_input_mode.risk_threshold || 6}
                    onChange={() => {}} // TODO: Implement
                  />
                  <div className="text-xs text-muted-foreground">
                    Auto-fixes above this risk score require approval
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Scan Frequency (minutes)</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={config?.zero_input_mode.scan_frequency || 10}
                    onChange={() => {}} // TODO: Implement
                  />
                  <div className="text-xs text-muted-foreground">
                    How often to run autonomous scans
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Monitoring Scope</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {config?.monitoring_scope.config && Object.entries(config.monitoring_scope.config).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="capitalize">{key.replace(/_/g, ' ')}</Label>
                      <Switch checked={enabled as boolean} onCheckedChange={() => {}} />
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Safety Guardrails:</strong> Autonomous mode will never modify payment gateways, 
                  delete user data, or change security settings without explicit approval.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ZeroInputMode;