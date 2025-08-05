import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  Database,
  Settings,
  Shield,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { logger } from '@/utils/logger';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  systemErrors: number;
  apiHealth: 'healthy' | 'degraded' | 'down';
}

export const BasicAdminPanel: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 1247,
    activeUsers: 89,
    totalPosts: 3456,
    systemErrors: 3,
    apiHealth: 'healthy'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleRefreshStats = async () => {
    setIsLoading(true);
    logger.trackAction('refresh_admin_stats', 'AdminPanel');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update stats with some variation
      setStats(prev => ({
        ...prev,
        activeUsers: Math.floor(Math.random() * 100) + 50,
        systemErrors: Math.floor(Math.random() * 10)
      }));

      logger.info('Admin stats refreshed successfully', 'AdminPanel');
    } catch (error) {
      logger.error('Failed to refresh admin stats', 'AdminPanel', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'healthy': return 'default';
      case 'degraded': return 'secondary';
      case 'down': return 'destructive';
      default: return 'outline';
    }
  };

  const recentActivities = [
    { id: 1, action: 'User registered', user: 'John Doe', time: '2 minutes ago' },
    { id: 2, action: 'Poll created', user: 'Admin', time: '5 minutes ago' },
    { id: 3, action: 'Village verified', user: 'Moderator', time: '10 minutes ago' },
    { id: 4, action: 'Comment flagged', user: 'System', time: '15 minutes ago' },
  ];

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'High memory usage detected', time: '1 hour ago' },
    { id: 2, type: 'info', message: 'Scheduled maintenance completed', time: '2 hours ago' },
    { id: 3, type: 'error', message: 'API rate limit exceeded', time: '3 hours ago' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>
        <Button onClick={handleRefreshStats} disabled={isLoading}>
          {isLoading ? <LoadingSpinner size="sm" /> : 'Refresh Stats'}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={getHealthBadgeVariant(stats.apiHealth)}>
                {stats.apiHealth}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              All services operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.systemErrors}</div>
            <p className="text-xs text-muted-foreground">
              In the last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">by {activity.user}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  System Alerts
                </CardTitle>
                <CardDescription>Important system notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemAlerts.map((alert) => (
                    <div key={alert.id} className="flex justify-between items-start">
                      <div className="flex items-start space-x-2">
                        <Badge 
                          variant={alert.type === 'error' ? 'destructive' : 
                                  alert.type === 'warning' ? 'secondary' : 'default'}
                          className="mt-0.5"
                        >
                          {alert.type}
                        </Badge>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage platform users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">User management features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>Review and moderate platform content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Content moderation tools coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Configure system settings and parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">System configuration panel coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};