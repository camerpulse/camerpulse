-- Create marketplace_wishlists table
CREATE TABLE public.marketplace_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create marketplace_reviews table
CREATE TABLE public.marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id, order_id)
);

-- Enable RLS on both tables
ALTER TABLE public.marketplace_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketplace_wishlists
CREATE POLICY "Users can manage their own wishlist"
ON public.marketplace_wishlists
FOR ALL
USING (auth.uid()::text = user_id::text);

-- Create RLS policies for marketplace_reviews
CREATE POLICY "Users can create reviews for their orders"
ON public.marketplace_reviews
FOR INSERT
WITH CHECK (
  auth.uid()::text = user_id::text 
  AND EXISTS (
    SELECT 1 FROM public.marketplace_orders 
    WHERE id = order_id 
    AND customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND order_status = 'delivered'
  )
);

CREATE POLICY "Users can view all reviews"
ON public.marketplace_reviews
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own reviews"
ON public.marketplace_reviews
FOR UPDATE
USING (auth.uid()::text = user_id::text);

-- Create trigger for updated_at on reviews
CREATE TRIGGER update_marketplace_reviews_updated_at
BEFORE UPDATE ON public.marketplace_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_marketplace_updated_at();

-- Create indexes for performance
CREATE INDEX idx_marketplace_wishlists_user_id ON public.marketplace_wishlists(user_id);
CREATE INDEX idx_marketplace_wishlists_product_id ON public.marketplace_wishlists(product_id);
CREATE INDEX idx_marketplace_reviews_user_id ON public.marketplace_reviews(user_id);
CREATE INDEX idx_marketplace_reviews_product_id ON public.marketplace_reviews(product_id);
CREATE INDEX idx_marketplace_reviews_order_id ON public.marketplace_reviews(order_id);