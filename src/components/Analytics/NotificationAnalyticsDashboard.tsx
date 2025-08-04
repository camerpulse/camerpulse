import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotificationAnalytics } from '@/hooks/useNotificationAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Bell, MousePointer, Eye, Calendar, Activity, Target } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const NotificationAnalyticsDashboard: React.FC = () => {
  const {
    userEngagement,
    performanceMetrics,
    loading,
    getEngagementOverview,
    getPerformanceOverview,
    fetchUserEngagement,
    fetchPerformanceMetrics
  } = useNotificationAnalytics();

  const [timeRange, setTimeRange] = useState<number>(30);

  const engagementOverview = getEngagementOverview();
  const performanceOverview = getPerformanceOverview();

  const handleTimeRangeChange = async (days: number) => {
    setTimeRange(days);
    await Promise.all([
      fetchUserEngagement(days),
      fetchPerformanceMetrics(days)
    ]);
  };

  // Prepare chart data
  const engagementChartData = userEngagement.map(metric => ({
    date: format(parseISO(metric.date_tracked), 'MMM dd'),
    received: metric.total_notifications_received,
    opened: metric.notifications_opened,
    clicked: metric.notifications_clicked,
    dismissed: metric.notifications_dismissed,
    score: metric.engagement_score
  }));

  const performanceChartData = performanceMetrics.reduce((acc: any[], metric) => {
    const existing = acc.find(item => item.type === metric.notification_type);
    if (existing) {
      existing.sent += metric.total_sent;
      existing.delivered += metric.total_delivered;
      existing.opened += metric.total_opened;
      existing.clicked += metric.total_clicked;
    } else {
      acc.push({
        type: metric.notification_type,
        sent: metric.total_sent,
        delivered: metric.total_delivered,
        opened: metric.total_opened,
        clicked: metric.total_clicked
      });
    }
    return acc;
  }, []);

  const pieChartData = performanceChartData.map(item => ({
    name: item.type,
    value: item.opened,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notification Analytics</h2>
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <Button
              key={days}
              variant={timeRange === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeRangeChange(days)}
            >
              {days}d
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      {engagementOverview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Total Received</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                {engagementOverview.totalReceived.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last {timeRange} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-success" />
                <span className="text-sm font-medium">Open Rate</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                {engagementOverview.openRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {engagementOverview.totalOpened} opened
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <MousePointer className="h-5 w-5 text-warning" />
                <span className="text-sm font-medium">Click Rate</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                {engagementOverview.clickRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {engagementOverview.totalClicked} clicked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">Engagement Score</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                {engagementOverview.avgEngagementScore.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average score
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="breakdown">Type Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="received" stroke="#8884d8" name="Received" />
                  <Line type="monotone" dataKey="opened" stroke="#82ca9d" name="Opened" />
                  <Line type="monotone" dataKey="clicked" stroke="#ffc658" name="Clicked" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Engagement Score</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={engagementChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {performanceOverview && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium">Delivery Rate</div>
                  <div className="text-2xl font-bold text-success">
                    {performanceOverview.deliveryRate.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium">Total Sent</div>
                  <div className="text-2xl font-bold">
                    {performanceOverview.totalSent.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium">Total Delivered</div>
                  <div className="text-2xl font-bold">
                    {performanceOverview.totalDelivered.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium">Avg Engagement</div>
                  <div className="text-2xl font-bold text-primary">
                    {performanceOverview.avgEngagementRate.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Performance by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sent" fill="#8884d8" name="Sent" />
                  <Bar dataKey="delivered" fill="#82ca9d" name="Delivered" />
                  <Bar dataKey="opened" fill="#ffc658" name="Opened" />
                  <Bar dataKey="clicked" fill="#ff7300" name="Clicked" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Opens by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
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
                <CardTitle>Type Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceChartData.map((item, index) => (
                  <div key={item.type} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{item.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.sent} sent, {item.opened} opened
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {item.sent > 0 ? ((item.opened / item.sent) * 100).toFixed(1) : 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">open rate</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};