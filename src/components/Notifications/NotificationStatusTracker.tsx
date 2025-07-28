import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Mail,
  Smartphone,
  Bell,
  Eye,
  TrendingUp
} from 'lucide-react';

interface NotificationStats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  pending: number;
}

interface ChannelStats {
  channel: string;
  sent: number;
  delivered: number;
  failed: number;
  delivery_rate: number;
}

interface DailyStats {
  date: string;
  sent: number;
  delivered: number;
  read: number;
}

export const NotificationStatusTracker: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
    pending: 0
  });
  const [channelStats, setChannelStats] = useState<ChannelStats[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        // Load overall stats
        const { data: notifications } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id);

        if (notifications) {
          const total = notifications.length;
          const sent = notifications.filter(n => 
            n.sent_via_email || n.sent_via_sms || n.sent_via_push || 
            n.channels.includes('in_app')
          ).length;
          const delivered = sent; // Assume all sent are delivered for now
          const read = notifications.filter(n => n.is_read).length;
          const failed = 0; // We'll implement failure tracking later
          const pending = total - sent;

          setStats({
            total,
            sent,
            delivered,
            read,
            failed,
            pending
          });
        }

        // Load channel-specific stats
        const channels = ['email', 'sms', 'push', 'in_app'];
        const channelData: ChannelStats[] = [];

        for (const channel of channels) {
          const channelNotifications = notifications?.filter(n => 
            n.channels.includes(channel)
          ) || [];
          
          let sentCount = 0;
          if (channel === 'email') {
            sentCount = channelNotifications.filter(n => n.sent_via_email).length;
          } else if (channel === 'sms') {
            sentCount = channelNotifications.filter(n => n.sent_via_sms).length;
          } else if (channel === 'push') {
            sentCount = channelNotifications.filter(n => n.sent_via_push).length;
          } else if (channel === 'in_app') {
            sentCount = channelNotifications.length; // All in-app are considered sent
          }

          const deliveredCount = sentCount; // Assume delivered = sent for now
          const failedCount = channelNotifications.length - sentCount;
          const deliveryRate = channelNotifications.length > 0 
            ? (deliveredCount / channelNotifications.length) * 100 
            : 0;

          channelData.push({
            channel,
            sent: sentCount,
            delivered: deliveredCount,
            failed: failedCount,
            delivery_rate: deliveryRate
          });
        }

        setChannelStats(channelData);

        // Load daily stats for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyData: DailyStats[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          const dayNotifications = notifications?.filter(n => 
            n.created_at.startsWith(dateStr)
          ) || [];

          const sent = dayNotifications.filter(n => 
            n.sent_via_email || n.sent_via_sms || n.sent_via_push || 
            n.channels.includes('in_app')
          ).length;
          
          const delivered = sent;
          const read = dayNotifications.filter(n => n.is_read).length;

          dailyData.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            sent,
            delivered,
            read
          });
        }

        setDailyStats(dailyData);

      } catch (error) {
        console.error('Error loading notification stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    // Set up real-time updates
    const channel = supabase
      .channel('notification-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Reload stats when notifications change
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return Mail;
      case 'sms':
        return Smartphone;
      case 'push':
        return Bell;
      case 'in_app':
        return Eye;
      default:
        return Activity;
    }
  };

  const deliveryRate = stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0;
  const readRate = stats.total > 0 ? (stats.read / stats.total) * 100 : 0;

  const pieData = [
    { name: 'Read', value: stats.read, color: '#22c55e' },
    { name: 'Delivered', value: stats.delivered - stats.read, color: '#3b82f6' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Failed', value: stats.failed, color: '#ef4444' }
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Notification Status Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{stats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{stats.delivered}</p>
                <Progress value={deliveryRate} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Read</p>
                <p className="text-2xl font-bold">{stats.read}</p>
                <Progress value={readRate} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Rate</span>
                    <span>{deliveryRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={deliveryRate} className="mt-1" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Read Rate</span>
                    <span>{readRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={readRate} className="mt-1" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">{deliveryRate.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Avg. Delivery</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-500">{readRate.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Avg. Read Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelStats.map((channel) => {
                  const Icon = getChannelIcon(channel.channel);
                  return (
                    <div key={channel.channel} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium capitalize">{channel.channel}</p>
                          <p className="text-sm text-muted-foreground">
                            {channel.sent} sent, {channel.delivered} delivered
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={channel.delivery_rate > 90 ? 'default' : 'secondary'}>
                          {channel.delivery_rate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                7-Day Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="sent" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Sent"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="delivered" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Delivered"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="read" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Read"
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