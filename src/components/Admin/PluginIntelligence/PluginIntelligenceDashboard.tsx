import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePluginIntelligence } from '@/hooks/usePluginIntelligence';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  RefreshCw, 
  Zap,
  Network,
  BarChart3,
  Shield,
  Clock
} from 'lucide-react';

export const PluginIntelligenceDashboard: React.FC = () => {
  const {
    diagnostics,
    pluginHealthData,
    isLoading,
    isScanning,
    lastScanTime,
    forceHealthScan,
    downloadDiagnosticsReport,
    autoFix,
    isAutoFixing,
    getPluginsByCategory,
    getDependencyTree
  } = usePluginIntelligence();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading plugin intelligence...</span>
        </div>
      </div>
    );
  }

  if (!diagnostics) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load plugin diagnostics. Please check if plugins.json is accessible.
        </AlertDescription>
      </Alert>
    );
  }

  const healthPercentage = diagnostics.total_plugins > 0 ? 
    (diagnostics.healthy_plugins / diagnostics.total_plugins) * 100 : 0;

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLoadImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plugin Intelligence Core</h1>
          <p className="text-muted-foreground">
            Monitor, validate, and maintain all CamerPulse plugins
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={forceHealthScan} 
            disabled={isScanning}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Force Scan'}
          </Button>
          <Button onClick={downloadDiagnosticsReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plugins</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diagnostics.total_plugins}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthPercentage.toFixed(1)}%</div>
            <Progress value={healthPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {diagnostics.error_plugins + diagnostics.warning_plugins}
            </div>
            <p className="text-xs text-muted-foreground">
              {diagnostics.error_plugins} errors, {diagnostics.warning_plugins} warnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {lastScanTime ? new Date(lastScanTime).toLocaleTimeString() : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-scan every 30s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Issues Alert */}
      {(diagnostics.missing_dependencies.length > 0 || diagnostics.duplicate_ids.length > 0) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {diagnostics.missing_dependencies.length > 0 && (
                <div>Missing dependencies: {diagnostics.missing_dependencies.join(', ')}</div>
              )}
              {diagnostics.duplicate_ids.length > 0 && (
                <div>Duplicate plugin IDs: {diagnostics.duplicate_ids.join(', ')}</div>
              )}
            </div>
            <div className="mt-2">
              <Button 
                size="sm" 
                onClick={() => autoFix('dependencies')}
                disabled={isAutoFixing}
              >
                <Zap className="h-3 w-3 mr-1" />
                Auto-Fix Issues
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Plugin Health</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Health Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Healthy
                    </div>
                    <Badge variant="secondary">{diagnostics.healthy_plugins}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                      Warning
                    </div>
                    <Badge variant="secondary">{diagnostics.warning_plugins}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      Error
                    </div>
                    <Badge variant="secondary">{diagnostics.error_plugins}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => autoFix('dependencies')}
                  disabled={isAutoFixing}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Fix Dependency Issues
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => autoFix('versions')}
                  disabled={isAutoFixing}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Outdated Plugins
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => autoFix('quarantine')}
                  disabled={isAutoFixing}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Quarantine Broken Plugins
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Health Status</CardTitle>
              <CardDescription>
                Real-time health monitoring for all registered plugins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pluginHealthData.map((health) => (
                  <div key={health.plugin_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getHealthIcon(health.health_status)}
                      <div>
                        <div className="font-medium">{health.plugin_id}</div>
                        <div className="text-sm text-muted-foreground">
                          Load Impact: <span className={`inline-block w-2 h-2 rounded-full ${getLoadImpactColor(health.load_impact)} ml-1`}></span>
                          {health.load_impact}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={health.health_status === 'healthy' ? 'default' : 'destructive'}
                      >
                        {health.health_status}
                      </Badge>
                      {health.dependency_issues.length > 0 && (
                        <Badge variant="outline">
                          {health.dependency_issues.length} dep issues
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="h-5 w-5 mr-2" />
                Dependency Map
              </CardTitle>
              <CardDescription>
                Visualize plugin dependencies and detect circular references
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(diagnostics.dependency_map).map(([pluginId, deps]) => (
                  <div key={pluginId} className="p-3 border rounded-lg">
                    <div className="font-medium mb-2">{pluginId}</div>
                    <div className="flex flex-wrap gap-2">
                      {deps.length > 0 ? (
                        deps.map(dep => (
                          <Badge key={dep} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No dependencies</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Missing Dependencies</h4>
                  {diagnostics.missing_dependencies.length > 0 ? (
                    <div className="space-y-1">
                      {diagnostics.missing_dependencies.map(dep => (
                        <Badge key={dep} variant="destructive" className="mr-1">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">All dependencies resolved</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Outdated Plugins</h4>
                  {diagnostics.outdated_plugins.length > 0 ? (
                    <div className="space-y-1">
                      {diagnostics.outdated_plugins.map(plugin => (
                        <Badge key={plugin} variant="outline" className="mr-1">
                          {plugin}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">All plugins up to date</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>High Impact Plugins</span>
                    <Badge>
                      {pluginHealthData.filter(h => h.load_impact === 'high').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Medium Impact Plugins</span>
                    <Badge>
                      {pluginHealthData.filter(h => h.load_impact === 'medium').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Low Impact Plugins</span>
                    <Badge>
                      {pluginHealthData.filter(h => h.load_impact === 'low').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};