import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Users, 
  Eye, 
  Edit,
  Crown,
  UserCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

type UserRole = 'admin' | 'moderator' | 'verified_politician' | 'user';

interface UserWithRole {
  id: string;
  email: string;
  display_name: string;
  username: string;
  role?: UserRole;
  granted_at?: string;
  granted_by?: string;
}

interface RolePermissions {
  [key: string]: {
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    permissions: string[];
  };
}

const rolePermissions: RolePermissions = {
  admin: {
    name: 'Administrator',
    description: 'Full system access and control',
    icon: <Crown className="h-4 w-4" />,
    color: 'bg-red-500 text-white',
    permissions: [
      'Manage all users and roles',
      'Access admin dashboard',
      'Manage CamerPulse Intelligence',
      'Handle civic alerts',
      'Access security logs',
      'Manage system settings'
    ]
  },
  moderator: {
    name: 'Moderator',
    description: 'Content moderation and user management',
    icon: <Shield className="h-4 w-4" />,
    color: 'bg-orange-500 text-white',
    permissions: [
      'Moderate content',
      'Handle user reports',
      'Manage civic alerts',
      'Access analytics',
      'Manage polls and discussions'
    ]
  },
  verified_politician: {
    name: 'Verified Politician',
    description: 'Verified political figure',
    icon: <UserCheck className="h-4 w-4" />,
    color: 'bg-blue-500 text-white',
    permissions: [
      'Update political profile',
      'Access politician dashboard',
      'Manage political content',
      'View analytics'
    ]
  },
  user: {
    name: 'User',
    description: 'Standard user access',
    icon: <Users className="h-4 w-4" />,
    color: 'bg-gray-500 text-white',
    permissions: [
      'View content',
      'Create posts',
      'Vote in polls',
      'Send messages'
    ]
  }
};

export const RoleControlSystem: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCurrentUserRole();
      fetchUsersWithRoles();
    }
  }, [user]);

  const fetchCurrentUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();
      
      if (data) {
        setCurrentUserRole(data.role as UserRole);
      }
    } catch (error) {
      console.error('Error fetching current user role:', error);
    }
  };

  const fetchUsersWithRoles = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles with their auth data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          username,
          display_name,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          granted_at,
          granted_by
        `);

      if (rolesError) throw rolesError;

      // Get auth users for email
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      // Combine the data
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const authUser = authUsers?.users?.find((au: any) => au.id === profile.user_id);
        const userRole = (roles || []).find((r: any) => r.user_id === profile.user_id);
        
        return {
          id: profile.user_id,
          email: authUser?.email || 'No email',
          display_name: profile.display_name || profile.username,
          username: profile.username,
          role: userRole?.role as UserRole,
          granted_at: userRole?.granted_at,
          granted_by: userRole?.granted_by
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users with roles:', error);
      toast({
        title: "Error",
        description: "Failed to load users and roles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role,
          granted_by: user?.id,
          granted_at: new Date().toISOString()
        });

      if (error) throw error;

      // Log security event
      await supabase.rpc('log_security_event', {
        p_user_id: user?.id,
        p_event_type: 'role_assigned',
        p_severity: 'info',
        p_metadata: { target_user: userId, role }
      });

      await fetchUsersWithRoles();
      setShowRoleDialog(false);
      setSelectedUser(null);

      toast({
        title: "Role Assigned",
        description: `Successfully assigned ${rolePermissions[role].name} role`
      });

    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive"
      });
    }
  };

  const removeRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      // Log security event
      await supabase.rpc('log_security_event', {
        p_user_id: user?.id,
        p_event_type: 'role_removed',
        p_severity: 'warning',
        p_metadata: { target_user: userId }
      });

      await fetchUsersWithRoles();

      toast({
        title: "Role Removed",
        description: "User role has been removed"
      });

    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManageRoles = currentUserRole === 'admin';

  if (!user || !canManageRoles) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            You need administrator privileges to access role management.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Management System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(rolePermissions).map(([roleKey, role]) => (
              <Card key={roleKey} className="border-l-4" style={{ borderLeftColor: role.color.split(' ')[0].replace('bg-', '') }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {role.icon}
                    <h4 className="font-semibold">{role.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                  <div className="space-y-1">
                    {role.permissions.slice(0, 3).map((permission, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{permission}</span>
                      </div>
                    ))}
                    {role.permissions.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{role.permissions.length - 3} more permissions
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Role Assignment
            </div>
            <Badge variant="outline">
              {users.length} Users
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search users by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p>No users found</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <Card key={user.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-semibold">{user.display_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                @{user.username} • {user.email}
                              </p>
                            </div>
                          </div>
                          {user.role && (
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={rolePermissions[user.role].color}>
                                {rolePermissions[user.role].icon}
                                <span className="ml-1">{rolePermissions[user.role].name}</span>
                              </Badge>
                              {user.granted_at && (
                                <span className="text-xs text-muted-foreground">
                                  Granted {new Date(user.granted_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Dialog open={showRoleDialog && selectedUser?.id === user.id} onOpenChange={setShowRoleDialog}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setSelectedRole(user.role || 'user');
                                  setShowRoleDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                {user.role ? 'Change Role' : 'Assign Role'}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  {user.role ? 'Change Role' : 'Assign Role'} for {user.display_name}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(rolePermissions).map(([roleKey, role]) => (
                                      <SelectItem key={roleKey} value={roleKey}>
                                        <div className="flex items-center gap-2">
                                          {role.icon}
                                          <span>{role.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                                <div className="border rounded-lg p-3 bg-muted/20">
                                  <h4 className="font-semibold mb-2">Permissions for {rolePermissions[selectedRole].name}:</h4>
                                  <div className="space-y-1">
                                    {rolePermissions[selectedRole].permissions.map((permission, index) => (
                                      <div key={index} className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                        <span>{permission}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => assignRole(user.id, selectedRole)}
                                    className="flex-1"
                                  >
                                    {user.role ? 'Update Role' : 'Assign Role'}
                                  </Button>
                                  {user.role && (
                                    <Button
                                      variant="destructive"
                                      onClick={() => removeRole(user.id)}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Remove Role
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};