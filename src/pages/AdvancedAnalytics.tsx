import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Brain, TrendingUp, Zap, Activity, AlertTriangle, 
  CheckCircle, Clock, Target 
} from 'lucide-react';

interface AIInsight {
  type: string;
  data: any;
  generated_at: string;
}

interface PerformanceMetric {
  id: string;
  metric_type: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  recorded_at: string;
}

interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  priority: string;
  impact_score: number;
  implementation_effort: string;
  status: string;
}

const AdvancedAnalytics: React.FC = () => {
  const { toast } = useToast();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock AI insights for demo
      const mockInsights = [
        {
          type: 'sentiment_analysis',
          data: {
            positive_trend: 45,
            negative_trend: 20,
            neutral_trend: 35,
            avg_sentiment: 0.65
          },
          generated_at: new Date().toISOString()
        },
        {
          type: 'civic_trends',
          data: {
            total_complaints: 127,
            urgent_complaints: 23,
            trending_issues: ['infrastructure', 'healthcare', 'education']
          },
          generated_at: new Date().toISOString()
        }
      ];
      setInsights(mockInsights);

      // Mock performance metrics
      const mockMetrics = Array.from({ length: 20 }, (_, i) => ({
        id: `metric-${i}`,
        metric_type: ['page_load', 'api_response', 'database_query'][i % 3],
        metric_name: `Sample Metric ${i + 1}`,
        metric_value: Math.random() * 1000 + 100,
        metric_unit: 'ms',
        recorded_at: new Date(Date.now() - i * 3600000).toISOString()
      }));
      setPerformanceMetrics(mockMetrics);

      // Mock recommendations
      const mockRecommendations = [
        {
          id: '1',
          title: 'Optimize Database Queries',
          description: 'Several queries are taking longer than 500ms. Consider adding indexes.',
          priority: 'high',
          impact_score: 8,
          implementation_effort: 'medium',
          status: 'pending'
        },
        {
          id: '2',
          title: 'Improve Mobile Responsiveness',
          description: 'Some components are not fully responsive on mobile devices.',
          priority: 'medium',
          impact_score: 6,
          implementation_effort: 'low',
          status: 'in_progress'
        }
      ];
      setRecommendations(mockRecommendations);

    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    try {
      // Mock AI insight generation for demo
      const newInsight = {
        type: 'real_time_analysis',
        data: {
          active_users: Math.floor(Math.random() * 1000) + 500,
          engagement_rate: (Math.random() * 0.3 + 0.7).toFixed(2),
          performance_score: Math.floor(Math.random() * 20) + 80,
          trend_direction: Math.random() > 0.5 ? 'upward' : 'stable'
        },
        generated_at: new Date().toISOString()
      };

      setInsights(prev => [newInsight, ...prev.slice(0, 4)]);
      
      toast({
        title: "Success",
        description: "AI insights generated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate AI insights",
        variant: "destructive"
      });
    }
  };

  const trackPerformanceMetric = (type: string, name: string, value: number, unit: string) => {
    // Mock performance tracking for demo
    const newMetric = {
      id: `metric-${Date.now()}`,
      metric_type: type,
      metric_name: name,
      metric_value: value,
      metric_unit: unit,
      recorded_at: new Date().toISOString()
    };

    setPerformanceMetrics(prev => [newMetric, ...prev.slice(0, 19)]);
    
    toast({
      title: "Metric Tracked",
      description: `${name}: ${value}${unit}`
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-orange-600';
      case 'dismissed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  // Sample performance data for charts
  const performanceChartData = performanceMetrics
    .filter(m => m.metric_type === 'page_load')
    .slice(0, 10)
    .map(m => ({
      name: new Date(m.recorded_at).toLocaleTimeString(),
      value: m.metric_value
    }));

  const metricTypeData = performanceMetrics
    .reduce((acc, metric) => {
      const type = metric.metric_type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(metricTypeData).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Advanced Analytics & AI Insights</h1>
            <p className="text-muted-foreground">Comprehensive platform analytics with AI-powered insights</p>
          </div>
          <Button onClick={generateAIInsights} className="gap-2">
            <Brain className="h-4 w-4" />
            Generate AI Insights
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Total Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.length}</div>
              <p className="text-xs text-muted-foreground">Performance data points</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.length}</div>
              <p className="text-xs text-muted-foreground">Generated insights</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recommendations.length}</div>
              <p className="text-xs text-muted-foreground">Optimization suggestions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="api-health">API Health</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insights.map((insight, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      {insight.type.replace('_', ' ').toUpperCase()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {insight.data && (
                      <div className="space-y-2">
                        {Object.entries(insight.data).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              {key.replace('_', ' ')}:
                            </span>
                            <span className="text-sm font-medium">
                              {typeof value === 'number' ? value.toFixed(2) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <Badge variant="outline">
                      Generated: {new Date(insight.generated_at).toLocaleString()}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Page Load Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Metric Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {performanceMetrics.slice(0, 10).map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <div className="font-medium">{metric.metric_name}</div>
                        <div className="text-sm text-muted-foreground">{metric.metric_type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{metric.metric_value} {metric.metric_unit}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(metric.recorded_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Card key={rec.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(rec.priority)}`}></div>
                          {rec.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(rec.status)}>
                        {rec.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Impact Score</div>
                        <div className="flex items-center gap-2">
                          <Progress value={rec.impact_score * 10} className="flex-1" />
                          <span className="text-sm font-medium">{rec.impact_score}/10</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Priority</div>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Implementation Effort</div>
                        <Badge variant="outline">{rec.implementation_effort}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api-health" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    OpenAI GPT
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className="bg-green-500">Healthy</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Response Time:</span>
                      <span>120ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span>99.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Twitter Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className="bg-yellow-500">Degraded</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Response Time:</span>
                      <span>850ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span>94.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Slack Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className="bg-green-500">Healthy</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Response Time:</span>
                      <span>89ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span>99.9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;