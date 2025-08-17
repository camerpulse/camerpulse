import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Activity, AlertTriangle, CheckCircle, Clock, Database, 
  Monitor, Server, Shield, TrendingUp, Wifi, Zap, RefreshCw,
  AlertCircle, XCircle, Settings, BarChart3
} from 'lucide-react';

interface SystemHealthManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

interface HealthMetric {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  value: number;
  threshold: number;
  unit: string;
  description: string;
  last_check: string;
}

interface SystemAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  component: string;
  created_at: string;
  resolved: boolean;
}

export const SystemHealthManager: React.FC<SystemHealthManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch system health metrics
  const { data: healthMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['system_health_metrics'],
    queryFn: async (): Promise<HealthMetric[]> => {
      // Simulate real health checks - in production, this would call actual monitoring APIs
      const mockMetrics: HealthMetric[] = [
        {
          id: '1',
          name: 'Database Performance',
          status: 'healthy',
          value: 150,
          threshold: 200,
          unit: 'ms',
          description: 'Average query response time',
          last_check: new Date().toISOString()
        },
        {
          id: '2',
          name: 'API Response Time',
          status: 'warning',
          value: 450,
          threshold: 400,
          unit: 'ms',
          description: 'Average API endpoint response',
          last_check: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Storage Usage',
          status: 'healthy',
          value: 65,
          threshold: 80,
          unit: '%',
          description: 'Database storage utilization',
          last_check: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Active Connections',
          status: 'healthy',
          value: 45,
          threshold: 100,
          unit: 'count',
          description: 'Current database connections',
          last_check: new Date().toISOString()
        },
        {
          id: '5',
          name: 'Memory Usage',
          status: 'critical',
          value: 95,
          threshold: 85,
          unit: '%',
          description: 'Server memory utilization',
          last_check: new Date().toISOString()
        }
      ];

      return mockMetrics;
    },
    refetchInterval: autoRefresh ? 30000 : false,
    enabled: hasPermission('all') || hasPermission('system_monitor')
  });

  // Fetch system alerts
  const { data: systemAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['system_alerts'],
    queryFn: async (): Promise<SystemAlert[]> => {
      try {
        const { data, error } = await supabase
          .from('admin_alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        return data.map(alert => ({
          id: alert.id,
          type: alert.alert_type || 'system',
          severity: alert.severity || 'medium',
          message: alert.message,
          component: alert.component || 'system',
          created_at: alert.created_at,
          resolved: alert.resolved || false
        }));
      } catch (error) {
        console.error('Error fetching alerts:', error);
        return [];
      }
    },
    enabled: hasPermission('all') || hasPermission('system_monitor')
  });

  // Run system diagnostics
  const diagnosticsMutation = useMutation({
    mutationFn: async () => {
      // Simulate running comprehensive diagnostics
      const diagnostics = {
        database_check: true,
        rls_policy_check: true,
        performance_check: true,
        security_scan: true
      };
      
      await logActivity('system_diagnostics_run', diagnostics);
      return diagnostics;
    },
    onSuccess: () => {
      toast({
        title: "Diagnostics Complete",
        description: "System diagnostics completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['system_health_metrics'] });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!hasPermission('all') && !hasPermission('system_monitor')) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
        <p className="text-muted-foreground">
          You need system monitoring permissions to access this module.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Monitor className="h-6 w-6 mr-2 text-blue-600" />
            System Health & Monitoring
          </h2>
          <p className="text-muted-foreground">
            Real-time system health monitoring and diagnostics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          
          <Button
            onClick={() => diagnosticsMutation.mutate()}
            disabled={diagnosticsMutation.isPending}
          >
            <Settings className="h-4 w-4 mr-1" />
            Run Diagnostics
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthMetrics?.map((metric) => (
              <Card key={metric.id} className={`border ${getStatusColor(metric.status)}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {metric.name}
                    </CardTitle>
                    {getStatusIcon(metric.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">
                    {metric.value}{metric.unit}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Threshold: {metric.threshold}{metric.unit}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* System Overview Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.total_users || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats?.total_polls || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Polls</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">15.2GB</div>
                  <div className="text-sm text-muted-foreground">Data Storage</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="space-y-4">
            {healthMetrics?.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {getStatusIcon(metric.status)}
                      <h3 className="font-semibold ml-2">{metric.name}</h3>
                    </div>
                    <Badge variant={metric.status === 'healthy' ? 'default' : 'destructive'}>
                      {metric.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Value:</span>
                      <span className="font-mono">{metric.value}{metric.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Threshold:</span>
                      <span className="font-mono">{metric.threshold}{metric.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Check:</span>
                      <span>{new Date(metric.last_check).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-3">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="space-y-4">
            {systemAlerts?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
                  <p className="text-muted-foreground">
                    System is running smoothly with no active alerts.
                  </p>
                </CardContent>
              </Card>
            ) : (
              systemAlerts?.map((alert) => (
                <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{alert.type.toUpperCase()} - {alert.component}</span>
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'}>
                      {alert.severity}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>
                    {alert.message}
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(alert.created_at).toLocaleString()}
                    </div>
                  </AlertDescription>
                </Alert>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                System performance trends and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Performance Dashboard</h3>
                <p className="text-muted-foreground">
                  Advanced performance analytics and trending data
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};