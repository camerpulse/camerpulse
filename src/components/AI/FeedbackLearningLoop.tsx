import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Brain,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Target,
  Clock,
  Filter
} from 'lucide-react';

interface LearningEntry {
  id: string;
  learning_type: string;
  pattern_identified: string;
  confidence_improvement: number;
  input_data: any;
  validation_score: number;
  created_at: string;
  applied_at?: string;
}

interface NewPattern {
  term: string;
  type: 'slang' | 'political_term' | 'emotion' | 'sarcasm';
  language: 'en' | 'pidgin';
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  context: string;
}

interface LearningStats {
  total_patterns_learned: number;
  new_terms_today: number;
  accuracy_improvement: number;
  pending_review: number;
}

export const FeedbackLearningLoop = () => {
  const [learningEntries, setLearningEntries] = useState<LearningEntry[]>([]);
  const [pendingPatterns, setPendingPatterns] = useState<NewPattern[]>([]);
  const [stats, setStats] = useState<LearningStats>({
    total_patterns_learned: 0,
    new_terms_today: 0,
    accuracy_improvement: 0,
    pending_review: 0
  });
  const [autoApproval, setAutoApproval] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [newPatternForm, setNewPatternForm] = useState<Partial<NewPattern>>({
    type: 'slang',
    language: 'en',
    sentiment: 'neutral',
    confidence: 0.8
  });

  useEffect(() => {
    loadLearningData();
    const interval = setInterval(loadLearningData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadLearningData = async () => {
    try {
      // Load learning logs
      const { data: logs, error: logsError } = await supabase
        .from('camerpulse_intelligence_learning_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      setLearningEntries(logs || []);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayEntries = logs?.filter(log => 
        log.created_at.startsWith(today)
      ) || [];

      const avgConfidence = logs?.reduce((acc, log) => 
        acc + (log.confidence_improvement || 0), 0) / (logs?.length || 1);

      setStats({
        total_patterns_learned: logs?.length || 0,
        new_terms_today: todayEntries.length,
        accuracy_improvement: avgConfidence * 100,
        pending_review: logs?.filter(log => !log.applied_at).length || 0
      });

      // Load learning configuration
      const { data: config } = await supabase
        .from('camerpulse_intelligence_config')
        .select('config_value')
        .eq('config_key', 'learning_feedback_system')
        .single();

      if (config) {
        const learningConfig = config.config_value as any;
        setAutoApproval(learningConfig.auto_learning || true);
        setConfidenceThreshold(learningConfig.confidence_threshold || 0.8);
      }
    } catch (error) {
      console.error('Error loading learning data:', error);
      toast.error('Failed to load learning data');
    }
  };

  const triggerLearningAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('camerpulse-processor', {
        body: {
          action: 'learn_patterns',
          threshold: confidenceThreshold,
          auto_approve: autoApproval
        }
      });

      if (error) throw error;
      
      toast.success('Learning analysis triggered successfully');
      loadLearningData();
    } catch (error) {
      console.error('Error triggering learning:', error);
      toast.error('Failed to trigger learning analysis');
    } finally {
      setLoading(false);
    }
  };

  const approvePattern = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('camerpulse_intelligence_learning_logs')
        .update({ applied_at: new Date().toISOString() })
        .eq('id', entryId);

      if (error) throw error;
      
      toast.success('Pattern approved and applied');
      loadLearningData();
    } catch (error) {
      console.error('Error approving pattern:', error);
      toast.error('Failed to approve pattern');
    }
  };

  const rejectPattern = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('camerpulse_intelligence_learning_logs')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
      
      toast.success('Pattern rejected');
      loadLearningData();
    } catch (error) {
      console.error('Error rejecting pattern:', error);
      toast.error('Failed to reject pattern');
    }
  };

  const addNewPattern = async () => {
    if (!newPatternForm.term || !newPatternForm.context) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('camerpulse-processor', {
        body: {
          action: 'add_pattern',
          pattern: newPatternForm
        }
      });

      if (error) throw error;
      
      toast.success('New pattern added successfully');
      setNewPatternForm({
        type: 'slang',
        language: 'en',
        sentiment: 'neutral',
        confidence: 0.8
      });
      loadLearningData();
    } catch (error) {
      console.error('Error adding pattern:', error);
      toast.error('Failed to add new pattern');
    }
  };

  const updateLearningConfig = async () => {
    try {
      const { error } = await supabase
        .from('camerpulse_intelligence_config')
        .update({
          config_value: {
            auto_learning: autoApproval,
            confidence_threshold: confidenceThreshold,
            feedback_sources: ['user_corrections', 'context_analysis', 'regional_patterns'],
            update_frequency: 'real_time'
          }
        })
        .eq('config_key', 'learning_feedback_system');

      if (error) throw error;
      
      toast.success('Learning configuration updated');
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Failed to update configuration');
    }
  };

  const formatLearningType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'slang_detection': return <MessageSquare className="h-4 w-4" />;
      case 'emotion_learning': return <Brain className="h-4 w-4" />;
      case 'political_figure': return <Target className="h-4 w-4" />;
      case 'sarcasm_detection': return <Eye className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Feedback Learning Loop</h2>
          <p className="text-muted-foreground">
            AI continuously learns from civic language patterns and emotional context
          </p>
        </div>
        <Button 
          onClick={triggerLearningAnalysis}
          disabled={loading}
          variant="default"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Analyze Patterns
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Patterns Learned</p>
                <p className="text-2xl font-bold">{stats.total_patterns_learned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">New Today</p>
                <p className="text-2xl font-bold">{stats.new_terms_today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Accuracy Gain</p>
                <p className="text-2xl font-bold">+{stats.accuracy_improvement.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pending_review}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="learned" className="space-y-4">
        <TabsList>
          <TabsTrigger value="learned">Learned Patterns</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="add">Add Pattern</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        {/* Learned Patterns */}
        <TabsContent value="learned">
          <Card>
            <CardHeader>
              <CardTitle>Successfully Learned Patterns</CardTitle>
              <CardDescription>
                Patterns that have been automatically learned and applied to improve accuracy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {learningEntries
                    .filter(entry => entry.applied_at)
                    .map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getPatternIcon(entry.learning_type)}
                          <Badge variant="secondary">
                            {formatLearningType(entry.learning_type)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Applied
                        </Badge>
                      </div>
                      <p className="font-medium">{entry.pattern_identified}</p>
                      {entry.input_data?.newPattern && (
                        <p className="text-sm text-muted-foreground">
                          Term: "{entry.input_data.newPattern}" 
                          {entry.input_data.language && ` (${entry.input_data.language})`}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Confidence: {((entry.confidence_improvement || 0) * 100).toFixed(1)}%</span>
                        <span>Validation: {((entry.validation_score || 0) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Review */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Patterns Pending Review</CardTitle>
              <CardDescription>
                New patterns detected that require manual approval before applying
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {learningEntries
                    .filter(entry => !entry.applied_at)
                    .map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getPatternIcon(entry.learning_type)}
                          <Badge variant="secondary">
                            {formatLearningType(entry.learning_type)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-orange-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      <p className="font-medium">{entry.pattern_identified}</p>
                      {entry.input_data?.newPattern && (
                        <div className="bg-muted p-2 rounded text-sm">
                          <p><strong>Term:</strong> "{entry.input_data.newPattern}"</p>
                          {entry.input_data.language && (
                            <p><strong>Language:</strong> {entry.input_data.language}</p>
                          )}
                          {entry.input_data.sentiment && (
                            <p><strong>Sentiment:</strong> {entry.input_data.sentiment}</p>
                          )}
                          {entry.input_data.context && (
                            <p><strong>Context:</strong> {entry.input_data.context}</p>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Confidence: {((entry.confidence_improvement || 0) * 100).toFixed(1)}%
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approvePattern(entry.id)}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectPattern(entry.id)}
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {learningEntries.filter(entry => !entry.applied_at).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No patterns pending review</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add New Pattern */}
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Pattern</CardTitle>
              <CardDescription>
                Manually add new language patterns, slang, or terms for the AI to learn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Term/Pattern</label>
                  <Input
                    placeholder="Enter new term or pattern"
                    value={newPatternForm.term || ''}
                    onChange={(e) => setNewPatternForm(prev => ({ ...prev, term: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={newPatternForm.type}
                    onChange={(e) => setNewPatternForm(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="slang">Slang</option>
                    <option value="political_term">Political Term</option>
                    <option value="emotion">Emotion</option>
                    <option value="sarcasm">Sarcasm</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={newPatternForm.language}
                    onChange={(e) => setNewPatternForm(prev => ({ ...prev, language: e.target.value as any }))}
                  >
                    <option value="en">English</option>
                    <option value="pidgin">Pidgin</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Sentiment</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={newPatternForm.sentiment}
                    onChange={(e) => setNewPatternForm(prev => ({ ...prev, sentiment: e.target.value as any }))}
                  >
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Context/Usage Example</label>
                <Textarea
                  placeholder="Provide context or example usage"
                  value={newPatternForm.context || ''}
                  onChange={(e) => setNewPatternForm(prev => ({ ...prev, context: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Confidence (0.0 - 1.0)</label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={newPatternForm.confidence}
                  onChange={(e) => setNewPatternForm(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                />
              </div>
              <Button onClick={addNewPattern} className="w-full">
                Add Pattern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Learning Configuration</CardTitle>
              <CardDescription>
                Configure how the AI learns and adapts to new patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-approval</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically apply high-confidence patterns without manual review
                  </p>
                </div>
                <Switch
                  checked={autoApproval}
                  onCheckedChange={setAutoApproval}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Confidence Threshold</label>
                <p className="text-sm text-muted-foreground mb-2">
                  Minimum confidence required for auto-approval (0.0 - 1.0)
                </p>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                />
              </div>

              <div>
                <h4 className="font-medium mb-2">Learning Sources</h4>
                <div className="space-y-2 text-sm">
                  <p>✓ User corrections and feedback</p>
                  <p>✓ Context analysis from conversations</p>
                  <p>✓ Regional sentiment patterns</p>
                  <p>✓ Trending hashtags and mentions</p>
                  <p>✓ Political figure detection</p>
                </div>
              </div>

              <Button onClick={updateLearningConfig} className="w-full">
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};