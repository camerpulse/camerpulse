import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Lightbulb, 
  Download, 
  Archive, 
  Rocket, 
  Clock, 
  Target, 
  Database,
  Users,
  CheckCircle,
  AlertCircle,
  Layers,
  Zap
} from 'lucide-react';

interface Problem {
  id: string;
  problem_title: string;
  problem_description: string;
  problem_category: string;
  status: string;
  created_at: string;
  strategy_solutions?: Solution[];
}

interface Solution {
  id: string;
  solution_title: string;
  solution_overview: string;
  recommended_features: string[];
  data_requirements: any;
  user_flows: string[];
  dashboard_specs: any;
  integration_suggestions: string[];
  engagement_strategy: any;
  timeline_estimate: string;
  complexity_score: number;
  confidence_score: number;
  build_ready_prompt: string;
  created_at: string;
}

export default function CivicArchitectEngine() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [currentSolution, setCurrentSolution] = useState<Solution | null>(null);
  const [problemArchive, setProblemArchive] = useState<Problem[]>([]);
  const [activeTab, setActiveTab] = useState('architect');
  
  // Form state
  const [problemTitle, setProblemTitle] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [problemCategory, setProblemCategory] = useState('governance');
  const [targetAudience, setTargetAudience] = useState<string[]>(['citizens']);

  const { toast } = useToast();

  useEffect(() => {
    loadArchive();
  }, []);

  const loadArchive = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('prompt-intelligence-engine', {
        body: { action: 'get_archive' }
      });

      if (error) throw error;

      setProblemArchive(data.problems || []);
    } catch (error) {
      console.error('Error loading archive:', error);
      toast({
        title: "Error",
        description: "Failed to load strategy archive",
        variant: "destructive",
      });
    }
  };

  const analyzeProblem = async () => {
    if (!problemTitle.trim() || !problemDescription.trim()) {
      toast({
        title: "Error",
        description: "Please provide both title and description",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('prompt-intelligence-engine', {
        body: {
          action: 'analyze_problem',
          problem_title: problemTitle,
          problem_description: problemDescription,
          problem_category: problemCategory,
          target_audience: targetAudience
        }
      });

      if (error) throw error;

      // Fetch the created problem with analysis
      const { data: problemData, error: problemError } = await supabase
        .from('strategy_problems')
        .select('*')
        .eq('id', data.problem_id)
        .single();

      if (problemError) throw problemError;

      setCurrentProblem(problemData);
      setActiveTab('blueprint');
      
      toast({
        title: "Analysis Complete",
        description: "Civic problem analyzed successfully. Ready for solution generation.",
      });
    } catch (error) {
      console.error('Error analyzing problem:', error);
      toast({
        title: "Error",
        description: "Failed to analyze problem",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSolution = async () => {
    if (!currentProblem?.id) return;

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('prompt-intelligence-engine', {
        body: {
          action: 'generate_solution',
          problem_id: currentProblem.id
        }
      });

      if (error) throw error;

      setCurrentSolution(data.solution);
      
      toast({
        title: "Blueprint Generated",
        description: "Comprehensive civic solution blueprint created successfully.",
      });

      // Refresh archive
      loadArchive();
    } catch (error) {
      console.error('Error generating solution:', error);
      toast({
        title: "Error",
        description: "Failed to generate solution blueprint",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportSolution = (format: 'prompt' | 'json' | 'pdf') => {
    if (!currentSolution) return;

    let content = '';
    let filename = '';

    switch (format) {
      case 'prompt':
        content = currentSolution.build_ready_prompt;
        filename = `civic-solution-prompt-${Date.now()}.txt`;
        break;
      case 'json':
        content = JSON.stringify(currentSolution, null, 2);
        filename = `civic-solution-${Date.now()}.json`;
        break;
      case 'pdf':
        // For now, export as text - PDF generation would require additional library
        content = `CIVIC SOLUTION BLUEPRINT\n\n${currentSolution.solution_title}\n\n${currentSolution.solution_overview}\n\nFeatures:\n${currentSolution.recommended_features?.map(f => `- ${f}`).join('\n')}\n\nTimeline: ${currentSolution.timeline_estimate}`;
        filename = `civic-solution-${Date.now()}.txt`;
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Solution exported as ${format.toUpperCase()}`,
    });
  };

  const resetForm = () => {
    setProblemTitle('');
    setProblemDescription('');
    setProblemCategory('governance');
    setTargetAudience(['citizens']);
    setCurrentProblem(null);
    setCurrentSolution(null);
    setActiveTab('architect');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Intelligence Strategy Engine
            <Badge variant="secondary">Civic Architect Mode</Badge>
          </h2>
          <p className="text-muted-foreground">
            Transform civic problems into comprehensive digital solution blueprints
          </p>
        </div>
        <Button variant="outline" onClick={resetForm}>
          New Problem
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="architect">Problem Analysis</TabsTrigger>
          <TabsTrigger value="blueprint">Solution Blueprint</TabsTrigger>
          <TabsTrigger value="archive">Strategy Archive</TabsTrigger>
        </TabsList>

        <TabsContent value="architect" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Describe the Civic Challenge
              </CardTitle>
              <CardDescription>
                Present a governance issue, societal problem, or political failure for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Problem Title</label>
                <Input
                  value={problemTitle}
                  onChange={(e) => setProblemTitle(e.target.value)}
                  placeholder="e.g., Reduce fake political news before elections"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Detailed Description</label>
                <Textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Describe the specific challenges, current situation, stakeholders involved, and desired outcomes..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={problemCategory} onValueChange={setProblemCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="governance">Governance</SelectItem>
                      <SelectItem value="elections">Elections</SelectItem>
                      <SelectItem value="corruption">Anti-Corruption</SelectItem>
                      <SelectItem value="transparency">Transparency</SelectItem>
                      <SelectItem value="engagement">Public Engagement</SelectItem>
                      <SelectItem value="youth">Youth Issues</SelectItem>
                      <SelectItem value="finance">Budget & Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience</label>
                  <Select 
                    value={targetAudience[0]} 
                    onValueChange={(value) => setTargetAudience([value])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="citizens">General Citizens</SelectItem>
                      <SelectItem value="youth">Youth (18-35)</SelectItem>
                      <SelectItem value="officials">Government Officials</SelectItem>
                      <SelectItem value="media">Media & Journalists</SelectItem>
                      <SelectItem value="researchers">Researchers & NGOs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={analyzeProblem} 
                disabled={isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Ashen is thinking...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Problem
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blueprint" className="space-y-4">
          {currentProblem && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Problem Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold">{currentProblem.problem_title}</h3>
                  <p className="text-sm text-muted-foreground">{currentProblem.problem_description}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">{currentProblem.problem_category}</Badge>
                    <Badge variant={currentProblem.status === 'analyzed' ? 'default' : 'secondary'}>
                      {currentProblem.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentProblem && !currentSolution && (
            <Card>
              <CardHeader>
                <CardTitle>Generate Solution Blueprint</CardTitle>
                <CardDescription>
                  Create a comprehensive digital solution including features, data requirements, and implementation strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generateSolution} 
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Generating Blueprint...
                    </>
                  ) : (
                    <>
                      <Layers className="h-4 w-4 mr-2" />
                      Generate Solution Blueprint
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {currentSolution && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Solution Blueprint Generated
                  </CardTitle>
                  <CardDescription>
                    Comprehensive civic solution ready for implementation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{currentSolution.solution_title}</h3>
                    <p className="text-muted-foreground mt-2">{currentSolution.solution_overview}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Timeline</span>
                      </div>
                      <p className="text-lg font-bold">{currentSolution.timeline_estimate}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Complexity</span>
                      </div>
                      <p className="text-lg font-bold">{currentSolution.complexity_score}/10</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Target className="h-4 w-4" />
                        <span className="text-sm font-medium">Confidence</span>
                      </div>
                      <p className="text-lg font-bold">{Math.round(currentSolution.confidence_score * 100)}%</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Recommended Features
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentSolution.recommended_features?.map((feature, index) => (
                          <Badge key={index} variant="secondary">{feature}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Data Requirements
                      </h4>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {Object.entries(currentSolution.data_requirements || {}).map(([key, values]) => (
                          <div key={key} className="p-2 border rounded">
                            <span className="text-xs font-medium uppercase text-muted-foreground">{key}</span>
                            <div className="space-y-1">
                              {Array.isArray(values) ? values.map((value, i) => (
                                <div key={i} className="text-xs">{String(value)}</div>
                              )) : <div className="text-xs">{String(values)}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        User Flows
                      </h4>
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        {currentSolution.user_flows?.map((flow, index) => (
                          <li key={index}>{flow}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium">Integration Suggestions</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentSolution.integration_suggestions?.map((integration, index) => (
                          <Badge key={index} variant="outline">{integration}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={() => exportSolution('prompt')} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Prompt
                    </Button>
                    <Button onClick={() => exportSolution('json')} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export JSON
                    </Button>
                    <Button onClick={() => exportSolution('pdf')} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button variant="default" className="ml-auto">
                      <Rocket className="h-4 w-4 mr-2" />
                      Send to Dev Terminal
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {currentSolution.build_ready_prompt && (
                <Card>
                  <CardHeader>
                    <CardTitle>Build-Ready Prompt</CardTitle>
                    <CardDescription>
                      Copy this prompt to rapidly implement the solution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48 w-full border rounded p-4">
                      <pre className="text-xs whitespace-pre-wrap">
                        {currentSolution.build_ready_prompt}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Strategy Archive
              </CardTitle>
              <CardDescription>
                Previously analyzed problems and generated solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {problemArchive.map((problem) => (
                    <div key={problem.id} className="p-4 border rounded hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{problem.problem_title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {problem.problem_description}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{problem.problem_category}</Badge>
                            <Badge variant={problem.status === 'solution_generated' ? 'default' : 'secondary'}>
                              {problem.status}
                            </Badge>
                            {problem.strategy_solutions && problem.strategy_solutions.length > 0 && (
                              <Badge variant="default">Solution Available</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(problem.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {problemArchive.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No problems analyzed yet. Start by creating your first civic strategy.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}