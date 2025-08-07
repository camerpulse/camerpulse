import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category_id: string;
  vendor_id: string;
  images: string[];
  in_stock: boolean;
  stock_quantity: number;
  status: string;
  featured: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  vendor?: {
    id: string;
    business_name: string;
    verification_status: string;
    rating: number;
    location: string;
  };
}

export interface MarketplaceVendor {
  id: string;
  business_name: string;
  business_type: string;
  verification_status: string;
  rating: number;
  total_products: number;
  total_sales: number;
  location: string;
  description: string;
  created_at: string;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  product_count: number;
  parent_id?: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: MarketplaceProduct;
}

export interface FilterOptions {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  verified?: boolean;
  location?: string;
  inStock?: boolean;
  search?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export const useMarketplace = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterOptions>({});

  // Fetch products with filters
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['marketplace-products', filters],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_products')
        .select(`
          *,
          category:marketplace_categories(*),
          vendor:marketplace_vendors(*)
        `)
        .eq('status', 'approved');

      // Apply filters
      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }
      if (filters.priceMin) {
        query = query.gte('price', filters.priceMin);
      }
      if (filters.priceMax) {
        query = query.lte('price', filters.priceMax);
      }
      if (filters.inStock) {
        query = query.eq('in_stock', true);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;
      if (error) throw error;
      return data as MarketplaceProduct[];
    }
  });

  // Fetch featured products
  const {
    data: featuredProducts = [],
    isLoading: featuredLoading
  } = useQuery({
    queryKey: ['marketplace-featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_products')
        .select(`
          *,
          category:marketplace_categories(*),
          vendor:marketplace_vendors(*)
        `)
        .eq('featured', true)
        .eq('status', 'approved')
        .limit(12);

      if (error) throw error;
      return data as MarketplaceProduct[];
    }
  });

  // Fetch categories
  const {
    data: categories = [],
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['marketplace-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as MarketplaceCategory[];
    }
  });

  // Fetch vendors
  const {
    data: vendors = [],
    isLoading: vendorsLoading
  } = useQuery({
    queryKey: ['marketplace-vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_vendors')
        .select('*')
        .eq('verification_status', 'verified')
        .order('rating', { ascending: false });

      if (error) throw error;
      return data as MarketplaceVendor[];
    }
  });

  // Fetch cart items
  const {
    data: cartItems = [],
    isLoading: cartLoading,
    refetch: refetchCart
  } = useQuery({
    queryKey: ['marketplace-cart'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('marketplace_cart')
        .select(`
          *,
          product:marketplace_products(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data as CartItem[];
    }
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to add to cart');

      // Check if item already in cart
      const { data: existingItem } = await supabase
        .from('marketplace_cart')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('marketplace_cart')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);
        
        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from('marketplace_cart')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-cart'] });
      toast({
        title: "Added to Cart",
        description: "Product has been added to your cart.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('marketplace_cart')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-cart'] });
      toast({
        title: "Removed from Cart",
        description: "Product has been removed from your cart.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update cart quantity mutation
  const updateCartQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        return removeFromCartMutation.mutateAsync(itemId);
      }

      const { error } = await supabase
        .from('marketplace_cart')
        .update({ quantity })
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-cart'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('marketplace_cart')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-cart'] });
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      cartItems: CartItem[];
      shippingAddress: any;
      paymentMethod: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to create order');

      // Calculate totals
      const subtotal = orderData.cartItems.reduce((sum, item) => 
        sum + (item.product?.price || 0) * item.quantity, 0
      );
      const shipping = 0; // Calculate shipping
      const tax = subtotal * 0.18; // 18% VAT for Cameroon
      const total = subtotal + shipping + tax;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('marketplace_orders')
        .insert({
          buyer_id: user.id,
          total_amount: total,
          subtotal,
          tax_amount: tax,
          shipping_amount: shipping,
          currency: 'XAF',
          status: 'pending_payment',
          shipping_address: orderData.shippingAddress,
          payment_method: orderData.paymentMethod
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        vendor_id: item.product?.vendor_id || '',
        quantity: item.quantity,
        price: item.product?.price || 0,
        total: (item.product?.price || 0) * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('marketplace_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: (order) => {
      // Clear cart after successful order
      clearCartMutation.mutate();
      toast({
        title: "Order Created",
        description: `Order ${order.order_number} has been created successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Order Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const cartTotal = cartItems.reduce((sum, item) => 
    sum + (item.product?.price || 0) * item.quantity, 0
  );

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    // Data
    products,
    featuredProducts,
    categories,
    vendors,
    cartItems,
    cartTotal,
    cartItemCount,
    filters,

    // Loading states
    productsLoading,
    featuredLoading,
    categoriesLoading,
    vendorsLoading,
    cartLoading,

    // Errors
    productsError,

    // Actions
    addToCart: addToCartMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    updateCartQuantity: updateCartQuantityMutation.mutate,
    clearCart: clearCartMutation.mutate,
    createOrder: createOrderMutation.mutate,
    updateFilters,
    clearFilters,
    refetchProducts,
    refetchCart,

    // Mutation states
    isAddingToCart: addToCartMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
    isUpdatingQuantity: updateCartQuantityMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
    isCreatingOrder: createOrderMutation.isPending
  };
};

export const useMarketplaceProduct = (productId: string) => {
  return useQuery({
    queryKey: ['marketplace-product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_products')
        .select(`
          *,
          category:marketplace_categories(*),
          vendor:marketplace_vendors(*)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data as MarketplaceProduct;
    },
    enabled: !!productId
  });
};

export const useMarketplaceVendor = (vendorId: string) => {
  return useQuery({
    queryKey: ['marketplace-vendor', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

      if (error) throw error;
      return data as MarketplaceVendor;
    },
    enabled: !!vendorId
  });
};