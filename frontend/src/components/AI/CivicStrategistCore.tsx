import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, Target, Users, Lightbulb, BarChart3, MessageSquare, Play, Eye, EyeOff, Clock, MapPin } from 'lucide-react';

interface CivicStrategy {
  id: string;
  strategy_title: string;
  short_term_actions: any;
  long_term_reforms: any;
  policy_suggestions: any;
  digital_tools: any;
  is_public: boolean;
  created_at: string;
}

interface CivicProblem {
  id: string;
  problem_title: string;
  problem_description: string;
  problem_category: string;
  target_region: string;
  urgency_level: string;
  volatility_score: number;
  created_at: string;
}

interface SimulationResult {
  id: string;
  simulation_scenario: string;
  predicted_outcomes: any;
  risk_factors: any;
  confidence_score: number;
  created_at: string;
}

const CivicStrategistCore: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [isLoading, setIsLoading] = useState(false);
  const [strategies, setStrategies] = useState<CivicStrategy[]>([]);
  const [problems, setProblems] = useState<CivicProblem[]>([]);
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  // Problem Analysis Form
  const [problemForm, setProblemForm] = useState({
    problem_title: '',
    problem_description: '',
    problem_category: 'governance',
    target_region: '',
    target_demographics: '',
    urgency_level: 'medium'
  });

  // Simulation Form
  const [simulationForm, setSimulationForm] = useState({
    scenario: '',
    parameters: '',
    timeframe_years: 1
  });

  // Campaign Form
  const [campaignForm, setCampaignForm] = useState({
    template_type: 'social_media',
    target_audience: '',
    platform: 'multi-platform',
    goal: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load strategies
      const { data: strategiesData } = await supabase
        .from('civic_strategies')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (strategiesData) setStrategies(strategiesData);

      // Load problems
      const { data: problemsData } = await supabase
        .from('civic_strategy_problems')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (problemsData) setProblems(problemsData);

      // Load simulations
      const { data: simulationsData } = await supabase
        .from('civic_simulation_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (simulationsData) setSimulations(simulationsData);

      // Load dashboard stats
      await loadStats();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await supabase.functions.invoke('civic-strategist-core', {
        body: { action: 'get_dashboard_stats' }
      });

      if (data?.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const analyzeProblem = async () => {
    if (!problemForm.problem_title || !problemForm.problem_description) {
      toast({
        title: "Missing Information",
        description: "Please provide both a problem title and description.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await supabase.functions.invoke('civic-strategist-core', {
        body: { 
          action: 'analyze_problem', 
          data: {
            ...problemForm,
            target_demographics: problemForm.target_demographics.split(',').map(s => s.trim()).filter(Boolean)
          }
        }
      });

      if (data?.success) {
        toast({
          title: "Problem Analyzed Successfully",
          description: "Strategic solution has been generated with AI recommendations."
        });
        
        await loadData();
        setProblemForm({
          problem_title: '',
          problem_description: '',
          problem_category: 'governance',
          target_region: '',
          target_demographics: '',
          urgency_level: 'medium'
        });
      }
    } catch (error) {
      console.error('Error analyzing problem:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the civic problem. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runSimulation = async () => {
    if (!simulationForm.scenario) {
      toast({
        title: "Missing Information",
        description: "Please provide a simulation scenario.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const parameters = simulationForm.parameters ? JSON.parse(simulationForm.parameters) : {};
      
      const { data } = await supabase.functions.invoke('civic-strategist-core', {
        body: { 
          action: 'run_simulation', 
          data: {
            scenario: simulationForm.scenario,
            parameters,
            timeframe_years: simulationForm.timeframe_years
          }
        }
      });

      if (data?.success) {
        toast({
          title: "Simulation Complete",
          description: "Civic impact simulation has been generated successfully."
        });
        
        await loadData();
        setSimulationForm({
          scenario: '',
          parameters: '',
          timeframe_years: 1
        });
      }
    } catch (error) {
      console.error('Error running simulation:', error);
      toast({
        title: "Simulation Failed",
        description: "Failed to run the civic simulation. Please check your parameters.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCampaign = async () => {
    if (!campaignForm.target_audience || !campaignForm.goal) {
      toast({
        title: "Missing Information",
        description: "Please provide target audience and campaign goal.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await supabase.functions.invoke('civic-strategist-core', {
        body: { 
          action: 'generate_campaign', 
          data: campaignForm
        }
      });

      if (data?.success) {
        toast({
          title: "Campaign Generated",
          description: "Civic engagement campaign template has been created successfully."
        });
        
        setCampaignForm({
          template_type: 'social_media',
          target_audience: '',
          platform: 'multi-platform',
          goal: ''
        });
      }
    } catch (error) {
      console.error('Error generating campaign:', error);
      toast({
        title: "Campaign Generation Failed",
        description: "Failed to generate the campaign template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStrategyVisibility = async (strategyId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('civic_strategies')
        .update({ is_public: !currentVisibility })
        .eq('id', strategyId);

      if (error) throw error;

      await loadData();
      toast({
        title: "Visibility Updated",
        description: `Strategy is now ${!currentVisibility ? 'public' : 'private'}.`
      });
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update strategy visibility.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Brain className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">AI Civic Strategist Core</h2>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Problems</p>
                  <p className="text-2xl font-bold">{stats.active_problems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending Strategies</p>
                  <p className="text-2xl font-bold">{stats.pending_strategies}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Public Strategies</p>
                  <p className="text-2xl font-bold">{stats.public_strategies}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Recent Simulations</p>
                  <p className="text-2xl font-bold">{stats.recent_simulations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analyzer">Problem Analyzer</TabsTrigger>
          <TabsTrigger value="simulation">Simulation Mode</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Builder</TabsTrigger>
          <TabsTrigger value="strategies">Strategy Hub</TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Civic Problem Analysis</span>
              </CardTitle>
              <CardDescription>
                Analyze civic challenges and generate strategic solutions with AI recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="problem_title">Problem Title</Label>
                  <Input
                    id="problem_title"
                    value={problemForm.problem_title}
                    onChange={(e) => setProblemForm({ ...problemForm, problem_title: e.target.value })}
                    placeholder="e.g., Low youth voter participation in Centre Region"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="problem_category">Category</Label>
                  <Select value={problemForm.problem_category} onValueChange={(value) => setProblemForm({ ...problemForm, problem_category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="governance">Governance</SelectItem>
                      <SelectItem value="civic_engagement">Civic Engagement</SelectItem>
                      <SelectItem value="transparency">Transparency</SelectItem>
                      <SelectItem value="corruption">Anti-Corruption</SelectItem>
                      <SelectItem value="youth_participation">Youth Participation</SelectItem>
                      <SelectItem value="gender_equality">Gender Equality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem_description">Problem Description</Label>
                <Textarea
                  id="problem_description"
                  value={problemForm.problem_description}
                  onChange={(e) => setProblemForm({ ...problemForm, problem_description: e.target.value })}
                  placeholder="Detailed description of the civic problem, its impact, and current situation..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_region">Target Region</Label>
                  <Input
                    id="target_region"
                    value={problemForm.target_region}
                    onChange={(e) => setProblemForm({ ...problemForm, target_region: e.target.value })}
                    placeholder="e.g., Centre, Littoral, Far North"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_demographics">Target Demographics</Label>
                  <Input
                    id="target_demographics"
                    value={problemForm.target_demographics}
                    onChange={(e) => setProblemForm({ ...problemForm, target_demographics: e.target.value })}
                    placeholder="e.g., Youth 18-35, Women, Students"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgency_level">Urgency Level</Label>
                  <Select value={problemForm.urgency_level} onValueChange={(value) => setProblemForm({ ...problemForm, urgency_level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={analyzeProblem} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Brain className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Problem...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Strategic Solution
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Problems */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Problems Analyzed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {problems.map((problem) => (
                  <div key={problem.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{problem.problem_title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {problem.problem_description.substring(0, 100)}...
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary">{problem.problem_category}</Badge>
                          <Badge variant={problem.urgency_level === 'critical' ? 'destructive' : 'outline'}>
                            {problem.urgency_level}
                          </Badge>
                          {problem.target_region && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {problem.target_region}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(problem.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Civic Impact Simulation</span>
              </CardTitle>
              <CardDescription>
                Run predictive simulations to understand potential outcomes of civic interventions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scenario">Simulation Scenario</Label>
                <Textarea
                  id="scenario"
                  value={simulationForm.scenario}
                  onChange={(e) => setSimulationForm({ ...simulationForm, scenario: e.target.value })}
                  placeholder="e.g., What will happen if youth turnout drops below 30% in 2025 elections?"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parameters">Parameters (JSON)</Label>
                  <Textarea
                    id="parameters"
                    value={simulationForm.parameters}
                    onChange={(e) => setSimulationForm({ ...simulationForm, parameters: e.target.value })}
                    placeholder='{"target_regions": ["Centre", "Littoral"], "affected_demographics": ["youth"]}'
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe (Years)</Label>
                  <Input
                    id="timeframe"
                    type="number"
                    min="1"
                    max="5"
                    value={simulationForm.timeframe_years}
                    onChange={(e) => setSimulationForm({ ...simulationForm, timeframe_years: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <Button onClick={runSimulation} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Play className="mr-2 h-4 w-4 animate-spin" />
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Civic Simulation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Simulations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Simulations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {simulations.map((simulation) => (
                  <div key={simulation.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{simulation.simulation_scenario}</h4>
                    <div className="mt-2 space-y-2">
                      <div className="text-sm">
                        <strong>Confidence:</strong> {Math.round(simulation.confidence_score * 100)}%
                      </div>
                      <div className="text-sm">
                        <strong>Risk Factors:</strong> {Array.isArray(simulation.risk_factors) ? simulation.risk_factors.join(', ') : 'N/A'}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {new Date(simulation.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Campaign Template Generator</span>
              </CardTitle>
              <CardDescription>
                Generate tactical campaign templates for civic engagement and outreach.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template_type">Campaign Type</Label>
                  <Select value={campaignForm.template_type} onValueChange={(value) => setCampaignForm({ ...campaignForm, template_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS Campaign</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="education">Education Module</SelectItem>
                      <SelectItem value="townhall">Town Hall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={campaignForm.platform} onValueChange={(value) => setCampaignForm({ ...campaignForm, platform: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="multi-platform">Multi-Platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_audience">Target Audience</Label>
                <Input
                  id="target_audience"
                  value={campaignForm.target_audience}
                  onChange={(e) => setCampaignForm({ ...campaignForm, target_audience: e.target.value })}
                  placeholder="e.g., University students aged 18-25 in urban areas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Campaign Goal</Label>
                <Input
                  id="goal"
                  value={campaignForm.goal}
                  onChange={(e) => setCampaignForm({ ...campaignForm, goal: e.target.value })}
                  placeholder="e.g., Increase voter registration by 40%"
                />
              </div>

              <Button onClick={generateCampaign} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4 animate-spin" />
                    Generating Campaign...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Generate Campaign Template
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Strategy Management Hub</span>
              </CardTitle>
              <CardDescription>
                Manage generated strategies and control their public visibility.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{strategy.strategy_title}</h4>
                        <div className="mt-2 space-y-2">
                          <div className="text-sm">
                            <strong>Short-term Actions:</strong> {Array.isArray(strategy.short_term_actions) ? strategy.short_term_actions.length : 0} items
                          </div>
                          <div className="text-sm">
                            <strong>Long-term Reforms:</strong> {Array.isArray(strategy.long_term_reforms) ? strategy.long_term_reforms.length : 0} items
                          </div>
                          <div className="text-sm">
                            <strong>Policy Suggestions:</strong> {Array.isArray(strategy.policy_suggestions) ? strategy.policy_suggestions.length : 0} items
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-3">
                          <Badge variant={strategy.is_public ? "default" : "secondary"}>
                            {strategy.is_public ? "Public" : "Private"}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(strategy.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStrategyVisibility(strategy.id, strategy.is_public)}
                      >
                        {strategy.is_public ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CivicStrategistCore;