import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CamerLogisticsLayout } from '@/components/Layout/CamerLogisticsLayout';
import { 
  Building2, 
  Package, 
  TrendingUp, 
  Users, 
  MapPin,
  Clock,
  DollarSign,
  Star,
  Settings,
  Plus,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompanyStats {
  totalShipments: number;
  activeShipments: number;
  completedShipments: number;
  totalRevenue: number;
  averageRating: number;
  monthlyGrowth: number;
}

export const LogisticsCompanyPortal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [stats, setStats] = useState<CompanyStats>({
    totalShipments: 0,
    activeShipments: 0,
    completedShipments: 0,
    totalRevenue: 0,
    averageRating: 0,
    monthlyGrowth: 0
  });

  useEffect(() => {
    if (user) {
      fetchCompanyData();
    }
  }, [user]);

  const fetchCompanyData = async () => {
    try {
      // Get shipping company for current user
      const { data: companyData, error: companyError } = await supabase
        .from('shipping_companies')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (companyError && companyError.code !== 'PGRST116') {
        throw companyError;
      }

      if (companyData) {
        setCompany(companyData);
        await fetchCompanyStats(companyData.id);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      toast({
        title: "Error",
        description: "Failed to load company data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyStats = async (companyId: string) => {
    try {
      // Get shipments stats
      const { data: shipments, error: shipmentsError } = await supabase
        .from('shipments')
        .select('*')
        .eq('shipping_company_id', companyId);

      if (shipmentsError) throw shipmentsError;

      const total = shipments?.length || 0;
      const active = shipments?.filter(s => ['pending', 'in_transit', 'out_for_delivery'].includes(s.status)).length || 0;
      const completed = shipments?.filter(s => s.status === 'delivered').length || 0;
      const revenue = shipments?.reduce((sum, s) => sum + (s.shipping_cost || 0), 0) || 0;

      setStats({
        totalShipments: total,
        activeShipments: active,
        completedShipments: completed,
        totalRevenue: revenue,
        averageRating: 4.5, // Mock data
        monthlyGrowth: 12.5 // Mock data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (!user) {
    return (
      <CamerLogisticsLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-4">
                Please log in to access the company portal.
              </p>
              <Button onClick={() => window.location.href = '/auth'}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </CamerLogisticsLayout>
    );
  }

  if (loading) {
    return (
      <CamerLogisticsLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </CamerLogisticsLayout>
    );
  }

  if (!company) {
    return (
      <CamerLogisticsLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <Building2 className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">No Company Found</h2>
              <p className="text-muted-foreground mb-6">
                You don't have a shipping company registered yet. Register your company to start managing shipments.
              </p>
              <Button onClick={() => window.location.href = '/logistics/join-company'}>
                Register Your Company
              </Button>
            </CardContent>
          </Card>
        </div>
      </CamerLogisticsLayout>
    );
  }

  return (
    <CamerLogisticsLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Company Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{company.company_name}</h1>
              <p className="text-muted-foreground">Company Portal Dashboard</p>
            </div>
            <div className="ml-auto">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalShipments}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeShipments}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} FCFA</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}/5</div>
              <p className="text-xs text-muted-foreground">Customer satisfaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest shipments and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Frequently used features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Shipment
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Shipments
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shipments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipment Management</CardTitle>
                <CardDescription>View and manage all your shipments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Shipments Found</h3>
                  <p>Your shipments will appear here once you start shipping packages.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Track your company's performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                  <p>Detailed analytics and reporting features will be available soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Settings</CardTitle>
                <CardDescription>Manage your company information and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Company Information</h4>
                    <p className="text-sm text-muted-foreground mb-4">Basic details about your company</p>
                    <Button variant="outline">Edit Company Profile</Button>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Notification Settings</h4>
                    <p className="text-sm text-muted-foreground mb-4">Manage how you receive notifications</p>
                    <Button variant="outline">Configure Notifications</Button>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">API Access</h4>
                    <p className="text-sm text-muted-foreground mb-4">Integrate with your systems</p>
                    <Button variant="outline">Manage API Keys</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CamerLogisticsLayout>
  );
};