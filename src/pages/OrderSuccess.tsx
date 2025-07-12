import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  CreditCard, 
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface OrderDetails {
  id: string;
  amount: number;
  currency: string;
  quantity: number;
  status: string;
  customer_name: string;
  customer_email: string;
  shipping_address?: {
    name: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postal_code: string;
      country: string;
    };
  };
}

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });

        if (error) throw error;

        if (data.success) {
          setOrder(data.order);
          toast({
            title: "Payment Successful! 🎉",
            description: "Your order has been confirmed and is being processed.",
          });
        } else {
          setError(data.message || 'Payment verification failed');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to verify payment';
        setError(errorMessage);
        toast({
          title: "Verification Error",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, toast]);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: currency === 'XAF' ? 'XAF' : currency
    }).format(amount / 100); // Convert from cents
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-civic flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h2 className="text-lg font-semibold mb-2">Verifying Payment</h2>
            <p className="text-muted-foreground text-center">
              Please wait while we confirm your order...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-civic flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2 text-center">Payment Verification Failed</h2>
            <p className="text-muted-foreground text-center mb-6">
              {error}
            </p>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link to="/marketplace">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Marketplace
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-civic">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <Card className="mb-6">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <CheckCircle className="h-16 w-16 text-cm-green mb-4" />
              <h1 className="text-2xl font-bold text-center mb-2">
                Order Confirmed! 🎉
              </h1>
              <p className="text-muted-foreground text-center">
                Thank you for your purchase. Your order has been successfully processed.
              </p>
            </CardContent>
          </Card>

          {/* Order Details */}
          {order && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono text-sm">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className="bg-cm-green text-white">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold">
                      {formatPrice(order.amount, order.currency)} × {order.quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm">Card</span>
                    </div>
                  </div>
                </div>

                {order.customer_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p>{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                  </div>
                )}

                {order.shipping_address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Shipping Address</p>
                    <div className="bg-muted/50 p-3 rounded">
                      <p className="font-medium">{order.shipping_address.name}</p>
                      <p>{order.shipping_address.address.line1}</p>
                      {order.shipping_address.address.line2 && (
                        <p>{order.shipping_address.address.line2}</p>
                      )}
                      <p>
                        {order.shipping_address.address.city}
                        {order.shipping_address.address.state && `, ${order.shipping_address.address.state}`}
                        {' '}
                        {order.shipping_address.address.postal_code}
                      </p>
                      <p>{order.shipping_address.address.country}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p className="text-sm text-muted-foreground">
                    The vendor will prepare your order for shipment
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Shipping Notification</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive tracking information once shipped
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    Your order will be delivered to your specified address
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Button asChild variant="outline">
              <Link to="/marketplace">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            <Button asChild>
              <Link to="/">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;