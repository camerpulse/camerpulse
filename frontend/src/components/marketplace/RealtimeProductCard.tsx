import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Eye, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
  category: string;
  vendor_id: string;
  created_at: string;
  updated_at: string;
}

interface RealtimeProductCardProps {
  productId: string;
  userId?: string;
}

export const RealtimeProductCard: React.FC<RealtimeProductCardProps> = ({ 
  productId, 
  userId 
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    // Initial product fetch
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('marketplace_products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;
        setProduct({
          ...data,
          title: (data as any).title || (data as any).name || 'Untitled Product'
        });
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();

    // Set up real-time subscription
    const channel = supabase
      .channel(`product-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'marketplace_products',
          filter: `id=eq.${productId}`
        },
        (payload) => {
          const updatedProduct = payload.new as Product;
          setProduct(updatedProduct);
          setLastUpdated(new Date());
          
          // Show update notification
          toast.info('Product updated in real-time!', {
            description: 'Price or inventory has been updated'
          });
        }
      )
      .subscribe();

    // Track product views
    const viewChannel = supabase
      .channel(`product-views-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'product_views',
          filter: `product_id=eq.${productId}`
        },
        () => {
          setViewCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(viewChannel);
    };
  }, [productId]);

  const handleAddToCart = async () => {
    if (!userId) {
      toast.error('Please log in to add items to cart');
      return;
    }

    if (!product || product.stock_quantity === 0) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      // In a real app, you'd add to cart table
      toast.success('Added to cart!');
      
      // Track the interaction
      await supabase.rpc('increment_product_view', {
        p_product_id: productId,
        p_user_id: userId,
        p_session_id: `session_${Date.now()}`
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!product) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Product not found</p>
        </CardContent>
      </Card>
    );
  }

  const isLowStock = product.stock_quantity <= 5;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <Card className="relative overflow-hidden">
      {lastUpdated && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-300">
            <TrendingUp className="h-3 w-3 mr-1" />
            Updated
          </Badge>
        </div>
      )}

      <CardHeader className="p-4">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-40 object-cover rounded-md mb-4"
          />
        )}
        <CardTitle className="text-lg">{product.title}</CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'XAF'
              }).format(product.price)}
            </span>
            <Badge variant="outline">{product.category}</Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className={isOutOfStock ? 'text-red-500' : isLowStock ? 'text-yellow-500' : 'text-green-500'}>
                {isOutOfStock ? 'Out of Stock' : `${product.stock_quantity} in stock`}
              </span>
              {isLowStock && !isOutOfStock && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{viewCount}</span>
            </div>
          </div>

          <Button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>

          {lastUpdated && (
            <p className="text-xs text-muted-foreground text-center">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};