import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Activity, TrendingUp, Users, FileText, AlertTriangle, CheckCircle,
  Clock, DollarSign, BarChart3, Eye, Edit, Trash2
} from 'lucide-react';

interface PlatformStats {
  totalTenders: number;
  activeTenders: number;
  totalBids: number;
  totalUsers: number;
  pendingApprovals: number;
  totalValue: number;
}

export const TenderPlatformDashboard: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch platform statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['platform_stats'],
    queryFn: async (): Promise<PlatformStats> => {
      const [tendersRes, bidsRes, usersRes, contractsRes] = await Promise.all([
        supabase.from('tenders').select('id, tender_value, status', { count: 'exact' }),
        supabase.from('bids').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('contracts').select('contract_value')
      ]);

      const totalValue = contractsRes.data?.reduce((sum, contract) => sum + (contract.contract_value || 0), 0) || 0;
      const activeTenders = tendersRes.data?.filter(t => t.status === 'open').length || 0;
      const pendingApprovals = tendersRes.data?.filter(t => t.status === 'draft').length || 0;

      return {
        totalTenders: tendersRes.count || 0,
        activeTenders,
        totalBids: bidsRes.count || 0,
        totalUsers: usersRes.count || 0,
        pendingApprovals,
        totalValue
      };
    },
    refetchInterval: 30000,
  });

  // Fetch recent activities
  const { data: recentActivities } = useQuery({
    queryKey: ['recent_activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenders')
        .select('id, title, created_at, status, created_by')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch pending tenders for approval
  const { data: pendingTenders } = useQuery({
    queryKey: ['pending_tenders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenders')
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const statCards = [
    {
      title: "Total Tenders",
      value: stats?.totalTenders || 0,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Active Tenders",
      value: stats?.activeTenders || 0,
      icon: Activity,
      color: "text-green-600",
    },
    {
      title: "Total Bids",
      value: stats?.totalBids || 0,
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Platform Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-orange-600",
    },
    {
      title: "Pending Approvals",
      value: stats?.pendingApprovals || 0,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Total Contract Value",
      value: `$${((stats?.totalValue || 0) / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: "text-green-600",
    },
  ];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Platform Dashboard</h2>
          <p className="text-muted-foreground">Monitor and manage your tender platform</p>
        </div>
        <Button>
          <BarChart3 className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Platform performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>System Uptime</span>
                    <span className="text-green-600">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database Health</span>
                    <span className="text-green-600">Excellent</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Usage</span>
                    <span className="text-yellow-600">67%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Review Tenders
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Tender Approvals</CardTitle>
              <CardDescription>Tenders waiting for admin approval</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingTenders?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No pending tenders for approval
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingTenders?.map((tender) => (
                    <div key={tender.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{tender.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Budget: ${tender.budget?.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {new Date(tender.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button size="sm" variant="default">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Platform Activity</CardTitle>
              <CardDescription>Latest actions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities?.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 border-l-2 border-primary">
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={activity.status === 'open' ? 'default' : 'secondary'}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};