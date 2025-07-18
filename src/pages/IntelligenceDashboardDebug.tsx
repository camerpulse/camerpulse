import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bug, AlertTriangle, Clock, Database, Wifi, Activity,
  Monitor, Cpu, HardDrive, Download, RefreshCw, Terminal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DebugLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  component: string;
  message: string;
  details?: any;
}

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  api_latency: number;
  active_connections: number;
  error_rate: number;
  last_updated: string;
}

interface FailedScrape {
  id: string;
  source: string;
  url: string;
  error_message: string;
  timestamp: string;
  retry_count: number;
}

const IntelligenceDashboardDebug = () => {
  const { toast } = useToast();
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [failedScrapes, setFailedScrapes] = useState<FailedScrape[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDebugData();
    const interval = setInterval(loadDebugData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDebugData = async () => {
    try {
      // Simulate loading debug data
      setDebugLogs([
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'error',
          component: 'SentimentAnalyzer',
          message: 'Failed to process batch of 50 social media posts',
          details: { batch_id: 'SA_001', error_code: 'TIMEOUT' }
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          level: 'warning',
          component: 'DataScraper',
          message: 'Rate limit approaching for Twitter API',
          details: { remaining_calls: 25, reset_time: '2025-01-18T15:30:00Z' }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          level: 'info',
          component: 'RegionalProcessor',
          message: 'Successfully processed Northwest region data',
          details: { records_processed: 1250, processing_time: '2.3s' }
        }
      ]);

      setSystemMetrics({
        cpu_usage: 78.5,
        memory_usage: 65.2,
        api_latency: 145,
        active_connections: 24,
        error_rate: 2.1,
        last_updated: new Date().toISOString()
      });

      setFailedScrapes([
        {
          id: '1',
          source: 'Facebook Public Posts',
          url: 'https://facebook.com/api/public_posts',
          error_message: 'Authentication failed - API key expired',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          retry_count: 3
        },
        {
          id: '2',
          source: 'Twitter Trends',
          url: 'https://api.twitter.com/1.1/trends/place.json',
          error_message: 'Rate limit exceeded',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          retry_count: 1
        }
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading debug data:', error);
      setIsLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const exportDebugReport = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      logs: debugLogs,
      metrics: systemMetrics,
      failed_scrapes: failedScrapes
    };
    
    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelligence-debug-${Date.now()}.json`;
    a.click();
    
    toast({
      title: "Debug Report Exported",
      description: "Debug data has been downloaded as JSON file",
    });
  };

  const clearLogs = () => {
    setDebugLogs([]);
    toast({
      title: "Logs Cleared",
      description: "All debug logs have been cleared",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Terminal className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <p className="text-lg">Loading debug interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Bug className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold">Intelligence Debug Console</h1>
            <p className="text-gray-400">Real-time system diagnostics and error tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={clearLogs} variant="outline" className="bg-gray-800 border-gray-700 text-white">
            Clear Logs
          </Button>
          <Button onClick={exportDebugReport} className="bg-red-600 hover:bg-red-700">
            <Download className="h-4 w-4 mr-2" />
            Export Debug Report
          </Button>
        </div>
      </div>

      {/* System Status Alert */}
      <Alert className="mb-6 bg-red-900/20 border-red-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-red-200">
          Debug mode is active. This interface is only accessible to super administrators.
        </AlertDescription>
      </Alert>

      {/* System Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">CPU Usage</p>
                <p className="text-2xl font-bold text-red-400">{systemMetrics?.cpu_usage}%</p>
              </div>
              <Cpu className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Memory</p>
                <p className="text-2xl font-bold text-yellow-400">{systemMetrics?.memory_usage}%</p>
              </div>
              <HardDrive className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">API Latency</p>
                <p className="text-2xl font-bold text-blue-400">{systemMetrics?.api_latency}ms</p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Connections</p>
                <p className="text-2xl font-bold text-green-400">{systemMetrics?.active_connections}</p>
              </div>
              <Wifi className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Error Rate</p>
                <p className="text-2xl font-bold text-red-400">{systemMetrics?.error_rate}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Last Update</p>
                <p className="text-sm font-bold text-gray-300">
                  {systemMetrics?.last_updated ? new Date(systemMetrics.last_updated).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Debug Content */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="logs" className="data-[state=active]:bg-gray-700">Error Logs</TabsTrigger>
          <TabsTrigger value="scrapes" className="data-[state=active]:bg-gray-700">Failed Scrapes</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-gray-700">Performance</TabsTrigger>
          <TabsTrigger value="api" className="data-[state=active]:bg-gray-700">API Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Terminal className="h-5 w-5 mr-2" />
                System Error Logs
              </CardTitle>
              <CardDescription className="text-gray-400">
                Real-time error tracking and debugging information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {debugLogs.map((log) => (
                    <div key={log.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getLevelColor(log.level)} variant="secondary">
                            {log.level.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-mono text-gray-400">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                          {log.component}
                        </span>
                      </div>
                      <p className="text-white mb-2">{log.message}</p>
                      {log.details && (
                        <pre className="text-xs text-gray-400 bg-gray-950 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scrapes" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Failed Scrape Attempts
              </CardTitle>
              <CardDescription className="text-gray-400">
                Data sources that failed to load or process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {failedScrapes.map((scrape) => (
                  <div key={scrape.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{scrape.source}</h4>
                      <Badge variant="destructive">
                        {scrape.retry_count} retries
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{scrape.url}</p>
                    <p className="text-red-400 text-sm mb-2">{scrape.error_message}</p>
                    <p className="text-xs text-gray-500">
                      Failed at: {new Date(scrape.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Monitor className="h-5 w-5 mr-2" />
                Performance Metrics
              </CardTitle>
              <CardDescription className="text-gray-400">
                System performance and UI lag detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-900 rounded">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Average Response Time</h4>
                    <p className="text-2xl font-bold text-white">287ms</p>
                  </div>
                  <div className="p-3 bg-gray-900 rounded">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">UI Lag Events</h4>
                    <p className="text-2xl font-bold text-yellow-400">3</p>
                  </div>
                  <div className="p-3 bg-gray-900 rounded">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Memory Leaks</h4>
                    <p className="text-2xl font-bold text-red-400">1</p>
                  </div>
                  <div className="p-3 bg-gray-900 rounded">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Cache Hit Rate</h4>
                    <p className="text-2xl font-bold text-green-400">94.2%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Wifi className="h-5 w-5 mr-2" />
                API Limits & Status
              </CardTitle>
              <CardDescription className="text-gray-400">
                External API usage and rate limiting status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-gray-900 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-white">Twitter API</h4>
                    <Badge variant="secondary" className="bg-yellow-600">Rate Limited</Badge>
                  </div>
                  <p className="text-sm text-gray-400">25 / 900 calls remaining</p>
                  <p className="text-xs text-gray-500">Reset at: 15:30 GMT</p>
                </div>
                <div className="p-3 bg-gray-900 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-white">Facebook Graph API</h4>
                    <Badge variant="destructive">Down</Badge>
                  </div>
                  <p className="text-sm text-gray-400">Authentication failed</p>
                  <p className="text-xs text-gray-500">Last success: 2 hours ago</p>
                </div>
                <div className="p-3 bg-gray-900 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-white">Government Data API</h4>
                    <Badge variant="default" className="bg-green-600">Healthy</Badge>
                  </div>
                  <p className="text-sm text-gray-400">850 / 1000 calls remaining</p>
                  <p className="text-xs text-gray-500">Reset at: 00:00 GMT</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligenceDashboardDebug;