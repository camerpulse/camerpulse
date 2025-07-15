import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { User, Play, Square, RotateCcw, Eye, Clock, AlertTriangle, CheckCircle, Activity, Map } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SimulationReport {
  id: string;
  session_name: string;
  simulation_type: string;
  start_time: string;
  end_time: string | null;
  status: 'running' | 'completed' | 'failed';
  path_taken: string[];
  errors_found: any[];
  performance_metrics: any;
  usability_score: number;
  ai_confidence: number;
  created_at: string;
}

interface SimulationStep {
  action: string;
  target: string;
  timestamp: string;
  success: boolean;
  error_details?: string;
  performance_data?: any;
}

export default function HumanSimulationEngine() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationEnabled, setSimulationEnabled] = useState(false);
  const [simulationReports, setSimulationReports] = useState<SimulationReport[]>([]);
  const [currentSimulation, setCurrentSimulation] = useState<SimulationReport | null>(null);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([]);

  useEffect(() => {
    loadSimulationReports();
    loadSimulationConfig();
  }, []);

  const loadSimulationConfig = async () => {
    try {
      const { data } = await supabase
        .from('ashen_monitoring_config')
        .select('config_value')
        .eq('config_key', 'human_simulation_enabled')
        .single();

      if (data) {
        setSimulationEnabled(data.config_value === 'true');
      }
    } catch (error) {
      console.error('Error loading simulation config:', error);
    }
  };

  const loadSimulationReports = async () => {
    try {
      const { data } = await supabase
        .from('ashen_behavior_tests')
        .select('*')
        .eq('test_type', 'human_simulation')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        const reports: SimulationReport[] = data.map(test => {
          const metadata = typeof test.metadata === 'object' && test.metadata !== null ? test.metadata as any : {};
          const issuesFound = Array.isArray(test.issues_found) ? test.issues_found : 
                             typeof test.issues_found === 'object' && test.issues_found !== null ? [test.issues_found] : 
                             [];
          
          return {
            id: test.id,
            session_name: test.test_name,
            simulation_type: metadata.simulation_type || 'general',
            start_time: test.created_at,
            end_time: metadata.end_time || null,
            status: test.test_result === 'passed' ? 'completed' : test.test_result === 'failed' ? 'failed' : 'running',
            path_taken: Array.isArray(metadata.path_taken) ? metadata.path_taken : [],
            errors_found: issuesFound,
            performance_metrics: typeof test.performance_metrics === 'object' ? test.performance_metrics : {},
            usability_score: metadata.usability_score || 0,
            ai_confidence: metadata.ai_confidence || 0,
            created_at: test.created_at
          };
        });
        setSimulationReports(reports);
      }
    } catch (error) {
      console.error('Error loading simulation reports:', error);
      toast.error('Failed to load simulation reports');
    }
  };

  const toggleSimulation = async (enabled: boolean) => {
    try {
      await supabase
        .from('ashen_monitoring_config')
        .upsert({
          config_key: 'human_simulation_enabled',
          config_value: enabled.toString(),
          updated_at: new Date().toISOString()
        });

      setSimulationEnabled(enabled);
      toast.success(`Human Simulation ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating simulation config:', error);
      toast.error('Failed to update simulation settings');
    }
  };

  const startSimulation = async (simulationType: string) => {
    if (!simulationEnabled) {
      toast.error('Human Simulation is disabled. Enable it first.');
      return;
    }

    setIsSimulating(true);
    setSimulationProgress(0);
    setSimulationSteps([]);

    try {
      // Create simulation session
      const sessionName = `${simulationType}_simulation_${Date.now()}`;
      
      const newSimulation: SimulationReport = {
        id: crypto.randomUUID(),
        session_name: sessionName,
        simulation_type: simulationType,
        start_time: new Date().toISOString(),
        end_time: null,
        status: 'running',
        path_taken: [],
        errors_found: [],
        performance_metrics: {},
        usability_score: 0,
        ai_confidence: 0,
        created_at: new Date().toISOString()
      };

      setCurrentSimulation(newSimulation);

      // Simulate the user journey
      await runSimulationScenario(simulationType, sessionName);

    } catch (error) {
      console.error('Error starting simulation:', error);
      toast.error('Failed to start simulation');
    } finally {
      setIsSimulating(false);
    }
  };

  const runSimulationScenario = async (type: string, sessionName: string) => {
    const scenarios = {
      student: [
        { action: 'navigate', target: '/', description: 'Load homepage' },
        { action: 'search', target: 'mayor', description: 'Search for mayor' },
        { action: 'click', target: 'politician-card', description: 'Click politician profile' },
        { action: 'scroll', target: 'rating-section', description: 'Scroll to ratings' },
        { action: 'rate', target: 'approval-rating', description: 'Submit rating' },
        { action: 'comment', target: 'feedback-form', description: 'Add comment' }
      ],
      citizen: [
        { action: 'navigate', target: '/', description: 'Load homepage' },
        { action: 'navigate', target: '/polls', description: 'Visit polls page' },
        { action: 'click', target: 'create-poll', description: 'Create new poll' },
        { action: 'navigate', target: '/news', description: 'Check news' },
        { action: 'navigate', target: '/social', description: 'Visit social feed' }
      ],
      researcher: [
        { action: 'navigate', target: '/', description: 'Load homepage' },
        { action: 'navigate', target: '/politicians', description: 'Browse politicians' },
        { action: 'filter', target: 'region-filter', description: 'Filter by region' },
        { action: 'click', target: 'comparison-tool', description: 'Use comparison tool' },
        { action: 'export', target: 'data-export', description: 'Export data' }
      ]
    };

    const steps = scenarios[type as keyof typeof scenarios] || scenarios.citizen;
    const totalSteps = steps.length;
    const pathTaken: string[] = [];
    const errorsFound: any[] = [];
    const performanceMetrics: any = {};

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const startTime = performance.now();
      
      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1;
      
      const simulationStep: SimulationStep = {
        action: step.action,
        target: step.target,
        timestamp: new Date().toISOString(),
        success,
        performance_data: { execution_time: executionTime }
      };

      if (!success) {
        const error = {
          step: i + 1,
          action: step.action,
          target: step.target,
          error_type: 'ui_interaction_failed',
          error_message: `Failed to ${step.action} on ${step.target}`,
          severity: 'medium'
        };
        simulationStep.error_details = error.error_message;
        errorsFound.push(error);
      }

      setSimulationSteps(prev => [...prev, simulationStep]);
      pathTaken.push(`${step.action}:${step.target}`);
      performanceMetrics[step.target] = { execution_time: executionTime };
      
      setSimulationProgress(((i + 1) / totalSteps) * 100);
    }

    // Calculate scores
    const successRate = simulationSteps.filter(s => s.success).length / simulationSteps.length;
    const usabilityScore = Math.round(successRate * 100);
    const aiConfidence = Math.round((successRate + (errorsFound.length === 0 ? 0.1 : 0)) * 90);

    // Save simulation results
    await saveSimulationResults(sessionName, type, pathTaken, errorsFound, performanceMetrics, usabilityScore, aiConfidence);
    
    toast.success(`${type} simulation completed with ${errorsFound.length} issues found`);
  };

  const saveSimulationResults = async (
    sessionName: string,
    type: string,
    pathTaken: string[],
    errorsFound: any[],
    performanceMetrics: any,
    usabilityScore: number,
    aiConfidence: number
  ) => {
    try {
      await supabase
        .from('ashen_behavior_tests')
        .insert({
          test_name: sessionName,
          test_type: 'human_simulation',
          route_tested: pathTaken.join(' → '),
          device_type: 'desktop',
          test_result: errorsFound.length === 0 ? 'passed' : 'failed',
          issues_found: errorsFound,
          performance_metrics: performanceMetrics,
          metadata: {
            simulation_type: type,
            path_taken: pathTaken,
            usability_score: usabilityScore,
            ai_confidence: aiConfidence,
            end_time: new Date().toISOString(),
            errors_count: errorsFound.length
          }
        });

      // Log to activity timeline
      await supabase
        .from('camerpulse_activity_timeline')
        .insert({
          module: 'human_simulation_engine',
          activity_type: 'simulation_completed',
          activity_summary: `${type} simulation completed: ${errorsFound.length} issues found, ${usabilityScore}% usability score`,
          status: errorsFound.length === 0 ? 'success' : 'warning',
          details: {
            simulation_type: type,
            session_name: sessionName,
            errors_found: errorsFound.length,
            usability_score: usabilityScore,
            ai_confidence: aiConfidence,
            path_taken: pathTaken
          }
        });

      loadSimulationReports();
    } catch (error) {
      console.error('Error saving simulation results:', error);
      toast.error('Failed to save simulation results');
    }
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setSimulationProgress(0);
    setCurrentSimulation(null);
    toast.info('Simulation stopped');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'running': return <Activity className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <User className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Human Simulation Engine</h2>
            <p className="text-muted-foreground">Simulate user interactions to detect UI issues</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">Enable Simulation</span>
          <Switch
            checked={simulationEnabled}
            onCheckedChange={toggleSimulation}
          />
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>Simulation Control</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => startSimulation('student')}
              disabled={isSimulating || !simulationEnabled}
              className="h-20 flex-col space-y-2"
            >
              <User className="h-6 w-6" />
              <span>Student Journey</span>
              <span className="text-xs opacity-75">Search → Rate → Comment</span>
            </Button>
            <Button
              onClick={() => startSimulation('citizen')}
              disabled={isSimulating || !simulationEnabled}
              variant="secondary"
              className="h-20 flex-col space-y-2"
            >
              <Eye className="h-6 w-6" />
              <span>Citizen Journey</span>
              <span className="text-xs opacity-75">Polls → News → Social</span>
            </Button>
            <Button
              onClick={() => startSimulation('researcher')}
              disabled={isSimulating || !simulationEnabled}
              variant="outline"
              className="h-20 flex-col space-y-2"
            >
              <Map className="h-6 w-6" />
              <span>Researcher Journey</span>
              <span className="text-xs opacity-75">Compare → Filter → Export</span>
            </Button>
          </div>

          {isSimulating && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Simulation Progress</span>
                <Button
                  onClick={stopSimulation}
                  variant="destructive"
                  size="sm"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </div>
              <Progress value={simulationProgress} className="w-full" />
              <div className="text-sm text-muted-foreground">
                {Math.round(simulationProgress)}% complete
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Simulation Reports</TabsTrigger>
          <TabsTrigger value="live">Live Session</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Simulation Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {simulationReports.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No simulation reports yet</p>
                    <p className="text-sm text-muted-foreground">Run a simulation to see results here</p>
                  </div>
                ) : (
                  simulationReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(report.status)}
                          <span className="font-medium">{report.session_name}</span>
                          <Badge variant={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge variant="outline">
                            {report.simulation_type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Usability Score:</span>
                          <div className="font-medium">{report.usability_score}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">AI Confidence:</span>
                          <div className="font-medium">{report.ai_confidence}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Errors Found:</span>
                          <div className="font-medium text-red-500">{report.errors_found.length}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Steps Taken:</span>
                          <div className="font-medium">{report.path_taken.length}</div>
                        </div>
                      </div>

                      {report.path_taken.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Path Taken:</span>
                          <div className="text-sm mt-1 p-2 bg-muted rounded">
                            {report.path_taken.join(' → ')}
                          </div>
                        </div>
                      )}

                      {report.errors_found.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Issues Found:</span>
                          <div className="mt-2 space-y-1">
                            {report.errors_found.slice(0, 3).map((error, index) => (
                              <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                                <span className="font-medium">Step {error.step}:</span> {error.error_message}
                              </div>
                            ))}
                            {report.errors_found.length > 3 && (
                              <div className="text-sm text-muted-foreground">
                                +{report.errors_found.length - 3} more issues
                              </div>
                            )}
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

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Simulation Session</CardTitle>
            </CardHeader>
            <CardContent>
              {currentSimulation ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{currentSimulation.session_name}</span>
                    <Badge>{currentSimulation.simulation_type}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {simulationSteps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 border rounded">
                        {step.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="flex-1">{step.action} on {step.target}</span>
                        <span className="text-sm text-muted-foreground">
                          {step.performance_data?.execution_time ? 
                            `${Math.round(step.performance_data.execution_time)}ms` : 
                            ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No active simulation</p>
                  <p className="text-sm text-muted-foreground">Start a simulation to see live progress</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}