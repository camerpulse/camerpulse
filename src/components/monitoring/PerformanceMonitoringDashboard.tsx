import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Database, 
  Clock, 
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { checkDatabaseHealth } from '@/lib/supabaseHelpers';
import { logger } from '@/utils/logger';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layout/ResponsiveComponents';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'error';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface SystemMetric {
  category: string;
  metrics: PerformanceMetric[];
}

export const PerformanceMonitoringDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [realTimeData, setRealTimeData] = useState<any>({});

  // Database health check
  const { data: dbHealth, refetch: refetchDbHealth } = useQuery({
    queryKey: ['database-health'],
    queryFn: checkDatabaseHealth,
    refetchInterval: 30000, // Check every 30 seconds
    onSuccess: (data) => {
      logger.info('Database health check completed', 'PerformanceMonitoring', data);
    }
  });

  // Simulated performance metrics
  useEffect(() => {
    const generateMetrics = (): SystemMetric[] => {
      const now = Date.now();
      
      return [
        {
          category: 'Database Performance',
          metrics: [
            {
              name: 'Query Response Time',
              value: dbHealth?.responseTime || 150,
              unit: 'ms',
              status: (dbHealth?.responseTime || 150) < 200 ? 'good' : 'warning',
              trend: 'stable',
              description: 'Average database query response time'
            },
            {
              name: 'Connection Pool',
              value: 23,
              unit: 'connections',
              status: 'good',
              trend: 'up',
              description: 'Active database connections'
            },
            {
              name: 'Cache Hit Rate',
              value: 94.5,
              unit: '%',
              status: 'good',
              trend: 'stable',
              description: 'Query cache hit percentage'
            }
          ]
        },
        {
          category: 'Application Performance',
          metrics: [
            {
              name: 'Page Load Time',
              value: 1.2,
              unit: 'seconds',
              status: 'good',
              trend: 'stable',
              description: 'Average page load time'
            },
            {
              name: 'Bundle Size',
              value: 2.8,
              unit: 'MB',
              status: 'warning',
              trend: 'up',
              description: 'JavaScript bundle size'
            },
            {
              name: 'Memory Usage',
              value: 67,
              unit: '%',
              status: 'good',
              trend: 'stable',
              description: 'Client-side memory utilization'
            }
          ]
        },
        {
          category: 'User Experience',
          metrics: [
            {
              name: 'Core Web Vitals',
              value: 89,
              unit: 'score',
              status: 'good',
              trend: 'up',
              description: 'Google Core Web Vitals score'
            },
            {
              name: 'Error Rate',
              value: 0.12,
              unit: '%',
              status: 'good',
              trend: 'down',
              description: 'Client-side error rate'
            },
            {
              name: 'Session Duration',
              value: 8.5,
              unit: 'minutes',
              status: 'good',
              trend: 'up',
              description: 'Average user session duration'
            }
          ]
        },
        {
          category: 'System Resources',
          metrics: [
            {
              name: 'API Rate Limit',
              value: 156,
              unit: 'req/min',
              status: 'good',
              trend: 'stable',
              description: 'Current API request rate'
            },
            {
              name: 'Storage Usage',
              value: 34.2,
              unit: 'GB',
              status: 'good',
              trend: 'up',
              description: 'Total storage utilization'
            },
            {
              name: 'CDN Cache Hit',
              value: 98.7,
              unit: '%',
              status: 'good',
              trend: 'stable',
              description: 'CDN cache hit rate'
            }
          ]
        }
      ];
    };

    const updateMetrics = () => {
      setMetrics(generateMetrics());
      
      // Simulate real-time data
      setRealTimeData({
        activeUsers: Math.floor(Math.random() * 100) + 50,
        requestsPerSecond: Math.floor(Math.random() * 50) + 20,
        errorCount: Math.floor(Math.random() * 5),
        uptime: 99.9
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [dbHealth]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      case 'stable':
      default:
        return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'good':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Performance Monitoring</h1>
            <p className="text-muted-foreground">
              Real-time system performance and health metrics
            </p>
          </div>
          <Button onClick={() => refetchDbHealth()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Real-time Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getStatusIcon(dbHealth?.isHealthy ? 'good' : 'error')}
                <span className="font-medium">
                  {dbHealth?.isHealthy ? 'Healthy' : 'Issues Detected'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {realTimeData.uptime}% uptime
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeData.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Currently online
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requests/sec</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeData.requestsPerSecond}</div>
              <p className="text-xs text-muted-foreground">
                Current load
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Count</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{realTimeData.errorCount}</div>
              <p className="text-xs text-muted-foreground">
                Last hour
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <ResponsiveGrid cols={{ default: 1, lg: 2 }}>
              {metrics.map((category) => (
                <Card key={category.category}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.metrics.map((metric) => (
                        <div key={metric.name} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(metric.status)}
                              <span className="font-medium">{metric.name}</span>
                              {getTrendIcon(metric.trend)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {metric.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              {metric.value} {metric.unit}
                            </div>
                            <Badge variant={getStatusBadgeVariant(metric.status)} className="text-xs mt-1">
                              {metric.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          </TabsContent>

          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database Performance
                </CardTitle>
                <CardDescription>
                  Detailed database metrics and health information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-medium mb-2">Response Time</h4>
                      <div className="text-2xl font-bold">
                        {dbHealth?.responseTime || 'N/A'}ms
                      </div>
                      <Progress 
                        value={Math.min((dbHealth?.responseTime || 0) / 10, 100)} 
                        className="mt-2" 
                      />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Connection Status</h4>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(dbHealth?.isHealthy ? 'good' : 'error')}
                        <span className="font-medium">
                          {dbHealth?.isHealthy ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Query Cache</h4>
                      <div className="text-2xl font-bold">94.5%</div>
                      <Progress value={94.5} className="mt-2" />
                    </div>
                  </div>

                  {dbHealth?.error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-destructive">Database Error</span>
                      </div>
                      <p className="text-sm text-destructive">{dbHealth.error}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="frontend">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Frontend Performance
                </CardTitle>
                <CardDescription>
                  Client-side performance metrics and user experience data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Core Web Vitals</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Largest Contentful Paint</span>
                          <span className="text-sm font-medium">1.2s</span>
                        </div>
                        <Progress value={80} />
                        <div className="flex justify-between">
                          <span className="text-sm">First Input Delay</span>
                          <span className="text-sm font-medium">45ms</span>
                        </div>
                        <Progress value={90} />
                        <div className="flex justify-between">
                          <span className="text-sm">Cumulative Layout Shift</span>
                          <span className="text-sm font-medium">0.05</span>
                        </div>
                        <Progress value={95} />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Resource Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Bundle Size</span>
                          <span className="text-sm font-medium">2.8 MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Images Optimized</span>
                          <span className="text-sm font-medium">87%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Cache Hit Rate</span>
                          <span className="text-sm font-medium">94%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  System Resources
                </CardTitle>
                <CardDescription>
                  Infrastructure and resource utilization metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-3">Resource Usage</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Memory</span>
                            <span className="text-sm font-medium">67%</span>
                          </div>
                          <Progress value={67} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Storage</span>
                            <span className="text-sm font-medium">34%</span>
                          </div>
                          <Progress value={34} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Bandwidth</span>
                            <span className="text-sm font-medium">23%</span>
                          </div>
                          <Progress value={23} />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Network Stats</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Requests/min</span>
                          <span className="text-sm font-medium">1,247</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Data Transfer</span>
                          <span className="text-sm font-medium">156 MB/hr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">CDN Hit Rate</span>
                          <span className="text-sm font-medium">98.7%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Error Rate</span>
                          <span className="text-sm font-medium">0.12%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContainer>
  );
};