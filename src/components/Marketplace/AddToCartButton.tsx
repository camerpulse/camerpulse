import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
  className?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ 
  productId, 
  disabled = false,
  className = "" 
}) => {
  const [loading, setLoading] = useState(false);

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
        .eq('product_id', productId);

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
          product_id: productId,
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

  return (
    <Button
      onClick={addToCart}
      disabled={disabled || loading}
      className={className}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {loading ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
};