import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Shield, Search, UserCheck, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  user_roles?: {
    role: string;
  };
  profiles?: {
    username: string;
    display_name?: string;
  };
}

const ROLES = [
  { value: 'admin', label: 'Administrator', description: 'Full system access and management capabilities' },
  { value: 'moderator', label: 'Moderator', description: 'Content moderation and user management' },
  { value: 'user', label: 'Standard User', description: 'Basic platform access' }
];

export const RoleManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, searchTerm, roleFilter]);

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    setIsAdmin(!!data && !error);
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all profiles first
      let query = supabase
        .from('profiles')
        .select('user_id, username, display_name');

      if (searchTerm) {
        query = query.or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`);
      }

      const { data: profileData, error: profileError } = await query;
      if (profileError) throw profileError;

      // Get roles for each user
      const usersWithAuth: User[] = [];
      
      for (const profile of profileData || []) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.user_id)
          .single();

        // Filter by role if specified
        if (roleFilter !== 'all' && (!roleData || roleData.role !== roleFilter)) {
          continue;
        }

        usersWithAuth.push({
          id: profile.user_id,
          email: 'Email not available', // We can't access auth emails easily
          user_roles: roleData ? { role: roleData.role } : { role: 'user' },
          profiles: {
            username: profile.username,
            display_name: profile.display_name
          }
        });
      }

      setUsers(usersWithAuth);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole as any });

      if (error) throw error;

      toast({
        title: 'Role Updated',
        description: `User role has been updated to ${newRole}`,
      });

      await fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <AlertCircle className="h-8 w-8 mr-3 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access the role management system
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Only administrators can manage user roles and permissions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Shield className="h-8 w-8 mr-3 text-primary" />
          Role Management
        </h1>
        <p className="text-muted-foreground">Manage user roles and permissions across the platform</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Roles</CardTitle>
            <CardDescription>Overview of all available roles and their permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ROLES.map(role => (
                <div key={role.value} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{role.label}</h3>
                    <Badge variant={getRoleBadgeVariant(role.value)}>
                      {role.value}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Management
            </CardTitle>
            <CardDescription>Search and manage user roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by username or display name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users found matching your criteria.</p>
                  </div>
                ) : (
                  users.map(userData => (
                    <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <UserCheck className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {userData.profiles?.display_name || userData.profiles?.username || 'Unknown User'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              @{userData.profiles?.username} • {userData.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getRoleBadgeVariant(userData.user_roles?.role || 'user')}>
                          {userData.user_roles?.role || 'user'}
                        </Badge>
                        <Select
                          value={userData.user_roles?.role || 'user'}
                          onValueChange={(value) => handleRoleChange(userData.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map(role => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};