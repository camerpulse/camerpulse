import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  Globe,
  Server,
  Users,
  Wifi,
  WifiOff
} from 'lucide-react';
import { logger } from '@/utils/logger';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  lastCheck: string;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  lastCheck: string;
  responseTime?: number;
}

export const SystemHealthMonitor: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: 99.9,
    responseTime: 245,
    lastCheck: new Date().toISOString()
  });

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Database', status: 'online', uptime: 99.8, lastCheck: new Date().toISOString(), responseTime: 12 },
    { name: 'Authentication', status: 'online', uptime: 99.9, lastCheck: new Date().toISOString(), responseTime: 8 },
    { name: 'File Storage', status: 'online', uptime: 99.5, lastCheck: new Date().toISOString(), responseTime: 156 },
    { name: 'Notifications', status: 'degraded', uptime: 98.2, lastCheck: new Date().toISOString(), responseTime: 890 },
    { name: 'Analytics', status: 'online', uptime: 99.7, lastCheck: new Date().toISOString(), responseTime: 34 }
  ]);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      logger.info('Application came online', 'SystemHealth');
    };

    const handleOffline = () => {
      setIsOnline(false);
      logger.warn('Application went offline', 'SystemHealth');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate periodic health checks
    const healthCheckInterval = setInterval(async () => {
      await performHealthCheck();
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(healthCheckInterval);
    };
  }, []);

  const performHealthCheck = async () => {
    try {
      const startTime = Date.now();
      
      // Simulate API health check
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      }).catch(() => null);
      
      const responseTime = Date.now() - startTime;
      const isHealthy = response?.ok;

      setSystemHealth(prev => ({
        ...prev,
        status: isHealthy ? 'healthy' : 'degraded',
        responseTime,
        lastCheck: new Date().toISOString()
      }));

      // Update service statuses with some simulation
      setServices(prev => prev.map(service => ({
        ...service,
        lastCheck: new Date().toISOString(),
        responseTime: Math.random() * 500 + 10,
        status: Math.random() > 0.95 ? 'degraded' : 'online'
      })));

      logger.debug('Health check completed', 'SystemHealth', {
        responseTime,
        isHealthy
      });
    } catch (error) {
      logger.error('Health check failed', 'SystemHealth', error);
      setSystemHealth(prev => ({
        ...prev,
        status: 'down',
        lastCheck: new Date().toISOString()
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
      case 'offline':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'default';
      case 'degraded':
        return 'secondary';
      case 'down':
      case 'offline':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health Monitor
            </CardTitle>
            <CardDescription>Real-time system status and performance metrics</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <Badge variant={getStatusBadgeVariant(systemHealth.status)}>
              {systemHealth.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(systemHealth.status)}
                    <span className="font-medium capitalize">{systemHealth.status}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemHealth.uptime}%</div>
                  <Progress value={systemHealth.uptime} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemHealth.responseTime}ms</div>
                  <p className="text-xs text-muted-foreground">
                    Last checked: {new Date(systemHealth.lastCheck).toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Connection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isOnline ? (
                      <>
                        <Globe className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Connected</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Offline</span>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={performHealthCheck}
                  >
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="space-y-3">
              {services.map((service, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {service.responseTime}ms response time
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusBadgeVariant(service.status)}>
                          {service.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {service.uptime}% uptime
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Average Response Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{service.name}</span>
                        <span className="text-sm font-mono">
                          {service.responseTime}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">System Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Memory Usage</span>
                      <span className="text-sm font-mono">67%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CPU Usage</span>
                      <span className="text-sm font-mono">23%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Connections</span>
                      <span className="text-sm font-mono">1,247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Requests/min</span>
                      <span className="text-sm font-mono">8,934</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};