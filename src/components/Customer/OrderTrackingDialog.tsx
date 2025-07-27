import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Truck, Package, MapPin } from 'lucide-react';

interface OrderTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
}

export const OrderTrackingDialog = ({ open, onOpenChange, orderId }: OrderTrackingDialogProps) => {
  const { data: order, isLoading } = useQuery({
    queryKey: ['order-tracking', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data, error } = await supabase
        .from('marketplace_orders')
        .select(`
          *,
          marketplace_order_items (
            *,
            marketplace_products (name, image_url)
          ),
          marketplace_vendors (business_name, contact_phone)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  const getTrackingSteps = (status: string) => {
    const steps = [
      { id: 'pending', label: 'Order Placed', icon: Package },
      { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
      { id: 'processing', label: 'Processing', icon: Package },
      { id: 'shipped', label: 'Shipped', icon: Truck },
      { id: 'delivered', label: 'Delivered', icon: MapPin },
    ];

    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Tracking</DialogTitle>
          </DialogHeader>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!order) return null;

  const trackingSteps = getTrackingSteps(order.order_status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Order Tracking</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-semibold">Order #{order.order_number}</h3>
            <p className="text-sm text-muted-foreground">
              {(order.marketplace_vendors as any)?.business_name || 'Unknown Vendor'}
            </p>
            <Badge className="mt-2">
              {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
            </Badge>
          </div>

          <div className="space-y-4">
            {trackingSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-full ${
                      step.completed 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {index < trackingSteps.length - 1 && (
                      <div className={`w-0.5 h-8 mt-2 ${
                        step.completed ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      step.completed ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </p>
                    {step.current && (
                      <p className="text-sm text-primary">Current status</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {order.shipping_address && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Shipping Address</h4>
              <p className="text-sm text-muted-foreground">
                {String(order.shipping_address) || 'No address provided'}
              </p>
            </div>
          )}

           {(order.marketplace_vendors as any)?.contact_phone && (
             <div className="border-t pt-4">
               <h4 className="font-medium mb-2">Vendor Contact</h4>
               <p className="text-sm text-muted-foreground">
                 {(order.marketplace_vendors as any).contact_phone}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};