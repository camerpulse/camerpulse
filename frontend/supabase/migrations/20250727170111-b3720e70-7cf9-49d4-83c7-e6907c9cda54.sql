-- Create customer wishlist table
CREATE TABLE public.customer_wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

-- Create customer addresses table
CREATE TABLE public.customer_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  address_type TEXT NOT NULL DEFAULT 'home',
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'Cameroon',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer preferences table
CREATE TABLE public.customer_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL UNIQUE,
  notification_preferences JSONB NOT NULL DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
  language_preference TEXT NOT NULL DEFAULT 'en',
  currency_preference TEXT NOT NULL DEFAULT 'XAF',
  preferred_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.customer_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create product categories table for filtering
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_category_id UUID REFERENCES product_categories(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add category_id to marketplace_products
ALTER TABLE marketplace_products ADD COLUMN category_id UUID REFERENCES product_categories(id);

-- Create order tracking events table
CREATE TABLE public.order_tracking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  tracking_number TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS on all tables
ALTER TABLE customer_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customer_wishlist
CREATE POLICY "Users can manage their own wishlist" ON customer_wishlist
  FOR ALL USING (customer_id = auth.uid());

-- Create RLS policies for customer_addresses
CREATE POLICY "Users can manage their own addresses" ON customer_addresses
  FOR ALL USING (customer_id = auth.uid());

-- Create RLS policies for customer_preferences
CREATE POLICY "Users can manage their own preferences" ON customer_preferences
  FOR ALL USING (customer_id = auth.uid());

-- Create RLS policies for customer_notifications
CREATE POLICY "Users can view their own notifications" ON customer_notifications
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Users can update their notification read status" ON customer_notifications
  FOR UPDATE USING (customer_id = auth.uid());

-- Create RLS policies for product_categories
CREATE POLICY "Anyone can view active categories" ON product_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON product_categories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create RLS policies for order_tracking_events
CREATE POLICY "Users can view tracking for their orders" ON order_tracking_events
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM marketplace_orders 
    WHERE marketplace_orders.id = order_tracking_events.order_id 
    AND marketplace_orders.customer_id = auth.uid()
  ));

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_addresses_updated_at 
  BEFORE UPDATE ON customer_addresses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_preferences_updated_at 
  BEFORE UPDATE ON customer_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default product categories
INSERT INTO product_categories (name, description, sort_order) VALUES
  ('Electronics', 'Electronic devices and accessories', 1),
  ('Fashion', 'Clothing, shoes, and accessories', 2),
  ('Home & Garden', 'Home improvement and garden supplies', 3),
  ('Sports & Outdoors', 'Sports equipment and outdoor gear', 4),
  ('Books & Media', 'Books, movies, music, and games', 5),
  ('Health & Beauty', 'Health, beauty, and personal care products', 6),
  ('Food & Beverages', 'Food, drinks, and culinary products', 7),
  ('Automotive', 'Car parts and automotive accessories', 8);