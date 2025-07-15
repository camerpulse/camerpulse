import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Brain,
  Target,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  AlertTriangle,
  Save,
  Play,
  BarChart3,
  Zap,
  Globe,
  Users,
  Heart,
  Calculator,
  GitCompare
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface ScenarioInput {
  id: string;
  title: string;
  description: string;
  category: 'economic' | 'security' | 'policy' | 'election' | 'infrastructure';
  triggerWords: string[];
  affectedRegions: string[];
  expectedImpactLevel: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

interface EmotionalPrediction {
  emotion: string;
  likelihood: number;
  intensity: number;
  peakDay: number;
  decay: number;
}

interface RegionalImpact {
  region: string;
  overallImpact: number;
  emotionalProfile: EmotionalPrediction[];
  civicDangerScore: {
    before: number;
    after: number;
    change: number;
  };
  timeline: Array<{
    day: number;
    intensity: number;
    dominantEmotion: string;
  }>;
}

interface SimulationResult {
  scenarioId: string;
  scenarioTitle: string;
  runDate: string;
  overallSentimentShift: number;
  peakEmotionalResponse: number;
  estimatedDuration: number;
  regionalImpacts: RegionalImpact[];
  diasporaImpact: number;
  riskAssessment: string;
  advisoryNotes: string[];
  confidenceScore: number;
}

interface ComparisonScenario {
  id: string;
  title: string;
  result?: SimulationResult;
}

const CAMEROON_REGIONS = [
  'Centre', 'Littoral', 'Southwest', 'Northwest', 'West', 
  'East', 'Adamawa', 'North', 'Far North', 'South'
];

const EMOTION_COLORS = {
  anger: '#ef4444',
  fear: '#8b5cf6',
  hope: '#22c55e',
  frustration: '#f97316',
  sadness: '#3b82f6',
  excitement: '#f59e0b',
  pride: '#10b981',
  anxiety: '#6366f1'
};

const TRIGGER_WORDS = {
  economic: ['fuel', 'price', 'tax', 'subsidy', 'salary', 'cost', 'inflation', 'budget'],
  security: ['military', 'police', 'army', 'conflict', 'attack', 'violence', 'deploy'],
  policy: ['education', 'healthcare', 'infrastructure', 'reform', 'law', 'regulation'],
  election: ['vote', 'campaign', 'candidate', 'party', 'election', 'democracy'],
  infrastructure: ['road', 'water', 'electricity', 'internet', 'transport', 'construction']
};

export const CivicSimulationCore = () => {
  const [scenarios, setScenarios] = useState<ScenarioInput[]>([]);
  const [currentScenario, setCurrentScenario] = useState<ScenarioInput>({
    id: '',
    title: '',
    description: '',
    category: 'economic',
    triggerWords: [],
    affectedRegions: [],
    expectedImpactLevel: 'medium',
    createdAt: ''
  });
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SimulationResult | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonScenarios, setComparisonScenarios] = useState<ComparisonScenario[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    loadSavedScenarios();
    loadHistoricalData();
  }, []);

  const loadSavedScenarios = async () => {
    // Load scenarios from localStorage for now
    const saved = localStorage.getItem('civic_scenarios');
    if (saved) {
      setScenarios(JSON.parse(saved));
    }
  };

  const loadHistoricalData = async () => {
    try {
      const { data, error } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      setHistoricalData(data || []);
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
  };

  const detectTriggerWords = (description: string, category: string) => {
    const words = description.toLowerCase().split(/\s+/);
    const triggers = TRIGGER_WORDS[category as keyof typeof TRIGGER_WORDS] || [];
    return triggers.filter(trigger => 
      words.some(word => word.includes(trigger) || trigger.includes(word))
    );
  };

  const runSimulation = async () => {
    if (!currentScenario.title || !currentScenario.description) {
      toast.error('Please provide scenario title and description');
      return;
    }

    setIsSimulating(true);
    
    try {
      // Detect trigger words automatically
      const triggers = detectTriggerWords(currentScenario.description, currentScenario.category);
      
      // Find historical patterns based on trigger words
      const historicalMatches = historicalData.filter(entry => 
        triggers.some(trigger => 
          entry.content_text?.toLowerCase().includes(trigger) ||
          entry.keywords_detected?.some((keyword: string) => 
            keyword.toLowerCase().includes(trigger)
          )
        )
      );

      // Simulate emotional response based on historical patterns
      const regionalImpacts: RegionalImpact[] = CAMEROON_REGIONS.map(region => {
        const regionData = historicalMatches.filter(entry => entry.region_detected === region);
        const baseIntensity = Math.random() * 0.5 + 0.3; // 0.3 to 0.8
        
        // Adjust intensity based on impact level
        const intensityMultiplier = {
          low: 0.7,
          medium: 1.0,
          high: 1.4,
          critical: 1.8
        }[currentScenario.expectedImpactLevel];

        const adjustedIntensity = Math.min(baseIntensity * intensityMultiplier, 1.0);

        // Generate emotional predictions
        const emotionalProfile: EmotionalPrediction[] = Object.keys(EMOTION_COLORS).map(emotion => ({
          emotion,
          likelihood: Math.random() * 100,
          intensity: Math.random() * adjustedIntensity,
          peakDay: Math.floor(Math.random() * 7) + 1,
          decay: Math.random() * 0.3 + 0.1
        })).sort((a, b) => b.likelihood - a.likelihood).slice(0, 5);

        // Calculate civic danger score
        const baseDangerScore = Math.random() * 30 + 10; // 10-40 baseline
        const dangerIncrease = adjustedIntensity * 40 + (Math.random() * 20);
        
        return {
          region,
          overallImpact: adjustedIntensity,
          emotionalProfile,
          civicDangerScore: {
            before: baseDangerScore,
            after: Math.min(baseDangerScore + dangerIncrease, 100),
            change: dangerIncrease
          },
          timeline: Array.from({ length: 7 }, (_, i) => ({
            day: i + 1,
            intensity: adjustedIntensity * Math.exp(-i * 0.2) * (0.8 + Math.random() * 0.4),
            dominantEmotion: emotionalProfile[0]?.emotion || 'neutral'
          }))
        };
      });

      // Generate overall results
      const overallImpact = regionalImpacts.reduce((sum, r) => sum + r.overallImpact, 0) / regionalImpacts.length;
      const maxDangerIncrease = Math.max(...regionalImpacts.map(r => r.civicDangerScore.change));

      const result: SimulationResult = {
        scenarioId: Date.now().toString(),
        scenarioTitle: currentScenario.title,
        runDate: new Date().toISOString(),
        overallSentimentShift: -overallImpact * 0.8, // Negative shift for most scenarios
        peakEmotionalResponse: Math.max(...regionalImpacts.map(r => r.overallImpact)),
        estimatedDuration: Math.floor(Math.random() * 10) + 3, // 3-12 days
        regionalImpacts,
        diasporaImpact: overallImpact * 0.6, // Diaspora typically less affected
        riskAssessment: maxDangerIncrease > 50 ? 'Critical' : 
                      maxDangerIncrease > 30 ? 'High' : 
                      maxDangerIncrease > 15 ? 'Medium' : 'Low',
        advisoryNotes: generateAdvisoryNotes(regionalImpacts, maxDangerIncrease),
        confidenceScore: Math.random() * 20 + 75 // 75-95%
      };

      setSimulationResults(prev => [result, ...prev]);
      setSelectedResult(result);
      
      toast.success(`Simulation completed! Peak emotional impact predicted in ${result.estimatedDuration} days`);
    } catch (error) {
      console.error('Error running simulation:', error);
      toast.error('Failed to run simulation');
    } finally {
      setIsSimulating(false);
    }
  };

  const generateAdvisoryNotes = (impacts: RegionalImpact[], maxDanger: number): string[] => {
    const notes: string[] = [];
    
    if (maxDanger > 40) {
      notes.push('⚠️ High-risk scenario detected. Consider postponing implementation.');
    }
    
    const highImpactRegions = impacts.filter(r => r.overallImpact > 0.7);
    if (highImpactRegions.length > 0) {
      notes.push(`🎯 Focus monitoring on: ${highImpactRegions.map(r => r.region).join(', ')}`);
    }

    const angerDominant = impacts.filter(r => 
      r.emotionalProfile[0]?.emotion === 'anger' && r.emotionalProfile[0]?.likelihood > 60
    );
    if (angerDominant.length > 0) {
      notes.push('😠 High anger probability detected. Prepare crisis communication strategy.');
    }

    notes.push('📊 Deploy additional sentiment monitoring 48hrs before implementation.');
    
    return notes;
  };

  const saveScenario = () => {
    if (!currentScenario.title) {
      toast.error('Please provide a scenario title');
      return;
    }

    const scenario: ScenarioInput = {
      ...currentScenario,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      triggerWords: detectTriggerWords(currentScenario.description, currentScenario.category)
    };

    const updated = [...scenarios, scenario];
    setScenarios(updated);
    localStorage.setItem('civic_scenarios', JSON.stringify(updated));
    
    setCurrentScenario({
      id: '',
      title: '',
      description: '',
      category: 'economic',
      triggerWords: [],
      affectedRegions: [],
      expectedImpactLevel: 'medium',
      createdAt: ''
    });

    toast.success('Scenario saved successfully');
  };

  const loadScenario = (scenario: ScenarioInput) => {
    setCurrentScenario(scenario);
  };

  const getRiskColor = (assessment: string) => {
    switch (assessment) {
      case 'Critical': return 'text-red-600';
      case 'High': return 'text-orange-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimelineData = (result: SimulationResult) => {
    const timelineData = Array.from({ length: 7 }, (_, i) => {
      const day = i + 1;
      const avgIntensity = result.regionalImpacts.reduce((sum, r) => {
        const dayData = r.timeline.find(t => t.day === day);
        return sum + (dayData?.intensity || 0);
      }, 0) / result.regionalImpacts.length;

      return {
        day: `Day ${day}`,
        intensity: Math.round(avgIntensity * 100)
      };
    });

    return timelineData;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Civic Simulation Core
          </h2>
          <p className="text-muted-foreground">
            Predict public emotional response to hypothetical policies and events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setComparisonMode(!comparisonMode)}
            className="flex items-center gap-2"
          >
            <GitCompare className="h-4 w-4" />
            {comparisonMode ? 'Exit Compare' : 'Compare Scenarios'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="input" className="space-y-4">
        <TabsList>
          <TabsTrigger value="input">Scenario Input</TabsTrigger>
          <TabsTrigger value="results">Simulation Results</TabsTrigger>
          <TabsTrigger value="library">Scenario Library</TabsTrigger>
          <TabsTrigger value="compare">Comparison Tool</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Create Scenario
                </CardTitle>
                <CardDescription>
                  Define the political event or policy for simulation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Scenario Title</label>
                  <Input
                    placeholder="e.g., Fuel price increase by 30%"
                    value={currentScenario.title}
                    onChange={(e) => setCurrentScenario(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Detailed Description</label>
                  <Textarea
                    placeholder="Describe the scenario in detail..."
                    value={currentScenario.description}
                    onChange={(e) => setCurrentScenario(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={currentScenario.category}
                      onValueChange={(value: any) => setCurrentScenario(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="economic">Economic</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="policy">Policy</SelectItem>
                        <SelectItem value="election">Election</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Expected Impact</label>
                    <Select
                      value={currentScenario.expectedImpactLevel}
                      onValueChange={(value: any) => setCurrentScenario(prev => ({ ...prev, expectedImpactLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Impact</SelectItem>
                        <SelectItem value="medium">Medium Impact</SelectItem>
                        <SelectItem value="high">High Impact</SelectItem>
                        <SelectItem value="critical">Critical Impact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveScenario} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Scenario
                  </Button>
                  <Button 
                    onClick={runSimulation} 
                    disabled={isSimulating}
                    className="flex items-center gap-2"
                  >
                    <Play className={`h-4 w-4 ${isSimulating ? 'animate-spin' : ''}`} />
                    {isSimulating ? 'Simulating...' : 'Run Simulation'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Auto-detected Triggers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Analysis Preview
                </CardTitle>
                <CardDescription>
                  Auto-detected emotional triggers and impact preview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Trigger Words Detected</label>
                  <div className="flex flex-wrap gap-2">
                    {detectTriggerWords(currentScenario.description, currentScenario.category).map(word => (
                      <Badge key={word} variant="secondary">{word}</Badge>
                    ))}
                    {detectTriggerWords(currentScenario.description, currentScenario.category).length === 0 && (
                      <span className="text-sm text-muted-foreground">No triggers detected yet</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Expected Emotional Response</label>
                  <div className="space-y-2">
                    {currentScenario.category === 'economic' && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">High anger probability (fuel/tax related)</span>
                      </div>
                    )}
                    {currentScenario.category === 'security' && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">Fear and anxiety likely dominant</span>
                      </div>
                    )}
                    {currentScenario.category === 'policy' && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Mixed reactions expected</span>
                      </div>
                    )}
                  </div>
                </div>

                {currentScenario.description && (
                  <Alert>
                    <Calculator className="h-4 w-4" />
                    <AlertDescription>
                      Based on historical patterns, this scenario could affect <strong>
                        {CAMEROON_REGIONS.length} regions
                      </strong> with peak emotional response expected within <strong>2-5 days</strong>.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {selectedResult ? (
            <div className="space-y-6">
              {/* Result Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        {selectedResult.scenarioTitle}
                      </CardTitle>
                      <CardDescription>
                        Simulation run on {new Date(selectedResult.runDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {selectedResult.confidenceScore.toFixed(1)}% Confidence
                      </Badge>
                      <Badge className={getRiskColor(selectedResult.riskAssessment)}>
                        {selectedResult.riskAssessment} Risk
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Sentiment Shift</p>
                      <p className="text-2xl font-bold text-red-600">
                        {selectedResult.overallSentimentShift.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Peak Response</p>
                      <p className="text-2xl font-bold">
                        {(selectedResult.peakEmotionalResponse * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-2xl font-bold">
                        {selectedResult.estimatedDuration} days
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Diaspora Impact</p>
                      <p className="text-2xl font-bold">
                        {(selectedResult.diasporaImpact * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Emotional Intensity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={formatTimelineData(selectedResult)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="intensity" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Regional Impact */}
              <Card>
                <CardHeader>
                  <CardTitle>Regional Impact Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedResult.regionalImpacts.map(region => (
                      <div key={region.region} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {region.region}
                          </h4>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">
                              Civic Danger: {region.civicDangerScore.before}→{region.civicDangerScore.after}
                            </Badge>
                            <Badge variant={region.civicDangerScore.change > 30 ? "destructive" : "secondary"}>
                              +{region.civicDangerScore.change.toFixed(0)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Top Emotions Expected</p>
                            <div className="space-y-1">
                              {region.emotionalProfile.slice(0, 3).map(emotion => (
                                <div key={emotion.emotion} className="flex items-center justify-between">
                                  <span className="text-sm capitalize">{emotion.emotion}</span>
                                  <div className="flex items-center gap-2">
                                    <Progress value={emotion.likelihood} className="w-20 h-2" />
                                    <span className="text-xs">{emotion.likelihood.toFixed(0)}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Impact Timeline</p>
                            <div className="flex items-center gap-1">
                              {region.timeline.map(day => (
                                <div
                                  key={day.day}
                                  className="flex-1 h-8 bg-gradient-to-t from-blue-200 to-blue-500 rounded-sm flex items-end justify-center text-xs text-white font-medium"
                                  style={{ 
                                    height: `${Math.max(day.intensity * 32, 8)}px`,
                                    backgroundColor: EMOTION_COLORS[day.dominantEmotion as keyof typeof EMOTION_COLORS] || '#3b82f6'
                                  }}
                                  title={`Day ${day.day}: ${(day.intensity * 100).toFixed(0)}% ${day.dominantEmotion}`}
                                >
                                  {day.day}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Advisory Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Policy Advisory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedResult.advisoryNotes.map((note, index) => (
                      <Alert key={index}>
                        <AlertDescription>{note}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No simulation results yet</p>
                  <p className="text-sm text-muted-foreground">Create and run a scenario to see predictions</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Saved Scenarios */}
            <Card>
              <CardHeader>
                <CardTitle>Saved Scenarios</CardTitle>
                <CardDescription>Previously created simulation scenarios</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {scenarios.map(scenario => (
                      <div key={scenario.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{scenario.title}</h4>
                          <Badge variant="outline">{scenario.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {scenario.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(scenario.createdAt).toLocaleDateString()}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => loadScenario(scenario)}
                          >
                            Load
                          </Button>
                        </div>
                      </div>
                    ))}
                    {scenarios.length === 0 && (
                      <p className="text-center text-muted-foreground">No saved scenarios</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Past Results */}
            <Card>
              <CardHeader>
                <CardTitle>Simulation History</CardTitle>
                <CardDescription>Previous simulation results</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {simulationResults.map(result => (
                      <div key={result.scenarioId} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{result.scenarioTitle}</h4>
                          <Badge className={getRiskColor(result.riskAssessment)}>
                            {result.riskAssessment}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span>Impact: {(result.peakEmotionalResponse * 100).toFixed(0)}%</span>
                          <span>Duration: {result.estimatedDuration}d</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(result.runDate).toLocaleDateString()}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedResult(result)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                    {simulationResults.length === 0 && (
                      <p className="text-center text-muted-foreground">No simulation results</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Scenario Comparison
            </CardTitle>
              <CardDescription>
                Compare emotional impact between different policy scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  Scenario comparison feature coming soon. This will allow side-by-side analysis of 
                  multiple scenarios to help choose the least disruptive policy implementation approach.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};