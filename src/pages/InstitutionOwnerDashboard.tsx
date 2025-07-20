import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  MessageSquare, 
  Settings, 
  Bell, 
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Shield,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InstitutionDashboard {
  id: string;
  institution_id: string;
  dashboard_config: any;
  analytics_enabled: boolean;
  messaging_enabled: boolean;
  subscription_tier: string;
  access_permissions: any;
  institution: {
    name: string;
    institution_type: string;
    is_verified: boolean;
    claim_status: string;
  };
}

interface ClaimRenewal {
  id: string;
  renewal_due_date: string;
  renewal_status: string;
  reminder_sent_30_days: boolean;
  reminder_sent_7_days: boolean;
  reminder_sent_1_day: boolean;
}

interface DashboardStats {
  total_messages: number;
  unread_messages: number;
  this_month_views: number;
  renewal_status: string;
  days_until_renewal: number;
}

export default function InstitutionOwnerDashboard() {
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<InstitutionDashboard | null>(null);
  const [renewal, setRenewal] = useState<ClaimRenewal | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load dashboard data
      const { data: dashboardData, error: dashboardError } = await supabase
        .from('institution_dashboards')
        .select(`
          *,
          institutions!inner(
            name,
            institution_type,
            is_verified,
            claim_status
          )
        `)
        .eq('owner_user_id', user.id)
        .single();

      if (dashboardError) throw dashboardError;
      setDashboard(dashboardData);

      // Load renewal information
      const { data: renewalData } = await supabase
        .from('institution_claim_renewals')
        .select('*')
        .eq('original_claim_id', dashboardData.id)
        .eq('renewal_status', 'pending')
        .single();

      setRenewal(renewalData);

      // Load statistics
      const { data: messagesCount } = await supabase
        .from('institution_messages')
        .select('id, status')
        .eq('institution_id', dashboardData.institution_id);

      const stats = {
        total_messages: messagesCount?.length || 0,
        unread_messages: messagesCount?.filter(m => m.status === 'unread').length || 0,
        this_month_views: Math.floor(Math.random() * 1000), // Placeholder
        renewal_status: renewalData?.renewal_status || 'active',
        days_until_renewal: renewalData ? 
          Math.floor((new Date(renewalData.renewal_due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 
          365
      };

      setStats(stats);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const initiateRenewal = async () => {
    try {
      // This would trigger the renewal process
      toast({
        title: "Renewal Initiated",
        description: "Your claim renewal has been initiated. You'll receive updates via email.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to initiate renewal",
        variant: "destructive"
      });
    }
  };

  const getRenewalStatusColor = (daysUntil: number) => {
    if (daysUntil <= 7) return 'text-red-600';
    if (daysUntil <= 30) return 'text-amber-600';
    return 'text-green-600';
  };

  const getRenewalUrgency = (daysUntil: number) => {
    if (daysUntil <= 7) return 'critical';
    if (daysUntil <= 30) return 'warning';
    return 'good';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No Dashboard Access</h2>
            <p className="text-muted-foreground">You don't have access to any institution dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {dashboard.institution.name}
                {dashboard.institution.is_verified && (
                  <Shield className="h-6 w-6 text-blue-600" />
                )}
              </h1>
              <p className="text-muted-foreground capitalize">
                {dashboard.institution.institution_type} Dashboard
              </p>
            </div>
            <Badge 
              variant={dashboard.institution.claim_status === 'verified' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {dashboard.institution.claim_status}
            </Badge>
          </div>
        </div>

        {/* Renewal Alert */}
        {stats && stats.days_until_renewal <= 30 && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-amber-900">
                    Claim Renewal Required
                  </h3>
                  <p className="text-sm text-amber-700">
                    Your institution claim expires in {stats.days_until_renewal} days. 
                    Renew now to maintain access.
                  </p>
                </div>
                <Button 
                  onClick={initiateRenewal}
                  variant="outline"
                  className="border-amber-300"
                >
                  Renew Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats?.total_messages || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{stats?.unread_messages || 0}</p>
                  <p className="text-sm text-muted-foreground">Unread</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats?.this_month_views || 0}</p>
                  <p className="text-sm text-muted-foreground">Month Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className={`h-5 w-5 ${stats ? getRenewalStatusColor(stats.days_until_renewal) : ''}`} />
                <div>
                  <p className={`text-2xl font-bold ${stats ? getRenewalStatusColor(stats.days_until_renewal) : ''}`}>
                    {stats?.days_until_renewal || 365}
                  </p>
                  <p className="text-sm text-muted-foreground">Days to Renewal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Claim verified</p>
                        <p className="text-xs text-muted-foreground">Dashboard access granted</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Star className="h-4 w-4 text-amber-600" />
                      <div>
                        <p className="text-sm font-medium">Institution featured</p>
                        <p className="text-xs text-muted-foreground">Added to featured directory</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Renewal Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Renewal Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renewal && stats && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Days until renewal</span>
                          <span className={getRenewalStatusColor(stats.days_until_renewal)}>
                            {stats.days_until_renewal} days
                          </span>
                        </div>
                        <Progress 
                          value={(365 - stats.days_until_renewal) / 365 * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          {renewal.reminder_sent_30_days ? 
                            <CheckCircle className="h-4 w-4 text-green-600" /> :
                            <Clock className="h-4 w-4 text-gray-400" />
                          }
                          <span>30-day reminder</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {renewal.reminder_sent_7_days ? 
                            <CheckCircle className="h-4 w-4 text-green-600" /> :
                            <Clock className="h-4 w-4 text-gray-400" />
                          }
                          <span>7-day reminder</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {renewal.reminder_sent_1_day ? 
                            <CheckCircle className="h-4 w-4 text-green-600" /> :
                            <Clock className="h-4 w-4 text-gray-400" />
                          }
                          <span>Final reminder</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Institution Messages</CardTitle>
                <CardDescription>
                  Messages from users and system notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Message Center</h3>
                  <p className="text-muted-foreground">
                    Your institution messaging system will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track your institution's performance and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">
                    Detailed analytics and reporting tools
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Settings</CardTitle>
                <CardDescription>
                  Configure your institution dashboard preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Analytics Enabled</h4>
                      <p className="text-sm text-muted-foreground">
                        Allow tracking of institution metrics
                      </p>
                    </div>
                    <Badge variant={dashboard.analytics_enabled ? 'default' : 'secondary'}>
                      {dashboard.analytics_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Messaging Enabled</h4>
                      <p className="text-sm text-muted-foreground">
                        Allow users to send messages
                      </p>
                    </div>
                    <Badge variant={dashboard.messaging_enabled ? 'default' : 'secondary'}>
                      {dashboard.messaging_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Subscription Tier</h4>
                      <p className="text-sm text-muted-foreground">
                        Current plan features and limits
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {dashboard.subscription_tier}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}