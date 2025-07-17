import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Music, Users, Globe, Download, Calendar, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceData {
  id: string;
  date_recorded: string;
  stream_count: number;
  followers_count: number;
  monthly_listeners: number;
  top_songs: any[];
  top_regions: any[];
  platform_type: string;
}

interface PlatformConnection {
  id: string;
  platform_type: string;
  platform_username?: string;
  is_verified: boolean;
}

const platformColors = {
  spotify: '#1DB954',
  youtube: '#FF0000', 
  apple_music: '#000000',
  boomplay: '#FF6B35',
  audiomack: '#FF7700',
  deezer: '#FEAA2D',
  soundcloud: '#FF5500'
};

const platformIcons = {
  spotify: '🎵',
  youtube: '📺',
  apple_music: '🍎',
  boomplay: '🎶',
  audiomack: '🎧',
  deezer: '🎤',
  soundcloud: '☁️'
};

export function PerformanceIntelligenceDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const { data: connections } = useQuery({
    queryKey: ['platform-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artist_platform_connections')
        .select('id, platform_type, platform_username, is_verified')
        .eq('sync_enabled', true);
      
      if (error) throw error;
      return data as PlatformConnection[];
    }
  });

  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['performance-data', selectedTimeRange, selectedPlatform],
    queryFn: async () => {
      let query = supabase
        .from('platform_performance_data')
        .select(`
          *,
          artist_platform_connections!inner(platform_type, platform_username)
        `)
        .order('date_recorded', { ascending: true });

      // Apply time range filter
      if (selectedTimeRange === '7d') {
        query = query.gte('date_recorded', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      } else if (selectedTimeRange === '30d') {
        query = query.gte('date_recorded', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      } else if (selectedTimeRange === '90d') {
        query = query.gte('date_recorded', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
      }

      // Apply platform filter
      if (selectedPlatform !== 'all') {
        query = query.eq('artist_platform_connections.platform_type', selectedPlatform as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any;
    },
    enabled: !!connections
  });

  // Calculate aggregate metrics
  const aggregateMetrics = performanceData?.reduce((acc, item) => {
    acc.totalStreams += item.stream_count || 0;
    acc.totalFollowers += item.followers_count || 0;
    acc.totalListeners += item.monthly_listeners || 0;
    return acc;
  }, { totalStreams: 0, totalFollowers: 0, totalListeners: 0 });

  // Group data by platform for charts
  const platformData = performanceData?.reduce((acc, item) => {
    const platform = (item as any).artist_platform_connections.platform_type;
    if (!acc[platform]) {
      acc[platform] = { platform, streams: 0, followers: 0, listeners: 0 };
    }
    acc[platform].streams += item.stream_count || 0;
    acc[platform].followers += item.followers_count || 0;
    acc[platform].listeners += item.monthly_listeners || 0;
    return acc;
  }, {} as Record<string, any>);

  const chartData = platformData ? Object.values(platformData) : [];

  // Time series data
  const timeSeriesData = performanceData?.map(item => ({
    date: new Date(item.date_recorded).toLocaleDateString(),
    streams: item.stream_count || 0,
    followers: item.followers_count || 0,
    listeners: item.monthly_listeners || 0
  }));

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value?.toLocaleString() || 0}</p>
            {change !== undefined && (
              <div className={`flex items-center mt-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(change)}%
              </div>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading performance data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Intelligence</h2>
          <p className="text-muted-foreground">
            Unified analytics across all your connected platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {connections?.map((connection) => (
                <SelectItem key={connection.id} value={connection.platform_type}>
                  <div className="flex items-center gap-2">
                    <span>{platformIcons[connection.platform_type as keyof typeof platformIcons]}</span>
                    <span className="capitalize">{connection.platform_type.replace('_', ' ')}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Streams"
          value={aggregateMetrics?.totalStreams}
          icon={Music}
          trend="up"
          change={12.5}
        />
        <StatCard
          title="Total Followers"
          value={aggregateMetrics?.totalFollowers}
          icon={Users}
          trend="up"
          change={8.2}
        />
        <StatCard
          title="Monthly Listeners"
          value={aggregateMetrics?.totalListeners}
          icon={Globe}
          trend="up"
          change={15.3}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">By Platform</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stream Performance</CardTitle>
                <CardDescription>Daily stream counts across all platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="streams" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>Stream distribution by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="streams"
                      nameKey="platform"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {chartData.map((entry: any, index) => (
                        <Cell key={`cell-${index}`} fill={platformColors[entry.platform as keyof typeof platformColors] || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-4">
            {chartData.map((platform: any) => (
              <Card key={platform.platform}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{platformIcons[platform.platform as keyof typeof platformIcons]}</div>
                      <div>
                        <CardTitle className="text-lg capitalize">
                          {platform.platform.replace('_', ' ')}
                        </CardTitle>
                        <CardDescription>
                          Connected platform performance
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{platform.streams?.toLocaleString() || 0}</div>
                      <div className="text-sm text-muted-foreground">Streams</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{platform.followers?.toLocaleString() || 0}</div>
                      <div className="text-sm text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{platform.listeners?.toLocaleString() || 0}</div>
                      <div className="text-sm text-muted-foreground">Monthly Listeners</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Growth Trends</CardTitle>
              <CardDescription>Track your audience growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="streams" stroke="#8884d8" strokeWidth={2} name="Streams" />
                  <Line type="monotone" dataKey="followers" stroke="#82ca9d" strokeWidth={2} name="Followers" />
                  <Line type="monotone" dataKey="listeners" stroke="#ffc658" strokeWidth={2} name="Listeners" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Download your performance data for external analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 cursor-pointer hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <Download className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">CSV Export</h4>
                      <p className="text-sm text-muted-foreground">Download as spreadsheet</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 cursor-pointer hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">Analytics Report</h4>
                      <p className="text-sm text-muted-foreground">Comprehensive PDF report</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 cursor-pointer hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">Schedule Export</h4>
                      <p className="text-sm text-muted-foreground">Automated weekly reports</p>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}