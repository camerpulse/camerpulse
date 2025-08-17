import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Terminal, 
  Brain, 
  Code, 
  Database,
  FileCode,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Eye,
  RotateCcw,
  Copy,
  Settings,
  History,
  Cpu,
  Layers,
  GitBranch,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DevRequest {
  id: string;
  request_prompt: string;
  request_type: string;
  target_users: string[];
  build_mode: string;
  status: string;
  estimated_complexity: number;
  created_at: string;
  completed_at?: string;
  metadata?: any;
}

interface BuildStep {
  id: string;
  step_name: string;
  step_type: string;
  step_order: number;
  status: string;
  started_at?: string;
  completed_at?: string;
  error_details?: string;
}

interface GeneratedArtifact {
  id: string;
  artifact_type: string;
  artifact_name: string;
  file_path?: string;
  generated_code?: string;
  is_applied: boolean;
  created_at: string;
}

const AshenDevTerminal: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [requestType, setRequestType] = useState('feature');
  const [targetUsers, setTargetUsers] = useState(['admin']);
  const [buildMode, setBuildMode] = useState('think_first');
  const [useCivicMemory, setUseCivicMemory] = useState(true);
  const [previewBeforeBuild, setPreviewBeforeBuild] = useState(true);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<DevRequest | null>(null);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [generatedArtifacts, setGeneratedArtifacts] = useState<GeneratedArtifact[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  
  const [recentRequests, setRecentRequests] = useState<DevRequest[]>([]);
  const [terminalStatus, setTerminalStatus] = useState<any>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadTerminalStatus();
    const interval = setInterval(loadTerminalStatus, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadTerminalStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ashen-dev-terminal', {
        body: { action: 'status' }
      });

      if (error) throw error;

      if (data.status) {
        setTerminalStatus(data.status);
        setRecentRequests(data.status.recentRequests || []);
      }
    } catch (error) {
      console.error('Error loading terminal status:', error);
    }
  };

  const analyzePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ashen-dev-terminal', {
        body: {
          action: 'analyze',
          prompt,
          requestType,
          targetUsers,
          buildMode,
          useCivicMemory,
          previewBeforeBuild
        }
      });

      if (error) throw error;

      setCurrentRequest(data.request);
      setAnalysis(data.analysis);
      setBuildSteps(data.buildSteps || []);
      
      toast({
        title: "Analysis Complete",
        description: `Complexity: ${data.analysis.complexity_score}/10 - ${data.buildSteps.length} steps planned`,
      });

      await loadTerminalStatus();
    } catch (error) {
      console.error('Error analyzing prompt:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze your request",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const buildFeature = async () => {
    if (!currentRequest) {
      toast({
        title: "Error",
        description: "Please analyze a prompt first",
        variant: "destructive"
      });
      return;
    }

    setIsBuilding(true);
    try {
      const { data, error } = await supabase.functions.invoke('ashen-dev-terminal', {
        body: {
          action: 'build',
          requestId: currentRequest.id
        }
      });

      if (error) throw error;

      setGeneratedArtifacts(data.generatedArtifacts || []);
      
      toast({
        title: "Build Complete",
        description: `Generated ${data.generatedArtifacts.length} artifacts successfully`,
      });

      await loadTerminalStatus();
    } catch (error) {
      console.error('Error building feature:', error);
      toast({
        title: "Build Failed",
        description: "Failed to build your feature",
        variant: "destructive"
      });
    } finally {
      setIsBuilding(false);
    }
  };

  const revertFeature = async (requestId: string, reason: string = 'Manual revert') => {
    try {
      const { error } = await supabase.functions.invoke('ashen-dev-terminal', {
        body: {
          action: 'revert',
          requestId,
          options: { reason }
        }
      });

      if (error) throw error;

      toast({
        title: "Feature Reverted",
        description: "The feature has been successfully reverted",
      });

      await loadTerminalStatus();
    } catch (error) {
      console.error('Error reverting feature:', error);
      toast({
        title: "Revert Failed",
        description: "Failed to revert the feature",
        variant: "destructive"
      });
    }
  };

  const cloneFeature = async (requestId: string, newPrompt?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ashen-dev-terminal', {
        body: {
          action: 'clone',
          requestId,
          options: { newPrompt }
        }
      });

      if (error) throw error;

      setPrompt(newPrompt || data.clonedRequest.request_prompt);
      
      toast({
        title: "Feature Cloned",
        description: "The feature has been cloned for modification",
      });

      await loadTerminalStatus();
    } catch (error) {
      console.error('Error cloning feature:', error);
      toast({
        title: "Clone Failed",
        description: "Failed to clone the feature",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'building': case 'analyzing': return <Clock className="h-4 w-4 text-warning animate-spin" />;
      case 'reverted': return <RotateCcw className="h-4 w-4 text-muted-foreground" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'building': case 'analyzing': return 'secondary';
      case 'reverted': return 'outline';
      default: return 'outline';
    }
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 3) return 'text-success';
    if (complexity <= 6) return 'text-warning';
    return 'text-destructive';
  };

  const getArtifactIcon = (type: string) => {
    switch (type) {
      case 'table_schema': return <Database className="h-4 w-4" />;
      case 'component': return <FileCode className="h-4 w-4" />;
      case 'edge_function': return <Zap className="h-4 w-4" />;
      case 'rls_policy': return <Shield className="h-4 w-4" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Terminal className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Ashen Dev Terminal</h2>
          <Badge variant="outline">AI-Powered Builder</Badge>
        </div>
        <div className="flex items-center gap-4">
          {terminalStatus && (
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <span className="text-sm">
                Health: {terminalStatus.terminalHealth?.successRate || 0}%
              </span>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="terminal" className="w-full">
        <TabsList>
          <TabsTrigger value="terminal">Terminal</TabsTrigger>
          <TabsTrigger value="history">Build History</TabsTrigger>
          <TabsTrigger value="artifacts">Generated Code</TabsTrigger>
          <TabsTrigger value="memory">Civic Memory</TabsTrigger>
        </TabsList>

        <TabsContent value="terminal" className="space-y-6">
          {/* Build Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Build Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Build Type</Label>
                  <Select value={requestType} onValueChange={setRequestType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="scraper">Data Scraper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Build Mode</Label>
                  <Select value={buildMode} onValueChange={setBuildMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="think_first">🧠 Think First, Then Build</SelectItem>
                      <SelectItem value="auto_build">🚀 Auto-Build on Submit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Use Civic Memory</Label>
                  <Switch checked={useCivicMemory} onCheckedChange={setUseCivicMemory} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Preview Before Build</Label>
                  <Switch checked={previewBeforeBuild} onCheckedChange={setPreviewBeforeBuild} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prompt Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Describe What You Want to Build
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., 'Build a regional corruption complaint form for public use' or 'Create a fund usage audit feature for ministers'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="min-h-[100px]"
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={analyzePrompt}
                  disabled={isAnalyzing || isBuilding}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Analyze Request
                    </>
                  )}
                </Button>
                
                {currentRequest && analysis && (
                  <Button 
                    onClick={buildFeature}
                    disabled={isBuilding || isAnalyzing}
                    variant="default"
                  >
                    {isBuilding ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Building...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Build
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Complexity Score</Label>
                    <div className={`text-2xl font-bold ${getComplexityColor(analysis.complexity_score)}`}>
                      {analysis.complexity_score}/10
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Duration</Label>
                    <div className="text-2xl font-bold">
                      {analysis.estimated_duration_minutes || 0}m
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Artifacts to Generate</Label>
                    <div className="text-2xl font-bold">
                      {analysis.estimated_artifacts?.length || 0}
                    </div>
                  </div>
                </div>

                {analysis.estimated_artifacts && analysis.estimated_artifacts.length > 0 && (
                  <div className="space-y-2">
                    <Label>Planned Artifacts</Label>
                    <div className="flex flex-wrap gap-2">
                      {analysis.estimated_artifacts.map((artifact: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {artifact.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {buildSteps.length > 0 && (
                  <div className="space-y-2">
                    <Label>Build Steps</Label>
                    <div className="space-y-2">
                      {buildSteps.map((step, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <span className="text-sm font-medium w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span>{step.step_name}</span>
                          <Badge variant="outline" className="ml-auto">
                            {step.step_type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Generated Artifacts */}
          {generatedArtifacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Generated Artifacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generatedArtifacts.map((artifact) => (
                    <div key={artifact.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getArtifactIcon(artifact.artifact_type)}
                        <div>
                          <div className="font-medium">{artifact.artifact_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {artifact.file_path || artifact.artifact_type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={artifact.is_applied ? 'default' : 'outline'}>
                          {artifact.is_applied ? 'Applied' : 'Generated'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Build Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {recentRequests.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No recent build requests
                    </div>
                  ) : (
                    recentRequests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <Badge variant={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => cloneFeature(request.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {request.status === 'completed' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => revertFeature(request.id)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm font-medium">{request.request_prompt}</div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Type: {request.request_type}</span>
                          <span>Complexity: {request.estimated_complexity || 0}/10</span>
                          <span>{new Date(request.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artifacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                All Generated Artifacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {terminalStatus?.recentArtifacts?.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No artifacts generated yet
                </div>
              ) : (
                <div className="space-y-3">
                  {terminalStatus?.recentArtifacts?.map((artifact: any) => (
                    <div key={artifact.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getArtifactIcon(artifact.artifact_type)}
                          <div>
                            <div className="font-medium">{artifact.artifact_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {artifact.file_path || artifact.artifact_type}
                            </div>
                          </div>
                        </div>
                        <Badge variant={artifact.is_applied ? 'default' : 'outline'}>
                          {artifact.is_applied ? 'Applied' : 'Generated'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Civic Memory Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              {terminalStatus?.civicMemory?.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No civic memory patterns available
                </div>
              ) : (
                <div className="space-y-3">
                  {terminalStatus?.civicMemory?.map((pattern: any) => (
                    <div key={pattern.pattern_name} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{pattern.pattern_name}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {pattern.success_rate}% success
                          </Badge>
                          <Badge variant="secondary">
                            Used {pattern.usage_count}x
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        Type: {pattern.pattern_type}
                      </div>
                      
                      {pattern.tags && pattern.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {pattern.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AshenDevTerminal;