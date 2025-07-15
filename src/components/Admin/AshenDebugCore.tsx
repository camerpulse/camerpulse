import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, CheckCircle, XCircle, Brain, Eye, Settings, Activity, Zap, FileCode } from "lucide-react";
import ErrorDashboard from "./ErrorDashboard";
import HealingHistory from "./HealingHistory";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ErrorLog {
  id: string;
  component_path: string;
  error_type: string;
  error_message: string;
  severity: string;
  confidence_score: number;
  suggested_fix: string;
  status: string;
  created_at: string;
}

interface BehaviorTest {
  id: string;
  test_name: string;
  test_type: string;
  route_tested: string;
  device_type: string;
  test_result: string;
  issues_found: any;
  performance_metrics: any;
  created_at: string;
  screenshot_url?: string;
  metadata?: any;
}

interface CodeAnalysis {
  id: string;
  file_path: string;
  analysis_type: string;
  issues_found: number;
  quality_score: number;
  auto_fixable: boolean;
  last_analyzed: string;
}

export default function AshenDebugCore() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [behaviorTests, setBehaviorTests] = useState<BehaviorTest[]>([]);
  const [codeAnalysis, setCodeAnalysis] = useState<CodeAnalysis[]>([]);
  const [autoHealingEnabled, setAutoHealingEnabled] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  useEffect(() => {
    loadData();
    loadConfig();
  }, []);

  const loadData = async () => {
    try {
      // Load error logs
      const { data: errors } = await supabase
        .from('ashen_error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Load behavior tests
      const { data: tests } = await supabase
        .from('ashen_behavior_tests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Load code analysis
      const { data: analysis } = await supabase
        .from('ashen_code_analysis')
        .select('*')
        .order('last_analyzed', { ascending: false })
        .limit(50);

      if (errors) setErrorLogs(errors);
      if (tests) setBehaviorTests(tests);
      if (analysis) setCodeAnalysis(analysis);

      // Determine system status
      const criticalErrors = errors?.filter(e => e.severity === 'high' && e.status === 'open').length || 0;
      const failedTests = tests?.filter(t => t.test_result === 'failed').length || 0;

      if (criticalErrors > 5 || failedTests > 10) {
        setSystemStatus('critical');
      } else if (criticalErrors > 0 || failedTests > 5) {
        setSystemStatus('warning');
      } else {
        setSystemStatus('healthy');
      }

    } catch (error) {
      console.error('Error loading Ashen Debug data:', error);
      toast.error('Failed to load debug data');
    }
  };

  const loadConfig = async () => {
    try {
      const { data } = await supabase
        .from('ashen_monitoring_config')
        .select('config_value')
        .eq('config_key', 'auto_healing_enabled')
        .single();

      if (data) {
        setAutoHealingEnabled(data.config_value === 'true');
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const toggleAutoHealing = async (enabled: boolean) => {
    try {
      await supabase
        .from('ashen_monitoring_config')
        .update({ config_value: enabled.toString() })
        .eq('config_key', 'auto_healing_enabled');

      setAutoHealingEnabled(enabled);
      toast.success(`Auto-healing ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating auto-healing config:', error);
      toast.error('Failed to update configuration');
    }
  };

  const runAnalysis = async (action: 'analyze' | 'fix' | 'test' | 'monitor') => {
    setIsAnalyzing(true);
    try {
      const response = await supabase.functions.invoke('ashen-debug-core', {
        body: { action, options: { full_scan: true } }
      });

      if (response.error) {
        throw response.error;
      }

      toast.success(`${action} completed successfully`);
      loadData(); // Refresh data
    } catch (error) {
      console.error(`Error running ${action}:`, error);
      toast.error(`Failed to run ${action}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resolveError = async (errorId: string) => {
    try {
      await supabase
        .from('ashen_error_logs')
        .update({ 
          status: 'resolved', 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', errorId);

      loadData();
      toast.success('Error marked as resolved');
    } catch (error) {
      console.error('Error resolving error:', error);
      toast.error('Failed to resolve error');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = () => {
    switch (systemStatus) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Ashen Debug Core</h1>
            <p className="text-muted-foreground">Self-repairing diagnostic engine</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium capitalize">{systemStatus}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="text-sm">Auto-Healing</span>
            <Switch
              checked={autoHealingEnabled}
              onCheckedChange={toggleAutoHealing}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => runAnalysis('analyze')}
              disabled={isAnalyzing}
              className="h-20 flex-col space-y-2"
            >
              <Eye className="h-6 w-6" />
              <span>Analyze Code</span>
            </Button>
            <Button
              onClick={() => runAnalysis('fix')}
              disabled={isAnalyzing || !autoHealingEnabled}
              variant="secondary"
              className="h-20 flex-col space-y-2"
            >
              <Zap className="h-6 w-6" />
              <span>Auto-Fix</span>
            </Button>
            <Button
              onClick={() => runAnalysis('test')}
              disabled={isAnalyzing}
              variant="outline"
              className="h-20 flex-col space-y-2"
            >
              <Activity className="h-6 w-6" />
              <span>Run Tests</span>
            </Button>
            <Button
              onClick={() => runAnalysis('monitor')}
              disabled={isAnalyzing}
              variant="outline"
              className="h-20 flex-col space-y-2"
            >
              <Brain className="h-6 w-6" />
              <span>Monitor</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs defaultValue="error-dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="error-dashboard">Error Dashboard</TabsTrigger>
          <TabsTrigger value="healing-history">Healing History</TabsTrigger>
          <TabsTrigger value="code-health">Code Health</TabsTrigger>
          <TabsTrigger value="tests">Behavior Tests</TabsTrigger>
          <TabsTrigger value="ux-simulation">UX Simulation</TabsTrigger>
          <TabsTrigger value="monitor">System Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="error-dashboard" className="space-y-4">
          <ErrorDashboard />
        </TabsContent>
        
        <TabsContent value="healing-history" className="space-y-4">
          <HealingHistory />
        </TabsContent>

        <TabsContent value="code-health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileCode className="h-5 w-5" />
                <span>Code Health Scanner</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">AST Code Scanner</h3>
                <p className="text-muted-foreground mb-4">
                  Deep code analysis using Abstract Syntax Tree parsing
                </p>
                <Button
                  onClick={() => runAnalysis('analyze')}
                  disabled={isAnalyzing}
                  className="space-x-2"
                >
                  <FileCode className="h-4 w-4" />
                  <span>Run Code Health Scan</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {codeAnalysis.map((analysis) => (
                  <div key={analysis.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{analysis.file_path}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          Quality: {Math.round(analysis.quality_score * 100)}%
                        </Badge>
                        {analysis.auto_fixable && (
                          <Badge variant="secondary">Auto-fixable</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {analysis.issues_found} issues found • {analysis.analysis_type}
                    </p>
                  </div>
                ))}
                {codeAnalysis.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No code analysis results available. Run an analysis to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Behavior Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {behaviorTests.map((test) => (
                  <div key={test.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{test.test_name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={test.test_result === 'passed' ? 'default' : 'destructive'}>
                          {test.test_result}
                        </Badge>
                        <Badge variant="outline">{test.device_type}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Route: {test.route_tested} • {test.test_type}
                    </p>
                    {test.performance_metrics && (
                      <div className="text-xs text-muted-foreground">
                        Load time: {Math.round(test.performance_metrics.load_time)}ms
                      </div>
                    )}
                  </div>
                ))}
                {behaviorTests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No behavior tests have been run yet. Click "Run Tests" to start.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ux-simulation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>UX Simulation Log</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Behavior Testing Engine</h3>
                <p className="text-muted-foreground mb-4">
                  AI-powered human interaction simulation across multiple devices
                </p>
                <Button
                  onClick={() => runAnalysis('test')}
                  disabled={isAnalyzing}
                  className="space-x-2"
                >
                  <Activity className="h-4 w-4" />
                  <span>Run UX Simulation Tests</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <span className="font-medium capitalize">{systemStatus}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Open Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {errorLogs.filter(e => e.status === 'open').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Auto-Healing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${autoHealingEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span>{autoHealingEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}