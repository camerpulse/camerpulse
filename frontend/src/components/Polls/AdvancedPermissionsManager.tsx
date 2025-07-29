import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Shield, 
  Users, 
  Key, 
  Settings, 
  Plus,
  Trash2,
  Edit,
  Lock,
  Unlock,
  Crown,
  User,
  UserCheck,
  UserX,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource_type: string;
  actions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system_role: boolean;
  user_count: number;
  created_at: string;
}

interface UserRoleAssignment {
  user_id: string;
  user_email: string;
  user_name: string;
  roles: string[];
  last_active: string;
  is_active: boolean;
}

const PREDEFINED_PERMISSIONS: Omit<Permission, 'id'>[] = [
  {
    name: 'poll.create',
    description: 'Create new polls',
    category: 'Content Creation',
    resource_type: 'poll',
    actions: ['create']
  },
  {
    name: 'poll.edit',
    description: 'Edit existing polls',
    category: 'Content Management',
    resource_type: 'poll',
    actions: ['update']
  },
  {
    name: 'poll.delete',
    description: 'Delete polls',
    category: 'Content Management',
    resource_type: 'poll',
    actions: ['delete']
  },
  {
    name: 'poll.moderate',
    description: 'Moderate poll content and comments',
    category: 'Moderation',
    resource_type: 'poll',
    actions: ['moderate', 'flag', 'review']
  },
  {
    name: 'analytics.view',
    description: 'View poll analytics and reports',
    category: 'Analytics',
    resource_type: 'analytics',
    actions: ['read']
  },
  {
    name: 'analytics.export',
    description: 'Export analytics data',
    category: 'Analytics',
    resource_type: 'analytics',
    actions: ['export']
  },
  {
    name: 'user.manage',
    description: 'Manage user accounts and roles',
    category: 'User Management',
    resource_type: 'user',
    actions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'system.admin',
    description: 'Full system administration access',
    category: 'System',
    resource_type: 'system',
    actions: ['*']
  }
];

const PREDEFINED_ROLES: Omit<Role, 'id' | 'user_count' | 'created_at'>[] = [
  {
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: ['system.admin'],
    is_system_role: true
  },
  {
    name: 'Poll Manager',
    description: 'Can create, edit, and manage polls',
    permissions: ['poll.create', 'poll.edit', 'poll.delete', 'analytics.view'],
    is_system_role: true
  },
  {
    name: 'Moderator',
    description: 'Can moderate content and view analytics',
    permissions: ['poll.moderate', 'analytics.view'],
    is_system_role: true
  },
  {
    name: 'Analyst',
    description: 'Can view and export analytics data',
    permissions: ['analytics.view', 'analytics.export'],
    is_system_role: true
  },
  {
    name: 'Basic User',
    description: 'Can create and vote in polls',
    permissions: ['poll.create'],
    is_system_role: true
  }
];

