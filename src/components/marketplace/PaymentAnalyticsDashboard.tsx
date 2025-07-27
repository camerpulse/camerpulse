import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users,
  CreditCard,
  Smartphone,
  Calendar,
  Download,
  BarChart3,
  PieChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  platform?: {
    total_revenue: number;
    one_off_revenue: number;
    subscription_revenue: number;
    total_orders: number;
    total_subscriptions: number;
    payment_method_breakdown: Record<string, number>;
    subscription_plan_breakdown: Record<string, number>;
    stripe_data: {
      charges: number;
      charge_volume: number;
      subscriptions: number;
      subscription_mrr: number;
    };
  };
  vendor?: {
    total_sales: number;
    net_revenue: number;
    platform_fee: number;
    total_orders: number;
    total_items_sold: number;
    subscription_status: string;
    subscription_plan: string;
    orders: Array<{
      amount: number;
      status: string;
      created_at: string;
      quantity: number;
    }>;
  };
  user?: {
    total_spent: number;
    total_purchases: number;
    orders: Array<{
      amount: number;
      status: string;
      created_at: string;
    }>;
  };
}

interface PaymentAnalyticsDashboardProps {
  vendorId?: string;
  isAdmin?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const PaymentAnalyticsDashboard: React.FC<PaymentAnalyticsDashboardProps> = ({ 
  vendorId, 
  isAdmin = false 
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [period, vendorId, isAdmin]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period,
        ...(vendorId && { vendorId }),
        ...(isAdmin && { admin: 'true' })
      });

      const { data, error } = await supabase.functions.invoke('payment-analytics', {
        body: {},
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) throw error;
      
      setAnalyticsData(data.analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load payment analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment-analytics-${period}days.json`;
    link.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const renderPlatformAnalytics = () => {
    const data = analyticsData.platform;
    if (!data) return null;

    const paymentMethodData = Object.entries(data.payment_method_breakdown).map(([method, count]) => ({
      name: method.replace('_', ' ').toUpperCase(),
      value: count
    }));

    const subscriptionPlanData = Object.entries(data.subscription_plan_breakdown).map(([plan, count]) => ({
      name: plan.replace('vendor_', '').toUpperCase(),
      value: count
    }));

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.total_revenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Orders</p>
                  <p className="text-2xl font-bold">{data.total_orders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subscriptions</p>
                  <p className="text-2xl font-bold">{data.total_subscriptions}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">MRR</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.stripe_data.subscription_mrr)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>One-off Payments</span>
                  <span className="font-bold">{formatCurrency(data.one_off_revenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Subscription Revenue</span>
                  <span className="font-bold">{formatCurrency(data.subscription_revenue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Plans */}
        {subscriptionPlanData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Subscription Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subscriptionPlanData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderVendorAnalytics = () => {
    const data = analyticsData.vendor;
    if (!data) return null;

    // Process orders for chart
    const ordersByDay = data.orders.reduce((acc: Record<string, number>, order) => {
      const date = new Date(order.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + order.amount;
      return acc;
    }, {});

    const chartData = Object.entries(ordersByDay).map(([date, amount]) => ({
      date,
      amount: amount / 100
    }));

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.total_sales)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.net_revenue)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Orders</p>
                  <p className="text-2xl font-bold">{data.total_orders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items Sold</p>
                  <p className="text-2xl font-bold">{data.total_items_sold}</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant={data.subscription_status === 'active' ? 'default' : 'secondary'}>
                {data.subscription_status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Plan: {data.subscription_plan.replace('vendor_', '').toUpperCase()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Sales Chart */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sales Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                  <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">Loading payment analytics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Analytics</h2>
          <p className="text-muted-foreground">
            {isAdmin ? 'Platform-wide' : vendorId ? 'Vendor' : 'Personal'} payment insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {isAdmin && analyticsData.platform && renderPlatformAnalytics()}
      {vendorId && analyticsData.vendor && renderVendorAnalytics()}
      {!isAdmin && !vendorId && analyticsData.user && (
        <Card>
          <CardHeader>
            <CardTitle>Your Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(analyticsData.user.total_spent)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Purchases</p>
                <p className="text-2xl font-bold">{analyticsData.user.total_purchases}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};