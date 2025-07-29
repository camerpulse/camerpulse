import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain, Activity, TrendingUp, MapPin, AlertTriangle,
  Bot, Eye, Zap, Settings, MessageSquare, Globe,
  BarChart3, Users, Clock, Target
} from 'lucide-react';
import { ResponsiveChart } from './ResponsiveChart';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IntelligenceConfig {
  real_time_monitoring: boolean;
  threat_detection: boolean;
  sentiment_analysis: boolean;
  auto_poll_generation: boolean;
  civic_alerts: boolean;
  geo_tracking: boolean;
}

interface TrendData {
  topic: string;
  sentiment_score: number;
  engagement: number;
  regions: string[];
  timestamp: string;
}

interface ThreatAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_regions: string[];
  created_at: string;
}

export const CamerPulseIntelligencePanel: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<IntelligenceConfig>({
    real_time_monitoring: true,
    threat_detection: true,
    sentiment_analysis: true,
    auto_poll_generation: false,
    civic_alerts: true,
    geo_tracking: true,
  });

  // Fetch intelligence configuration
  const { data: intelligenceConfig } = useQuery({
    queryKey: ['intelligence_config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_generation_schedule')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Fetch real-time trends
  const { data: trends } = useQuery({
    queryKey: ['civic_trends'],
    queryFn: async (): Promise<TrendData[]> => {
      // Mock data for demonstration
      return [
        {
          topic: 'Infrastructure Development',
          sentiment_score: 0.7,
          engagement: 85,
          regions: ['Centre', 'Littoral', 'West'],
          timestamp: new Date().toISOString(),
        },
        {
          topic: 'Healthcare Reform',
          sentiment_score: 0.6,
          engagement: 92,
          regions: ['Far North', 'North', 'Adamawa'],
          timestamp: new Date().toISOString(),
        },
        {
          topic: 'Education Policy',
          sentiment_score: 0.4,
          engagement: 76,
          regions: ['Northwest', 'Southwest'],
          timestamp: new Date().toISOString(),
        },
        {
          topic: 'Economic Growth',
          sentiment_score: 0.8,
          engagement: 68,
          regions: ['East', 'South'],
          timestamp: new Date().toISOString(),
        },
      ];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mock threat alerts
  const threats: ThreatAlert[] = [
    {
      id: '1',
      type: 'Social Unrest',
      severity: 'high',
      description: 'Increased negative sentiment detected in Northwest region',
      affected_regions: ['Northwest'],
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'Misinformation',
      severity: 'medium',
      description: 'False claims spreading on social media platforms',
      affected_regions: ['Centre', 'Littoral'],
      created_at: new Date().toISOString(),
    },
  ];

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<IntelligenceConfig>) => {
      const { error } = await supabase
        .from('ai_generation_schedule')
        .update({
          generation_rules: newConfig,
          updated_at: new Date().toISOString(),
        })
        .eq('id', intelligenceConfig?.id || '');
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Intelligence configuration updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['intelligence_config'] });
    },
    onError: () => {
      toast({ title: 'Error updating configuration', variant: 'destructive' });
    },
  });

  const handleConfigChange = (key: keyof IntelligenceConfig, value: boolean) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    updateConfigMutation.mutate(newConfig);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            CamerPulse Intelligence Panel
          </h1>
          <p className="text-muted-foreground">
            Real-time civic intelligence, sentiment analysis, and threat detection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-600 text-white">
            <Activity className="h-3 w-3 mr-1" />
            Live Monitoring
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Sentiment
          </TabsTrigger>
          <TabsTrigger value="threats" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Threats
          </TabsTrigger>
          <TabsTrigger value="ai-tools" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Tools
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Config
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {trends?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Real-time civic topics
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {trends ? (trends.reduce((acc, t) => acc + t.sentiment_score, 0) / trends.length * 100).toFixed(0) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Positive sentiment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  Medium
                </div>
                <p className="text-xs text-muted-foreground">
                  {threats.length} active alerts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  12
                </div>
                <p className="text-xs text-muted-foreground">
                  Polls this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Regional Sentiment Map */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Sentiment Analysis</CardTitle>
              <CardDescription>
                Real-time sentiment scores across Cameroon's 10 regions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveChart
                type="bar"
                data={[
                  { name: 'Centre', value: 78 },
                  { name: 'Littoral', value: 85 },
                  { name: 'West', value: 72 },
                  { name: 'Northwest', value: 45 },
                  { name: 'Southwest', value: 52 },
                  { name: 'North', value: 68 },
                  { name: 'Far North', value: 61 },
                  { name: 'East', value: 74 },
                  { name: 'South', value: 69 },
                  { name: 'Adamawa', value: 65 }
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sentiment Analysis Tab */}
        <TabsContent value="sentiment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trending Civic Topics</CardTitle>
                <CardDescription>
                  Current topics with highest engagement and sentiment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {trends?.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <h4 className="font-medium">{trend.topic}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className={`text-sm font-medium ${getSentimentColor(trend.sentiment_score)}`}>
                          {(trend.sentiment_score * 100).toFixed(0)}% positive
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {trend.engagement}% engagement
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {trend.regions.map((region) => (
                          <Badge key={region} variant="secondary" className="text-xs">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Progress value={trend.sentiment_score * 100} className="w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Timeline</CardTitle>
                <CardDescription>
                  Sentiment changes over the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveChart
                  type="line"
                  data={[
                    { name: '00:00', users: 65, polls: 0, posts: 0 },
                    { name: '04:00', users: 58, polls: 0, posts: 0 },
                    { name: '08:00', users: 72, polls: 0, posts: 0 },
                    { name: '12:00', users: 68, polls: 0, posts: 0 },
                    { name: '16:00', users: 75, polls: 0, posts: 0 },
                    { name: '20:00', users: 71, polls: 0, posts: 0 },
                    { name: '24:00', users: 69, polls: 0, posts: 0 }
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Threat Detection Tab */}
        <TabsContent value="threats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Threat Alerts</CardTitle>
              <CardDescription>
                Real-time monitoring of potential civic threats and concerns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {threats.map((threat) => (
                <Alert key={threat.id} className="border-l-4 border-l-orange-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(threat.severity)}>
                            {threat.severity.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{threat.type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {threat.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {threat.affected_regions.map((region) => (
                            <Badge key={region} variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {region}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(threat.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tools Tab */}
        <TabsContent value="ai-tools" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Poll Generator</CardTitle>
                <CardDescription>
                  Autonomous poll creation based on trending topics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-polls">Enable Auto Generation</Label>
                  <Switch
                    id="auto-polls"
                    checked={config.auto_poll_generation}
                    onCheckedChange={(checked) => handleConfigChange('auto_poll_generation', checked)}
                  />
                </div>
                <Button className="w-full">
                  <Bot className="h-4 w-4 mr-2" />
                  Generate Poll Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Civic Intelligence Engine</CardTitle>
                <CardDescription>
                  Advanced AI analysis and prediction tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                  <Button variant="outline" size="sm">
                    <Target className="h-4 w-4 mr-2" />
                    Predict
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Monitor
                  </Button>
                  <Button variant="outline" size="sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Intelligence Configuration</CardTitle>
              <CardDescription>
                Configure AI monitoring, alerts, and analysis settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="real-time">Real-time Monitoring</Label>
                    <Switch
                      id="real-time"
                      checked={config.real_time_monitoring}
                      onCheckedChange={(checked) => handleConfigChange('real_time_monitoring', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="threat-detection">Threat Detection</Label>
                    <Switch
                      id="threat-detection"
                      checked={config.threat_detection}
                      onCheckedChange={(checked) => handleConfigChange('threat_detection', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sentiment">Sentiment Analysis</Label>
                    <Switch
                      id="sentiment"
                      checked={config.sentiment_analysis}
                      onCheckedChange={(checked) => handleConfigChange('sentiment_analysis', checked)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="civic-alerts">Civic Alerts</Label>
                    <Switch
                      id="civic-alerts"
                      checked={config.civic_alerts}
                      onCheckedChange={(checked) => handleConfigChange('civic_alerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="geo-tracking">Geo Tracking</Label>
                    <Switch
                      id="geo-tracking"
                      checked={config.geo_tracking}
                      onCheckedChange={(checked) => handleConfigChange('geo_tracking', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-polls">Auto Poll Generation</Label>
                    <Switch
                      id="auto-polls"
                      checked={config.auto_poll_generation}
                      onCheckedChange={(checked) => handleConfigChange('auto_poll_generation', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};