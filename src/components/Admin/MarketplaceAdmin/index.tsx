import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminDashboard } from './AdminDashboard';
import { DisputeResolution } from './DisputeResolution';
import { FinancialReporting } from './FinancialReporting';
import { VendorAnalytics } from './VendorAnalytics';
import { PricingConfigPanel } from '../PricingConfigPanel';
import {
  LayoutDashboard,
  Scale,
  DollarSign,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings
} from 'lucide-react';

interface MarketplaceAdminProps {
  userRole?: string;
}

export const MarketplaceAdmin: React.FC<MarketplaceAdminProps> = ({
  userRole = 'admin'
}) => {
  const [activityLog, setActivityLog] = useState<Array<{
    action: string;
    details: any;
    timestamp: Date;
  }>>([]);

  // Permission checker
  const hasPermission = (permission: string): boolean => {
    // Simple permission system - in production this would be more sophisticated
    const permissions = {
      admin: ['view_dashboard', 'manage_disputes', 'view_financial', 'manage_vendors', 'export_data'],
      moderator: ['view_dashboard', 'manage_disputes'],
      financial: ['view_dashboard', 'view_financial', 'export_data']
    };

    return permissions[userRole as keyof typeof permissions]?.includes(permission) || false;
  };

  // Activity logger
  const logActivity = (action: string, details: any) => {
    const newActivity = {
      action,
      details,
      timestamp: new Date()
    };
    setActivityLog(prev => [newActivity, ...prev.slice(0, 99)]); // Keep last 100 activities
    console.log('Admin Activity:', newActivity);
  };

  // Fetch admin alerts
  const { data: adminAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    }
  });

  // System health overview
  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      // Mock system health data
      return {
        database_status: 'healthy',
        api_response_time: 120,
        active_users: 1250,
        error_rate: 0.02,
        uptime: 99.8
      };
    }
  });

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with System Health */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Administration</h1>
          <p className="text-muted-foreground">
            Comprehensive marketplace management and oversight
          </p>
        </div>
        <Card className="w-80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {healthLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <div className="flex items-center gap-1">
                    {getHealthStatusIcon(systemHealth?.database_status || 'healthy')}
                    <span className="text-xs">{systemHealth?.database_status}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Time</span>
                  <span className="text-xs">{systemHealth?.api_response_time}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Users</span>
                  <span className="text-xs">{systemHealth?.active_users?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="text-xs">{systemHealth?.uptime}%</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner */}
      {adminAlerts && adminAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              Active Alerts ({adminAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {adminAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between text-sm">
                  <span>{alert.title}</span>
                  <Badge variant={getAlertSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
              {adminAlerts.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{adminAlerts.length - 3} more alerts
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Admin Interface */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="disputes" className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Disputes
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Pricing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {hasPermission('view_dashboard') ? (
            <AdminDashboard
              hasPermission={hasPermission}
              logActivity={logActivity}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  You don't have permission to view the dashboard.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="disputes">
          {hasPermission('manage_disputes') ? (
            <DisputeResolution
              hasPermission={hasPermission}
              logActivity={logActivity}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  You don't have permission to manage disputes.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="financial">
          {hasPermission('view_financial') ? (
            <FinancialReporting
              hasPermission={hasPermission}
              logActivity={logActivity}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  You don't have permission to view financial reports.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {hasPermission('manage_vendors') ? (
            <VendorAnalytics
              hasPermission={hasPermission}
              logActivity={logActivity}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  You don't have permission to view vendor analytics.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pricing">
          {hasPermission('view_dashboard') ? (
            <PricingConfigPanel />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  You don't have permission to manage pricing configuration.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Recent Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Admin Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {activityLog.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              activityLog.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-center justify-between text-xs border-b pb-1">
                  <span>{activity.action}</span>
                  <span className="text-muted-foreground">
                    {activity.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};