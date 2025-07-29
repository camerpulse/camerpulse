import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePluginIntelligence } from '@/hooks/usePluginIntelligence';
import { 
  Play, 
  Square, 
  AlertTriangle, 
  CheckCircle, 
  TestTube,
  Code,
  Monitor,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface SandboxTest {
  id: string;
  name: string;
  type: 'route' | 'component' | 'api' | 'dependency';
  status: 'idle' | 'running' | 'passed' | 'failed';
  result?: any;
  error?: string;
  duration?: number;
}

export const PluginSandbox: React.FC = () => {
  const { getPluginsByCategory, validatePlugin } = usePluginIntelligence();
  const [selectedPlugin, setSelectedPlugin] = useState<string>('');
  const [sandboxMode, setSandboxMode] = useState<'safe' | 'isolated' | 'full'>('safe');
  const [tests, setTests] = useState<SandboxTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const allPlugins = getPluginsByCategory();

  const runSandboxTests = async (pluginId: string) => {
    setIsRunning(true);
    const plugin = allPlugins.find(p => p.plugin_id === pluginId);
    
    if (!plugin) {
      toast.error('Plugin not found');
      setIsRunning(false);
      return;
    }

    const newTests: SandboxTest[] = [
      {
        id: 'validation',
        name: 'Plugin Validation',
        type: 'dependency',
        status: 'running'
      },
      {
        id: 'routes',
        name: 'Route Accessibility',
        type: 'route',
        status: 'idle'
      },
      {
        id: 'components',
        name: 'Component Loading',
        type: 'component',
        status: 'idle'
      },
      {
        id: 'api',
        name: 'API Endpoints',
        type: 'api',
        status: 'idle'
      }
    ];

    setTests(newTests);

    // Simulate test execution
    for (let i = 0; i < newTests.length; i++) {
      const test = newTests[i];
      
      // Update test status to running
      setTests(prev => prev.map(t => 
        t.id === test.id ? { ...t, status: 'running' } : t
      ));

      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      let testResult: 'passed' | 'failed' = 'passed';
      let error: string | undefined;
      
      // Simulate test logic
      switch (test.type) {
        case 'dependency':
          const validation = validatePlugin(plugin);
          if (validation && validation.dependency_issues.length > 0) {
            testResult = 'failed';
            error = `Missing dependencies: ${validation.dependency_issues.join(', ')}`;
          }
          break;
        case 'route':
          // Simulate route testing
          if (plugin.routes_linked.length === 0) {
            testResult = 'failed';
            error = 'No routes defined for plugin';
          } else if (Math.random() > 0.8) {
            testResult = 'failed';
            error = 'Route accessibility check failed';
          }
          break;
        case 'component':
          // Simulate component testing
          if (plugin.components_linked.length === 0) {
            testResult = 'failed';
            error = 'No components defined for plugin';
          } else if (Math.random() > 0.9) {
            testResult = 'failed';
            error = 'Component loading timeout';
          }
          break;
        case 'api':
          // Simulate API testing
          if (plugin.api_endpoints_linked.length === 0) {
            testResult = 'failed';
            error = 'No API endpoints defined';
          } else if (Math.random() > 0.85) {
            testResult = 'failed';
            error = 'API endpoint unreachable';
          }
          break;
      }

      // Update test with results
      setTests(prev => prev.map(t => 
        t.id === test.id ? { 
          ...t, 
          status: testResult,
          error,
          duration: Math.floor(Math.random() * 3000) + 500
        } : t
      ));
    }

    setIsRunning(false);
    
    const passedTests = newTests.filter(t => t.status !== 'failed').length;
    if (passedTests === newTests.length) {
      toast.success('All sandbox tests passed!');
    } else {
      toast.warning(`${passedTests}/${newTests.length} tests passed`);
    }
  };

  const clearSandbox = () => {
    setTests([]);
    setSelectedPlugin('');
  };

  const getTestIcon = (status: SandboxTest['status']) => {
    switch (status) {
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <TestTube className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTestTypeColor = (type: SandboxTest['type']) => {
    switch (type) {
      case 'route': return 'bg-blue-100 text-blue-800';
      case 'component': return 'bg-green-100 text-green-800';
      case 'api': return 'bg-purple-100 text-purple-800';
      case 'dependency': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="h-5 w-5 mr-2" />
            Plugin Sandbox Testing
          </CardTitle>
          <CardDescription>
            Test plugins in a safe, isolated environment before deploying to production
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Plugin</label>
              <Select value={selectedPlugin} onValueChange={setSelectedPlugin}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plugin to test" />
                </SelectTrigger>
                <SelectContent>
                  {allPlugins.map(plugin => (
                    <SelectItem key={plugin.plugin_id} value={plugin.plugin_id}>
                      {plugin.plugin_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sandbox Mode</label>
              <Select value={sandboxMode} onValueChange={(value: 'safe' | 'isolated' | 'full') => setSandboxMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safe">Safe Mode</SelectItem>
                  <SelectItem value="isolated">Isolated Mode</SelectItem>
                  <SelectItem value="full">Full System Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button 
                onClick={() => selectedPlugin && runSandboxTests(selectedPlugin)}
                disabled={!selectedPlugin || isRunning}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Run Tests
              </Button>
              <Button variant="outline" onClick={clearSandbox}>
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sandbox Mode Info */}
          <Alert>
            <Monitor className="h-4 w-4" />
            <AlertDescription>
              <strong>{sandboxMode === 'safe' ? 'Safe Mode' : sandboxMode === 'isolated' ? 'Isolated Mode' : 'Full System Mode'}:</strong>{' '}
              {sandboxMode === 'safe' && 'Tests run with minimal system impact, read-only operations only.'}
              {sandboxMode === 'isolated' && 'Tests run in isolation with mock data and services.'}
              {sandboxMode === 'full' && 'Tests run against live system - use with caution.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Test Results */}
      {tests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Test Results
              </span>
              <Badge variant={tests.every(t => t.status === 'passed') ? 'default' : 'destructive'}>
                {tests.filter(t => t.status === 'passed').length}/{tests.length} Passed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tests.map(test => (
                <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTestIcon(test.status)}
                    <div>
                      <div className="font-medium">{test.name}</div>
                      {test.error && (
                        <div className="text-sm text-red-600">{test.error}</div>
                      )}
                      {test.duration && (
                        <div className="text-xs text-muted-foreground">
                          Completed in {test.duration}ms
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getTestTypeColor(test.type)}>
                      {test.type}
                    </Badge>
                    <Badge 
                      variant={
                        test.status === 'passed' ? 'default' : 
                        test.status === 'failed' ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {test.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {tests.length > 0 && tests.every(t => t.status !== 'idle' && t.status !== 'running') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {tests.reduce((sum, t) => sum + (t.duration || 0), 0)}ms
                </div>
                <div className="text-sm text-muted-foreground">Total Test Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {tests.filter(t => t.status === 'passed').length}
                </div>
                <div className="text-sm text-muted-foreground">Tests Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {((tests.filter(t => t.status === 'passed').length / tests.length) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};