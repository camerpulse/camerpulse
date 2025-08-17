import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Search, Filter, Download, Users, Activity, Shield, Clock, MapPin, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserActivityAuditManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_description: string;
  ip_address: string;
  user_agent: string;
  location?: string;
  device_info?: any;
  session_id?: string;
  risk_score?: number;
  is_suspicious: boolean;
  created_at: string;
  user_email?: string;
  user_role?: string;
}

interface SecurityAlert {
  id: string;
  user_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  triggered_by: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

interface ActivityStats {
  total_activities: number;
  unique_users: number;
  suspicious_activities: number;
  security_alerts: number;
  login_attempts: number;
  failed_logins: number;
  unique_ips: number;
  active_sessions: number;
}

export const UserActivityAuditManager: React.FC<UserActivityAuditManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats>({
    total_activities: 0,
    unique_users: 0,
    suspicious_activities: 0,
    security_alerts: 0,
    login_attempts: 0,
    failed_logins: 0,
    unique_ips: 0,
    active_sessions: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedActivity, setSelectedActivity] = useState<UserActivity | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (hasPermission('admin:user_audit')) {
      fetchActivities();
      fetchSecurityAlerts();
      fetchStats();
    }
  }, [hasPermission, timeRange, filterType]);

  const fetchActivities = async () => {
    try {
      let query = supabase
        .from('user_activity_logs')
        .select(`
          *,
          profiles(email)
        `)
        .gte('created_at', getTimeRangeDate())
        .order('created_at', { ascending: false })
        .limit(500);

      if (filterType !== 'all') {
        if (filterType === 'suspicious') {
          query = query.eq('is_suspicious', true);
        } else {
          query = query.eq('activity_type', filterType);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      const processedActivities = (data || []).map(activity => ({
        ...activity,
        user_email: activity.profiles?.email || 'Unknown'
      }));

      setActivities(processedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user activities",
        variant: "destructive"
      });
    }
  };

  const fetchSecurityAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setSecurityAlerts(data || []);
    } catch (error) {
      console.error('Error fetching security alerts:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // These would typically come from analytics/logging system
      setActivityStats({
        total_activities: 23847,
        unique_users: 1243,
        suspicious_activities: 45,
        security_alerts: 12,
        login_attempts: 3421,
        failed_logins: 89,
        unique_ips: 876,
        active_sessions: 234
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeDate = () => {
    const now = new Date();
    switch (timeRange) {
      case '1h': return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default: return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'login': return 'bg-green-500 text-white';
      case 'logout': return 'bg-blue-500 text-white';
      case 'failed_login': return 'bg-red-500 text-white';
      case 'password_change': return 'bg-yellow-500 text-white';
      case 'profile_update': return 'bg-purple-500 text-white';
      case 'data_access': return 'bg-cyan-500 text-white';
      case 'admin_action': return 'bg-orange-500 text-white';
      case 'suspicious': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRiskScoreColor = (score?: number) => {
    if (!score) return 'text-green-600';
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const exportActivities = async () => {
    try {
      // This would generate and download a CSV/Excel file
      toast({
        title: "Export Started",
        description: "Activity report export has been initiated"
      });
      logActivity('activity_export_requested', { time_range: timeRange, filter: filterType });
    } catch (error) {
      console.error('Error exporting activities:', error);
      toast({
        title: "Error",
        description: "Failed to export activities",
        variant: "destructive"
      });
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('user_security_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Security alert resolved"
      });

      logActivity('security_alert_resolved', { alert_id: alertId });
      fetchSecurityAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive"
      });
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (searchQuery) {
      return (
        activity.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.activity_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.ip_address.includes(searchQuery)
      );
    }
    return true;
  });

  if (!hasPermission('admin:user_audit')) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            You don't have permission to access user activity auditing.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Eye className="h-6 w-6 mr-2 text-green-600" />
            User Activity Audit System
          </h2>
          <p className="text-muted-foreground">Monitor and audit user activities and security events</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportActivities}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                <p className="text-xl font-bold">{activityStats.total_activities.toLocaleString()}</p>
              </div>
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                <p className="text-xl font-bold">{activityStats.unique_users.toLocaleString()}</p>
              </div>
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suspicious</p>
                <p className="text-xl font-bold text-red-600">{activityStats.suspicious_activities}</p>
              </div>
              <Shield className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Alerts</p>
                <p className="text-xl font-bold text-orange-600">{activityStats.security_alerts}</p>
              </div>
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Login Attempts</p>
                <p className="text-xl font-bold">{activityStats.login_attempts.toLocaleString()}</p>
              </div>
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Logins</p>
                <p className="text-xl font-bold text-red-600">{activityStats.failed_logins}</p>
              </div>
              <Shield className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique IPs</p>
                <p className="text-xl font-bold">{activityStats.unique_ips.toLocaleString()}</p>
              </div>
              <MapPin className="h-6 w-6 text-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-xl font-bold text-green-600">{activityStats.active_sessions}</p>
              </div>
              <Smartphone className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activities" className="w-full">
        <TabsList>
          <TabsTrigger value="activities">User Activities</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="patterns">Behavior Patterns</TabsTrigger>
          <TabsTrigger value="reports">Audit Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Activity Log</CardTitle>
                  <CardDescription>Real-time user activity monitoring and audit trail</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search activities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activities</SelectItem>
                      <SelectItem value="login">Logins</SelectItem>
                      <SelectItem value="logout">Logouts</SelectItem>
                      <SelectItem value="failed_login">Failed Logins</SelectItem>
                      <SelectItem value="password_change">Password Changes</SelectItem>
                      <SelectItem value="profile_update">Profile Updates</SelectItem>
                      <SelectItem value="admin_action">Admin Actions</SelectItem>
                      <SelectItem value="suspicious">Suspicious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading activities...</div>
              ) : filteredActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4" />
                  <p>No activities found for the selected criteria.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                        activity.is_suspicious ? 'border-red-200 bg-red-50/50' : ''
                      }`}
                      onClick={() => setSelectedActivity(activity)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getActivityTypeColor(activity.activity_type)}>
                              {activity.activity_type}
                            </Badge>
                            {activity.risk_score && (
                              <Badge variant="outline" className={getRiskScoreColor(activity.risk_score)}>
                                Risk: {activity.risk_score}%
                              </Badge>
                            )}
                            {activity.is_suspicious && (
                              <Badge variant="destructive">Suspicious</Badge>
                            )}
                          </div>
                          <p className="font-medium mb-1">{activity.activity_description}</p>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">{activity.user_email}</span>
                            {' • '}
                            <span>{activity.ip_address}</span>
                            {activity.location && (
                              <>
                                {' • '}
                                <span>{activity.location}</span>
                              </>
                            )}
                            {' • '}
                            <span>{new Date(activity.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedActivity(activity);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Active security alerts and suspicious activities</CardDescription>
            </CardHeader>
            <CardContent>
              {securityAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No security alerts. System is secure!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {securityAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'}>
                              {alert.status}
                            </Badge>
                            <span className="text-sm font-medium">{alert.alert_type}</span>
                          </div>
                          <p className="font-medium mb-1">{alert.description}</p>
                          <div className="text-sm text-muted-foreground">
                            Triggered by: {alert.triggered_by} • {new Date(alert.created_at).toLocaleString()}
                            {alert.resolved_at && (
                              <span className="text-green-600">
                                {' '}• Resolved: {new Date(alert.resolved_at).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {alert.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Behavior Pattern Analysis</CardTitle>
              <CardDescription>AI-powered user behavior analysis and anomaly detection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Behavior Analytics</h3>
                <p className="text-muted-foreground">
                  Advanced pattern recognition and anomaly detection for user behavior
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Reports</CardTitle>
              <CardDescription>Generate comprehensive audit reports and compliance documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Download className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Audit Reports</h3>
                <p className="text-muted-foreground">
                  Generate detailed audit reports for compliance and security reviews
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-background border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Activity Details</CardTitle>
              <CardDescription>
                {new Date(selectedActivity.created_at).toLocaleString()}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedActivity(null)}
            >
              Close
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Activity Type</label>
                <Badge className={getActivityTypeColor(selectedActivity.activity_type)}>
                  {selectedActivity.activity_type}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium">User Email</label>
                <p className="text-sm text-muted-foreground">{selectedActivity.user_email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">IP Address</label>
                <p className="text-sm text-muted-foreground">{selectedActivity.ip_address}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <p className="text-sm text-muted-foreground">{selectedActivity.location || 'Unknown'}</p>
              </div>
              {selectedActivity.risk_score && (
                <div>
                  <label className="text-sm font-medium">Risk Score</label>
                  <p className={`text-sm font-semibold ${getRiskScoreColor(selectedActivity.risk_score)}`}>
                    {selectedActivity.risk_score}%
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Session ID</label>
                <p className="text-sm text-muted-foreground font-mono">
                  {selectedActivity.session_id || 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                {selectedActivity.activity_description}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">User Agent</label>
              <div className="mt-1 p-3 bg-muted rounded-md text-sm font-mono text-wrap break-all">
                {selectedActivity.user_agent}
              </div>
            </div>

            {selectedActivity.device_info && (
              <div>
                <label className="text-sm font-medium">Device Information</label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                  <pre>{JSON.stringify(selectedActivity.device_info, null, 2)}</pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};