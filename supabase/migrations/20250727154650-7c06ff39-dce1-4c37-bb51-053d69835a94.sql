-- Create marketplace_wishlists table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.marketplace_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on wishlists table
ALTER TABLE public.marketplace_wishlists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketplace_wishlists
CREATE POLICY "Users can manage their own wishlist"
ON public.marketplace_wishlists
FOR ALL
USING (auth.uid()::text = user_id::text);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_wishlists_user_id ON public.marketplace_wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_wishlists_product_id ON public.marketplace_wishlists(product_id);