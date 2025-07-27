import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag } from 'lucide-react';

interface VendorAnalyticsProps {
  vendorId: string;
}

interface AnalyticsData {
  chartData: Array<{ month: string; revenue: number; orders: number }>;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  growth: number;
}

export const VendorAnalytics = ({ vendorId }: VendorAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // Mock data for now to avoid Supabase type issues
        // In real implementation, you would fetch from Supabase here
        const mockData: AnalyticsData = {
          chartData: [
            { month: 'Jan 2024', revenue: 75000, orders: 15 },
            { month: 'Feb 2024', revenue: 85000, orders: 17 },
            { month: 'Mar 2024', revenue: 92000, orders: 18 },
            { month: 'Apr 2024', revenue: 105000, orders: 21 },
            { month: 'May 2024', revenue: 118000, orders: 24 },
            { month: 'Jun 2024', revenue: 125000, orders: 25 },
          ],
          totalRevenue: 600000,
          totalOrders: 120,
          avgOrderValue: 5000,
          growth: 12.3,
        };

        setAnalytics(mockData);
      } catch (error) {
        console.error('Error fetching vendor analytics:', error);
        setAnalytics({
          chartData: [],
          totalRevenue: 0,
          totalOrders: 0,
          avgOrderValue: 0,
          growth: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (vendorId) {
      fetchAnalytics();
    }
  }, [vendorId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-muted-foreground">Track your store performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics?.totalRevenue || 0).toLocaleString()} XAF
            </div>
            <p className="text-xs text-muted-foreground">
              Last 6 months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 6 months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics?.avgOrderValue || 0).toLocaleString()} XAF
            </div>
            <p className="text-xs text-muted-foreground">
              Per completed order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            {(analytics?.growth || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (analytics?.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {(analytics?.growth || 0) >= 0 ? '+' : ''}{(analytics?.growth || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Month over month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Monthly revenue over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} XAF`, 'Revenue']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Orders Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Order Volume</CardTitle>
          <CardDescription>Number of orders per month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value, 'Orders']}
              />
              <Bar 
                dataKey="orders" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};