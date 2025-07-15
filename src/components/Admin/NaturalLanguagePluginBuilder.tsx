import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, Code, Database, Zap, RotateCcw, Eye, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PluginRequest {
  id: string;
  request_text: string;
  plugin_name: string;
  status: string;
  created_at: string;
  similarity_check_results: any;
  parsed_requirements: any;
  estimated_complexity: number;
}

interface GeneratedPlugin {
  id: string;
  plugin_name: string;
  plugin_description: string;
  status: string;
  created_at: string;
  files_created: any; // JSON array from Supabase
  tables_created: string[];
  functions_created: string[];
  is_rollback_available: boolean;
}

interface GenerationStep {
  id: string;
  step_name: string;
  step_type: string;
  status: string;
  generated_code: string;
  file_path: string;
  error_message: string;
}

export function NaturalLanguagePluginBuilder() {
  const [requestText, setRequestText] = useState('');
  const [pluginName, setPluginName] = useState('');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<PluginRequest[]>([]);
  const [plugins, setPlugins] = useState<GeneratedPlugin[]>([]);
  const [currentRequest, setCurrentRequest] = useState<string | null>(null);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();
    loadPlugins();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentRequest) {
      interval = setInterval(() => {
        checkGenerationProgress(currentRequest);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentRequest]);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('ashen_plugin_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const loadPlugins = async () => {
    try {
      const { data, error } = await supabase
        .from('ashen_generated_plugins')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPlugins(data || []);
    } catch (error) {
      console.error('Error loading plugins:', error);
    }
  };

  const checkGenerationProgress = async (requestId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('natural-language-plugin-builder', {
        body: { action: 'status', requestId }
      });

      if (error) throw error;

      setGenerationSteps(data.steps || []);
      setProgress(data.progress || 0);

      if (data.status === 'completed' || data.status === 'failed') {
        setCurrentRequest(null);
        loadRequests();
        loadPlugins();
        
        if (data.status === 'completed') {
          toast({
            title: "Plugin Generated!",
            description: "Your plugin has been successfully created.",
          });
        }
      }
    } catch (error) {
      console.error('Error checking progress:', error);
    }
  };

  const handleAnalyzeRequest = async () => {
    if (!requestText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a plugin description",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('natural-language-plugin-builder', {
        body: { 
          action: 'analyze', 
          requestText, 
          pluginName: pluginName || undefined 
        }
      });

      if (error) throw error;

      const recommendation = data.recommendation;
      
      if (recommendation === 'duplicate') {
        toast({
          title: "Similar Plugin Found",
          description: "A very similar plugin already exists. Consider using or extending it instead.",
          variant: "destructive",
        });
        return;
      }
      
      if (recommendation === 'extend_existing') {
        toast({
          title: "Extension Recommended",
          description: "Consider extending an existing plugin instead of creating a new one.",
        });
      }

      // Ask for confirmation before generating
      const confirmed = confirm(`Generate plugin: "${data.parsedRequirements.suggestedName}"?\n\nEstimated complexity: ${data.parsedRequirements.complexity}/5\nFiles to create: ${data.estimatedSteps}\n\nClick OK to proceed.`);
      
      if (confirmed) {
        await handleGeneratePlugin(data.requestId);
      }

      loadRequests();
    } catch (error) {
      console.error('Error analyzing request:', error);
      toast({
        title: "Error",
        description: "Failed to analyze plugin request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlugin = async (requestId: string) => {
    try {
      setCurrentRequest(requestId);
      setProgress(0);
      setGenerationSteps([]);

      const { data, error } = await supabase.functions.invoke('natural-language-plugin-builder', {
        body: { action: 'generate', requestId }
      });

      if (error) throw error;

      toast({
        title: "Generation Started",
        description: "Plugin generation is in progress...",
      });
    } catch (error) {
      console.error('Error generating plugin:', error);
      toast({
        title: "Error",
        description: "Failed to start plugin generation",
        variant: "destructive",
      });
      setCurrentRequest(null);
    }
  };

  const handleRollbackPlugin = async (requestId: string) => {
    if (!confirm('Are you sure you want to rollback this plugin? This action cannot be undone.')) {
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('natural-language-plugin-builder', {
        body: { action: 'rollback', requestId }
      });

      if (error) throw error;

      toast({
        title: "Plugin Rolled Back",
        description: data.message,
      });
      
      loadPlugins();
    } catch (error) {
      console.error('Error rolling back plugin:', error);
      toast({
        title: "Error",
        description: "Failed to rollback plugin",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'schema':
        return <Database className="h-4 w-4" />;
      case 'component':
        return <Code className="h-4 w-4" />;
      case 'function':
        return <Zap className="h-4 w-4" />;
      default:
        return <Code className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Natural Language Plugin Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plugin-description">Describe Your Plugin</Label>
            <Textarea
              id="plugin-description"
              placeholder="e.g., 'Create a civic rating plugin for governors only' or 'Build a fund allocation tracker for each region' or 'Add a whistleblower form with image upload and anonymity'"
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plugin-name">Plugin Name (Optional)</Label>
            <Input
              id="plugin-name"
              placeholder="Auto-generated if not provided"
              value={pluginName}
              onChange={(e) => setPluginName(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleAnalyzeRequest} 
            disabled={loading || !!currentRequest}
            className="w-full"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Analyze & Build Plugin
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {currentRequest && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
            
            <div className="space-y-2">
              {generationSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  {getStepIcon(step.step_type)}
                  <span className="flex-1">{step.step_name}</span>
                  {getStatusIcon(step.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests">Recent Requests</TabsTrigger>
          <TabsTrigger value="plugins">Generated Plugins</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Requests History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{request.plugin_name}</h3>
                          {getStatusIcon(request.status)}
                          <Badge variant="outline">
                            Complexity: {request.estimated_complexity}/5
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.request_text}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>
                      
                      {request.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleGeneratePlugin(request.id)}
                          disabled={!!currentRequest}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Generate
                        </Button>
                      )}
                    </div>
                    
                    {request.similarity_check_results?.similar_plugins?.length > 0 && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Similar plugins found:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {request.similarity_check_results.similar_plugins.map((similar: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {similar.plugin_name} ({similar.similarity}%)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {requests.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No plugin requests yet. Create your first plugin above!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plugins">
          <Card>
            <CardHeader>
              <CardTitle>Generated Plugins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plugins.map((plugin) => (
                  <div key={plugin.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{plugin.plugin_name}</h3>
                          <Badge 
                            variant={plugin.status === 'active' ? 'default' : 'secondary'}
                          >
                            {plugin.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {plugin.plugin_description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {plugin.files_created?.length > 0 && (
                            <Badge variant="outline">
                              <Code className="h-3 w-3 mr-1" />
                              {plugin.files_created.length} files
                            </Badge>
                          )}
                          {plugin.tables_created?.length > 0 && (
                            <Badge variant="outline">
                              <Database className="h-3 w-3 mr-1" />
                              {plugin.tables_created.length} tables
                            </Badge>
                          )}
                          {plugin.functions_created?.length > 0 && (
                            <Badge variant="outline">
                              <Zap className="h-3 w-3 mr-1" />
                              {plugin.functions_created.length} functions
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: {new Date(plugin.created_at).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {plugin.is_rollback_available && plugin.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRollbackPlugin(plugin.id)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Rollback
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {plugins.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No plugins generated yet. Build your first plugin above!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NaturalLanguagePluginBuilder;