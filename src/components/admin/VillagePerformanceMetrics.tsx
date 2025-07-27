import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Eye, 
  Star,
  Clock,
  Database,
  Zap
} from 'lucide-react';

const VillagePerformanceMetrics: React.FC = () => {
  // Mock performance data
  const performanceStats = {
    totalVillages: 15,
    activeUsers: 1234,
    avgLoadTime: 1.2,
    dbQueries: 45,
    cacheHitRate: 89,
    errorRate: 0.02
  };

  const topPerformingVillages = [
    { name: 'Buea', views: 15670, rating: 9.3, growth: 23 },
    { name: 'Douala', views: 25670, rating: 9.0, growth: 18 },
    { name: 'Kumbo', views: 12340, rating: 9.1, growth: 15 },
    { name: 'Mvog-Mbi', views: 8950, rating: 8.7, growth: 12 },
    { name: 'Limbe', views: 11890, rating: 8.9, growth: 10 }
  ];

  const systemMetrics = [
    { label: 'API Response Time', value: '98ms', status: 'good', icon: Zap },
    { label: 'Database Latency', value: '24ms', status: 'good', icon: Database },
    { label: 'Cache Hit Rate', value: '89%', status: 'good', icon: TrendingUp },
    { label: 'Active Sessions', value: '156', status: 'normal', icon: Users },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Performance Dashboard</h2>
        <p className="text-muted-foreground">Monitor village directory performance and system health</p>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}
                  </p>
                </div>
                <metric.icon className={`h-8 w-8 ${getStatusColor(metric.status)}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Page Load Speed</span>
                <span className="text-sm text-muted-foreground">{performanceStats.avgLoadTime}s</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Database Performance</span>
                <span className="text-sm text-muted-foreground">{performanceStats.dbQueries} queries/min</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cache Efficiency</span>
                <span className="text-sm text-muted-foreground">{performanceStats.cacheHitRate}%</span>
              </div>
              <Progress value={performanceStats.cacheHitRate} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Error Rate</span>
                <span className="text-sm text-muted-foreground">{performanceStats.errorRate}%</span>
              </div>
              <Progress value={performanceStats.errorRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Villages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Villages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingVillages.map((village, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{village.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {village.views.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{village.rating}</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-green-100 text-green-700"
                    >
                      +{village.growth}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{performanceStats.totalVillages}</div>
              <p className="text-sm text-muted-foreground">Total Villages</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">{performanceStats.activeUsers.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Active Users (24h)</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">98.5%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Database optimization completed - 15% performance improvement</span>
              <span className="text-xs text-muted-foreground ml-auto">2 minutes ago</span>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 text-blue-800">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">New village data synchronized from external sources</span>
              <span className="text-xs text-muted-foreground ml-auto">1 hour ago</span>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50 text-yellow-800">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Cache refresh scheduled for peak hours</span>
              <span className="text-xs text-muted-foreground ml-auto">3 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VillagePerformanceMetrics;