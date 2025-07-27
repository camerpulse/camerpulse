import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ShoppingCart, 
  Star, 
  Heart, 
  Eye,
  Shield,
  Truck
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category?: string;
  images?: string[];
  in_stock?: boolean;
  stock_quantity?: number;
  vendor_id: string;
  vendor?: {
    id: string;
    business_name: string;
    vendor_id: string;
    verification_status: string;
    rating?: number;
  };
}

export const ProductCard = ({ product }: { product: Product }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number, currency = 'XAF') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'XAF' ? 'XAF' : currency
    }).format(price);
  };

  const handlePurchase = async () => {
    if (!product.in_stock) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      toast({
        title: "Processing...",
        description: "Creating secure checkout session...",
      });

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          productId: product.id,
          quantity: 1,
          customerInfo: {
            // Add any pre-filled customer info here if available
          }
        }
      });

      if (error) throw error;

      if (data.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Checkout Opened",
          description: "Complete your purchase in the new tab.",
        });
      } else {
        throw new Error('No checkout URL returned');
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getProductImage = () => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return `https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop`;
  };

  return (
    <Card className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={getProductImage()} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button size="icon" variant="secondary" className="h-10 w-10">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="h-10 w-10">
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Stock Badge */}
        {product.in_stock === false && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white">
            Out of Stock
          </Badge>
        )}
        
        {/* Category Badge */}
        {product.category && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
            {product.category}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        {/* Product Info */}
        <div className="mb-3">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="text-xl font-bold text-primary">
            {formatPrice(product.price, product.currency)}
          </div>
          {product.stock_quantity && product.stock_quantity < 10 && (
            <p className="text-xs text-orange-500">
              Only {product.stock_quantity} left in stock
            </p>
          )}
        </div>

        {/* Vendor Info */}
        {product.vendor && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {product.vendor.business_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {product.vendor.business_name}
              </p>
              <div className="flex items-center gap-1">
                {product.vendor.verification_status === 'verified' && (
                  <Shield className="h-3 w-3 text-cm-green" />
                )}
                <span className="text-xs text-muted-foreground">
                  {product.vendor.vendor_id}
                </span>
              </div>
            </div>
            {product.vendor.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-accent fill-current" />
                <span className="text-xs">{product.vendor.rating}</span>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-3 gap-1 mb-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3 w-3 text-cm-green" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Truck className="h-3 w-3 text-primary" />
            <span>Fast Ship</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CreditCard className="h-3 w-3 text-cm-yellow" />
            <span>Escrow</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            disabled={!product.in_stock || isProcessing}
            size="sm"
            onClick={handlePurchase}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4 mr-2" />
            )}
            {isProcessing ? 'Processing...' : product.in_stock ? 'Buy Now' : 'Out of Stock'}
          </Button>
          
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};