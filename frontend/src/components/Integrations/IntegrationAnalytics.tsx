import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationLog {
  id: string;
  integration_id?: string;
  webhook_endpoint_id?: string;
  api_key_id?: string;
  event_type: string;
  request_method?: string;
  response_status?: number;
  processing_time_ms?: number;
  error_message?: string;
  created_at: string;
  user_integrations?: {
    connection_name: string;
    integration_services: {
      display_name: string;
    };
  };
  webhook_endpoints?: {
    endpoint_name: string;
  };
  api_keys?: {
    key_name: string;
  };
}

interface AnalyticsData {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  topServices: Array<{ name: string; count: number }>;
  recentLogs: IntegrationLog[];
  hourlyStats: Array<{ hour: string; requests: number; errors: number }>;
}

export const IntegrationAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    topServices: [],
    recentLogs: [],
    hourlyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7');

  const fetchAnalytics = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      // Fetch integration logs
      const { data: logs, error: logsError } = await supabase
        .from('integration_logs_v2')
        .select(`
          *,
          user_integrations (
            connection_name,
            integration_services (display_name)
          ),
          webhook_endpoints (endpoint_name),
          api_keys (key_name)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;

      const allLogs = logs || [];
      
      // Filter logs for current user (through relationships)
      const userLogs = allLogs.filter(log => 
        log.user_integrations || log.webhook_endpoints || log.api_keys
      );

      // Calculate analytics
      const totalRequests = userLogs.length;
      const successfulRequests = userLogs.filter(log => 
        log.response_status && log.response_status >= 200 && log.response_status < 400
      ).length;
      const failedRequests = totalRequests - successfulRequests;
      
      const avgResponseTime = userLogs.reduce((sum, log) => 
        sum + (log.processing_time_ms || 0), 0
      ) / totalRequests || 0;

      // Top services
      const serviceCount: Record<string, number> = {};
      userLogs.forEach(log => {
        const serviceName = 
          log.user_integrations?.integration_services?.display_name ||
          log.webhook_endpoints?.endpoint_name ||
          log.api_keys?.key_name ||
          'Unknown';
        serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
      });

      const topServices = Object.entries(serviceCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Hourly stats for the last 24 hours
      const now = new Date();
      const hourlyStats = [];
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourStart = new Date(hour);
        hourStart.setMinutes(0, 0, 0);
        const hourEnd = new Date(hourStart);
        hourEnd.setHours(hourEnd.getHours() + 1);

        const hourLogs = userLogs.filter(log => {
          const logTime = new Date(log.created_at);
          return logTime >= hourStart && logTime < hourEnd;
        });

        hourlyStats.push({
          hour: hourStart.toLocaleTimeString('en-US', { hour: '2-digit' }),
          requests: hourLogs.length,
          errors: hourLogs.filter(log => 
            log.response_status && log.response_status >= 400
          ).length
        });
      }

      setAnalytics({
        totalRequests,
        successfulRequests,
        failedRequests,
        averageResponseTime: Math.round(avgResponseTime),
        topServices,
        recentLogs: userLogs.slice(0, 10),
        hourlyStats
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user?.id, timeRange]);

  const getStatusIcon = (status?: number) => {
    if (!status) return <Clock className="h-4 w-4 text-gray-500" />;
    if (status >= 200 && status < 400) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status?: number) => {
    if (!status) return <Badge variant="secondary">Pending</Badge>;
    if (status >= 200 && status < 400) return <Badge variant="default">Success</Badge>;
    return <Badge variant="destructive">Error</Badge>;
  };

  const successRate = analytics.totalRequests > 0 
    ? Math.round((analytics.successfulRequests / analytics.totalRequests) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Integration Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Monitor integration performance and usage statistics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24h</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              in the last {timeRange} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            {successRate >= 95 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.successfulRequests} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              average processing time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.failedRequests}</div>
            <p className="text-xs text-muted-foreground">
              errors encountered
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Integration Services</CardTitle>
            <CardDescription>Most active integrations by request volume</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topServices.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No integration activity yet
              </p>
            ) : (
              <div className="space-y-3">
                {analytics.topServices.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <span>{service.name}</span>
                    </div>
                    <Badge variant="outline">{service.count} requests</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hourly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last 24 Hours Activity</CardTitle>
            <CardDescription>Request volume by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.hourlyStats.slice(-8).map((stat) => (
                <div key={stat.hour} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{stat.hour}</span>
                  <div className="flex items-center gap-4">
                    <span>{stat.requests} requests</span>
                    {stat.errors > 0 && (
                      <span className="text-red-500">{stat.errors} errors</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>Latest integration requests and responses</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No recent activity
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.response_status)}
                    <div>
                      <div className="font-medium text-sm">
                        {log.user_integrations?.integration_services?.display_name ||
                         log.webhook_endpoints?.endpoint_name ||
                         log.api_keys?.key_name ||
                         'Unknown Service'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.event_type} • {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.processing_time_ms && (
                      <span className="text-xs text-muted-foreground">
                        {log.processing_time_ms}ms
                      </span>
                    )}
                    {getStatusBadge(log.response_status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};