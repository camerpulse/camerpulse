import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Activity,
  AlertTriangle,
  Eye,
  Download,
  Settings,
  RefreshCw,
  Globe,
  Heart,
  Target,
  Zap
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const keyMetrics = [
    {
      title: 'Total Civic Engagement',
      value: '68.5%',
      change: '+12.3%',
      trend: 'up',
      icon: Users,
      description: 'Overall participation rate across all civic activities'
    },
    {
      title: 'Active Users',
      value: '847',
      change: '+23.1%',
      trend: 'up',
      icon: Activity,
      description: 'Users who participated in the last 30 days'
    },
    {
      title: 'Poll Completion Rate',
      value: '73.2%',
      change: '+5.7%',
      trend: 'up',
      icon: Target,
      description: 'Percentage of polls completed by participants'
    },
    {
      title: 'Education Engagement',
      value: '42.3%',
      change: '-2.1%',
      trend: 'down',
      icon: Brain,
      description: 'Civic education content completion rate'
    }
  ];

  const aiInsights = [
    {
      id: 1,
      type: 'trend_analysis',
      title: 'Rising Civic Engagement in Urban Areas',
      description: 'Analysis shows a 23% increase in civic participation among urban youth over the past 3 months.',
      confidence: 85.5,
      priority: 'high',
      recommendations: [
        'Increase targeted campaigns in rural areas',
        'Expand youth-focused civic programs',
        'Develop mobile-first engagement tools'
      ]
    },
    {
      id: 2,
      type: 'anomaly_detection',
      title: 'Unusual Polling Pattern Detected',
      description: 'Detected anomalous voting patterns in Centre Region that deviate from historical norms.',
      confidence: 92.3,
      priority: 'critical',
      recommendations: [
        'Investigate poll security measures',
        'Review participant verification',
        'Conduct additional validation'
      ]
    },
    {
      id: 3,
      type: 'recommendation',
      title: 'Optimize Educational Content Timing',
      description: 'Educational content performs 34% better when published on weekday mornings.',
      confidence: 78.9,
      priority: 'medium',
      recommendations: [
        'Schedule content for weekday mornings',
        'Create morning digest newsletters',
        'Adjust notification timing'
      ]
    }
  ];

  const sentimentData = [
    {
      topic: 'Healthcare Reform',
      positive: 65,
      negative: 20,
      neutral: 15,
      trend: 'positive',
      mentions: 245
    },
    {
      topic: 'Education Budget',
      positive: 45,
      negative: 35,
      neutral: 20,
      trend: 'negative',
      mentions: 189
    },
    {
      topic: 'Infrastructure Development',
      positive: 58,
      negative: 25,
      neutral: 17,
      trend: 'positive',
      mentions: 156
    }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend_analysis': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'anomaly_detection': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'recommendation': return <Brain className="w-5 h-5 text-purple-500" />;
      default: return <Eye className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 hover:bg-red-600';
      case 'high': return 'bg-orange-500 hover:bg-orange-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-xl text-muted-foreground">
              AI-powered insights and real-time civic engagement analytics
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyMetrics.map((metric, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <metric.icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant={metric.trend === 'up' ? 'default' : 'destructive'}>
                    {metric.change}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm font-medium">{metric.title}</div>
                  <div className="text-xs text-muted-foreground">{metric.description}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="w-fit">
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="realtime">Real-time Data</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {aiInsights.map((insight) => (
                <Card key={insight.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getInsightIcon(insight.type)}
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getPriorityColor(insight.priority)}>
                              {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)}
                            </Badge>
                            <Badge variant="outline">
                              {insight.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{insight.description}</p>
                    
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Confidence Score</div>
                      <Progress value={insight.confidence} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-medium">Recommendations:</div>
                      <div className="space-y-2">
                        {insight.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Zap className="w-4 h-4 mr-2" />
                        Take Action
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-500" />
                    Public Sentiment Overview
                  </CardTitle>
                  <CardDescription>
                    Real-time sentiment analysis across key civic topics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {sentimentData.map((item, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{item.topic}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.mentions} mentions
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Positive: {item.positive}%</span>
                            <span>Negative: {item.negative}%</span>
                            <span>Neutral: {item.neutral}%</span>
                          </div>
                          
                          <div className="w-full bg-muted rounded-full h-3 flex overflow-hidden">
                            <div 
                              className="bg-green-500 h-full"
                              style={{ width: `${item.positive}%` }}
                            />
                            <div 
                              className="bg-red-500 h-full"
                              style={{ width: `${item.negative}%` }}
                            />
                            <div 
                              className="bg-gray-400 h-full"
                              style={{ width: `${item.neutral}%` }}
                            />
                          </div>
                        </div>

                        <Badge variant={item.trend === 'positive' ? 'default' : 'destructive'}>
                          {item.trend === 'positive' ? '↗ Improving' : '↘ Declining'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Trends</CardTitle>
                  <CardDescription>
                    Track sentiment changes over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Interactive sentiment trend chart would appear here</p>
                      <p className="text-sm mt-2">Real-time visualization of sentiment changes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-500" />
                  Predictive Analytics
                </CardTitle>
                <CardDescription>
                  AI-powered predictions for civic engagement trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">Next 30 Days</div>
                    <div className="text-2xl font-bold">73.2%</div>
                    <div className="text-sm">Predicted civic participation rate</div>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      +5.4% increase
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">Election Turnout</div>
                    <div className="text-2xl font-bold">68.7%</div>
                    <div className="text-sm">Forecasted voter turnout</div>
                    <Badge variant="outline">
                      82% confidence
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">Education Engagement</div>
                    <div className="text-2xl font-bold">45.1%</div>
                    <div className="text-sm">Learning completion rate</div>
                    <Badge className="bg-blue-500 hover:bg-blue-600">
                      +2.8% growth
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium mb-2">Key Prediction Factors:</div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>• Historical engagement patterns</div>
                    <div>• Seasonal variations</div>
                    <div>• Demographic trends</div>
                    <div>• Political event impact</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-500" />
                    Live Activity Feed
                  </CardTitle>
                  <CardDescription>
                    Real-time civic engagement activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'New poll response', user: 'Anonymous', location: 'Douala', time: '2 min ago' },
                      { action: 'Course completed', user: 'Jean M.', location: 'Yaoundé', time: '5 min ago' },
                      { action: 'Performance rating', user: 'Marie K.', location: 'Bamenda', time: '8 min ago' },
                      { action: 'Comment added', user: 'Paul N.', location: 'Bafoussam', time: '12 min ago' },
                      { action: 'Quiz completed', user: 'Sarah T.', location: 'Garoua', time: '15 min ago' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <div>
                            <div className="text-sm font-medium">{activity.action}</div>
                            <div className="text-xs text-muted-foreground">
                              {activity.user} • {activity.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">{activity.time}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-blue-500" />
                    Geographic Activity
                  </CardTitle>
                  <CardDescription>
                    Regional engagement distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { region: 'Centre', activity: 89, percentage: 23 },
                      { region: 'Littoral', activity: 76, percentage: 20 },
                      { region: 'West', activity: 65, percentage: 17 },
                      { region: 'Northwest', activity: 54, percentage: 14 },
                      { region: 'Southwest', activity: 43, percentage: 11 }
                    ].map((region, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{region.region}</span>
                          <span className="text-muted-foreground">
                            {region.activity} activities ({region.percentage}%)
                          </span>
                        </div>
                        <Progress value={region.percentage * 4} className="h-2" />
                      </div>
                    ))}
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

export default AnalyticsDashboard;