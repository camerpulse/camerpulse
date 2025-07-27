import { useState } from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { VendorRegistration } from '@/components/Vendor/VendorRegistration';
import { VendorOverview } from '@/components/Vendor/VendorOverview';
import { VendorProducts } from '@/components/Vendor/VendorProducts';
import { VendorOrders } from '@/components/Vendor/VendorOrders';
import { VendorAnalytics } from '@/components/Vendor/VendorAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, Package, ShoppingBag, BarChart3 } from 'lucide-react';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('marketplace_vendors')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!vendor) {
    return (
      <AppLayout>
        <VendorRegistration />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Vendor Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your business on CamerPulse Marketplace
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">
              <Store className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <VendorOverview vendor={vendor} />
          </TabsContent>

          <TabsContent value="products">
            <VendorProducts vendorId={vendor.id} />
          </TabsContent>

          <TabsContent value="orders">
            <VendorOrders vendorId={vendor.id} />
          </TabsContent>

          <TabsContent value="analytics">
            <VendorAnalytics vendorId={vendor.id} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default VendorDashboard;