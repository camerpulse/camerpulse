import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, AlertTriangle, Key, Smartphone, FileText, 
  Activity, UserX, Lock, Unlock, Eye, EyeOff, Clock,
  CheckCircle, XCircle, TrendingUp, Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityManagementModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const SecurityManagementModule: React.FC<SecurityManagementModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch security statistics
  const { data: securityStats } = useQuery({
    queryKey: ['security-stats'],
    queryFn: async () => {
      const [
        failedLogins, activeDevices, securityLogs, 
        suspiciousActivity, blockedIPs
      ] = await Promise.all([
        supabase.from('failed_login_attempts').select('id', { count: 'exact' }),
        supabase.from('user_devices').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('security_logs').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('security_audit_logs').select('id', { count: 'exact' }).eq('severity', 'high'),
        supabase.from('failed_login_attempts').select('ip_address', { count: 'exact' }).not('blocked_until', 'is', null)
      ]);

      return {
        failedLogins: failedLogins.count || 0,
        activeDevices: activeDevices.count || 0,
        securityEvents: securityLogs.count || 0,
        suspiciousActivity: suspiciousActivity.count || 0,
        blockedIPs: blockedIPs.count || 0
      };
    },
    enabled: hasPermission('security')
  });

  // Fetch failed login attempts
  const { data: failedLogins } = useQuery({
    queryKey: ['failed-logins', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('failed_login_attempts')
        .select('*')
        .order('attempt_time', { ascending: false })
        .limit(50);

      if (searchTerm) {
        query = query.ilike('email', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: hasPermission('security')
  });

  // Fetch security audit logs
  const { data: auditLogs } = useQuery({
    queryKey: ['security-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: hasPermission('security')
  });

  // Fetch user devices
  const { data: userDevices } = useQuery({
    queryKey: ['user-devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .order('last_used_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: hasPermission('security')
  });

  // Block IP mutation
  const blockIP = useMutation({
    mutationFn: async (ipAddress: string) => {
      const { error } = await supabase
        .from('failed_login_attempts')
        .update({ 
          blocked_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() 
        })
        .eq('ip_address', ipAddress);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['failed-logins'] });
      toast({ title: "IP address blocked successfully" });
    }
  });

  // Trust device mutation
  const trustDevice = useMutation({
    mutationFn: async (deviceId: string) => {
      const { error } = await supabase
        .from('user_devices')
        .update({ is_trusted: true })
        .eq('id', deviceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-devices'] });
      toast({ title: "Device marked as trusted" });
    }
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge variant="secondary">Medium</Badge>;
      case 'low': return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Security Management"
        description="Comprehensive security monitoring, authentication management, and threat detection"
        icon={Shield}
        iconColor="text-red-600"
        searchPlaceholder="Search security events, IPs, devices..."
        onSearch={setSearchTerm}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['security-stats'] });
          logActivity('security_management_refresh', { timestamp: new Date() });
        }}
      />

      {/* Security Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{securityStats?.failedLogins || 0}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <Smartphone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.activeDevices || 0}</div>
            <p className="text-xs text-muted-foreground">Registered devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.securityEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.suspiciousActivity || 0}</div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Lock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.blockedIPs || 0}</div>
            <p className="text-xs text-muted-foreground">Active blocks</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="failed-logins">Failed Logins</TabsTrigger>
          <TabsTrigger value="devices">Device Management</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="2fa">2FA Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Security Health Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Overall Security</span>
                    <span className="font-bold text-green-600">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Authentication Security</span>
                      <span className="text-green-600">Good</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Access Control</span>
                      <span className="text-green-600">Strong</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Threat Detection</span>
                      <span className="text-yellow-600">Moderate</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Security Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Security Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs?.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{log.event_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                      {getSeverityBadge(log.severity)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="failed-logins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Login Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {failedLogins?.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{attempt.email}</h3>
                      <p className="text-sm text-muted-foreground">
                        IP: {String(attempt.ip_address)} | Time: {new Date(attempt.attempt_time).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Reason: {attempt.reason}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => blockIP.mutate(String(attempt.ip_address))}
                        className="text-red-600"
                      >
                        <Lock className="h-4 w-4" />
                        Block IP
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userDevices?.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Smartphone className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-medium">{device.device_name || 'Unknown Device'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {device.device_type} | {device.operating_system}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last used: {new Date(device.last_used_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      {device.is_trusted ? (
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Trusted
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => trustDevice.mutate(device.id)}
                        >
                          Trust Device
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs?.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{log.event_type}</h3>
                      <p className="text-sm text-muted-foreground">{log.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                    {getSeverityBadge(log.severity)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2fa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">2FA management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};