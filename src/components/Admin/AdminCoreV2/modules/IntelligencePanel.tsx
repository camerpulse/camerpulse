import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, Brain, Activity, TrendingUp, AlertTriangle, Eye, 
  Radio, Target, Zap, Shield, Globe, Users, Clock,
  BarChart3, PieChart, MapPin, Flame, Download
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface IntelligencePanelProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

interface SentimentData {
  emotion: string;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  region?: string;
}

interface ThreatAlert {
  id: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  region: string;
}

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Real-time sentiment data
  const { data: sentimentData, refetch: refetchSentiment } = useQuery({
    queryKey: ['intelligence_sentiment'],
    queryFn: async (): Promise<SentimentData[]> => {
      // Simulate real-time sentiment data
      return [
        { emotion: 'Positive', percentage: 35, trend: 'up', region: 'Centre' },
        { emotion: 'Neutral', percentage: 42, trend: 'stable', region: 'Centre' },
        { emotion: 'Negative', percentage: 18, trend: 'down', region: 'Centre' },
        { emotion: 'Angry', percentage: 5, trend: 'up', region: 'Centre' }
      ];
    },
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  });

  // Threat level tracking
  const { data: threatAlerts } = useQuery({
    queryKey: ['intelligence_threats'],
    queryFn: async (): Promise<ThreatAlert[]> => {
      return [
        {
          id: '1',
          level: 'medium',
          message: 'Increased political tension detected in Northwest region',
          timestamp: new Date().toISOString(),
          region: 'Northwest'
        },
        {
          id: '2', 
          level: 'low',
          message: 'Social media sentiment shift in Douala',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          region: 'Littoral'
        }
      ];
    },
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  });

  // Trending topics
  const { data: trendingTopics } = useQuery({
    queryKey: ['intelligence_trending'],
    queryFn: async () => {
      return [
        { topic: 'Electricity Crisis', mentions: 2450, sentiment: 'negative' },
        { topic: 'Road Infrastructure', mentions: 1890, sentiment: 'mixed' },
        { topic: 'Education Reform', mentions: 1654, sentiment: 'positive' },
        { topic: 'Healthcare Access', mentions: 1203, sentiment: 'concerned' }
      ];
    },
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  });

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'angry': return 'text-red-700';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const exportReport = () => {
    logActivity('intelligence_report_export', { timestamp: new Date().toISOString() });
    // Implementation for PDF/PNG export would go here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Bot className="h-6 w-6 mr-2 text-purple-500" />
            CamerPulse Intelligence Core
          </h2>
          <p className="text-muted-foreground">Real-time civic intelligence monitoring and threat assessment</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Auto-refresh</span>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>
          <Button onClick={exportReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Real-time Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className="text-2xl font-bold text-green-600">Online</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Live monitoring active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Threat Level</p>
                <p className="text-2xl font-bold text-yellow-600">Medium</p>
              </div>
              <Shield className="h-8 w-8 text-yellow-600" />
            </div>
            <Progress value={45} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Regions</p>
                <p className="text-2xl font-bold">8/10</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Northwest, Southwest monitoring</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Points</p>
                <p className="text-2xl font-bold">12.4K</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-green-600 mt-2">+15% from last hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Sentiment Stream */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-indigo-600" />
              Regional Sentiment Radar
            </CardTitle>
            <CardDescription>Live emotion analysis by region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentimentData?.map((sentiment, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getSentimentColor(sentiment.emotion)}`}></div>
                    <span className="font-medium">{sentiment.emotion}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{sentiment.percentage}%</span>
                    <TrendingUp className={`h-4 w-4 ${sentiment.trend === 'up' ? 'text-green-600' : sentiment.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Threat Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Threat Level Tracker
            </CardTitle>
            <CardDescription>Real-time security and stability alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {threatAlerts?.map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className={getThreatColor(alert.level)}>{alert.level.toUpperCase()}</Badge>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.region} • {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trending Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flame className="h-5 w-5 mr-2 text-orange-600" />
              Trending Topics
            </CardTitle>
            <CardDescription>Most discussed civic topics right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trendingTopics?.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{topic.topic}</p>
                    <p className="text-sm text-muted-foreground">{topic.mentions.toLocaleString()} mentions</p>
                  </div>
                  <Badge variant={topic.sentiment === 'positive' ? 'default' : topic.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                    {topic.sentiment}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Influencer Impact Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Influencer Impact
            </CardTitle>
            <CardDescription>Key opinion leader monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Political Leaders</p>
                    <p className="text-sm text-muted-foreground">15 active voices</p>
                  </div>
                  <Badge>High Impact</Badge>
                </div>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Civil Society</p>
                    <p className="text-sm text-muted-foreground">8 organizations</p>
                  </div>
                  <Badge variant="secondary">Moderate Impact</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Intelligence Quick Actions</CardTitle>
          <CardDescription>Rapid response and analysis tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Target className="h-6 w-6 mb-2 text-purple-600" />
              <span>Fact Check</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Eye className="h-6 w-6 mb-2 text-blue-600" />
              <span>Deep Scan</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Radio className="h-6 w-6 mb-2 text-green-600" />
              <span>Broadcast Alert</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <PieChart className="h-6 w-6 mb-2 text-orange-600" />
              <span>Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};