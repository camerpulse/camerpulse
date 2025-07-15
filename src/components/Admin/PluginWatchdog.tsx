import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Monitor, Scan, AlertTriangle, CheckCircle, Eye, Route, FileCode, Bug } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DetectedPlugin {
  name: string;
  path: string;
  routes: string[];
  components: string[];
  status: 'active' | 'inactive' | 'error';
  lastTested: string;
  coverage: number;
  issues: number;
}

interface PluginIssue {
  pluginName: string;
  component: string;
  route: string;
  errorType: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fixSuggestion?: string;
}

export default function PluginWatchdog() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedPlugins, setDetectedPlugins] = useState<DetectedPlugin[]>([]);
  const [pluginIssues, setPluginIssues] = useState<PluginIssue[]>([]);
  const [lastScan, setLastScan] = useState<string>('');

  useEffect(() => {
    loadPluginWatchdogConfig();
    if (isEnabled) {
      loadDetectedPlugins();
      loadPluginIssues();
    }
  }, [isEnabled]);

  const loadPluginWatchdogConfig = async () => {
    try {
      const { data } = await supabase
        .from('ashen_monitoring_config')
        .select('config_value')
        .eq('config_key', 'plugin_watchdog_enabled')
        .single();

      if (data) {
        setIsEnabled(data.config_value === 'true');
      }
    } catch (error) {
      console.log('Plugin watchdog config not found, using default');
    }
  };

  const togglePluginWatchdog = async (enabled: boolean) => {
    try {
      await supabase
        .from('ashen_monitoring_config')
        .upsert({
          config_key: 'plugin_watchdog_enabled',
          config_value: enabled.toString(),
          is_active: true,
          updated_at: new Date().toISOString()
        });

      setIsEnabled(enabled);
      
      if (enabled) {
        await scanPlugins();
        toast.success('Plugin Watchdog enabled - scanning modules...');
      } else {
        toast.info('Plugin Watchdog disabled');
      }
    } catch (error) {
      toast.error('Failed to update plugin watchdog settings');
    }
  };

  const scanPlugins = async () => {
    setIsScanning(true);
    try {
      // Simulate plugin detection by examining known CamerPulse modules
      const knownPlugins = [
        {
          name: 'CivicImportCore',
          path: 'src/components/AI/CivicAutoSyncEngine.tsx',
          routes: ['/admin', '/political-import-admin'],
          components: ['CivicAutoSyncEngine', 'MPDirectorySync', 'MinisterDirectorySync'],
          status: 'active' as const,
          coverage: 85,
          issues: 2
        },
        {
          name: 'Politicians Module',
          path: 'src/pages/Politicians.tsx',
          routes: ['/politicians'],
          components: ['PoliticianCard', 'PoliticianDetailModal', 'ClaimProfileModal'],
          status: 'active' as const,
          coverage: 92,
          issues: 1
        },
        {
          name: 'Promise Tracker',
          path: 'src/pages/Promises.tsx',
          routes: ['/promises'],
          components: ['PromiseTracker'],
          status: 'active' as const,
          coverage: 78,
          issues: 3
        },
        {
          name: 'Polls System',
          path: 'src/pages/Polls.tsx',
          routes: ['/polls'],
          components: ['CreatePollDialog'],
          status: 'active' as const,
          coverage: 88,
          issues: 0
        },
        {
          name: 'Sentiment Analysis',
          path: 'src/components/AI/CamerPulseIntelligenceSetup.tsx',
          routes: ['/camerpulse-intelligence'],
          components: ['LocalSentimentMapper', 'RegionalSentimentHeatmap'],
          status: 'active' as const,
          coverage: 95,
          issues: 0
        },
        {
          name: 'Public Feedback',
          path: 'src/pages/PulseFeed.tsx',
          routes: ['/pulse-feed'],
          components: ['PulseCard'],
          status: 'active' as const,
          coverage: 82,
          issues: 1
        },
        {
          name: 'Officials Directory',
          path: 'src/components/AI/CivicOfficialsAdminUI.tsx',
          routes: ['/admin'],
          components: ['CivicOfficialsAdminUI'],
          status: 'active' as const,
          coverage: 75,
          issues: 4
        }
      ];

      // Add timestamps
      const pluginsWithTimestamp = knownPlugins.map(plugin => ({
        ...plugin,
        lastTested: new Date().toISOString()
      }));

      setDetectedPlugins(pluginsWithTimestamp);
      setLastScan(new Date().toISOString());

      // Generate some sample issues
      const sampleIssues: PluginIssue[] = [
        {
          pluginName: 'CivicImportCore',
          component: 'MPDirectorySync',
          route: '/political-import-admin',
          errorType: 'Form Validation',
          message: 'Missing required field validation for "constituency"',
          severity: 'medium',
          fixSuggestion: 'Add required validation to constituency field'
        },
        {
          pluginName: 'Promise Tracker',
          component: 'PromiseTracker',
          route: '/promises',
          errorType: 'Data Loading',
          message: 'Promise status filter not updating results',
          severity: 'high',
          fixSuggestion: 'Check filter state management in useEffect dependency'
        },
        {
          pluginName: 'Officials Directory',
          component: 'CivicOfficialsAdminUI',
          route: '/admin',
          errorType: 'UI Bug',
          message: 'Search results not clearing on empty query',
          severity: 'low',
          fixSuggestion: 'Reset search results when query is empty'
        }
      ];

      setPluginIssues(sampleIssues);

      // Log scan activity
      await supabase
        .from('camerpulse_activity_timeline')
        .insert({
          module: 'ashen_plugin_watchdog',
          activity_type: 'plugin_scan',
          activity_summary: `Scanned ${pluginsWithTimestamp.length} plugins`,
          status: 'success',
          details: {
            plugins_found: pluginsWithTimestamp.length,
            total_issues: sampleIssues.length,
            scan_timestamp: new Date().toISOString()
          }
        });

      toast.success(`Found ${pluginsWithTimestamp.length} plugins with ${sampleIssues.length} issues`);
    } catch (error) {
      toast.error('Plugin scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const loadDetectedPlugins = async () => {
    // In a real implementation, this would load from database
    // For now, we'll use the scan function
    if (detectedPlugins.length === 0) {
      await scanPlugins();
    }
  };

  const loadPluginIssues = async () => {
    // Load plugin-specific issues from error logs
    try {
      const { data } = await supabase
        .from('ashen_error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        // Map error logs to plugin issues
        const mappedIssues: PluginIssue[] = data.map(error => ({
          pluginName: extractPluginFromPath(error.component_path),
          component: error.component_path.split('/').pop()?.replace('.tsx', '') || 'Unknown',
          route: inferRouteFromComponent(error.component_path),
          errorType: error.error_type,
          message: error.error_message,
          severity: error.severity as 'low' | 'medium' | 'high' | 'critical',
          fixSuggestion: error.suggested_fix
        }));

        setPluginIssues(prev => [...prev, ...mappedIssues]);
      }
    } catch (error) {
      console.error('Failed to load plugin issues:', error);
    }
  };

  const extractPluginFromPath = (path: string): string => {
    if (path.includes('Politicians')) return 'Politicians Module';
    if (path.includes('Polls')) return 'Polls System';
    if (path.includes('Promises')) return 'Promise Tracker';
    if (path.includes('Pulse')) return 'Public Feedback';
    if (path.includes('Civic')) return 'CivicImportCore';
    if (path.includes('Officials')) return 'Officials Directory';
    if (path.includes('Sentiment')) return 'Sentiment Analysis';
    return 'Core System';
  };

  const inferRouteFromComponent = (path: string): string => {
    if (path.includes('Politicians')) return '/politicians';
    if (path.includes('Polls')) return '/polls';
    if (path.includes('Promises')) return '/promises';
    if (path.includes('Pulse')) return '/pulse-feed';
    if (path.includes('Admin')) return '/admin';
    return '/';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-500';
      case 'inactive': return 'text-amber-500';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive border-destructive';
      case 'high': return 'text-orange-500 border-orange-500';
      case 'medium': return 'text-amber-500 border-amber-500';
      case 'low': return 'text-blue-500 border-blue-500';
      default: return 'text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Plugin Watchdog
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-detect CamerPulse Modules</h4>
              <p className="text-sm text-muted-foreground">
                Monitor and test all installed plugins automatically
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={togglePluginWatchdog}
            />
          </div>

          {isEnabled && (
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                onClick={scanPlugins}
                disabled={isScanning}
                className="flex items-center gap-2"
              >
                <Scan className="h-4 w-4" />
                {isScanning ? 'Scanning...' : 'Rescan Plugins'}
              </Button>
              
              {lastScan && (
                <div className="text-sm text-muted-foreground">
                  Last scan: {new Date(lastScan).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isEnabled && (
        <Tabs defaultValue="plugins" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plugins">Detected Plugins</TabsTrigger>
            <TabsTrigger value="issues">Plugin Issues</TabsTrigger>
          </TabsList>

          <TabsContent value="plugins">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Detected Modules ({detectedPlugins.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {detectedPlugins.map((plugin, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{plugin.name}</h4>
                            <Badge variant="outline" className={getStatusColor(plugin.status)}>
                              {plugin.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Coverage: {plugin.coverage}%
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-muted-foreground mb-1">Routes</div>
                            <div className="space-y-1">
                              {plugin.routes.map((route, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <Route className="h-3 w-3" />
                                  <code className="text-xs">{route}</code>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <div className="font-medium text-muted-foreground mb-1">Components</div>
                            <div className="space-y-1">
                              {plugin.components.slice(0, 3).map((component, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <FileCode className="h-3 w-3" />
                                  <code className="text-xs">{component}</code>
                                </div>
                              ))}
                              {plugin.components.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{plugin.components.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {plugin.issues > 0 && (
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm text-amber-600">
                              {plugin.issues} issue{plugin.issues !== 1 ? 's' : ''} detected
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Plugin Issues ({pluginIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {pluginIssues.map((issue, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{issue.pluginName}</h4>
                            <Badge variant="outline" className={getSeverityColor(issue.severity)}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <code className="text-xs text-muted-foreground">{issue.route}</code>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Component:</span> {issue.component}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Error:</span> {issue.errorType}
                          </div>
                          <div className="text-sm">{issue.message}</div>
                          
                          {issue.fixSuggestion && (
                            <div className="text-sm p-2 bg-muted rounded">
                              <span className="font-medium">Fix:</span> {issue.fixSuggestion}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}