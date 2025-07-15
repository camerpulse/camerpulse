import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, CheckCircle, XCircle, Brain, Eye, Settings, Activity, Zap, FileCode, Monitor, Clock, Shield, Wrench, Target, Puzzle } from "lucide-react";
import ErrorDashboard from "./ErrorDashboard";
import HealingHistory from "./HealingHistory";
import { UIBugLogs } from "./UIBugLogs";
import { LearningEngine } from "./LearningEngine";
import HumanSimulationEngine from "./HumanSimulationEngine";
import BrowserEmulationLayer from "./BrowserEmulationLayer";
import PluginWatchdog from "./PluginWatchdog";
import SelfLearningEngine from "./SelfLearningEngine";
import BatchFixManager from "./BatchFixManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AshenAlertSystem } from "./AshenAlertSystem";
import { useAshenDebugCore } from "@/hooks/useAshenDebugCore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Use the enhanced Ashen Debug Core hook
  const { 
    config, 
    status, 
    isLoading, 
    updateConfig, 
    runAnalysis, 
    runMonitoringService,
    runBackgroundHealing 
  } = useAshenDebugCore();

  useEffect(() => {
    loadData();
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

      // System status is now handled by the hook

    } catch (error) {
      console.error('Error loading Ashen Debug data:', error);
      toast.error('Failed to load debug data');
    }
  };

  // loadConfig is now handled by the hook

  const toggleAutoHealing = (enabled: boolean) => {
    updateConfig('auto_healing_enabled', enabled);
  };

  const toggleBackgroundHealing = (enabled: boolean) => {
    updateConfig('background_healing_enabled', enabled);
  };

  const runAnalysisLocal = async (action: 'analyze' | 'fix' | 'test' | 'monitor') => {
    setIsAnalyzing(true);
    try {
      await runAnalysis(action);
      loadData(); // Refresh local data
    } catch (error) {
      console.error(`Error running ${action}:`, error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runVisualInspection = async () => {
    setIsAnalyzing(true);
    try {
      const response = await supabase.functions.invoke('ui-visual-inspector');

      if (response.error) {
        throw response.error;
      }

      toast.success(`UI inspection completed - found ${response.data.issues_found} issues`);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error running UI visual inspection:', error);
      toast.error('Failed to run UI visual inspection');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runLearningEngine = async () => {
    setIsAnalyzing(true);
    try {
      const response = await supabase.functions.invoke('ashen-learning-engine', {
        body: { action: 'train' }
      });

      if (response.error) {
        throw response.error;
      }

      toast.success(`Learning complete - discovered ${response.data.patterns_learned} new patterns`);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error running learning engine:', error);
      toast.error('Failed to run learning engine');
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
    switch (status.system_health) {
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
            <span className="font-medium capitalize">{status.system_health}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="text-sm">Auto-Healing</span>
            <Switch
              checked={config.auto_healing_enabled}
              onCheckedChange={toggleAutoHealing}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Background</span>
            <Switch
              checked={config.background_healing_enabled}
              onCheckedChange={toggleBackgroundHealing}
            />
          </div>
        </div>
      </div>

      {/* Enhanced System Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Errors</p>
                <p className="text-2xl font-bold">{status.active_errors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Wrench className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Fixes Today</p>
                <p className="text-2xl font-bold">{status.fixes_today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Healing Queue</p>
                <p className="text-2xl font-bold">{status.healing_queue_size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Emergency (1h)</p>
                <p className="text-2xl font-bold text-red-500">{status.emergency_fixes_in_last_hour}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Ashen Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Scan Frequency</label>
              <Select 
                value={config.scan_interval_hours.toString()} 
                onValueChange={(value) => updateConfig('scan_interval_hours', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">Every 6 hours</SelectItem>
                  <SelectItem value="12">Every 12 hours</SelectItem>
                  <SelectItem value="24">Every 24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fix Type Filter</label>
              <Select 
                value={config.fix_type_filter} 
                onValueChange={(value) => updateConfig('fix_type_filter', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Issues</SelectItem>
                  <SelectItem value="layout">Layout Only</SelectItem>
                  <SelectItem value="backend">Backend Only</SelectItem>
                  <SelectItem value="security">Security Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confidence Threshold</label>
              <Select 
                value={(config.confidence_threshold * 100).toString()} 
                onValueChange={(value) => updateConfig('confidence_threshold', parseInt(value) / 100)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="70">70%</SelectItem>
                  <SelectItem value="85">85%</SelectItem>
                  <SelectItem value="95">95%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Button
              onClick={() => runAnalysisLocal('analyze')}
              disabled={isAnalyzing}
              className="h-20 flex-col space-y-2"
            >
              <Eye className="h-6 w-6" />
              <span>Analyze Code</span>
            </Button>
            <Button
              onClick={() => runLearningEngine()}
              disabled={isAnalyzing}
              variant="secondary"
              className="h-20 flex-col space-y-2"
            >
              <Brain className="h-6 w-6" />
              <span>Learn Patterns</span>
            </Button>
            <Button
              onClick={() => runVisualInspection()}
              disabled={isAnalyzing}
              variant="secondary"
              className="h-20 flex-col space-y-2"
            >
              <Monitor className="h-6 w-6" />
              <span>UI Inspector</span>
            </Button>
            <Button
              onClick={() => runBackgroundHealing()}
              disabled={isAnalyzing || !config.auto_healing_enabled}
              variant="secondary"
              className="h-20 flex-col space-y-2"
            >
              <Zap className="h-6 w-6" />
              <span>Background Heal</span>
            </Button>
            <Button
              onClick={() => runAnalysisLocal('test')}
              disabled={isAnalyzing}
              variant="outline"
              className="h-20 flex-col space-y-2"
            >
              <Activity className="h-6 w-6" />
              <span>Run Tests</span>
            </Button>
            <Button
              onClick={() => runMonitoringService()}
              disabled={isAnalyzing}
              variant="outline"
              className="h-20 flex-col space-y-2"
            >
              <Shield className="h-6 w-6" />
              <span>Monitor</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs defaultValue="error-dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-12">
          <TabsTrigger value="error-dashboard">Error Dashboard</TabsTrigger>
          <TabsTrigger value="healing-history">Healing History</TabsTrigger>
          <TabsTrigger value="learning-engine">Learning Engine</TabsTrigger>
          <TabsTrigger value="self-learning">Self-Learning</TabsTrigger>
          <TabsTrigger value="batch-fix">Batch Fix</TabsTrigger>
          <TabsTrigger value="ui-inspector">UI Inspector</TabsTrigger>
          <TabsTrigger value="code-health">Code Health</TabsTrigger>
          <TabsTrigger value="tests">Behavior Tests</TabsTrigger>
          <TabsTrigger value="human-simulation">Human Simulation</TabsTrigger>
          <TabsTrigger value="browser-emulation">Browser Emulation</TabsTrigger>
          <TabsTrigger value="plugin-watchdog">Plugin Watchdog</TabsTrigger>
          <TabsTrigger value="monitor">System Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="error-dashboard" className="space-y-4">
          <ErrorDashboard />
        </TabsContent>
        
        <TabsContent value="healing-history" className="space-y-4">
          <HealingHistory />
        </TabsContent>
        
        <TabsContent value="learning-engine" className="space-y-4">
          <LearningEngine />
        </TabsContent>

        <TabsContent value="self-learning" className="space-y-4">
          <SelfLearningEngine />
        </TabsContent>

        <TabsContent value="batch-fix" className="space-y-4">
          <BatchFixManager />
        </TabsContent>
        
        <TabsContent value="ui-inspector" className="space-y-4">
          <UIBugLogs />
        </TabsContent>
        
        <TabsContent value="alert-system" className="space-y-4">
          <AshenAlertSystem />
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
                  onClick={() => runAnalysisLocal('analyze')}
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

        <TabsContent value="human-simulation" className="space-y-4">
          <HumanSimulationEngine />
        </TabsContent>

        <TabsContent value="browser-emulation" className="space-y-4">
          <BrowserEmulationLayer />
        </TabsContent>

        <TabsContent value="plugin-watchdog" className="space-y-4">
          <PluginWatchdog />
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
                  onClick={() => runAnalysisLocal('test')}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Auto-Healing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`h-3 w-3 rounded-full ${config.auto_healing_enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span>{config.auto_healing_enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatic error detection and repair
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Background Healing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`h-3 w-3 rounded-full ${config.background_healing_enabled ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span>{config.background_healing_enabled ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Continuous background monitoring every {config.scan_interval_hours}h
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon()}
                  <span className="capitalize">{status.system_health}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Overall application status
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`h-3 w-3 rounded-full ${status.emergency_fixes_in_last_hour >= config.emergency_alert_threshold ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                  <span>{status.emergency_fixes_in_last_hour >= config.emergency_alert_threshold ? 'Alert' : 'Normal'}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {status.emergency_fixes_in_last_hour}/{config.emergency_alert_threshold} fixes in last hour
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Legacy Self-Healer Migration Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">🔄 Self-Healer Migration Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-2">
                ✅ Legacy Self-Healer module has been successfully absorbed into Ashen Debug Core
              </p>
              <div className="text-sm text-blue-600 space-y-1">
                <p>• All historical healing logs migrated to Activity Timeline</p>
                <p>• Background healing now runs every {config.scan_interval_hours} hours</p>
                <p>• Emergency alert threshold set to {config.emergency_alert_threshold} fixes per hour</p>
                <p>• Centralized diagnostics, healing, and monitoring under Ashen</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}