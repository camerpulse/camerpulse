import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Users, Flag, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  activeModerations: number;
  flaggedContent: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

interface ModerationItem {
  id: string;
  type: 'post' | 'comment' | 'user';
  content: string;
  reporter: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeModerations: 0,
    flaggedContent: 0,
    systemHealth: 'good'
  });
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Load admin statistics
      const { data: users } = await supabase.from('profiles').select('id');
      const { data: moderations } = await supabase
        .from('content_moderation_queue')
        .select('*')
        .eq('status', 'pending');

      setStats({
        totalUsers: users?.length || 0,
        activeModerations: moderations?.length || 0,
        flaggedContent: moderations?.length || 0,
        systemHealth: (moderations?.length || 0) > 10 ? 'warning' : 'good'
      });

      setModerationQueue(moderations?.map(item => ({
        id: item.id,
        type: item.content_type,
        content: item.content,
        reporter: item.reported_by,
        reason: item.reason,
        status: item.status,
        createdAt: item.created_at
      })) || []);

    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (itemId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('content_moderation_queue')
        .update({ status: action === 'approve' ? 'approved' : 'rejected' })
        .eq('id', itemId);

      if (error) throw error;

      setModerationQueue(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Success",
        description: `Content ${action}d successfully`
      });
    } catch (error) {
      console.error('Moderation action failed:', error);
      toast({
        title: "Error",
        description: "Failed to process moderation action",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage platform content</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Moderations</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeModerations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flaggedContent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={stats.systemHealth === 'good' ? 'default' : 'destructive'}>
                {stats.systemHealth}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="moderation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Queue</CardTitle>
              <CardDescription>
                Review and moderate flagged content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moderationQueue.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-semibold">All clear!</p>
                    <p className="text-muted-foreground">No items in the moderation queue</p>
                  </div>
                ) : (
                  moderationQueue.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Reported by {item.reporter}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div>
                        <p className="font-medium mb-1">Reason: {item.reason}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.content}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleModerationAction(item.id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleModerationAction(item.id, 'reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">User management tools will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>View platform usage and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics dashboard will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};