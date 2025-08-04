import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  FileText,
  BarChart3,
  Settings,
  Search,
  Download
} from 'lucide-react';

interface AdminDashboardProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
}

interface DashboardStats {
  totalOrders: number;
  activeVendors: number;
  totalRevenue: number;
  totalCommission: number;
  openDisputes: number;
  completedOrders: number;
}

interface Dispute {
  id: string;
  dispute_number: string;
  status: string;
  priority_level: string;
  dispute_type: string;
  created_at: string;
}

interface Vendor {
  id: string;
  vendor_id: string;
  metric_value: number;
  metric_type: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  hasPermission,
  logActivity
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentDisputes, setRecentDisputes] = useState<Dispute[]>([]);
  const [topVendors, setTopVendors] = useState<Vendor[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [disputesLoading, setDisputesLoading] = useState(true);
  const [vendorsLoading, setVendorsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
    loadRecentDisputes();
    loadTopVendors();
  }, [statusFilter]);

  const loadDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Simple mock data for now since we have table structure issues
      const stats: DashboardStats = {
        totalOrders: 0,
        activeVendors: 0,
        totalRevenue: 0,
        totalCommission: 0,
        openDisputes: 0,
        completedOrders: 0
      };

      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadRecentDisputes = async () => {
    try {
      setDisputesLoading(true);
      // Mock data for disputes
      const disputes: Dispute[] = [];
      setRecentDisputes(disputes);
    } catch (error) {
      console.error('Error loading disputes:', error);
    } finally {
      setDisputesLoading(false);
    }
  };

  const loadTopVendors = async () => {
    try {
      setVendorsLoading(true);
      // Mock data for vendors
      const vendors: Vendor[] = [];
      setTopVendors(vendors);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setVendorsLoading(false);
    }
  };

  const handleExportReport = async (reportType: string) => {
    logActivity('export_report', { reportType });
    // Implementation for report export would go here
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'secondary';
      case 'resolved': return 'default';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Administration</h1>
          <p className="text-muted-foreground">
            Comprehensive oversight and management dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExportReport('dashboard')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XAF'
              }).format(dashboardStats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Commission: {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XAF'
              }).format(dashboardStats?.totalCommission || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.activeVendors}</div>
            <p className="text-xs text-muted-foreground">
              Approved and active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.completedOrders} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.openDisputes}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="disputes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="disputes">Dispute Management</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Disputes Tab */}
        <TabsContent value="disputes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Disputes</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search disputes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {disputesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDisputes?.map((dispute) => (
                    <div
                      key={dispute.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{dispute.dispute_number}</span>
                          <Badge variant={getStatusColor(dispute.status)}>
                            {dispute.status}
                          </Badge>
                          <Badge variant={getPriorityColor(dispute.priority_level)}>
                            {dispute.priority_level} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {dispute.dispute_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(dispute.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {dispute.status === 'open' && (
                          <Button size="sm">
                            Assign
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {!recentDisputes?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      No disputes found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendor Performance Tab */}
        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              {vendorsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {topVendors?.map((vendor, index) => (
                    <div
                      key={vendor.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">
                            Vendor {vendor.vendor_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Revenue: {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'XAF'
                            }).format(Number(vendor.metric_value))}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Analytics
                        </Button>
                        <Button variant="outline" size="sm">
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!topVendors?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      No vendor data available
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Reports Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XAF'
                      }).format(dashboardStats?.totalRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Commission</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XAF'
                      }).format(dashboardStats?.totalCommission || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission Rate</span>
                    <span className="font-medium">
                      {dashboardStats?.totalRevenue 
                        ? ((dashboardStats.totalCommission / dashboardStats.totalRevenue) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExportReport('financial')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Financial Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExportReport('commission')}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Export Commission Data
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExportReport('vendor_payouts')}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Vendor Payout Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {dashboardStats?.totalOrders}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {dashboardStats?.activeVendors}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Vendors</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {dashboardStats?.openDisputes}
                  </div>
                  <p className="text-sm text-muted-foreground">Open Disputes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};