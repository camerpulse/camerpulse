import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingBag, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface VendorOverviewProps {
  vendor: any;
}

export const VendorOverview = ({ vendor }: VendorOverviewProps) => {
  const { data: stats } = useQuery({
    queryKey: ['vendor-stats', vendor.id],
    queryFn: async () => {
      const [productsResult, ordersResult] = await Promise.all([
        supabase
          .from('marketplace_products')
          .select('id')
          .eq('vendor_id', vendor.id),
        supabase
          .from('marketplace_orders')
          .select('id, total_amount, order_status')
          .eq('vendor_id', vendor.id)
      ]);

      const totalProducts = productsResult.data?.length || 0;
      const totalOrders = ordersResult.data?.length || 0;
      const completedOrders = ordersResult.data?.filter(order => order.order_status === 'completed') || [];
      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const pendingOrders = ordersResult.data?.filter(order => order.order_status === 'pending').length || 0;

      return {
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
      };
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Vendor Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {vendor.business_name}
            {getStatusBadge(vendor.verification_status || 'pending')}
          </CardTitle>
          <CardDescription>{vendor.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Vendor ID:</strong> {vendor.vendor_id}</p>
              <p><strong>Rating:</strong> {vendor.rating || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Joined:</strong> {new Date(vendor.created_at).toLocaleDateString()}</p>
              <p><strong>Total Sales:</strong> {(vendor.total_sales || 0).toLocaleString()} XAF</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Products in your store
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.totalRevenue || 0).toLocaleString()} XAF</div>
            <p className="text-xs text-muted-foreground">
              Completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {(vendor.verification_status === 'pending' || !vendor.verification_status) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Application Under Review</CardTitle>
            <CardDescription className="text-yellow-700">
              Your vendor application is being reviewed. You'll be notified once approved.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};