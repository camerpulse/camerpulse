import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/Layout/AppLayout';
import { 
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Star,
  Plus,
  Edit,
  Eye,
  Trash2,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export const VendorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with real API calls
  const vendorStats = {
    totalProducts: 45,
    totalOrders: 128,
    totalRevenue: 2500000,
    averageRating: 4.8,
    pendingOrders: 12,
    lowStockAlerts: 3
  };

  const recentOrders = [
    {
      id: 'ORD-001',
      customerName: 'Jean Paul',
      products: 2,
      total: 25000,
      status: 'pending',
      date: '2024-01-15'
    },
    {
      id: 'ORD-002',
      customerName: 'Marie Nguyen',
      products: 1,
      total: 15000,
      status: 'processing',
      date: '2024-01-14'
    },
    {
      id: 'ORD-003',
      customerName: 'Paul Biya',
      products: 3,
      total: 45000,
      status: 'shipped',
      date: '2024-01-13'
    }
  ];

  const products = [
    {
      id: 'PROD-001',
      name: 'Traditional Ndole Spice Mix',
      price: 2500,
      stock: 45,
      status: 'active',
      orders: 25,
      revenue: 62500
    },
    {
      id: 'PROD-002',
      name: 'Handwoven Basket Set',
      price: 15000,
      stock: 2,
      status: 'low_stock',
      orders: 8,
      revenue: 120000
    },
    {
      id: 'PROD-003',
      name: 'African Print Dress',
      price: 18000,
      stock: 0,
      status: 'out_of_stock',
      orders: 15,
      revenue: 270000
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF'
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-500', text: 'Pending' },
      'processing': { color: 'bg-blue-500', text: 'Processing' },
      'shipped': { color: 'bg-green-500', text: 'Shipped' },
      'delivered': { color: 'bg-green-600', text: 'Delivered' },
      'cancelled': { color: 'bg-red-500', text: 'Cancelled' },
      'active': { color: 'bg-green-500', text: 'Active' },
      'low_stock': { color: 'bg-yellow-500', text: 'Low Stock' },
      'out_of_stock': { color: 'bg-red-500', text: 'Out of Stock' },
      'draft': { color: 'bg-gray-500', text: 'Draft' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    );
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
            <p className="text-muted-foreground">Manage your store, products, and orders</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{vendorStats.totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{vendorStats.totalOrders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatPrice(vendorStats.totalRevenue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    {vendorStats.averageRating}
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(vendorStats.pendingOrders > 0 || vendorStats.lowStockAlerts > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {vendorStats.pendingOrders > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">
                      {vendorStats.pendingOrders} pending orders need attention
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {vendorStats.lowStockAlerts > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">
                      {vendorStats.lowStockAlerts} products have low stock
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(order.total)}</p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.slice(0, 3).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.orders} orders</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(product.revenue)}</p>
                          <p className="text-sm text-muted-foreground">{product.stock} in stock</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Products Management</CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground">Price: {formatPrice(product.price)}</span>
                          <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                          <span className="text-sm text-muted-foreground">Orders: {product.orders}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(product.status)}
                        
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Orders Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex-1">
                        <h4 className="font-medium">{order.id}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground">Customer: {order.customerName}</span>
                          <span className="text-sm text-muted-foreground">Items: {order.products}</span>
                          <span className="text-sm text-muted-foreground">Date: {order.date}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{formatPrice(order.total)}</span>
                        {getStatusBadge(order.status)}
                        
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Analytics Dashboard</p>
                    <p className="text-muted-foreground">Detailed sales and performance analytics coming soon</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Customer Analytics</p>
                    <p className="text-muted-foreground">Customer behavior and insights coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};