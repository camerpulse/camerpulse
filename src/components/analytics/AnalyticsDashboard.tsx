import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Eye, MessageCircle, Clock, Star } from 'lucide-react';

interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  topEvents: Array<{ event_type: string; count: number }>;
  periodDays: number;
}

interface VillageAnalytics {
  village_id: string;
  village_name: string;
  analytics: AnalyticsData;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<VillageAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [selectedVillage, setSelectedVillage] = useState<string>('all');

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch village analytics for user's villages or all if admin
      const { data: villages, error: villagesError } = await supabase
        .from('villages')
        .select('id, village_name')
        .limit(20);

      if (villagesError) {
        console.error('Error fetching villages:', villagesError);
        return;
      }

      const analyticsPromises = villages?.map(async (village) => {
        const { data, error } = await supabase
          .rpc('get_village_analytics_summary', {
            p_village_id: village.id,
            p_days: parseInt(timeRange)
          });

        if (error) {
          console.error('Error fetching analytics for village:', village.id, error);
          return null;
        }

        return {
          village_id: village.id,
          village_name: village.village_name,
          analytics: (data as any) || { totalVisits: 0, uniqueVisitors: 0, topEvents: [], periodDays: parseInt(timeRange) }
        };
      }) || [];

      const results = await Promise.all(analyticsPromises);
      setAnalytics(results.filter(Boolean) as VillageAnalytics[]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user, timeRange]);

  const aggregatedData = analytics.reduce((acc, village) => {
    acc.totalVisits += village.analytics.totalVisits || 0;
    acc.uniqueVisitors += village.analytics.uniqueVisitors || 0;
    return acc;
  }, { totalVisits: 0, uniqueVisitors: 0 });

  const topVillages = analytics
    .sort((a, b) => (b.analytics.totalVisits || 0) - (a.analytics.totalVisits || 0))
    .slice(0, 10);

  const eventData = analytics.reduce((acc: any[], village) => {
    village.analytics.topEvents?.forEach(event => {
      const existing = acc.find(item => item.event_type === event.event_type);
      if (existing) {
        existing.count += event.count;
      } else {
        acc.push({ ...event });
      }
    });
    return acc;
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track village engagement and user behavior insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregatedData.totalVisits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last {timeRange} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregatedData.uniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Unique users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Villages</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.filter(v => (v.analytics.totalVisits || 0) > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              With activity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.length > 0 
                ? (aggregatedData.totalVisits / analytics.length).toFixed(1)
                : '0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Visits per village
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="villages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="villages">Villages</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="villages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Villages by Visits</CardTitle>
              <CardDescription>
                Most visited villages in the last {timeRange} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topVillages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="village_name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="analytics.totalVisits" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Event Distribution</CardTitle>
                <CardDescription>User interaction types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventData.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="count"
                      label={({ event_type }) => event_type}
                    >
                      {eventData.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Counts</CardTitle>
                <CardDescription>Total interactions by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {eventData.slice(0, 8).map((event, index) => (
                    <div key={event.event_type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">
                          {event.event_type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <Badge variant="secondary">{event.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
              <CardDescription>
                Village visit patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={topVillages.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="village_name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="analytics.totalVisits" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="analytics.uniqueVisitors" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};