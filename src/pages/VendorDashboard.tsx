import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VendorOrders } from '@/components/Vendor/VendorOrders';
import { VendorProducts } from '@/components/Vendor/VendorProducts';
import { VendorAnalytics } from '@/components/Vendor/VendorAnalytics';
import { VendorProfile } from '@/components/Vendor/VendorProfile';
import { Package, ShoppingCart, BarChart3, User } from 'lucide-react';

export const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Manage your products, orders, and business analytics</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>View and process customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <VendorOrders />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>Manage your product inventory and listings</CardDescription>
              </CardHeader>
              <CardContent>
                <VendorProducts />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
                <CardDescription>Track your sales performance and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <VendorAnalytics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Profile</CardTitle>
                <CardDescription>Manage your vendor information and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <VendorProfile />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};