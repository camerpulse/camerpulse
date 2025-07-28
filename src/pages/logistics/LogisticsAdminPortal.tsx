import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CamerLogisticsLayout } from '@/components/Layout/CamerLogisticsLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Settings, 
  Package, 
  FileText, 
  BarChart3, 
  Users, 
  Truck,
  Building2,
  Shield,
  Database,
  Palette,
  QrCode,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalShipments: number;
  totalCompanies: number;
  totalUsers: number;
  totalTemplates: number;
  todayRevenue: number;
  systemHealth: number;
}

export const LogisticsAdminPortal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalShipments: 0,
    totalCompanies: 0,
    totalUsers: 0,
    totalTemplates: 0,
    todayRevenue: 0,
    systemHealth: 98.5
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
      fetchAdminStats();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      setIsAdmin(userRoles?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      // Get all shipments
      const { data: shipments } = await supabase
        .from('shipments')
        .select('*');

      // Get all shipping companies
      const { data: companies } = await supabase
        .from('shipping_companies')
        .select('*');

      // Get all users
      const { data: users } = await supabase
        .from('user_profiles')
        .select('*');

      // Get all label templates
      const { data: templates } = await supabase
        .from('label_templates')
        .select('*');

      const totalRevenue = shipments?.reduce((sum, s) => sum + (s.shipping_cost || 0), 0) || 0;

      setStats({
        totalShipments: shipments?.length || 0,
        totalCompanies: companies?.length || 0,
        totalUsers: users?.length || 0,
        totalTemplates: templates?.length || 0,
        todayRevenue: totalRevenue,
        systemHealth: 98.5
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast({
        title: "Error",
        description: "Failed to load admin statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <CamerLogisticsLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-4">
                Please log in to access the admin portal.
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

  if (!isAdmin) {
    return (
      <CamerLogisticsLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You don't have administrator privileges to access this portal.
              </p>
              <Button onClick={() => window.location.href = '/logistics'}>
                Go Back
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Logistics Admin Portal
            </h1>
            <p className="text-muted-foreground">Manage the CamerLogistics platform</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            System Healthy
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalShipments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shipping Companies</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">Registered partners</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Active accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Label Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTemplates}</div>
              <p className="text-xs text-muted-foreground">Available designs</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Platform performance and monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overall Health</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {stats.systemHealth}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Status</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Online
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Response Time</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        &lt;200ms
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Label Template
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Building2 className="h-4 w-4 mr-2" />
                    Approve Company Registration
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate System Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    System Backup
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Management</CardTitle>
                <CardDescription>Manage shipping company registrations and approvals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Company Management</h3>
                  <p>Review and approve company registrations, manage partnerships.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipment Monitoring</CardTitle>
                <CardDescription>Monitor all shipments across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Shipment Overview</h3>
                  <p>Track all shipments, monitor delivery performance, and handle disputes.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Label Templates</CardTitle>
                    <CardDescription>Manage shipping label templates and designs</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Template Cards */}
                  <Card className="border-dashed border-2 border-gray-300 hover:border-primary transition-colors">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <Palette className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">Standard Shipping</h3>
                      <p className="text-sm text-muted-foreground mb-4">Default template for standard shipments</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed border-2 border-gray-300 hover:border-primary transition-colors">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">Express Delivery</h3>
                      <p className="text-sm text-muted-foreground mb-4">Template for urgent shipments</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed border-2 border-gray-300 hover:border-primary transition-colors">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">Create New</h3>
                      <p className="text-sm text-muted-foreground mb-4">Design a new label template</p>
                      <Button size="sm">
                        Create
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>System-wide performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                  <p>Comprehensive reporting and business intelligence for the platform.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Platform settings and configurations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Platform Settings</h4>
                    <p className="text-sm text-muted-foreground mb-4">Configure global platform settings</p>
                    <Button variant="outline">Manage Settings</Button>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Security & Access</h4>
                    <p className="text-sm text-muted-foreground mb-4">User roles and security configurations</p>
                    <Button variant="outline">Security Settings</Button>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">API Management</h4>
                    <p className="text-sm text-muted-foreground mb-4">API keys and integration settings</p>
                    <Button variant="outline">API Settings</Button>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Backup & Maintenance</h4>
                    <p className="text-sm text-muted-foreground mb-4">System backup and maintenance tools</p>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                      </Button>
                    </div>
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