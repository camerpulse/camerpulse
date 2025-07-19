import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Building, 
  CreditCard,
  Calendar,
  MapPin,
  Star,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

interface RevenueData {
  total_revenue: number;
  revenue_by_module: {
    schools: number;
    hospitals: number;
    pharmacies: number;
  };
  monthly_revenue: {
    month: string;
    amount: number;
  }[];
  recent_transactions: {
    id: string;
    institution_name: string;
    institution_type: string;
    amount: number;
    payment_type: string;
    status: string;
    created_at: string;
  }[];
  pending_claims: number;
  active_features: number;
  total_institutions: number;
}

interface InstitutionPayment {
  id: string;
  institution_id: string;
  institution_name: string;
  institution_type: string;
  payment_type: string;
  amount: number;
  currency: string;
  payment_reference: string;
  payment_status: string;
  features_enabled: string[];
  active_until: string;
  created_at: string;
}

export default function MonetizationDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [payments, setPayments] = useState<InstitutionPayment[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedModule, setSelectedModule] = useState('all');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    if (user) {
      checkUserRole();
      fetchDashboardData();
    }
  }, [user]);

  const checkUserRole = async () => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();
      
      setUserRole(data?.role || 'citizen');
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole('citizen');
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch revenue and payment data based on user role
      if (userRole === 'admin') {
        await fetchAdminDashboard();
      } else {
        await fetchUserPayments();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminDashboard = async () => {
    const { data: claimsData } = await supabase
      .from('institution_claims')
      .select(`
        *,
        institution_payments(*)
      `)
      .eq('status', 'approved');

    const { data: paymentsData } = await supabase
      .from('institution_payments')
      .select('*')
      .order('created_at', { ascending: false });

    // Calculate revenue metrics
    const totalRevenue = paymentsData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    
    const revenueByModule = {
      schools: paymentsData?.filter(p => p.institution_type === 'school').reduce((sum, p) => sum + p.amount, 0) || 0,
      hospitals: paymentsData?.filter(p => p.institution_type === 'hospital').reduce((sum, p) => sum + p.amount, 0) || 0,
      pharmacies: paymentsData?.filter(p => p.institution_type === 'pharmacy').reduce((sum, p) => sum + p.amount, 0) || 0,
    };

    // Get monthly revenue (last 6 months)
    const monthlyRevenue = generateMonthlyRevenue(paymentsData || []);

    // Get recent transactions
    const recentTransactions = paymentsData?.slice(0, 10).map(payment => ({
      id: payment.id,
      institution_name: payment.institution_name || 'Unknown',
      institution_type: payment.institution_type,
      amount: payment.amount,
      payment_type: payment.payment_type,
      status: payment.payment_status,
      created_at: payment.created_at
    })) || [];

    const pendingClaims = claimsData?.filter(claim => claim.status === 'pending').length || 0;
    const activeFeatures = claimsData?.filter(claim => claim.status === 'approved').length || 0;

    setRevenueData({
      total_revenue: totalRevenue,
      revenue_by_module: revenueByModule,
      monthly_revenue: monthlyRevenue,
      recent_transactions: recentTransactions,
      pending_claims: pendingClaims,
      active_features: activeFeatures,
      total_institutions: claimsData?.length || 0
    });

    setPayments(paymentsData || []);
  };

  const fetchUserPayments = async () => {
    const { data: userPayments } = await supabase
      .from('institution_payments')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    setPayments(userPayments || []);
  };

  const generateMonthlyRevenue = (payments: any[]) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const monthRevenue = payments.filter(payment => {
        const paymentDate = new Date(payment.created_at);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      }).reduce((sum, payment) => sum + payment.amount, 0);

      months.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: monthRevenue
      });
    }
    
    return months;
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportData = async () => {
    try {
      const { data } = await supabase.functions.invoke('export-monetization-data', {
        body: { period: selectedPeriod, module: selectedModule }
      });
      
      // Create downloadable CSV
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `monetization-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Successful',
        description: 'Monetization report has been downloaded'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export data',
        variant: 'destructive'
      });
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card>
            <CardContent className="p-6">
              <p>Please sign in to access the monetization dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-full">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {userRole === 'admin' ? 'Revenue Dashboard' : 'My Payments'}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                {userRole === 'admin' 
                  ? 'Monitor monetization across all directories and institutions' 
                  : 'Track your institution payments and active features'
                }
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchDashboardData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {userRole === 'admin' && (
                <Button onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue={userRole === 'admin' ? 'overview' : 'payments'} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                {userRole === 'admin' && <TabsTrigger value="overview">Overview</TabsTrigger>}
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Admin Overview Tab */}
              {userRole === 'admin' && revenueData && (
                <TabsContent value="overview" className="space-y-6">
                  {/* Revenue Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{revenueData.total_revenue.toLocaleString()} FCFA</div>
                        <p className="text-xs text-muted-foreground">All time revenue</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Claims</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{revenueData.active_features}</div>
                        <p className="text-xs text-muted-foreground">Institutions with paid features</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{revenueData.pending_claims}</div>
                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Institutions</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{revenueData.total_institutions}</div>
                        <p className="text-xs text-muted-foreground">Registered institutions</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Revenue by Module */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue by Directory</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {revenueData.revenue_by_module.schools.toLocaleString()}
                          </div>
                          <p className="text-sm text-muted-foreground">Schools Revenue (FCFA)</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {revenueData.revenue_by_module.hospitals.toLocaleString()}
                          </div>
                          <p className="text-sm text-muted-foreground">Hospitals Revenue (FCFA)</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {revenueData.revenue_by_module.pharmacies.toLocaleString()}
                          </div>
                          <p className="text-sm text-muted-foreground">Pharmacies Revenue (FCFA)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Transactions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {revenueData.recent_transactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">{transaction.institution_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.institution_type} • {transaction.payment_type}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{transaction.amount.toLocaleString()} FCFA</p>
                              {getPaymentStatusBadge(transaction.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Payments Tab */}
              <TabsContent value="payments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {payments.length > 0 ? (
                      <div className="space-y-4">
                        {payments.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                              <p className="font-medium">{payment.institution_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {payment.institution_type} • {payment.payment_type}
                              </p>
                              <div className="flex gap-2">
                                {payment.features_enabled?.map((feature) => (
                                  <Badge key={feature} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="font-medium">{payment.amount.toLocaleString()} {payment.currency}</p>
                              {getPaymentStatusBadge(payment.payment_status)}
                              {payment.active_until && (
                                <p className="text-xs text-muted-foreground">
                                  Active until: {new Date(payment.active_until).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No payment history found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
                        <div className="space-y-2">
                          {['Mobile Money', 'Bank Transfer', 'Card Payment'].map((method) => (
                            <div key={method} className="flex justify-between">
                              <span>{method}</span>
                              <span className="font-medium">
                                {payments.filter(p => p.payment_type === method).length}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Success Rate</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Completed</span>
                            <span className="font-medium text-green-600">
                              {payments.filter(p => p.payment_status === 'completed').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Failed</span>
                            <span className="font-medium text-red-600">
                              {payments.filter(p => p.payment_status === 'failed').length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </AppLayout>
  );
}