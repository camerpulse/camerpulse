import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Bot, Brain, MessageSquare, Play, Pause, RotateCcw, Trash2, Eye, Settings, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface JrAgent {
  id: string;
  agent_name: string;
  agent_goal: string;
  agent_scope: any;
  personality: string;
  knowledge_sources: string[];
  status: string;
  accuracy_rating: number;
  memory_size: number;
  last_active: string;
  public_interaction_enabled: boolean;
  feedback_loop_enabled: boolean;
  training_prompt: string;
  system_prompt: string;
  created_at: string;
}

interface AgentSuggestion {
  agent_id: string;
  agent_name: string;
  suggestion_type: string;
  suggestion_message: string;
  priority: number;
}

const AshenJrTrainingCore: React.FC = () => {
  const [agents, setAgents] = useState<JrAgent[]>([]);
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'agent'; content: string; confidence?: number }>>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state for creating new agent
  const [formData, setFormData] = useState({
    agent_name: '',
    agent_goal: '',
    agent_scope: { regions: ['all'], focus: '', timeframe: '' },
    personality: 'professional',
    knowledge_sources: [] as string[],
    training_prompt: '',
    public_interaction_enabled: false,
    feedback_loop_enabled: true
  });

  const personalities = [
    { value: 'professional', label: 'Professional' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'youth_friendly', label: 'Youth-friendly' },
    { value: 'sarcastic', label: 'Sarcastic' },
    { value: 'bold', label: 'Bold' },
    { value: 'friendly', label: 'Friendly' }
  ];

  const knowledgeSourceOptions = [
    'sentiment', 'ratings', 'promises', 'elections', 'budget_data', 
    'complaints', 'financial_reports', 'voter_registration', 'civic_education'
  ];

  useEffect(() => {
    loadAgents();
    loadSuggestions();
  }, []);

  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ashen-jr-training', {
        body: { action: 'get_agents' }
      });

      if (error) throw error;
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error loading agents:', error);
      toast({
        title: "Error",
        description: "Failed to load Jr. agents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ashen-jr-training', {
        body: { action: 'get_agent_suggestions' }
      });

      if (error) throw error;
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const createAgent = async () => {
    if (!formData.agent_name || !formData.agent_goal) {
      toast({
        title: "Error",
        description: "Agent name and goal are required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ashen-jr-training', {
        body: { 
          action: 'create_agent',
          agentData: formData
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: data.message
      });

      setShowCreateForm(false);
      setFormData({
        agent_name: '',
        agent_goal: '',
        agent_scope: { regions: ['all'], focus: '', timeframe: '' },
        personality: 'professional',
        knowledge_sources: [],
        training_prompt: '',
        public_interaction_enabled: false,
        feedback_loop_enabled: true
      });
      
      loadAgents();
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Error",
        description: "Failed to create agent",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const trainAgent = async (agentId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ashen-jr-training', {
        body: { 
          action: 'train_agent',
          agentId
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: data.message
      });

      loadAgents();
    } catch (error) {
      console.error('Error training agent:', error);
      toast({
        title: "Error",
        description: "Failed to train agent",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const interactWithAgent = async () => {
    if (!selectedAgent || !chatMessage.trim()) return;

    const userMessage = chatMessage.trim();
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const { data, error } = await supabase.functions.invoke('ashen-jr-training', {
        body: { 
          action: 'interact_with_agent',
          agentId: selectedAgent,
          message: userMessage
        }
      });

      if (error) throw error;

      setChatHistory(prev => [...prev, { 
        role: 'agent', 
        content: data.response,
        confidence: data.confidence
      }]);

    } catch (error) {
      console.error('Error interacting with agent:', error);
      setChatHistory(prev => [...prev, { 
        role: 'agent', 
        content: 'Sorry, I encountered an error processing your message.'
      }]);
    }
  };

  const updateAgentStatus = async (agentId: string, status: string) => {
    try {
      const { error } = await supabase.functions.invoke('ashen-jr-training', {
        body: { 
          action: 'update_agent_status',
          agentId,
          agentData: { status }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Agent status updated to ${status}`
      });

      loadAgents();
    } catch (error) {
      console.error('Error updating agent status:', error);
      toast({
        title: "Error",
        description: "Failed to update agent status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'training': return 'bg-amber-500';
      case 'paused': return 'bg-slate-400';
      case 'archived': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  const getPersonalityIcon = (personality: string) => {
    switch (personality) {
      case 'youth_friendly': return '🌟';
      case 'sarcastic': return '😏';
      case 'bold': return '💪';
      case 'friendly': return '😊';
      case 'professional': return '👔';
      default: return '🤖';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Ashen Jr. Training Core</h2>
          <p className="text-muted-foreground">Create, train, and manage specialized AI sub-agents for civic tasks</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Bot className="h-4 w-4" />
          New Jr. Agent
        </Button>
      </div>

      {/* Suggestions Panel */}
      {suggestions.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="h-5 w-5" />
              Ashen Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-amber-100 rounded-lg">
                  <div>
                    <p className="font-medium text-amber-800">{suggestion.agent_name}</p>
                    <p className="text-sm text-amber-700">{suggestion.suggestion_message}</p>
                  </div>
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    {suggestion.suggestion_type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="directory">Agent Directory</TabsTrigger>
          <TabsTrigger value="training">Training Console</TabsTrigger>
          <TabsTrigger value="interaction">Agent Interaction</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Card key={agent.id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getPersonalityIcon(agent.personality)}</span>
                      <Badge className={`${getStatusColor(agent.status)} text-white`}>
                        {agent.status}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      {agent.status === 'training' && (
                        <Button size="sm" variant="outline" onClick={() => trainAgent(agent.id)}>
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      {agent.status === 'active' && (
                        <Button size="sm" variant="outline" onClick={() => updateAgentStatus(agent.id, 'paused')}>
                          <Pause className="h-3 w-3" />
                        </Button>
                      )}
                      {agent.status === 'paused' && (
                        <Button size="sm" variant="outline" onClick={() => updateAgentStatus(agent.id, 'active')}>
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => trainAgent(agent.id)}>
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{agent.agent_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{agent.agent_goal}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Accuracy:</span>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(agent.accuracy_rating || 0) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Memory:</span>
                      <p className="text-muted-foreground">{agent.memory_size} items</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {agent.knowledge_sources.slice(0, 3).map((source) => (
                      <Badge key={source} variant="secondary" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                    {agent.knowledge_sources.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{agent.knowledge_sources.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Last active: {new Date(agent.last_active).toLocaleDateString()}</span>
                    {agent.public_interaction_enabled && (
                      <Badge variant="outline" className="text-xs">Public</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          {showCreateForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Create New Jr. Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent_name">Agent Name</Label>
                    <Input
                      id="agent_name"
                      placeholder="e.g., Budget Hawk Jr."
                      value={formData.agent_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, agent_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personality">Personality</Label>
                    <Select 
                      value={formData.personality} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, personality: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {personalities.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent_goal">Agent Goal</Label>
                  <Textarea
                    id="agent_goal"
                    placeholder="Describe what this agent should focus on..."
                    value={formData.agent_goal}
                    onChange={(e) => setFormData(prev => ({ ...prev, agent_goal: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training_prompt">Training Prompt</Label>
                  <Textarea
                    id="training_prompt"
                    placeholder="Provide specific training instructions..."
                    value={formData.training_prompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, training_prompt: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Knowledge Sources</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {knowledgeSourceOptions.map((source) => (
                      <label key={source} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.knowledge_sources.includes(source)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                knowledge_sources: [...prev.knowledge_sources, source]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                knowledge_sources: prev.knowledge_sources.filter(s => s !== source)
                              }));
                            }
                          }}
                          className="rounded border-muted-foreground"
                        />
                        <span>{source}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public_interaction"
                      checked={formData.public_interaction_enabled}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, public_interaction_enabled: checked }))}
                    />
                    <Label htmlFor="public_interaction">Enable Public Interaction</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="feedback_loop"
                      checked={formData.feedback_loop_enabled}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, feedback_loop_enabled: checked }))}
                    />
                    <Label htmlFor="feedback_loop">Enable Feedback Loop</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={createAgent} disabled={isLoading}>
                    <Brain className="h-4 w-4 mr-2" />
                    Create & Train Agent
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8">
              <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Training Session Active</h3>
              <p className="text-muted-foreground mb-4">Create a new Jr. agent to start training</p>
              <Button onClick={() => setShowCreateForm(true)}>
                Create New Agent
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="interaction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Agent Interaction Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Agent</Label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an active agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.filter(agent => agent.status === 'active').map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {getPersonalityIcon(agent.personality)} {agent.agent_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAgent && (
                <>
                  <div className="border rounded-lg p-4 h-64 overflow-y-auto space-y-3">
                    {chatHistory.length === 0 ? (
                      <p className="text-muted-foreground text-center">Start a conversation with your Jr. agent...</p>
                    ) : (
                      chatHistory.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            {message.confidence && (
                              <p className="text-xs opacity-70 mt-1">
                                Confidence: {Math.round(message.confidence * 100)}%
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask your Jr. agent a question..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && interactWithAgent()}
                    />
                    <Button onClick={interactWithAgent} disabled={!chatMessage.trim()}>
                      Send
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AshenJrTrainingCore;