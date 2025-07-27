import { useState } from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { CustomerOrders } from '@/components/Customer/CustomerOrders';
import { CustomerWishlist } from '@/components/Customer/CustomerWishlist';
import { CustomerReviews } from '@/components/Customer/CustomerReviews';
import { CustomerProfile } from '@/components/Customer/CustomerProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Heart, Star, User } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h1>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your orders, wishlist, and reviews
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="orders">
              <Package className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="wishlist">
              <Heart className="w-4 h-4 mr-2" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="w-4 h-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <CustomerOrders />
          </TabsContent>

          <TabsContent value="wishlist">
            <CustomerWishlist />
          </TabsContent>

          <TabsContent value="reviews">
            <CustomerReviews />
          </TabsContent>

          <TabsContent value="profile">
            <CustomerProfile />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CustomerDashboard;