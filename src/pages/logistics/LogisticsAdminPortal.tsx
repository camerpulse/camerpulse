import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CamerLogisticsLayout } from '@/components/Layout/CamerLogisticsLayout';
import { useAuth } from '@/contexts/AuthContext';
import { TemplateManager } from '@/components/LabelDesigner/TemplateManager';
import { LabelDesigner } from '@/components/LabelDesigner/LabelDesigner';
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
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AdminStats {
  totalShipments: number;
  totalCompanies: number;
  totalUsers: number;
  totalTemplates: number;
  pendingApprovals: number;
  todayRevenue: number;
  systemHealth: number;
  activeShipments: number;
}

interface Company {
  id: string;
  company_name: string;
  email?: string;
  phone?: string;
  address: string;
  verification_status: string;
  created_at: string;
  services_offered?: string[];
}

interface Shipment {
  id: string;
  tracking_number: string;
  status: string;
  origin_address: string;
  destination_address: string;
  shipping_cost: number;
  created_at: string;
  estimated_delivery_date: string;
  shipping_companies?: { company_name: string };
}

export const LogisticsAdminPortal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalShipments: 0,
    totalCompanies: 0,
    totalUsers: 0,
    totalTemplates: 0,
    pendingApprovals: 0,
    todayRevenue: 0,
    systemHealth: 98.5,
    activeShipments: 0
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [showLabelDesigner, setShowLabelDesigner] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    try {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (userRoles?.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        toast({
          title: "Access Denied",
          description: "You don't have administrator privileges",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      // Fetch all data in parallel
      const [
        { data: shipments },
        { data: companies },
        { data: users },
        { data: templates }
      ] = await Promise.all([
        supabase.from('shipments').select('*, shipping_companies(company_name)'),
        supabase.from('shipping_companies').select('*'),
        supabase.from('user_profiles').select('*'),
        supabase.from('label_templates').select('*')
      ]);

      const totalRevenue = shipments?.reduce((sum, s) => sum + (s.shipping_cost || 0), 0) || 0;
      const pendingCompanies = companies?.filter(c => c.verification_status === 'pending').length || 0;
      const activeShipments = shipments?.filter(s => ['pending', 'in_transit', 'out_for_delivery'].includes(s.status)).length || 0;

      setStats({
        totalShipments: shipments?.length || 0,
        totalCompanies: companies?.length || 0,
        totalUsers: users?.length || 0,
        totalTemplates: templates?.length || 0,
        pendingApprovals: pendingCompanies,
        todayRevenue: totalRevenue,
        systemHealth: 98.5,
        activeShipments
      });

      setCompanies(companies || []);
      setShipments(shipments || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    }
  };

  const handleApproveCompany = async (companyId: string) => {
    try {
      const { error } = await supabase
        .from('shipping_companies')
        .update({ verification_status: 'verified' })
        .eq('id', companyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company verified successfully"
      });

      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Error approving company:', error);
      toast({
        title: "Error",
        description: "Failed to verify company",
        variant: "destructive"
      });
    }
  };

  const handleRejectCompany = async (companyId: string) => {
    try {
      const { error } = await supabase
        .from('shipping_companies')
        .update({ verification_status: 'rejected' })
        .eq('id', companyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company rejected"
      });

      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting company:', error);
      toast({
        title: "Error",
        description: "Failed to reject company",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Verified</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'in_transit':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Transit</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
              <Button onClick={() => navigate('/auth')}>
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
              <Button onClick={() => navigate('/logistics')}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </CamerLogisticsLayout>
    );
  }

  if (showLabelDesigner) {
    return (
      <CamerLogisticsLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Label Designer</h1>
            <Button onClick={() => setShowLabelDesigner(false)} variant="outline">
              Back to Admin
            </Button>
          </div>
          <LabelDesigner onSave={() => setShowLabelDesigner(false)} />
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
              CamerLogistics Admin Portal
            </h1>
            <p className="text-muted-foreground">Complete platform management dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-4 w-4 mr-1" />
              System Healthy ({stats.systemHealth}%)
            </Badge>
            <Button onClick={fetchAdminData} variant="outline" size="sm">
              Refresh Data
            </Button>
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
              <div className="text-2xl font-bold">{stats.totalShipments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">{stats.activeShipments}</span> active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-yellow-600">{stats.pendingApprovals}</span> pending approval
              </p>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="companies">
              Companies
              {stats.pendingApprovals > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {stats.pendingApprovals}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health & Performance</CardTitle>
                  <CardDescription>Real-time platform monitoring</CardDescription>
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
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Sessions</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {stats.totalUsers}
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
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setShowLabelDesigner(true)}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Create Label Template
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('companies')}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Review Company Approvals
                    {stats.pendingApprovals > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {stats.pendingApprovals}
                      </Badge>
                    )}
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('shipments')}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Monitor Shipments
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
                <CardDescription>Latest system events and user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companies.slice(0, 5).map((company) => (
                    <div key={company.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          New company registration: {company.company_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(company.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(company.verification_status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Company Management</CardTitle>
                    <CardDescription>Review and approve shipping company registrations</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    {stats.pendingApprovals} Pending Approval
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companies.map((company) => (
                    <Card key={company.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h3 className="font-semibold text-lg">{company.company_name}</h3>
                              {getStatusBadge(company.verification_status)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{company.address}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{company.email || 'No email provided'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Registered: {new Date(company.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                <span>Services: {company.services_offered?.join(', ') || 'Standard Delivery'}</span>
                              </div>
                            </div>
                          </div>
                          {company.verification_status === 'pending' && (
                            <div className="flex gap-2 ml-4">
                              <Button 
                                size="sm" 
                                onClick={() => handleApproveCompany(company.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verify
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRejectCompany(company.id)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {companies.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Companies Found</h3>
                      <p>No shipping companies have registered yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipment Monitoring Dashboard</CardTitle>
                <CardDescription>Real-time tracking of all platform shipments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipments.slice(0, 10).map((shipment) => (
                    <Card key={shipment.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h3 className="font-semibold">{shipment.tracking_number}</h3>
                              {getStatusBadge(shipment.status)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>From: {shipment.origin_address}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>To: {shipment.destination_address}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                <span>Company: {shipment.shipping_companies?.company_name || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                <span>Cost: {shipment.shipping_cost?.toLocaleString()} FCFA</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Created: {new Date(shipment.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                <span>ETA: {shipment.estimated_delivery_date ? new Date(shipment.estimated_delivery_date).toLocaleDateString() : 'Not set'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/logistics/tracking/${shipment.tracking_number}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Track
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {shipments.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Shipments Found</h3>
                      <p>No shipments have been created yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Label Template Management</CardTitle>
                    <CardDescription>Create and manage shipping label templates</CardDescription>
                  </div>
                  <Button onClick={() => setShowLabelDesigner(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <TemplateManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Platform earnings and financial metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Revenue</span>
                      <span className="text-2xl font-bold">{stats.todayRevenue.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Shipment Value</span>
                      <span className="text-lg font-semibold">
                        {stats.totalShipments > 0 ? Math.round(stats.todayRevenue / stats.totalShipments).toLocaleString() : 0} FCFA
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>System efficiency and user engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Users</span>
                      <span className="text-2xl font-bold">{stats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completion Rate</span>
                      <span className="text-lg font-semibold">94.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Configuration</CardTitle>
                  <CardDescription>Global system settings and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Default Shipping Rates</h4>
                      <p className="text-sm text-muted-foreground mb-3">Configure standard pricing for different service types</p>
                      <Button variant="outline" size="sm">Manage Rates</Button>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Notification Settings</h4>
                      <p className="text-sm text-muted-foreground mb-3">Configure system notifications and alerts</p>
                      <Button variant="outline" size="sm">Configure Notifications</Button>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">API Management</h4>
                      <p className="text-sm text-muted-foreground mb-3">Manage API keys and integration settings</p>
                      <Button variant="outline" size="sm">API Settings</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Maintenance</CardTitle>
                  <CardDescription>Backup, monitoring, and maintenance tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Data Backup</h4>
                      <p className="text-sm text-muted-foreground mb-3">Create and manage system backups</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Import Data
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">System Monitoring</h4>
                      <p className="text-sm text-muted-foreground mb-3">Monitor system health and performance</p>
                      <Button variant="outline" size="sm">
                        <Activity className="h-4 w-4 mr-2" />
                        View Logs
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CamerLogisticsLayout>
  );
};