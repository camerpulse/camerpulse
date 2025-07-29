import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, BarChart3, Globe, Users, TrendingUp, 
  Zap, Clock, Target, Eye, Signal
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface RealTimeAnalyticsModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const RealTimeAnalyticsModule: React.FC<RealTimeAnalyticsModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('live');
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);

  // Fetch real-time analytics events
  const { data: analyticsEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['realtime_analytics_events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('realtime_analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Fetch data streams
  const { data: dataStreams = [], isLoading: streamsLoading } = useQuery({
    queryKey: ['real_time_data_streams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('real_time_data_streams')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Set up real-time subscription
  useEffect(() => {
    if (isStreaming) {
      const channel = supabase
        .channel('realtime-analytics')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'realtime_analytics_events'
          },
          (payload) => {
            setLiveEvents(prev => [payload.new, ...prev.slice(0, 49)]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isStreaming]);

  // Generate sample time series data
  const generateTimeSeriesData = () => {
    const now = new Date();
    const data = [];
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        events: Math.floor(Math.random() * 100) + 20,
        sentiment: Math.random() * 2 - 1,
        engagement: Math.floor(Math.random() * 50) + 10
      });
    }
    return data;
  };

  const timeSeriesData = generateTimeSeriesData();
  const activeStreams = dataStreams.filter(stream => stream.is_active);
  const totalEvents = analyticsEvents.length;
  const avgProcessingTime = 125; // ms

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Real-Time Analytics Dashboard"
        description="Live monitoring of civic engagement, sentiment, and platform activity"
        icon={Activity}
        iconColor="text-green-600"
        badge={{
          text: isStreaming ? "Live" : "Paused",
          variant: isStreaming ? "default" : "secondary"
        }}
        searchPlaceholder="Search events, streams..."
        onSearch={(query) => console.log('Searching analytics:', query)}
        onRefresh={() => {
          logActivity('realtime_analytics_refresh', { timestamp: new Date() });
        }}
        actions={
          <Button 
            onClick={() => setIsStreaming(!isStreaming)}
            variant={isStreaming ? "destructive" : "default"}
          >
            <Signal className="h-4 w-4 mr-2" />
            {isStreaming ? "Stop Streaming" : "Start Streaming"}
          </Button>
        }
      />

      {/* Real-Time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Live Events"
          value={totalEvents.toString()}
          icon={Zap}
          description="Events processed today"
          trend={{ value: 12.5, isPositive: true, period: "this hour" }}
        />
        <StatCard
          title="Active Streams"
          value={activeStreams.length.toString()}
          icon={Globe}
          description="Data sources streaming"
          badge={{ text: "Healthy", variant: "default" }}
        />
        <StatCard
          title="Processing Time"
          value={`${avgProcessingTime}ms`}
          icon={Clock}
          description="Average processing time"
          trend={{ value: 8.3, isPositive: true, period: "vs last hour" }}
        />
        <StatCard
          title="Data Throughput"
          value="2.4GB"
          icon={BarChart3}
          description="Processed today"
          trend={{ value: 15.2, isPositive: true, period: "vs yesterday" }}
        />
      </div>

      {/* Real-Time Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live">Live Feed</TabsTrigger>
          <TabsTrigger value="charts">Analytics Charts</TabsTrigger>
          <TabsTrigger value="streams">Data Streams</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Event Stream
              </CardTitle>
              <CardDescription>
                Real-time civic events, sentiment changes, and user interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {isStreaming && liveEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Waiting for live events...
                  </div>
                )}
                {(isStreaming ? liveEvents : analyticsEvents.slice(0, 20)).map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                      <div>
                        <h4 className="font-medium text-sm">{event.event_type}</h4>
                        <p className="text-xs text-muted-foreground">
                          Source: {event.event_source} | Region: {event.region || 'National'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleTimeString()}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {event.processed ? 'Processed' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Event Volume (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Sentiment Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[-1, 1]} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="sentiment" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Engagement Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="engagement" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Data Stream Status
              </CardTitle>
              <CardDescription>
                Monitor health and performance of real-time data sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataStreams.map((stream, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-3 w-3 rounded-full ${
                        stream.is_active ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <h4 className="font-medium">{stream.data_source}</h4>
                        <p className="text-sm text-muted-foreground">{stream.data_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="font-medium">{stream.events_per_minute} events/min</p>
                        <p className="text-muted-foreground">Last: {new Date(stream.last_event_at).toLocaleTimeString()}</p>
                      </div>
                      <Badge variant={stream.is_active ? 'default' : 'destructive'}>
                        {stream.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-medium">23%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">67%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Network I/O</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processing Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">99.7%</p>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">125ms</p>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">2.4K</p>
                    <p className="text-sm text-muted-foreground">Events/Hour</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Error Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Connection Errors</span>
                    <Badge variant="outline">0.3%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Processing Errors</span>
                    <Badge variant="outline">0.1%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Timeout Errors</span>
                    <Badge variant="outline">0.2%</Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Error Rate</span>
                      <Badge variant="secondary">0.6%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};