export const AdvancedPermissionsManager: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userAssignments, setUserAssignments] = useState<UserRoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showAssignRole, setShowAssignRole] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    loadPermissionsData();
  }, []);

  const loadPermissionsData = async () => {
    try {
      setLoading(true);
      
      // Mock data for permissions
      const mockPermissions: Permission[] = PREDEFINED_PERMISSIONS.map((perm, index) => ({
        ...perm,
        id: `perm_${index}`
      }));
      
      // Mock data for roles
      const mockRoles: Role[] = PREDEFINED_ROLES.map((role, index) => ({
        ...role,
        id: `role_${index}`,
        user_count: Math.floor(Math.random() * 50) + 1,
        created_at: new Date().toISOString()
      }));
      
      // Mock user assignments
      const mockUserAssignments: UserRoleAssignment[] = [
        {
          user_id: 'user_1',
          user_email: 'admin@camerpulse.com',
          user_name: 'System Admin',
          roles: ['role_0'], // Super Admin
          last_active: new Date().toISOString(),
          is_active: true
        },
        {
          user_id: 'user_2',
          user_email: 'moderator@camerpulse.com',
          user_name: 'Content Moderator',
          roles: ['role_2'], // Moderator
          last_active: new Date(Date.now() - 86400000).toISOString(),
          is_active: true
        },
        {
          user_id: 'user_3',
          user_email: 'analyst@camerpulse.com',
          user_name: 'Data Analyst',
          roles: ['role_3'], // Analyst
          last_active: new Date(Date.now() - 172800000).toISOString(),
          is_active: true
        }
      ];
      
      setPermissions(mockPermissions);
      setRoles(mockRoles);
      setUserAssignments(mockUserAssignments);
      
    } catch (error) {
      console.error('Error loading permissions data:', error);
      toast.error('Failed to load permissions data');
    } finally {
      setLoading(false);
    }
  };

  const createRole = async () => {
    try {
      // In real implementation, this would create a role in the database
      const roleId = `role_${Date.now()}`;
      const newRoleData: Role = {
        id: roleId,
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
        is_system_role: false,
        user_count: 0,
        created_at: new Date().toISOString()
      };
      
      setRoles([...roles, newRoleData]);
      setNewRole({ name: '', description: '', permissions: [] });
      setShowCreateRole(false);
      toast.success('Role created successfully');
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Failed to create role');
    }
  };

  const togglePermissionForRole = (roleId: string, permissionId: string) => {
    setRoles(roles.map(role => {
      if (role.id === roleId) {
        const hasPermission = role.permissions.includes(permissionId);
        return {
          ...role,
          permissions: hasPermission
            ? role.permissions.filter(p => p !== permissionId)
            : [...role.permissions, permissionId]
        };
      }
      return role;
    }));
  };

  const assignRoleToUser = async (userId: string, roleId: string) => {
    try {
      // In real implementation, this would update the database
      setUserAssignments(userAssignments.map(assignment => {
        if (assignment.user_id === userId) {
          return {
            ...assignment,
            roles: assignment.roles.includes(roleId)
              ? assignment.roles.filter(r => r !== roleId)
              : [...assignment.roles, roleId]
          };
        }
        return assignment;
      }));
      
      toast.success('Role assignment updated');
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    }
  };

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  const getRolePermissions = (roleId: string): Permission[] => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return [];
    
    return permissions.filter(permission => 
      role.permissions.includes(permission.id) || role.permissions.includes('system.admin')
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const permissionCategories = getPermissionsByCategory();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Advanced Permissions Manager</h2>
        <p className="text-muted-foreground">
          Manage roles, permissions, and user access controls with enterprise-grade security
        </p>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="users">User Assignments</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          {/* Create Role Dialog */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">System Roles</h3>
            <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Define a new role with specific permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="roleName">Role Name</Label>
                      <Input
                        id="roleName"
                        value={newRole.name}
                        onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                        placeholder="Content Manager"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="roleDescription">Description</Label>
                    <Textarea
                      id="roleDescription"
                      value={newRole.description}
                      onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                      placeholder="Describe what this role can do..."
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Permissions</Label>
                    {Object.entries(permissionCategories).map(([category, perms]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium text-sm">{category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {perms.map(permission => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={permission.id}
                                checked={newRole.permissions.includes(permission.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setNewRole({
                                      ...newRole,
                                      permissions: [...newRole.permissions, permission.id]
                                    });
                                  } else {
                                    setNewRole({
                                      ...newRole,
                                      permissions: newRole.permissions.filter(p => p !== permission.id)
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor={permission.id} className="text-sm">
                                {permission.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateRole(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createRole} disabled={!newRole.name}>
                    Create Role
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map(role => {
              const rolePermissions = getRolePermissions(role.id);
              
              return (
                <Card key={role.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        {role.is_system_role && (
                          <Badge variant="secondary">System</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!role.is_system_role && (
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Users with this role:</span>
                        <Badge variant="outline">{role.user_count}</Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Permissions ({rolePermissions.length})</h4>
                        <div className="flex flex-wrap gap-1">
                          {rolePermissions.slice(0, 3).map(permission => (
                            <Badge key={permission.id} variant="outline" className="text-xs">
                              {permission.name}
                            </Badge>
                          ))}
                          {rolePermissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{rolePermissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <h3 className="text-lg font-semibold">System Permissions</h3>
          
          {Object.entries(permissionCategories).map(([category, perms]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {perms.map(permission => (
                    <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="font-medium">{permission.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                        <div className="flex gap-1 mt-1">
                          {permission.actions.map(action => (
                            <Badge key={action} variant="secondary" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {roles.filter(role => role.permissions.includes(permission.id)).length} roles
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">User Role Assignments</h3>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Assign Roles
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {userAssignments.map(assignment => {
                  const userRoles = assignment.roles.map(roleId => 
                    roles.find(role => role.id === roleId)
                  ).filter(Boolean);
                  
                  return (
                    <div key={assignment.user_id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{assignment.user_name}</div>
                          <div className="text-sm text-muted-foreground">{assignment.user_email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex flex-wrap gap-1">
                          {userRoles.map(role => (
                            <Badge key={role!.id} variant="default" className="text-xs">
                              {role!.name}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={assignment.is_active ? "default" : "destructive"} className="text-xs">
                            {assignment.is_active ? "Active" : "Inactive"}
                          </Badge>
                          
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <h3 className="text-lg font-semibold">Permission Audit Log</h3>
          
          <Card>
            <CardContent className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h4 className="text-lg font-semibold mb-2">Audit Log Coming Soon</h4>
              <p className="text-muted-foreground">
                Track all permission changes, role assignments, and security events
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};