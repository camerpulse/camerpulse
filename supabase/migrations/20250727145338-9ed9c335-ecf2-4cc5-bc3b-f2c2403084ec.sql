-- Phase 1: Enhanced Marketplace Infrastructure

-- Create orders table for order management
CREATE TABLE public.marketplace_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_email TEXT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'XAF',
    order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT,
    stripe_payment_intent_id TEXT,
    stripe_session_id TEXT,
    shipping_address JSONB,
    billing_address JSONB,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order items table
CREATE TABLE public.marketplace_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    product_snapshot JSONB, -- Store product details at time of order
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shopping cart table
CREATE TABLE public.marketplace_cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT, -- For guest users
    product_id UUID REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, product_id),
    UNIQUE(session_id, product_id)
);

-- Create product reviews table
CREATE TABLE public.marketplace_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    review_text TEXT,
    images TEXT[],
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(customer_id, product_id, order_id)
);

-- Create vendor analytics table
CREATE TABLE public.marketplace_vendor_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_products_sold INTEGER DEFAULT 0,
    avg_order_value DECIMAL(10,2) DEFAULT 0,
    customer_count INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(vendor_id, metric_date)
);

-- Add indexes for performance
CREATE INDEX idx_marketplace_orders_customer_id ON public.marketplace_orders(customer_id);
CREATE INDEX idx_marketplace_orders_status ON public.marketplace_orders(order_status);
CREATE INDEX idx_marketplace_orders_created_at ON public.marketplace_orders(created_at);
CREATE INDEX idx_marketplace_order_items_order_id ON public.marketplace_order_items(order_id);
CREATE INDEX idx_marketplace_order_items_vendor_id ON public.marketplace_order_items(vendor_id);
CREATE INDEX idx_marketplace_cart_user_id ON public.marketplace_cart(user_id);
CREATE INDEX idx_marketplace_cart_session_id ON public.marketplace_cart(session_id);
CREATE INDEX idx_marketplace_reviews_product_id ON public.marketplace_reviews(product_id);
CREATE INDEX idx_marketplace_reviews_vendor_id ON public.marketplace_reviews(vendor_id);

-- Enable RLS on all tables
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_vendor_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_orders
CREATE POLICY "Users can view their own orders" ON public.marketplace_orders
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Vendors can view orders containing their products" ON public.marketplace_orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_order_items moi
            JOIN public.marketplace_vendors mv ON moi.vendor_id = mv.id
            WHERE moi.order_id = marketplace_orders.id AND mv.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert orders" ON public.marketplace_orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update orders" ON public.marketplace_orders
    FOR UPDATE USING (true);

-- RLS Policies for marketplace_order_items
CREATE POLICY "Users can view their order items" ON public.marketplace_order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_orders mo
            WHERE mo.id = marketplace_order_items.order_id AND mo.customer_id = auth.uid()
        )
    );

CREATE POLICY "Vendors can view their order items" ON public.marketplace_order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_vendors mv
            WHERE mv.id = marketplace_order_items.vendor_id AND mv.user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage order items" ON public.marketplace_order_items
    FOR ALL USING (true);

-- RLS Policies for marketplace_cart
CREATE POLICY "Users can manage their own cart" ON public.marketplace_cart
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Guest carts by session" ON public.marketplace_cart
    FOR ALL USING (session_id IS NOT NULL AND user_id IS NULL);

-- RLS Policies for marketplace_reviews
CREATE POLICY "Anyone can read reviews" ON public.marketplace_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reviews" ON public.marketplace_reviews
    FOR ALL USING (customer_id = auth.uid());

-- RLS Policies for marketplace_vendor_analytics
CREATE POLICY "Vendors can view their own analytics" ON public.marketplace_vendor_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_vendors mv
            WHERE mv.id = marketplace_vendor_analytics.vendor_id AND mv.user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage analytics" ON public.marketplace_vendor_analytics
    FOR ALL USING (true);

-- Functions for order number generation
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((RANDOM() * 99999)::INTEGER::TEXT, 5, '0');
        
        IF NOT EXISTS (SELECT 1 FROM public.marketplace_orders WHERE order_number = new_number) THEN
            EXIT;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique order number';
        END IF;
    END LOOP;
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON public.marketplace_orders
    FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_marketplace_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_marketplace_orders_updated_at
    BEFORE UPDATE ON public.marketplace_orders
    FOR EACH ROW EXECUTE FUNCTION update_marketplace_updated_at();

CREATE TRIGGER trigger_marketplace_cart_updated_at
    BEFORE UPDATE ON public.marketplace_cart
    FOR EACH ROW EXECUTE FUNCTION update_marketplace_updated_at();

CREATE TRIGGER trigger_marketplace_reviews_updated_at
    BEFORE UPDATE ON public.marketplace_reviews
    FOR EACH ROW EXECUTE FUNCTION update_marketplace_updated_at();