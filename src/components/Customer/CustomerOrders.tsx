import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderTrackingDialog } from './OrderTrackingDialog';
import { useState } from 'react';
import { Eye, Package } from 'lucide-react';

export const CustomerOrders = () => {
  const { user } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['customer-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('marketplace_orders')
        .select(`
          *,
          marketplace_order_items (
            *,
            marketplace_products (
              name,
              price,
              image_url
            )
          ),
          marketplace_vendors (
            business_name
          )
        `)
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTrackOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setTrackingDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Orders</h2>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </div>

      {orders?.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground">Start shopping to see your orders here!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                    <CardDescription>
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.order_status)}>
                    {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Total: {order.total_amount.toLocaleString()} XAF</p>
                      <p className="text-sm text-muted-foreground">
                        Vendor: {order.marketplace_vendors?.business_name}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => handleTrackOrder(order.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Track Order
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Items:</h4>
                    <div className="space-y-2">
                      {order.marketplace_order_items?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-3">
                            {item.marketplace_products?.image_url && (
                              <img 
                                src={item.marketplace_products.image_url} 
                                alt={item.marketplace_products.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.marketplace_products?.name}</p>
                              <p className="text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-medium">
                            {(item.price_at_time * item.quantity).toLocaleString()} XAF
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <OrderTrackingDialog
        open={trackingDialogOpen}
        onOpenChange={setTrackingDialogOpen}
        orderId={selectedOrderId}
      />
    </div>
  );
};