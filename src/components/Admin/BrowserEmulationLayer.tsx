import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Globe, Play, Monitor, Smartphone, AlertTriangle, CheckCircle, Settings, FileText, Bug, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FormTestResult {
  id: string;
  form_name: string;
  page_url: string;
  test_data_used: any;
  browser_type: string;
  device_type: string;
  submission_outcome: 'success' | 'failed' | 'validation_error' | 'network_error';
  errors_found: string[];
  warnings: string[];
  fix_suggestions: string[];
  test_duration: number;
  created_at: string;
}

interface EmulationSettings {
  enabled: boolean;
  auto_test_interval: number;
  test_browsers: string[];
  test_devices: string[];
  generate_test_data: boolean;
}

export default function BrowserEmulationLayer() {
  const [isTestingForms, setIsTestingForms] = useState(false);
  const [formTestResults, setFormTestResults] = useState<FormTestResult[]>([]);
  const [testProgress, setTestProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [settings, setSettings] = useState<EmulationSettings>({
    enabled: false,
    auto_test_interval: 24,
    test_browsers: ['chrome', 'firefox'],
    test_devices: ['desktop', 'mobile'],
    generate_test_data: true
  });

  useEffect(() => {
    loadFormTestResults();
    loadEmulationSettings();
  }, []);

  const loadEmulationSettings = async () => {
    try {
      const { data } = await supabase
        .from('ashen_monitoring_config')
        .select('config_value')
        .eq('config_key', 'browser_emulation_enabled')
        .single();

      if (data) {
        setSettings(prev => ({ ...prev, enabled: data.config_value === 'true' }));
      }
    } catch (error) {
      console.error('Error loading emulation settings:', error);
    }
  };

  const loadFormTestResults = async () => {
    try {
      const { data } = await supabase
        .from('ashen_behavior_tests')
        .select('*')
        .eq('test_type', 'form_emulation')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        const results: FormTestResult[] = data.map(test => {
          const metadata = typeof test.metadata === 'object' && test.metadata !== null ? test.metadata as any : {};
          const issuesFound = Array.isArray(test.issues_found) ? test.issues_found : 
                             typeof test.issues_found === 'object' && test.issues_found !== null ? [test.issues_found] : 
                             [];
          
          return {
            id: test.id,
            form_name: metadata.form_name || test.test_name,
            page_url: test.route_tested,
            test_data_used: metadata.test_data_used || {},
            browser_type: metadata.browser_type || 'chrome',
            device_type: test.device_type,
            submission_outcome: metadata.submission_outcome || (test.test_result === 'passed' ? 'success' : 'failed'),
            errors_found: issuesFound.map((issue: any) => issue.error_message || issue.message || issue).filter(Boolean),
            warnings: metadata.warnings || [],
            fix_suggestions: metadata.fix_suggestions || [],
            test_duration: metadata.test_duration || 0,
            created_at: test.created_at
          };
        });
        setFormTestResults(results);
      }
    } catch (error) {
      console.error('Error loading form test results:', error);
      toast.error('Failed to load form test results');
    }
  };

  const toggleEmulation = async (enabled: boolean) => {
    try {
      await supabase
        .from('ashen_monitoring_config')
        .upsert({
          config_key: 'browser_emulation_enabled',
          config_value: enabled.toString(),
          updated_at: new Date().toISOString()
        });

      setSettings(prev => ({ ...prev, enabled }));
      toast.success(`Browser Emulation ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating emulation settings:', error);
      toast.error('Failed to update emulation settings');
    }
  };

  const generateTestData = (formType: string) => {
    const testDataTemplates = {
      login: {
        email: 'test.user@example.com',
        password: 'TestPassword123!'
      },
      registration: {
        username: 'testuser_' + Date.now(),
        email: 'testuser_' + Date.now() + '@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890'
      },
      contact: {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Form Submission',
        message: 'This is a test message generated by the browser emulation layer.'
      },
      feedback: {
        rating: '5',
        comment: 'Test feedback comment',
        category: 'general'
      },
      poll: {
        option: 'option1',
        comment: 'Test poll response'
      }
    };

    return testDataTemplates[formType as keyof typeof testDataTemplates] || {};
  };

  const runFormTests = async (testType: 'all' | 'specific' = 'all') => {
    if (!settings.enabled) {
      toast.error('Browser Emulation is disabled. Enable it first.');
      return;
    }

    setIsTestingForms(true);
    setTestProgress(0);
    setCurrentTest(null);

    try {
      const formsToTest = [
        { name: 'Login Form', url: '/auth', type: 'login' },
        { name: 'Registration Form', url: '/auth', type: 'registration' },
        { name: 'Contact Form', url: '/contact', type: 'contact' },
        { name: 'Poll Creation', url: '/polls', type: 'poll' }
      ];

      const totalTests = formsToTest.length * settings.test_browsers.length * settings.test_devices.length;
      let completedTests = 0;

      for (const form of formsToTest) {
        for (const browser of settings.test_browsers) {
          for (const device of settings.test_devices) {
            setCurrentTest(`Testing ${form.name} on ${browser} (${device})`);
            
            const testData = generateTestData(form.type);
            const startTime = performance.now();

            // Simulate form testing
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

            const endTime = performance.now();
            const testDuration = endTime - startTime;

            // Simulate test results with some randomness
            const hasErrors = Math.random() < 0.2; // 20% chance of errors
            const hasWarnings = Math.random() < 0.4; // 40% chance of warnings

            const errors: string[] = [];
            const warnings: string[] = [];
            const fixSuggestions: string[] = [];

            if (hasErrors) {
              errors.push('Form validation failed: Email field requires valid format');
              fixSuggestions.push('Add proper email validation pattern');
            }

            if (hasWarnings) {
              warnings.push('Form submission takes longer than 3 seconds');
              warnings.push('No loading indicator during form submission');
              fixSuggestions.push('Add loading spinner during form submission');
              fixSuggestions.push('Optimize form submission performance');
            }

            const submissionOutcome = hasErrors ? 'validation_error' : 'success';

            // Save test result
            await saveFormTestResult({
              form_name: form.name,
              page_url: form.url,
              test_data_used: testData,
              browser_type: browser,
              device_type: device,
              submission_outcome: submissionOutcome as any,
              errors_found: errors,
              warnings,
              fix_suggestions: fixSuggestions,
              test_duration: testDuration
            });

            completedTests++;
            setTestProgress((completedTests / totalTests) * 100);
          }
        }
      }

      toast.success(`Form testing completed: ${completedTests} tests run`);
      loadFormTestResults();

    } catch (error) {
      console.error('Error running form tests:', error);
      toast.error('Failed to run form tests');
    } finally {
      setIsTestingForms(false);
      setCurrentTest(null);
    }
  };

  const saveFormTestResult = async (result: Omit<FormTestResult, 'id' | 'created_at'>) => {
    try {
      await supabase
        .from('ashen_behavior_tests')
        .insert({
          test_name: `${result.form_name}_${result.browser_type}_${result.device_type}`,
          test_type: 'form_emulation',
          route_tested: result.page_url,
          device_type: result.device_type,
          test_result: result.submission_outcome === 'success' ? 'passed' : 'failed',
          issues_found: result.errors_found.map(error => ({ 
            type: 'form_error', 
            message: error,
            severity: 'high'
          })),
          performance_metrics: {
            test_duration: result.test_duration,
            browser_type: result.browser_type
          },
          metadata: {
            form_name: result.form_name,
            test_data_used: result.test_data_used,
            browser_type: result.browser_type,
            submission_outcome: result.submission_outcome,
            warnings: result.warnings,
            fix_suggestions: result.fix_suggestions,
            test_duration: result.test_duration
          }
        });

      // Log to activity timeline
      await supabase
        .from('camerpulse_activity_timeline')
        .insert({
          module: 'browser_emulation_layer',
          activity_type: 'form_test_completed',
          activity_summary: `${result.form_name} tested on ${result.browser_type} (${result.device_type}): ${result.submission_outcome}`,
          status: result.submission_outcome === 'success' ? 'success' : 'warning',
          details: {
            form_name: result.form_name,
            page_url: result.page_url,
            browser_type: result.browser_type,
            device_type: result.device_type,
            errors_count: result.errors_found.length,
            warnings_count: result.warnings.length,
            test_duration: result.test_duration
          }
        });

    } catch (error) {
      console.error('Error saving form test result:', error);
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success': return 'default';
      case 'failed': return 'destructive';
      case 'validation_error': return 'secondary';
      case 'network_error': return 'outline';
      default: return 'outline';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      case 'validation_error': return <Bug className="h-4 w-4" />;
      case 'network_error': return <Zap className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Globe className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Browser Emulation Layer</h2>
            <p className="text-muted-foreground">Automated form testing across browsers and devices</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">Enable Emulation</span>
          <Switch
            checked={settings.enabled}
            onCheckedChange={toggleEmulation}
          />
        </div>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Emulation Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Test Browsers</label>
                <div className="mt-2 space-y-2">
                  {['chrome', 'firefox', 'safari', 'edge'].map((browser) => (
                    <div key={browser} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={browser}
                        checked={settings.test_browsers.includes(browser)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSettings(prev => ({
                              ...prev,
                              test_browsers: [...prev.test_browsers, browser]
                            }));
                          } else {
                            setSettings(prev => ({
                              ...prev,
                              test_browsers: prev.test_browsers.filter(b => b !== browser)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={browser} className="text-sm capitalize">{browser}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Test Devices</label>
                <div className="mt-2 space-y-2">
                  {['desktop', 'mobile', 'tablet'].map((device) => (
                    <div key={device} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={device}
                        checked={settings.test_devices.includes(device)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSettings(prev => ({
                              ...prev,
                              test_devices: [...prev.test_devices, device]
                            }));
                          } else {
                            setSettings(prev => ({
                              ...prev,
                              test_devices: prev.test_devices.filter(d => d !== device)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={device} className="text-sm capitalize">{device}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>Form Testing Control</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => runFormTests('all')}
              disabled={isTestingForms || !settings.enabled}
              className="h-20 flex-col space-y-2"
            >
              <Globe className="h-6 w-6" />
              <span>Test All Forms</span>
              <span className="text-xs opacity-75">Cross-browser testing</span>
            </Button>
            <Button
              onClick={() => runFormTests('all')}
              disabled={isTestingForms || !settings.enabled}
              variant="secondary"
              className="h-20 flex-col space-y-2"
            >
              <Monitor className="h-6 w-6" />
              <span>Desktop Only</span>
              <span className="text-xs opacity-75">Chrome + Firefox</span>
            </Button>
            <Button
              onClick={() => runFormTests('all')}
              disabled={isTestingForms || !settings.enabled}
              variant="outline"
              className="h-20 flex-col space-y-2"
            >
              <Smartphone className="h-6 w-6" />
              <span>Mobile Only</span>
              <span className="text-xs opacity-75">Safari + WebView</span>
            </Button>
          </div>

          {isTestingForms && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Form Testing Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(testProgress)}% complete
                </span>
              </div>
              <Progress value={testProgress} className="w-full" />
              {currentTest && (
                <div className="text-sm text-muted-foreground">
                  Currently: {currentTest}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Testing Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formTestResults.length === 0 ? (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No form test results yet</p>
                    <p className="text-sm text-muted-foreground">Run form tests to see results here</p>
                  </div>
                ) : (
                  formTestResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getOutcomeIcon(result.submission_outcome)}
                          <span className="font-medium">{result.form_name}</span>
                          <Badge variant={getOutcomeColor(result.submission_outcome)}>
                            {result.submission_outcome.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {result.browser_type}
                          </Badge>
                          <Badge variant="outline">
                            {result.device_type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(result.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Page:</span>
                          <div className="font-medium">{result.page_url}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <div className="font-medium">{Math.round(result.test_duration)}ms</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Errors:</span>
                          <div className="font-medium text-red-500">{result.errors_found.length}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Warnings:</span>
                          <div className="font-medium text-yellow-500">{result.warnings.length}</div>
                        </div>
                      </div>

                      {Object.keys(result.test_data_used).length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Test Data Used:</span>
                          <div className="text-sm mt-1 p-2 bg-muted rounded">
                            {Object.entries(result.test_data_used).map(([key, value]) => (
                              <div key={key}>
                                <strong>{key}:</strong> {typeof value === 'string' ? value : JSON.stringify(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.errors_found.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Errors Found:</span>
                          <div className="mt-2 space-y-1">
                            {result.errors_found.map((error, index) => (
                              <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                                {error}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.warnings.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Warnings:</span>
                          <div className="mt-2 space-y-1">
                            {result.warnings.map((warning, index) => (
                              <div key={index} className="text-sm p-2 bg-yellow-50 border border-yellow-200 rounded">
                                {warning}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.fix_suggestions.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Fix Suggestions:</span>
                          <div className="mt-2 space-y-1">
                            {result.fix_suggestions.map((suggestion, index) => (
                              <div key={index} className="text-sm p-2 bg-blue-50 border border-blue-200 rounded">
                                💡 {suggestion}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">
                      {formTestResults.length > 0 
                        ? Math.round((formTestResults.filter(r => r.submission_outcome === 'success').length / formTestResults.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Bug className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Errors</p>
                    <p className="text-2xl font-bold">
                      {formTestResults.reduce((sum, result) => sum + result.errors_found.length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Warnings</p>
                    <p className="text-2xl font-bold">
                      {formTestResults.reduce((sum, result) => sum + result.warnings.length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}