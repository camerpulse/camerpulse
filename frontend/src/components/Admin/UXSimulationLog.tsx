import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Play, 
  RefreshCw, 
  Monitor, 
  Tablet, 
  Smartphone,
  Clock,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BehaviorTest {
  id: string;
  test_name: string;
  test_type: string;
  route_tested: string;
  device_type: string;
  test_result: string;
  issues_found: any[];
  performance_metrics: any;
  screenshot_url?: string;
  metadata: any;
  created_at: string;
}

export default function UXSimulationLog() {
  const [tests, setTests] = useState<BehaviorTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadTestResults();
  }, []);

  const loadTestResults = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ashen-behavior-tester', {
        body: { action: 'get_test_results' }
      });

      if (error) throw error;
      setTests(data.results || []);
    } catch (error) {
      console.error('Error loading test results:', error);
      toast.error('Failed to load test results');
    } finally {
      setIsLoading(false);
    }
  };

  const runBehaviorTests = async () => {
    setIsRunningTests(true);
    try {
      const { data, error } = await supabase.functions.invoke('ashen-behavior-tester', {
        body: { 
          action: 'run_behavior_tests',
          device_type: selectedDevice,
          routes: []
        }
      });

      if (error) throw error;
      
      toast.success(`Completed ${data.tests_run} behavior tests on ${selectedDevice}`);
      await loadTestResults();
    } catch (error) {
      console.error('Error running behavior tests:', error);
      toast.error('Failed to run behavior tests');
    } finally {
      setIsRunningTests(false);
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <Monitor className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'passed': return 'bg-success text-success-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'failed': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredTests = tests.filter(test => {
    if (activeTab === 'all') return true;
    return test.test_result === activeTab;
  });

  const testStats = {
    total: tests.length,
    passed: tests.filter(t => t.test_result === 'passed').length,
    warning: tests.filter(t => t.test_result === 'warning').length,
    failed: tests.filter(t => t.test_result === 'failed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">UX Simulation Log</h2>
          <p className="text-muted-foreground">
            AI-powered behavior testing across multiple devices and user flows
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desktop">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Desktop
                </div>
              </SelectItem>
              <SelectItem value="tablet">
                <div className="flex items-center gap-2">
                  <Tablet className="h-4 w-4" />
                  Tablet
                </div>
              </SelectItem>
              <SelectItem value="mobile">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={runBehaviorTests} 
            disabled={isRunningTests}
            className="gap-2"
          >
            {isRunningTests ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run Tests
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{testStats.total}</div>
            <p className="text-sm text-muted-foreground">Total Tests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">{testStats.passed}</div>
            <p className="text-sm text-muted-foreground">Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">{testStats.warning}</div>
            <p className="text-sm text-muted-foreground">Warnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">{testStats.failed}</div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Tests</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="warning">Warnings</TabsTrigger>
          <TabsTrigger value="passed">Passed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredTests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No test results</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'all' 
                    ? 'Run behavior tests to see results here.' 
                    : `No ${activeTab} tests found.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTests.map((test) => (
              <Card key={test.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getResultIcon(test.test_result)}
                        <CardTitle className="text-lg">{test.test_name}</CardTitle>
                        <Badge className={getResultColor(test.test_result)}>
                          {test.test_result}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {getDeviceIcon(test.device_type)}
                          <span className="capitalize">{test.device_type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(test.created_at).toLocaleString()}</span>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {test.test_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Route: {test.route_tested}</h4>
                  </div>

                  {test.issues_found && test.issues_found.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Issues Found:</h4>
                      <div className="space-y-2">
                        {test.issues_found.map((issue, index) => (
                          <div key={index} className="bg-muted p-3 rounded-md">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-medium capitalize">
                                  {issue.type?.replace('_', ' ')}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {issue.message}
                                </div>
                                {issue.element && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Element: {issue.element}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {test.performance_metrics && Object.keys(test.performance_metrics).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Performance Metrics:</h4>
                      <div className="bg-muted p-3 rounded-md font-mono text-sm">
                        {Object.entries(test.performance_metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                            <span>{typeof value === 'number' ? value.toFixed(2) : JSON.stringify(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {test.screenshot_url && (
                    <div>
                      <h4 className="font-semibold mb-2">Screenshot:</h4>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <a 
                          href={test.screenshot_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View Screenshot
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}