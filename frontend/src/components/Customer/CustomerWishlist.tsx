import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddToCartButton } from '@/components/Marketplace/AddToCartButton';
import { Heart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const CustomerWishlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ['customer-wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('customer_wishlist')
        .select(`
          *,
          marketplace_products (
            *,
            marketplace_vendors (business_name)
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('customer_wishlist')
        .delete()
        .eq('customer_id', user?.id)
        .eq('product_id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Removed from wishlist');
      queryClient.invalidateQueries({ queryKey: ['customer-wishlist'] });
    },
    onError: (error) => {
      toast.error('Failed to remove from wishlist');
      console.error('Error removing from wishlist:', error);
    },
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-48 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Wishlist</h2>
        <p className="text-muted-foreground">Products you want to buy later</p>
      </div>

      {wishlistItems?.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground">Add products you love to your wishlist!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems?.map((item) => {
            const product = item.marketplace_products;
            return (
              <Card key={item.id} className="group">
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <img
                      src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                      onClick={() => removeFromWishlistMutation.mutate(product.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {product.marketplace_vendors?.business_name}
                      </p>
                    </div>

                    <p className="text-lg font-bold text-primary">
                      {product.price.toLocaleString()} XAF
                    </p>

                    <div className="flex items-center space-x-2">
                      <AddToCartButton 
                        product={product} 
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromWishlistMutation.mutate(product.id)}
                      >
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};