import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Eye, Lightbulb, BookOpen, Target, Zap, BarChart3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LearningInsight {
  id: string;
  insight_type: string;
  pattern_name: string;
  pattern_description: string;
  confidence_score: number;
  usage_frequency: number;
  success_rate: number;
  learned_rules: any;
  applicable_contexts: any;
  created_at: string;
  updated_at: string;
  last_applied?: string;
  is_active: boolean;
}

interface LearningStats {
  total_patterns: number;
  high_confidence_patterns: number;
  avg_confidence: number;
  last_training: string;
}

const insightTypeIcons = {
  coding_style: BookOpen,
  ui_pattern: Eye,
  fix_strategy: Target,
  component_structure: Brain
};

const insightTypeColors = {
  coding_style: 'bg-blue-500/10 text-blue-700 border-blue-200',
  ui_pattern: 'bg-purple-500/10 text-purple-700 border-purple-200',
  fix_strategy: 'bg-green-500/10 text-green-700 border-green-200',
  component_structure: 'bg-orange-500/10 text-orange-700 border-orange-200'
};

export function LearningEngine() {
  const [learningEnabled, setLearningEnabled] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedInsightType, setSelectedInsightType] = useState<string>('all');

  const { data: insights, isLoading: insightsLoading, refetch: refetchInsights } = useQuery({
    queryKey: ['learning-insights', selectedInsightType],
    queryFn: async () => {
      let query = supabase
        .from('ashen_learning_insights')
        .select('*')
        .eq('is_active', true)
        .order('confidence_score', { ascending: false });

      if (selectedInsightType !== 'all') {
        query = query.eq('insight_type', selectedInsightType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching learning insights:', error);
        throw error;
      }

      return data as LearningInsight[];
    },
  });

  const { data: learningConfig, isLoading: configLoading } = useQuery({
    queryKey: ['learning-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ashen_monitoring_config')
        .select('config_key, config_value')
        .in('config_key', [
          'learning_engine_enabled',
          'learning_confidence_threshold',
          'learning_last_training_run'
        ]);

      if (error) throw error;

      return data.reduce((acc, item) => {
        acc[item.config_key] = item.config_value;
        return acc;
      }, {} as Record<string, any>);
    },
  });

  useEffect(() => {
    if (learningConfig) {
      setLearningEnabled(learningConfig.learning_engine_enabled === 'true');
    }
  }, [learningConfig]);

  const toggleLearning = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('ashen_monitoring_config')
        .update({ config_value: enabled.toString() })
        .eq('config_key', 'learning_engine_enabled');

      if (error) throw error;

      setLearningEnabled(enabled);
      toast({
        title: "Learning Mode Updated",
        description: `Learning engine ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error updating learning config:', error);
      toast({
        title: "Error",
        description: "Failed to update learning configuration",
        variant: "destructive",
      });
    }
  };

  const runTraining = async () => {
    setIsTraining(true);
    try {
      const { data, error } = await supabase.functions.invoke('ashen-learning-engine', {
        body: { action: 'train' }
      });

      if (error) throw error;

      toast({
        title: "Training Complete",
        description: `Learned ${data.patterns_learned} new patterns from ${data.training_data_points} data points`,
      });

      refetchInsights();
    } catch (error) {
      console.error('Error running training:', error);
      toast({
        title: "Training Failed",
        description: "Failed to run learning engine training",
        variant: "destructive",
      });
    } finally {
      setIsTraining(false);
    }
  };

  const getInsightTypeIcon = (type: string) => {
    const IconComponent = insightTypeIcons[type as keyof typeof insightTypeIcons] || Brain;
    return <IconComponent className="h-4 w-4" />;
  };

  const calculateStats = (): LearningStats => {
    if (!insights) {
      return {
        total_patterns: 0,
        high_confidence_patterns: 0,
        avg_confidence: 0,
        last_training: 'Never'
      };
    }

    const highConfidence = insights.filter(i => i.confidence_score > 0.8).length;
    const avgConfidence = insights.reduce((sum, i) => sum + i.confidence_score, 0) / insights.length;
    const lastTraining = learningConfig?.learning_last_training_run !== 'null' 
      ? new Date(learningConfig.learning_last_training_run.replace(/"/g, '')).toLocaleDateString()
      : 'Never';

    return {
      total_patterns: insights.length,
      high_confidence_patterns: highConfidence,
      avg_confidence: avgConfidence * 100,
      last_training: lastTraining
    };
  };

  const stats = calculateStats();

  if (insightsLoading || configLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Learning Engine...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Learning Engine
              </CardTitle>
              <CardDescription>
                AI-powered pattern recognition from successful fixes and admin feedback
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Learning Mode</span>
                <Switch
                  checked={learningEnabled}
                  onCheckedChange={toggleLearning}
                />
              </div>
              <Button 
                onClick={runTraining} 
                disabled={isTraining || !learningEnabled}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                {isTraining ? 'Training...' : 'Train Model'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Learning Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total_patterns}</div>
              <div className="text-sm text-muted-foreground">Total Patterns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.high_confidence_patterns}</div>
              <div className="text-sm text-muted-foreground">High Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(stats.avg_confidence)}%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{stats.last_training}</div>
              <div className="text-sm text-muted-foreground">Last Training</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs value={selectedInsightType} onValueChange={setSelectedInsightType} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Patterns</TabsTrigger>
              <TabsTrigger value="coding_style">Coding Style</TabsTrigger>
              <TabsTrigger value="ui_pattern">UI Patterns</TabsTrigger>
              <TabsTrigger value="fix_strategy">Fix Strategy</TabsTrigger>
              <TabsTrigger value="component_structure">Components</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedInsightType} className="space-y-4">
              {insights && insights.length > 0 ? (
                insights.map((insight) => (
                  <Card key={insight.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getInsightTypeIcon(insight.insight_type)}
                          <div>
                            <CardTitle className="text-lg">{insight.pattern_name}</CardTitle>
                            <CardDescription>{insight.pattern_description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={insightTypeColors[insight.insight_type as keyof typeof insightTypeColors]}>
                            {insight.insight_type.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(insight.confidence_score * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Confidence Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Confidence Score</span>
                          <span>{Math.round(insight.confidence_score * 100)}%</span>
                        </div>
                        <Progress value={insight.confidence_score * 100} className="h-2" />
                      </div>

                      {/* Success Metrics */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Usage Frequency: </span>
                          <span className="font-medium">{insight.usage_frequency} times</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Success Rate: </span>
                          <span className="font-medium">{Math.round(insight.success_rate * 100)}%</span>
                        </div>
                      </div>

                      {/* Learned Rules Preview */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4" />
                          <span className="text-sm font-medium">Learned Rules</span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {Object.entries(insight.learned_rules || {}).slice(0, 3).map(([key, value]) => (
                            <div key={key}>
                              <strong>{key.replace('_', ' ')}:</strong> {
                                Array.isArray(value) 
                                  ? value.slice(0, 2).join(', ') + (value.length > 2 ? '...' : '')
                                  : typeof value === 'string' 
                                    ? value.slice(0, 50) + (value.length > 50 ? '...' : '')
                                    : JSON.stringify(value)
                              }
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Last updated: {new Date(insight.updated_at).toLocaleDateString()} at{' '}
                        {new Date(insight.updated_at).toLocaleTimeString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Learning Patterns Found</h3>
                    <p className="text-muted-foreground mb-4">
                      The learning engine needs admin feedback on fixes to build intelligence patterns.
                    </p>
                    <Button onClick={runTraining} disabled={isTraining || !learningEnabled}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Start Learning from History
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}