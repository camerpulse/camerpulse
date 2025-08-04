import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Users, UserPlus, UserMinus, Shield, AlertTriangle, CheckCircle, 
  XCircle, Clock, Eye, Activity, Smartphone, TrendingUp, FileText,
  Mail, Phone, MapPin, Globe, Calendar, Star, BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserManagementModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const UserManagementModule: React.FC<UserManagementModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch comprehensive user data with all related tables
  const { data: userProfiles, isLoading } = useQuery({
    queryKey: ['user-profiles-comprehensive', searchTerm, statusFilter, roleFilter],
    queryFn: async () => {
      let query = supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles(role),
          user_profile_extensions(*),
          user_engagement_metrics(
            engagement_score,
            login_count,
            actions_performed,
            content_created
          ),
          user_devices(
            device_name,
            device_type,
            last_used_at,
            is_trusted
          )
        `);

      if (searchTerm) {
        query = query.or(`display_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: hasPermission('users')
  });

  // Fetch comprehensive user statistics
  const { data: userStats } = useQuery({
    queryKey: ['user-stats-comprehensive'],
    queryFn: async () => {
      const [
        totalUsers, activeUsers, newUsers, adminUsers, 
        pendingVerifications, failedLogins, engagementData
      ] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact' }),
        supabase.from('user_profiles').select('id', { count: 'exact' }).gte('last_seen_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_profiles').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_roles').select('user_id', { count: 'exact' }).eq('role', 'admin'),
        supabase.from('profile_verification_queue').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('failed_login_attempts').select('id', { count: 'exact' }).gte('attempt_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_engagement_metrics').select('engagement_score').gte('metric_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const avgEngagement = engagementData.data?.length > 0 
        ? engagementData.data.reduce((acc, curr) => acc + (curr.engagement_score || 0), 0) / engagementData.data.length 
        : 0;

      return {
        total: totalUsers.count || 0,
        active: activeUsers.count || 0,
        newThisWeek: newUsers.count || 0,
        admins: adminUsers.count || 0,
        pendingVerifications: pendingVerifications.count || 0,
        failedLogins: failedLogins.count || 0,
        avgEngagement: Math.round(avgEngagement * 100) / 100
      };
    }
  });

  // Enhanced mutations for comprehensive user management
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role, reason }: { userId: string; role: string; reason?: string }) => {
      // Get current role
      const { data: currentRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      // Update role
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: role as any });
      if (error) throw error;

      // Log role change
      await supabase.from('role_change_audit').insert({
        target_user: userId,
        old_role: currentRole?.role || null,
        new_role: role,
        changed_by: (await supabase.auth.getUser()).data.user?.id,
        reason: reason || 'Admin update'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles-comprehensive'] });
      toast({ title: "User role updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update user role", variant: "destructive" });
    }
  });

  const suspendUser = useMutation({
    mutationFn: async (userId: string) => {
      // Note: user_profiles table doesn't have status field in current schema
      // This would need to be implemented when we add status field to profiles
      console.log('Suspend user functionality would suspend:', userId);
      // For now, just log the action
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles-comprehensive'] });
      toast({ title: "User suspension logged (feature pending)" });
    }
  });

  const approveVerification = useMutation({
    mutationFn: async (verificationId: string) => {
      const { error } = await supabase
        .from('profile_verification_queue')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', verificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-queue'] });
      toast({ title: "Verification approved successfully" });
    }
  });

  // Fetch verification queue
  const { data: verificationQueue } = useQuery({
    queryKey: ['verification-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_verification_queue')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: hasPermission('users')
  });

  // Fetch failed login attempts
  const { data: failedLogins } = useQuery({
    queryKey: ['failed-login-attempts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('failed_login_attempts')
        .select('*')
        .gte('attempt_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('attempt_time', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: hasPermission('users')
  });

  const filteredUsers = userProfiles?.filter(user => {
    // Note: status filtering disabled until status field is added to user_profiles
    if (roleFilter !== 'all') {
      const userRole = Array.isArray(user.user_roles) && user.user_roles.length > 0 ? user.user_roles[0].role : null;
      if (userRole !== roleFilter) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Enhanced User Management"
        description="Comprehensive user management with verification, security, and analytics"
        icon={Users}
        iconColor="text-blue-600"
        searchPlaceholder="Search users by name or email..."
        onSearch={setSearchTerm}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['user-profiles-comprehensive'] });
          logActivity('user_management_refresh', { timestamp: new Date() });
        }}
      />

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.active || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.newThisWeek || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.admins || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.pendingVerifications || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins (24h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.failedLogins || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.avgEngagement || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quick User Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Users ({filteredUsers?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div>Loading users...</div>
                ) : (
                  filteredUsers?.slice(0, 5).map((user) => (
                    <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={user.profile_picture_url || ''} />
                          <AvatarFallback>
                            {user.display_name?.slice(0, 2)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{user.display_name || 'Unknown User'}</h3>
                          <p className="text-sm text-muted-foreground">{user.display_name}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="default">
                              Active
                            </Badge>
                            {Array.isArray(user.user_roles) && user.user_roles.length > 0 && (
                              <Badge variant="secondary">
                                {user.user_roles[0].role}
                              </Badge>
                            )}
                            {Array.isArray(user.user_profile_extensions) && user.user_profile_extensions.length > 0 && user.user_profile_extensions[0].verification_status === 'verified' && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {/* Full Users List */}
          <Card>
            <CardHeader>
              <CardTitle>All Users ({filteredUsers?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div>Loading users...</div>
                ) : (
                  filteredUsers?.map((user) => (
                    <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={user.profile_picture_url || ''} />
                          <AvatarFallback>
                            {user.display_name?.slice(0, 2)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{user.display_name || 'Unknown User'}</h3>
                          <p className="text-sm text-muted-foreground">{user.display_name}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="default">
                              Active
                            </Badge>
                            {Array.isArray(user.user_roles) && user.user_roles.length > 0 && (
                              <Badge variant="secondary">
                                {user.user_roles[0].role}
                              </Badge>
                            )}
                            {Array.isArray(user.user_engagement_metrics) && user.user_engagement_metrics.length > 0 && (
                              <Badge variant="outline">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {user.user_engagement_metrics[0].engagement_score || 0}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Select
                          value={Array.isArray(user.user_roles) && user.user_roles.length > 0 ? user.user_roles[0].role : 'user'}
                          onValueChange={(role) => updateUserRole.mutate({ userId: user.user_id, role })}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => suspendUser.mutate(user.user_id)}
                          className="text-red-600"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          {/* Verification Queue */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Verifications ({verificationQueue?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {verificationQueue?.map((verification) => (
                  <div key={verification.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">User Verification</h3>
                        <p className="text-sm text-muted-foreground">{verification.user_id}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{verification.verification_type}</Badge>
                          <Badge variant="secondary">normal</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => approveVerification.mutate(verification.id)}
                        className="text-green-600"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {/* Security Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle>Failed Login Attempts (Last 24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {failedLogins?.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{attempt.email}</h3>
                      <p className="text-sm text-muted-foreground">
                        IP: {String(attempt.ip_address)} | Reason: {attempt.reason}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Time: {new Date(attempt.attempt_time).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* User Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>User Engagement Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Comprehensive analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          {/* Device Management */}
          <Card>
            <CardHeader>
              <CardTitle>User Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Device management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Detail Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>User Details: {selectedUser.display_name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Profile Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {selectedUser.display_name}</p>
                  <p><strong>Status:</strong> Active</p>
                  <p><strong>Role:</strong> {Array.isArray(selectedUser.user_roles) && selectedUser.user_roles.length > 0 ? selectedUser.user_roles[0].role : 'user'}</p>
                  <p><strong>Created:</strong> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Extended Profile</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Verification:</strong> {Array.isArray(selectedUser.user_profile_extensions) && selectedUser.user_profile_extensions.length > 0 ? selectedUser.user_profile_extensions[0].verification_status : 'unverified'}</p>
                  <p><strong>Completion:</strong> {Array.isArray(selectedUser.user_profile_extensions) && selectedUser.user_profile_extensions.length > 0 ? selectedUser.user_profile_extensions[0].profile_completion_score : 0}%</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};