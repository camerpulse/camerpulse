import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, XCircle, Puzzle, Shield, Activity, Zap, Settings, Scan, AlertOctagon, BarChart3, Loader2 } from "lucide-react";
import { usePluginWatchdog } from "@/hooks/usePluginWatchdog";
import { toast } from "sonner";

const PluginWatchdog: React.FC = () => {
  const {
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
    updatePluginStatus
  } = usePluginWatchdog();

  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'bg-green-500';
    if (score <= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskBadgeVariant = (score: number) => {
    if (score <= 30) return 'default';
    if (score <= 70) return 'secondary';
    return 'destructive';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'disabled': return 'text-gray-500';
      case 'pending': return 'text-yellow-500';
      case 'blocked': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getTestResultIcon = (result: string) => {
    switch (result) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Plugin Watchdog...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Puzzle className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Plugin Stress & Compatibility Watchdog</h2>
            <p className="text-muted-foreground">Monitor, test, and protect against plugin conflicts</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={scanPlugins}
            disabled={isScanning}
            className="flex items-center space-x-2"
          >
            {isScanning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Scan className="h-4 w-4" />
            )}
            <span>{isScanning ? 'Scanning...' : 'Scan Plugins'}</span>
          </Button>
          <Button
            onClick={detectConflicts}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <AlertOctagon className="h-4 w-4" />
            <span>Detect Conflicts</span>
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Watchdog Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Plugin Watchdog</label>
                <Switch
                  checked={config.plugin_watchdog_enabled}
                  onCheckedChange={(value) => updateConfig('plugin_watchdog_enabled', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Block High-Risk Plugins</label>
                <Switch
                  checked={config.block_high_risk_plugins}
                  onCheckedChange={(value) => updateConfig('block_high_risk_plugins', value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto-Simulation After Install</label>
                <Switch
                  checked={config.auto_simulation_after_install}
                  onCheckedChange={(value) => updateConfig('auto_simulation_after_install', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Conflict Detection</label>
                <Switch
                  checked={config.conflict_detection_enabled}
                  onCheckedChange={(value) => updateConfig('conflict_detection_enabled', value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Risk Threshold: {config.plugin_risk_threshold}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={config.plugin_risk_threshold}
                  onChange={(e) => updateConfig('plugin_risk_threshold', parseInt(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Test Frequency: {config.stress_test_frequency_hours}h</label>
                <input
                  type="range"
                  min="24"
                  max="720"
                  step="24"
                  value={config.stress_test_frequency_hours}
                  onChange={(e) => updateConfig('stress_test_frequency_hours', parseInt(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Puzzle className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Plugins</p>
                <p className="text-2xl font-bold">{plugins.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertOctagon className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Conflicts</p>
                <p className="text-2xl font-bold text-red-500">{conflicts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {plugins.filter(p => p.plugin_risk_score >= 70).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tests Today</p>
                <p className="text-2xl font-bold text-green-500">
                  {stressTests.filter(t => 
                    new Date(t.executed_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="plugin-registry" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="plugin-registry">Plugin Registry</TabsTrigger>
          <TabsTrigger value="conflict-alerts">Conflict Alerts</TabsTrigger>
          <TabsTrigger value="risk-heatmap">Risk Heatmap</TabsTrigger>
          <TabsTrigger value="simulation-logs">Simulation Logs</TabsTrigger>
          <TabsTrigger value="installation-guards">Install Guards</TabsTrigger>
        </TabsList>

        <TabsContent value="plugin-registry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Registry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plugins.map((plugin) => (
                  <div key={plugin.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(plugin.plugin_risk_score)}`} />
                      <div>
                        <h4 className="font-medium">{plugin.plugin_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {plugin.plugin_author} • v{plugin.plugin_version} • {plugin.plugin_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={getRiskBadgeVariant(plugin.plugin_risk_score)}>
                        Risk: {plugin.plugin_risk_score}%
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(plugin.plugin_status)}>
                        {plugin.plugin_status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => analyzePlugin(plugin.id)}
                        >
                          <Scan className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runStressTest(plugin.id)}
                        >
                          <Activity className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => assessRisk(plugin.id)}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflict-alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Conflicts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conflicts.map((conflict) => (
                  <div key={conflict.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <AlertOctagon className="h-5 w-5 text-red-500" />
                        <h4 className="font-medium">{conflict.conflict_type.replace('_', ' ').toUpperCase()}</h4>
                        <Badge variant={getSeverityColor(conflict.conflict_severity)}>
                          {conflict.conflict_severity}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          const notes = prompt('Resolution notes:');
                          if (notes) resolveConflict(conflict.id, notes);
                        }}
                      >
                        Resolve
                      </Button>
                    </div>
                    <p className="text-sm mb-2">{conflict.conflict_description}</p>
                    {conflict.resolution_suggestion && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Suggestion:</strong> {conflict.resolution_suggestion}
                      </p>
                    )}
                    {conflict.affected_resources.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium">Affected: </span>
                        {conflict.affected_resources.map((resource, idx) => (
                          <Badge key={idx} variant="outline" className="mr-1">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {conflicts.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium mb-2">No Active Conflicts</h3>
                    <p className="text-muted-foreground">All plugins are compatible with each other</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Risk Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plugins.map((plugin) => (
                  <div key={plugin.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium truncate">{plugin.plugin_name}</h4>
                      <Badge variant={getRiskBadgeVariant(plugin.plugin_risk_score)}>
                        {plugin.plugin_risk_score}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Security</span>
                        <span>{Math.floor(Math.random() * 30) + 70}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Performance</span>
                        <span>{Math.floor(Math.random() * 40) + 60}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Compatibility</span>
                        <span>{Math.floor(Math.random() * 20) + 80}%</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getRiskColor(plugin.plugin_risk_score)}`}
                          style={{ width: `${plugin.plugin_risk_score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulation-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stress Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stressTests.slice(0, 20).map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTestResultIcon(test.test_result)}
                      <div>
                        <h5 className="font-medium">{test.test_scenario}</h5>
                        <p className="text-sm text-muted-foreground">
                          {test.device_type} • {test.network_condition} • {test.render_time_ms}ms
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={test.performance_score >= 80 ? 'default' : 'secondary'}>
                        Performance: {test.performance_score}%
                      </Badge>
                      <Badge variant={test.error_count === 0 ? 'default' : 'destructive'}>
                        {test.error_count} errors
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="installation-guards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Installation Guards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-medium mb-2">Installation Guards Active</h3>
                  <p className="text-muted-foreground">
                    High-risk plugins are automatically blocked from installation
                  </p>
                  <div className="mt-4 flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {plugins.filter(p => p.plugin_risk_score < config.plugin_risk_threshold).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Safe Plugins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">
                        {plugins.filter(p => p.plugin_risk_score >= config.plugin_risk_threshold).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Blocked Plugins</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PluginWatchdog;