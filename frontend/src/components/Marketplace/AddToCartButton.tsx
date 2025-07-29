import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  product: any;
  className?: string;
}

export const AddToCartButton = ({ product, className }: AddToCartButtonProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Check if product is in wishlist
  const { data: isInWishlist } = useQuery({
    queryKey: ['wishlist-status', product.id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('marketplace_wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();
      
      return !error && !!data;
    },
    enabled: !!user,
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('Please log in to add to wishlist');
      }

      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('marketplace_wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);

        if (error) throw error;
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('marketplace_wishlists')
          .insert([{
            user_id: user.id,
            product_id: product.id,
          }]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
      queryClient.invalidateQueries({ queryKey: ['wishlist-status', product.id] });
      queryClient.invalidateQueries({ queryKey: ['customer-wishlist'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getOrCreateSessionId = () => {
    let sessionId = sessionStorage.getItem('guest_session_id');
    if (!sessionId) {
      sessionId = 'guest_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('guest_session_id', sessionId);
    }
    return sessionId;
  };

  const addToCart = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      // Check if item already exists in cart
      let existingItemQuery = supabase
        .from('marketplace_cart')
        .select('id, quantity')
        .eq('product_id', product.id);

      if (user) {
        existingItemQuery = existingItemQuery.eq('user_id', user.id);
      } else {
        const sessionId = getOrCreateSessionId();
        existingItemQuery = existingItemQuery.eq('session_id', sessionId);
      }

      const { data: existingItems, error: fetchError } = await existingItemQuery;
      
      if (fetchError) throw fetchError;

      if (existingItems && existingItems.length > 0) {
        // Update existing item quantity
        const { error: updateError } = await supabase
          .from('marketplace_cart')
          .update({ quantity: existingItems[0].quantity + 1 })
          .eq('id', existingItems[0].id);

        if (updateError) throw updateError;
        toast.success('Cart updated! Quantity increased.');
      } else {
        // Add new item to cart
        const cartData: any = {
          product_id: product.id,
          quantity: 1
        };

        if (user) {
          cartData.user_id = user.id;
        } else {
          cartData.session_id = getOrCreateSessionId();
        }

        const { error: insertError } = await supabase
          .from('marketplace_cart')
          .insert(cartData);

        if (insertError) throw insertError;
        toast.success('Added to cart!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlistMutation.mutate();
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={addToCart}
        disabled={loading}
        className={cn("flex-1", className)}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        {loading ? 'Adding...' : 'Add to Cart'}
      </Button>
      
      {user && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleWishlist}
          disabled={toggleWishlistMutation.isPending}
        >
          <Heart className={cn("w-4 h-4", isInWishlist && "fill-red-500 text-red-500")} />
        </Button>
      )}
    </div>
  );
};