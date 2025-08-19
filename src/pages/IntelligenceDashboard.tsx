import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Bot, Brain, Activity, TrendingUp, AlertTriangle, Eye, 
  Radio, Target, Zap, Shield, Globe, Users, Clock,
  BarChart3, PieChart, MapPin, Flame, Download, Search,
  Menu, Settings, ChevronDown, RefreshCw, Filter
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CivicLayout, AnalyticsChart, ActionBanner, TabSwitcher, LoadMoreButton, NoContent } from '@/components/camerpulse';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';

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

interface TrendingTopic {
  topic: string;
  mentions: number;
  sentiment: 'positive' | 'negative' | 'mixed' | 'concerned';
}

interface RegionalData {
  region: string;
  status: 'active' | 'monitoring' | 'offline';
  sentiment: number;
  threats: number;
}

const IntelligenceSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  
  const navItems = [
    { title: 'Live Feed', icon: Activity, url: '#feed' },
    { title: 'Sentiment Map', icon: MapPin, url: '#map' },
    { title: 'Threat Board', icon: Shield, url: '#threats' },
    { title: 'Analytics', icon: BarChart3, url: '#analytics' },
    { title: 'Reports', icon: Download, url: '#reports' },
    { title: 'Settings', icon: Settings, url: '#settings' }
  ];

  const quickToggles = [
    { label: 'Auto Refresh', key: 'autoRefresh', defaultValue: true },
    { label: 'Sound Alerts', key: 'soundAlerts', defaultValue: true },
    { label: 'Sound Alerts', key: 'soundAlerts', defaultValue: true },
    { label: 'Mobile View', key: 'mobileView', defaultValue: false }
  ];

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent className="bg-white border-r border-gray-200">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-red-600 uppercase tracking-wide">
            Intelligence Core
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-gray-50 transition-colors">
                      <item.icon className="h-5 w-5 text-gray-600" />
                      {!collapsed && <span className="font-medium text-gray-900">{item.title}</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm font-semibold text-green-600 uppercase tracking-wide">
              Quick Controls
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-3 px-3">
                {quickToggles.map((toggle) => (
                  <div key={toggle.key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{toggle.label}</span>
                    <Switch defaultChecked={toggle.defaultValue} />
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Admin Actions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2 px-3">
                <Button variant="outline" size="sm" className="w-full justify-start rounded-2xl">
                  <Target className="h-4 w-4 mr-2" />
                  Emergency Alert
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start rounded-2xl">
                  <Eye className="h-4 w-4 mr-2" />
                  Deep Scan
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start rounded-2xl">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

const IntelligenceDashboard = () => {
  const { toast } = useToast();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time sentiment data
  const { data: sentimentData, refetch: refetchSentiment } = useQuery({
    queryKey: ['intelligence_sentiment'],
    queryFn: async (): Promise<SentimentData[]> => {
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
    queryFn: async (): Promise<TrendingTopic[]> => {
      return [
        { topic: 'Electricity Crisis', mentions: 2450, sentiment: 'negative' },
        { topic: 'Road Infrastructure', mentions: 1890, sentiment: 'mixed' },
        { topic: 'Education Reform', mentions: 1654, sentiment: 'positive' },
        { topic: 'Healthcare Access', mentions: 1203, sentiment: 'concerned' }
      ];
    },
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  });

  // Regional status data
  const { data: regionalData } = useQuery({
    queryKey: ['intelligence_regional'],
    queryFn: async (): Promise<RegionalData[]> => {
      return [
        { region: 'Centre', status: 'active', sentiment: 0.65, threats: 2 },
        { region: 'Littoral', status: 'active', sentiment: 0.72, threats: 1 },
        { region: 'Northwest', status: 'monitoring', sentiment: 0.45, threats: 4 },
        { region: 'Southwest', status: 'monitoring', sentiment: 0.48, threats: 3 },
        { region: 'North', status: 'active', sentiment: 0.58, threats: 1 },
        { region: 'Far North', status: 'active', sentiment: 0.52, threats: 2 },
        { region: 'East', status: 'active', sentiment: 0.68, threats: 0 },
        { region: 'South', status: 'active', sentiment: 0.71, threats: 1 },
        { region: 'Adamawa', status: 'active', sentiment: 0.62, threats: 1 },
        { region: 'West', status: 'active', sentiment: 0.74, threats: 0 }
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

  const getRegionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'monitoring': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const exportReport = () => {
    toast({
      title: "Report Export Started",
      description: "Your intelligence report is being generated...",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <IntelligenceSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="lg:hidden" />
              <div className="hidden lg:flex items-center gap-3">
                <Bot className="h-8 w-8 text-red-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Intelligence Core</h1>
                  <p className="text-sm text-gray-500">Real-time Civic Monitoring</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search intelligence..." 
                    className="pl-9 w-64 rounded-2xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="rounded-2xl">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Auto-refresh</span>
                  <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                </div>
                <Button onClick={exportReport} variant="outline" size="sm" className="rounded-2xl">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Export</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6 space-y-6 overflow-auto">
            {/* Real-time Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">System Status</p>
                      <p className="text-2xl font-bold text-green-600">Online</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500">Live monitoring active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Threat Level</p>
                      <p className="text-2xl font-bold text-yellow-600">Medium</p>
                    </div>
                    <Shield className="h-8 w-8 text-yellow-600" />
                  </div>
                  <Progress value={45} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Active Regions</p>
                      <p className="text-2xl font-bold">{regionalData?.filter(r => r.status === 'active').length || 0}/10</p>
                    </div>
                    <Globe className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Northwest, Southwest monitoring</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Data Points</p>
                      <p className="text-2xl font-bold">12.4K</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">+15% from last hour</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Live Sentiment Feed */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <Brain className="h-5 w-5 mr-2" />
                    Regional Sentiment Radar
                  </CardTitle>
                  <CardDescription>Live emotion analysis by region</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sentimentData?.map((sentiment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
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

              {/* Regional Map */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    Regional Status Map
                  </CardTitle>
                  <CardDescription>Real-time regional monitoring status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {regionalData?.map((region) => (
                      <div key={region.region} className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{region.region}</span>
                          <div className={`w-3 h-3 rounded-full ${getRegionStatusColor(region.status)}`}></div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Sentiment:</span>
                            <span className={region.sentiment > 0.6 ? 'text-green-600' : region.sentiment > 0.4 ? 'text-yellow-600' : 'text-red-600'}>
                              {Math.round(region.sentiment * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Threats:</span>
                            <span className={region.threats === 0 ? 'text-green-600' : region.threats < 3 ? 'text-yellow-600' : 'text-red-600'}>
                              {region.threats}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Threat Alerts */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Threat Level Tracker
                  </CardTitle>
                  <CardDescription>Real-time security and stability alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {threatAlerts?.map((alert) => (
                      <div key={alert.id} className="p-3 rounded-xl border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Badge className={getThreatColor(alert.level)} variant="secondary">
                              {alert.level.toUpperCase()}
                            </Badge>
                            <p className="text-sm mt-1">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {alert.region} • {new Date(alert.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <LoadMoreButton onLoadMore={() => {}} />
                  </div>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <Flame className="h-5 w-5 mr-2" />
                    Trending Topics
                  </CardTitle>
                  <CardDescription>Most discussed civic topics right now</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trendingTopics?.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-medium">{topic.topic}</p>
                          <p className="text-sm text-gray-500">{topic.mentions.toLocaleString()} mentions</p>
                        </div>
                        <Badge variant={topic.sentiment === 'positive' ? 'default' : topic.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                          {topic.sentiment}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Engine Status */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <Zap className="h-5 w-5 mr-2" />
                    AI Engine Status
                  </CardTitle>
                  <CardDescription>Model performance and data quality</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Model Status</span>
                      <Badge variant="default" className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Sync</span>
                      <span className="text-sm text-gray-500">2 minutes ago</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Training Data</span>
                      <span className="text-sm text-gray-500">99.2% quality</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing Speed</span>
                        <span>94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Chart */}
              <Card className="lg:col-span-2 rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Sentiment Timeline
                  </CardTitle>
                  <CardDescription>24-hour sentiment analysis trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart 
                    title="Sentiment Timeline"
                    data={[
                      { time: '00:00', positive: 45, negative: 25, neutral: 30 },
                      { time: '06:00', positive: 52, negative: 28, neutral: 20 },
                      { time: '12:00', positive: 48, negative: 32, neutral: 20 },
                      { time: '18:00', positive: 55, negative: 25, neutral: 20 },
                      { time: '24:00', positive: 50, negative: 30, neutral: 20 }
                    ]}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Admin Intelligence Controls */}
            <ActionBanner
              type="info"
              title="Intelligence Command Center"
              description="Advanced monitoring and control capabilities are active"
              actionLabel="Export Report"
              onAction={exportReport}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default IntelligenceDashboard;