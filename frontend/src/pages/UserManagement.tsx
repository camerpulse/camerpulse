import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Shield, Activity, Settings, Search, Filter } from "lucide-react";
import { CamerPlayHeader } from "@/components/Layout/CamerPlayHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserData {
  id: string;
  email: string;
  role: string;
  status: string;
  last_sign_in: string;
  created_at: string;
  profile?: {
    display_name?: string;
    region?: string;
  };
}

interface UserPreferences {
  id: string;
  theme: string;
  language: string;
  notification_frequency: string;
  privacy_level: string;
  show_activity: boolean;
  show_followers: boolean;
  allow_messages: boolean;
}

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateUser, setShowCreateUser] = useState(false);

  useEffect(() => {
    fetchUsers();
    if (user) {
      fetchUserPreferences();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          profiles!inner(
            display_name,
            region
          )
        `)
        .limit(50);

      if (error) throw error;

      // Mock additional data since we don't have full user info in our schema
      const mockUsers: UserData[] = (data || []).map((item, index) => ({
        id: item.user_id,
        email: `user${index + 1}@example.com`,
        role: item.role,
        status: 'active',
        last_sign_in: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        profile: Array.isArray(item.profiles) && item.profiles.length > 0 ? item.profiles[0] : undefined
      }));

      setUsers(mockUsers);
    } catch (error) {
      toast({
        title: "Error fetching users",
        description: "Could not load user data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Mock user preferences data
      if (data) {
        setUserPreferences({
          id: data.id,
          theme: 'system',
          language: 'en',
          notification_frequency: 'daily',
          privacy_level: 'public',
          show_activity: true,
          show_followers: true,
          allow_messages: true
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        });

      if (error) throw error;

      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved successfully.",
      });

      fetchUserPreferences();
    } catch (error) {
      toast({
        title: "Error updating preferences",
        description: "Could not save your preferences.",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: "Error updating role",
        description: "Could not update user role.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profile?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'secondary';
      case 'user': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CamerPlayHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage users, roles, and preferences</p>
            </div>
            <Button onClick={() => setShowCreateUser(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Roles & Permissions
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                User Activity
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                My Preferences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Directory</CardTitle>
                  <CardDescription>View and manage all platform users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-48">
                        <Filter className="mr-2 h-4 w-4" />
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

                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No users found</div>
                    ) : (
                      filteredUsers.map((userData) => (
                        <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src="" />
                              <AvatarFallback>
                                {userData.profile?.display_name?.charAt(0) || userData.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{userData.profile?.display_name || userData.email}</p>
                              <p className="text-sm text-muted-foreground">{userData.email}</p>
                              <p className="text-xs text-muted-foreground">{userData.profile?.region}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant={getRoleBadgeColor(userData.role)}>
                              {userData.role}
                            </Badge>
                            <Select
                              value={userData.role}
                              onValueChange={(newRole: 'user' | 'admin' | 'moderator') => updateUserRole(userData.id, newRole)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-destructive" />
                      Admin
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Full system access</li>
                      <li>• User management</li>
                      <li>• Content moderation</li>
                      <li>• System configuration</li>
                      <li>• Analytics access</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-secondary" />
                      Moderator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Content moderation</li>
                      <li>• User reports review</li>
                      <li>• Forum management</li>
                      <li>• Basic analytics</li>
                      <li>• Community guidelines</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Content creation</li>
                      <li>• Profile management</li>
                      <li>• Community participation</li>
                      <li>• Basic features access</li>
                      <li>• Personal analytics</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent User Activity</CardTitle>
                  <CardDescription>System-wide user engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground">Total Users</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">856</div>
                        <p className="text-xs text-muted-foreground">Active Today</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">42</div>
                        <p className="text-xs text-muted-foreground">New This Week</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">96.2%</div>
                        <p className="text-xs text-muted-foreground">Retention Rate</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Preferences</CardTitle>
                  <CardDescription>Customize your platform experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="theme">Theme</Label>
                        <Select
                          value={userPreferences?.theme || 'system'}
                          onValueChange={(value) => updateUserPreferences({ theme: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={userPreferences?.language || 'en'}
                          onValueChange={(value) => updateUserPreferences({ language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="notifications">Notification Frequency</Label>
                        <Select
                          value={userPreferences?.notification_frequency || 'daily'}
                          onValueChange={(value) => updateUserPreferences({ notification_frequency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show_activity">Show Activity</Label>
                        <Switch
                          id="show_activity"
                          checked={userPreferences?.show_activity || true}
                          onCheckedChange={(checked) => updateUserPreferences({ show_activity: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="show_followers">Show Followers</Label>
                        <Switch
                          id="show_followers"
                          checked={userPreferences?.show_followers || true}
                          onCheckedChange={(checked) => updateUserPreferences({ show_followers: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow_messages">Allow Messages</Label>
                        <Switch
                          id="allow_messages"
                          checked={userPreferences?.allow_messages || true}
                          onCheckedChange={(checked) => updateUserPreferences({ allow_messages: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;