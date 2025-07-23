import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Shield, ShieldAlert, UserX, MessageSquare, Flag, Eye, Clock,
  Search, Filter, MoreHorizontal, Ban, CheckCircle, AlertTriangle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  created_at: string;
  last_sign_in_at?: string;
  is_active: boolean;
  banned_at?: string;
  ban_reason?: string;
}

interface Report {
  id: string;
  reported_user_id: string;
  reporter_id: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  user?: User;
  reporter?: User;
}

export const UserModerationTools: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [moderationNote, setModerationNote] = useState('');

  // Fetch users with search
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['moderation_users', searchTerm],
    queryFn: async (): Promise<User[]> => {
      let query = supabase
        .from('profiles')
        .select('id, user_id, username, display_name, created_at, is_active, banned_at, ban_reason')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      return data?.map(profile => ({
        id: profile.user_id,
        email: '', // We don't have access to email from profiles
        username: profile.username,
        display_name: profile.display_name,
        created_at: profile.created_at,
        is_active: profile.is_active,
        banned_at: profile.banned_at,
        ban_reason: profile.ban_reason
      })) || [];
    },
  });

  // Fetch user reports
  const { data: reports } = useQuery({
    queryKey: ['user_reports'],
    queryFn: async (): Promise<Report[]> => {
      const { data, error } = await supabase
        .from('user_reports')
        .select(`
          *,
          reported_user:profiles!user_reports_reported_user_id_fkey(username, display_name),
          reporter:profiles!user_reports_reporter_id_fkey(username, display_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: false,
          banned_at: new Date().toISOString(),
          ban_reason: reason
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Log moderation action
      await supabase.from('moderation_actions').insert({
        moderator_id: (await supabase.auth.getUser()).data.user?.id,
        target_user_id: userId,
        action_type: 'ban_user',
        reason: reason,
        notes: moderationNote
      });
    },
    onSuccess: () => {
      toast({
        title: "User Banned",
        description: "The user has been successfully banned.",
      });
      queryClient.invalidateQueries({ queryKey: ['moderation_users'] });
      setSelectedUser(null);
      setBanReason('');
      setModerationNote('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to ban user.",
        variant: "destructive",
      });
      console.error('Ban user error:', error);
    },
  });

  // Unban user mutation
  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: true,
          banned_at: null,
          ban_reason: null
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Log moderation action
      await supabase.from('moderation_actions').insert({
        moderator_id: (await supabase.auth.getUser()).data.user?.id,
        target_user_id: userId,
        action_type: 'unban_user',
        notes: 'User unbanned by moderator'
      });
    },
    onSuccess: () => {
      toast({
        title: "User Unbanned",
        description: "The user has been successfully unbanned.",
      });
      queryClient.invalidateQueries({ queryKey: ['moderation_users'] });
    },
  });

  // Resolve report mutation
  const resolveReportMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: 'resolved' | 'dismissed' }) => {
      const { error } = await supabase
        .from('user_reports')
        .update({ status, resolved_at: new Date().toISOString() })
        .eq('id', reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Report Updated",
        description: "The report has been processed.",
      });
      queryClient.invalidateQueries({ queryKey: ['user_reports'] });
    },
  });

  const handleBanUser = () => {
    if (!selectedUser || !banReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a reason for banning.",
        variant: "destructive",
      });
      return;
    }
    banUserMutation.mutate({ userId: selectedUser.id, reason: banReason });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Moderation</h2>
          <p className="text-muted-foreground">Manage users and review reports</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">
            Reports
            {reports && reports.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {reports.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="actions">Moderation Log</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Search and moderate platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search users by username or display name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {users?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{user.display_name || user.username || 'Anonymous'}</h4>
                          {user.banned_at && (
                            <Badge variant="destructive">Banned</Badge>
                          )}
                          {!user.is_active && !user.banned_at && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          @{user.username} • Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                        {user.ban_reason && (
                          <p className="text-sm text-destructive">Reason: {user.ban_reason}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {user.banned_at ? (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => unbanUserMutation.mutate(user.id)}
                            disabled={unbanUserMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Unban
                          </Button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Ban
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Ban User</DialogTitle>
                                <DialogDescription>
                                  This will prevent the user from accessing the platform.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Reason for ban</label>
                                  <Input
                                    placeholder="Enter reason for banning this user..."
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Additional notes</label>
                                  <Textarea
                                    placeholder="Optional additional details..."
                                    value={moderationNote}
                                    onChange={(e) => setModerationNote(e.target.value)}
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <DialogTrigger asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogTrigger>
                                  <Button 
                                    variant="destructive" 
                                    onClick={handleBanUser}
                                    disabled={banUserMutation.isPending}
                                  >
                                    Ban User
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>Review and resolve user reports</CardDescription>
            </CardHeader>
            <CardContent>
              {reports?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No pending reports
                </p>
              ) : (
                <div className="space-y-4">
                  {reports?.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Flag className="h-4 w-4 text-destructive" />
                            <span className="font-medium">Report #{report.id.slice(0, 8)}</span>
                            <Badge variant="outline">{report.reason}</Badge>
                          </div>
                          <p className="text-sm mb-2">{report.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Reported by @{report.reporter?.username} • {new Date(report.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => resolveReportMutation.mutate({ reportId: report.id, status: 'dismissed' })}
                          >
                            Dismiss
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => resolveReportMutation.mutate({ reportId: report.id, status: 'resolved' })}
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Log</CardTitle>
              <CardDescription>History of all moderation actions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Moderation log will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};