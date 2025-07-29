import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, TrendingUp, Cpu, Clock, Database, 
  Users, Globe, Smartphone, Monitor, Zap
} from 'lucide-react';

interface PerformanceAnalyticsModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const PerformanceAnalyticsModule: React.FC<PerformanceAnalyticsModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('system');

  const systemPerformance = [
    {
      id: 1,
      metric: 'CPU Utilization',
      current: 45.2,
      average: 42.8,
      peak: 78.5,
      threshold: 80,
      status: 'good',
      trend: 'stable',
      unit: '%'
    },
    {
      id: 2,
      metric: 'Memory Usage',
      current: 67.8,
      average: 65.3,
      peak: 89.2,
      threshold: 85,
      status: 'warning',
      trend: 'increasing',
      unit: '%'
    },
    {
      id: 3,
      metric: 'Disk I/O',
      current: 234.5,
      average: 198.7,
      peak: 456.2,
      threshold: 500,
      status: 'good',
      trend: 'stable',
      unit: 'MB/s'
    },
    {
      id: 4,
      metric: 'Network Bandwidth',
      current: 1.2,
      average: 1.1,
      peak: 3.4,
      threshold: 5.0,
      status: 'good',
      trend: 'stable',
      unit: 'GB/s'
    }
  ];

  const applicationMetrics = [
    {
      id: 1,
      application: 'Frontend Web App',
      responseTime: 245,
      throughput: 1250,
      errorRate: 0.2,
      availability: 99.8,
      activeUsers: 3420,
      memoryUsage: 512,
      status: 'excellent'
    },
    {
      id: 2,
      application: 'Admin Panel',
      responseTime: 189,
      throughput: 89,
      errorRate: 0.1,
      availability: 99.9,
      activeUsers: 45,
      memoryUsage: 256,
      status: 'excellent'
    },
    {
      id: 3,
      application: 'Mobile API',
      responseTime: 567,
      throughput: 890,
      errorRate: 1.2,
      availability: 98.5,
      activeUsers: 2100,
      memoryUsage: 1024,
      status: 'warning'
    },
    {
      id: 4,
      application: 'Background Services',
      responseTime: 1200,
      throughput: 145,
      errorRate: 0.5,
      availability: 99.2,
      activeUsers: 0,
      memoryUsage: 768,
      status: 'good'
    }
  ];

  const userExperienceMetrics = [
    {
      id: 1,
      metric: 'Page Load Time',
      value: 2.1,
      target: 3.0,
      device: 'Desktop',
      improvement: '+15%',
      status: 'excellent'
    },
    {
      id: 2,
      metric: 'First Contentful Paint',
      value: 1.8,
      target: 2.5,
      device: 'Mobile',
      improvement: '+22%',
      status: 'excellent'
    },
    {
      id: 3,
      metric: 'Time to Interactive',
      value: 4.2,
      target: 5.0,
      device: 'Desktop',
      improvement: '+8%',
      status: 'good'
    },
    {
      id: 4,
      metric: 'Cumulative Layout Shift',
      value: 0.08,
      target: 0.1,
      device: 'Mobile',
      improvement: '+12%',
      status: 'good'
    }
  ];

  const databasePerformance = [
    {
      id: 1,
      database: 'Primary PostgreSQL',
      connections: 127,
      maxConnections: 200,
      queryTime: 45,
      slowQueries: 3,
      lockWaits: 0,
      cacheHitRatio: 94.2,
      status: 'healthy'
    },
    {
      id: 2,
      database: 'Redis Cache',
      connections: 45,
      maxConnections: 100,
      queryTime: 2,
      slowQueries: 0,
      lockWaits: 0,
      cacheHitRatio: 98.7,
      status: 'healthy'
    },
    {
      id: 3,
      database: 'Analytics DB',
      connections: 89,
      maxConnections: 150,
      queryTime: 234,
      slowQueries: 12,
      lockWaits: 2,
      cacheHitRatio: 87.3,
      status: 'warning'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
      case 'healthy':
        return 'text-blue-600 bg-blue-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'decreasing':
        return <TrendingUp className="h-4 w-4 text-green-600 rotate-180" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600 rotate-90" />;
    }
  };

  const handleOptimize = (type: string, id: number) => {
    logActivity('performance_optimize', { type, id });
  };

  const handleAnalyze = (metricType: string) => {
    logActivity('performance_analyze', { metric_type: metricType });
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Performance Analytics"
        description="Monitor system performance, user experience, and application metrics"
        icon={BarChart3}
        iconColor="text-blue-600"
        onRefresh={() => {
          logActivity('performance_analytics_refresh', { timestamp: new Date() });
        }}
      />

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="System Health"
          value="94.2%"
          icon={Cpu}
          trend={{ value: 1.2, isPositive: true, period: "this week" }}
          description="Overall performance score"
          badge={{ text: "Excellent", variant: "default" }}
        />
        <StatCard
          title="Response Time"
          value="245ms"
          icon={Clock}
          trend={{ value: -15, isPositive: true, period: "avg" }}
          description="Average API response"
        />
        <StatCard
          title="Active Users"
          value="5,565"
          icon={Users}
          trend={{ value: 12.3, isPositive: true, period: "24h" }}
          description="Concurrent sessions"
        />
        <StatCard
          title="Error Rate"
          value="0.2%"
          icon={Zap}
          trend={{ value: -0.1, isPositive: true, period: "24h" }}
          description="Application errors"
          badge={{ text: "Low", variant: "default" }}
        />
      </div>

      {/* Performance Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system">System Performance</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="user-experience">User Experience</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                System Performance Metrics
              </CardTitle>
              <CardDescription>
                Monitor real-time system resource utilization and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemPerformance.map((metric) => (
                  <div key={metric.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getStatusColor(metric.status)}`}>
                          <Cpu className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{metric.metric}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {getTrendIcon(metric.trend)}
                            <span>{metric.trend}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            metric.status === 'good' ? 'default' :
                            metric.status === 'warning' ? 'secondary' : 'destructive'
                          }
                        >
                          {metric.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAnalyze(metric.metric)}
                        >
                          Analyze
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current:</span>
                        <p className="font-medium text-lg">{metric.current}{metric.unit}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Average:</span>
                        <p className="font-medium">{metric.average}{metric.unit}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Peak:</span>
                        <p className="font-medium">{metric.peak}{metric.unit}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Threshold:</span>
                        <p className="font-medium">{metric.threshold}{metric.unit}</p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Utilization</span>
                        <span>{((metric.current / metric.threshold) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(metric.current / metric.threshold) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Application Performance
              </CardTitle>
              <CardDescription>
                Monitor application-specific performance metrics and health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applicationMetrics.map((app) => (
                  <div key={app.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getStatusColor(app.status)}`}>
                          <Globe className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{app.application}</h4>
                          <p className="text-sm text-muted-foreground">
                            {app.activeUsers.toLocaleString()} active users
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            app.status === 'excellent' ? 'default' :
                            app.status === 'good' ? 'secondary' : 'destructive'
                          }
                        >
                          {app.status}
                        </Badge>
                        <Button 
                          size="sm"
                          onClick={() => handleOptimize('application', app.id)}
                        >
                          Optimize
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Response:</span>
                        <p className="font-medium">{app.responseTime}ms</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Throughput:</span>
                        <p className="font-medium">{app.throughput}/min</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Error Rate:</span>
                        <p className="font-medium">{app.errorRate}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Uptime:</span>
                        <p className="font-medium">{app.availability}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Memory:</span>
                        <p className="font-medium">{app.memoryUsage}MB</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Users:</span>
                        <p className="font-medium">{app.activeUsers.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-experience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                User Experience Metrics
              </CardTitle>
              <CardDescription>
                Track Core Web Vitals and user experience performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userExperienceMetrics.map((metric) => (
                  <div key={metric.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getStatusColor(metric.status)}`}>
                          <Clock className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{metric.metric}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{metric.device}</Badge>
                            <span>{metric.improvement} improvement</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{metric.value}s</p>
                        <p className="text-sm text-muted-foreground">Target: {metric.target}s</p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Performance Score</span>
                        <span>{Math.round((1 - (metric.value / metric.target)) * 100)}%</span>
                      </div>
                      <Progress 
                        value={Math.max(0, (1 - (metric.value / metric.target)) * 100)} 
                        className="h-2" 
                      />
                    </div>

                    <Badge 
                      variant={
                        metric.status === 'excellent' ? 'default' :
                        metric.status === 'good' ? 'secondary' : 'outline'
                      }
                    >
                      {metric.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Performance
              </CardTitle>
              <CardDescription>
                Monitor database connection pools, query performance, and optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {databasePerformance.map((db) => (
                  <div key={db.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getStatusColor(db.status)}`}>
                          <Database className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{db.database}</h4>
                          <p className="text-sm text-muted-foreground">
                            {db.connections}/{db.maxConnections} connections
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            db.status === 'healthy' ? 'default' : 'secondary'
                          }
                        >
                          {db.status}
                        </Badge>
                        <Button 
                          size="sm"
                          onClick={() => handleOptimize('database', db.id)}
                        >
                          Optimize
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Query Time:</span>
                        <p className="font-medium">{db.queryTime}ms</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Slow Queries:</span>
                        <p className="font-medium">{db.slowQueries}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lock Waits:</span>
                        <p className="font-medium">{db.lockWaits}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cache Hit:</span>
                        <p className="font-medium">{db.cacheHitRatio}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Connections:</span>
                        <p className="font-medium">{db.connections}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Conn:</span>
                        <p className="font-medium">{db.maxConnections}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Connection Pool Usage</span>
                        <span>{Math.round((db.connections / db.maxConnections) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(db.connections / db.maxConnections) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};