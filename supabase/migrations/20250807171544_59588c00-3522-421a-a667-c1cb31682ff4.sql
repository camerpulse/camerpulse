-- ============================================
-- CAMERPULSE MARKETPLACE DATABASE SCHEMA
-- Complete production-ready marketplace implementation
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- CORE MARKETPLACE TABLES
-- ============================================

-- Marketplace categories table
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_name VARCHAR(50),
  parent_id UUID REFERENCES public.marketplace_categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  meta_title VARCHAR(200),
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Marketplace vendors table (business accounts)
CREATE TABLE IF NOT EXISTS public.marketplace_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- References auth.users
  business_name VARCHAR(200) NOT NULL,
  business_type VARCHAR(50) DEFAULT 'individual', -- individual, company, enterprise
  business_description TEXT,
  business_logo_url TEXT,
  business_banner_url TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  business_address JSONB, -- Store complete address
  verification_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected, suspended
  verification_documents JSONB[], -- Array of document URLs/data
  tax_number VARCHAR(50),
  business_license VARCHAR(100),
  bank_details JSONB, -- Encrypted bank account info
  commission_rate DECIMAL(5,2) DEFAULT 5.00, -- Platform commission percentage
  total_sales DECIMAL(15,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}', -- Vendor preferences and settings
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Marketplace products table
CREATE TABLE IF NOT EXISTS public.marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.marketplace_categories(id),
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) UNIQUE,
  description TEXT NOT NULL,
  short_description VARCHAR(500),
  product_code VARCHAR(100),
  brand VARCHAR(100),
  model VARCHAR(100),
  condition VARCHAR(20) DEFAULT 'new', -- new, used, refurbished
  
  -- Pricing
  price DECIMAL(15,2) NOT NULL,
  compare_price DECIMAL(15,2), -- Original price for discounts
  cost_price DECIMAL(15,2), -- Vendor's cost
  currency VARCHAR(5) DEFAULT 'XAF',
  
  -- Inventory
  track_inventory BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  allow_backorders BOOLEAN DEFAULT false,
  
  -- Physical properties
  weight DECIMAL(8,2), -- in kg
  dimensions JSONB, -- {length, width, height, unit}
  
  -- Product images and media
  images JSONB DEFAULT '[]', -- Array of image URLs
  videos JSONB DEFAULT '[]', -- Array of video URLs
  
  -- SEO and metadata
  meta_title VARCHAR(200),
  meta_description TEXT,
  tags TEXT[], -- Array of tags
  
  -- Status and visibility
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, inactive, out_of_stock
  is_featured BOOLEAN DEFAULT false,
  is_digital BOOLEAN DEFAULT false,
  requires_shipping BOOLEAN DEFAULT true,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product variants (for size, color, etc.)
CREATE TABLE IF NOT EXISTS public.marketplace_product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  option1 VARCHAR(100), -- e.g., Size
  option2 VARCHAR(100), -- e.g., Color
  option3 VARCHAR(100), -- e.g., Material
  price DECIMAL(15,2),
  compare_price DECIMAL(15,2),
  cost_price DECIMAL(15,2),
  sku VARCHAR(100),
  barcode VARCHAR(100),
  weight DECIMAL(8,2),
  inventory_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Shopping cart table
CREATE TABLE IF NOT EXISTS public.marketplace_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- Null for guest carts
  session_id VARCHAR(100), -- For guest users
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.marketplace_product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id, variant_id)
);

-- Wishlists table
CREATE TABLE IF NOT EXISTS public.marketplace_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- References auth.users
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  buyer_id UUID NOT NULL, -- References auth.users
  vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id),
  
  -- Order status
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled, refunded
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, refunded, partially_refunded
  fulfillment_status VARCHAR(20) DEFAULT 'unfulfilled', -- unfulfilled, partial, fulfilled
  
  -- Financial details
  subtotal DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  shipping_amount DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(5) DEFAULT 'XAF',
  
  -- Customer details
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  
  -- Shipping details
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  shipping_method VARCHAR(100),
  tracking_number VARCHAR(100),
  tracking_url TEXT,
  
  -- Payment details
  payment_method VARCHAR(50),
  payment_gateway VARCHAR(50),
  payment_transaction_id VARCHAR(200),
  
  -- Metadata
  notes TEXT,
  tags TEXT[],
  processed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS public.marketplace_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id),
  variant_id UUID REFERENCES public.marketplace_product_variants(id),
  vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id),
  
  -- Item details
  title VARCHAR(300) NOT NULL,
  variant_title VARCHAR(200),
  sku VARCHAR(100),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL,
  
  -- Product snapshot (in case product is deleted)
  product_snapshot JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews and ratings table
CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id),
  user_id UUID NOT NULL, -- References auth.users
  order_id UUID REFERENCES public.marketplace_orders(id),
  
  -- Review details
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  content TEXT,
  images JSONB DEFAULT '[]',
  
  -- Verification
  is_verified_purchase BOOLEAN DEFAULT false,
  
  -- Moderation
  status VARCHAR(20) DEFAULT 'published', -- published, hidden, flagged
  helpful_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, user_id, order_id)
);

-- Coupons and discounts table
CREATE TABLE IF NOT EXISTS public.marketplace_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.marketplace_vendors(id), -- Null for platform-wide coupons
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Discount details
  discount_type VARCHAR(20) NOT NULL, -- percentage, fixed_amount, free_shipping
  discount_value DECIMAL(15,2) NOT NULL,
  minimum_order_amount DECIMAL(15,2),
  maximum_discount_amount DECIMAL(15,2),
  
  -- Usage limits
  usage_limit INTEGER, -- Total usage limit
  usage_limit_per_customer INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  
  -- Applicable products/categories
  applicable_products JSONB DEFAULT '[]', -- Array of product IDs
  applicable_categories JSONB DEFAULT '[]', -- Array of category IDs
  
  -- Validity
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Shipping zones and rates
CREATE TABLE IF NOT EXISTS public.marketplace_shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.marketplace_vendors(id), -- Null for platform default
  name VARCHAR(200) NOT NULL,
  countries JSONB DEFAULT '[]', -- Array of country codes
  regions JSONB DEFAULT '[]', -- Array of regions/states
  cities JSONB DEFAULT '[]', -- Array of cities
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketplace_shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES public.marketplace_shipping_zones(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  
  -- Rate calculation
  rate_type VARCHAR(20) DEFAULT 'flat_rate', -- flat_rate, weight_based, price_based
  base_price DECIMAL(15,2) NOT NULL,
  
  -- Weight-based rates
  weight_unit VARCHAR(10) DEFAULT 'kg',
  price_per_weight DECIMAL(15,2) DEFAULT 0,
  
  -- Delivery estimates
  min_delivery_days INTEGER,
  max_delivery_days INTEGER,
  
  -- Conditions
  min_order_amount DECIMAL(15,2) DEFAULT 0,
  max_order_amount DECIMAL(15,2),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_shipping_rates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Categories: Public read access
CREATE POLICY "marketplace_categories_select" ON public.marketplace_categories FOR SELECT USING (is_active = true);

-- Vendors: Public read for verified, owners can manage
CREATE POLICY "marketplace_vendors_select" ON public.marketplace_vendors FOR SELECT USING (
  verification_status = 'verified' OR user_id = auth.uid()
);
CREATE POLICY "marketplace_vendors_insert" ON public.marketplace_vendors FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "marketplace_vendors_update" ON public.marketplace_vendors FOR UPDATE USING (user_id = auth.uid());

-- Products: Public read for active, vendors can manage their own
CREATE POLICY "marketplace_products_select" ON public.marketplace_products FOR SELECT USING (
  status = 'active' OR vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid())
);
CREATE POLICY "marketplace_products_insert" ON public.marketplace_products FOR INSERT WITH CHECK (
  vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid())
);
CREATE POLICY "marketplace_products_update" ON public.marketplace_products FOR UPDATE USING (
  vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid())
);
CREATE POLICY "marketplace_products_delete" ON public.marketplace_products FOR DELETE USING (
  vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid())
);

-- Product variants: Same as products
CREATE POLICY "marketplace_product_variants_select" ON public.marketplace_product_variants FOR SELECT USING (
  product_id IN (
    SELECT id FROM public.marketplace_products 
    WHERE status = 'active' OR vendor_id IN (
      SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "marketplace_product_variants_insert" ON public.marketplace_product_variants FOR INSERT WITH CHECK (
  product_id IN (
    SELECT id FROM public.marketplace_products 
    WHERE vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid())
  )
);
CREATE POLICY "marketplace_product_variants_update" ON public.marketplace_product_variants FOR UPDATE USING (
  product_id IN (
    SELECT id FROM public.marketplace_products 
    WHERE vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid())
  )
);
CREATE POLICY "marketplace_product_variants_delete" ON public.marketplace_product_variants FOR DELETE USING (
  product_id IN (
    SELECT id FROM public.marketplace_products 
    WHERE vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid())
  )
);

-- Cart: Users can manage their own cart
CREATE POLICY "marketplace_cart_select" ON public.marketplace_cart FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "marketplace_cart_insert" ON public.marketplace_cart FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "marketplace_cart_update" ON public.marketplace_cart FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "marketplace_cart_delete" ON public.marketplace_cart FOR DELETE USING (user_id = auth.uid());

-- Wishlists: Users can manage their own wishlist
CREATE POLICY "marketplace_wishlists_select" ON public.marketplace_wishlists FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "marketplace_wishlists_insert" ON public.marketplace_wishlists FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "marketplace_wishlists_delete" ON public.marketplace_wishlists FOR DELETE USING (user_id = auth.uid());

-- Orders: Users can see their own orders, vendors can see orders for their products
CREATE POLICY "marketplace_orders_select" ON public.marketplace_orders FOR SELECT USING (
  buyer_id = auth.uid() OR vendor_id IN (
    SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()
  )
);
CREATE POLICY "marketplace_orders_insert" ON public.marketplace_orders FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "marketplace_orders_update" ON public.marketplace_orders FOR UPDATE USING (
  buyer_id = auth.uid() OR vendor_id IN (
    SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()
  )
);

-- Order items: Same as orders
CREATE POLICY "marketplace_order_items_select" ON public.marketplace_order_items FOR SELECT USING (
  order_id IN (
    SELECT id FROM public.marketplace_orders 
    WHERE buyer_id = auth.uid() OR vendor_id IN (
      SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "marketplace_order_items_insert" ON public.marketplace_order_items FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM public.marketplace_orders WHERE buyer_id = auth.uid())
);

-- Reviews: Public read, users can manage their own
CREATE POLICY "marketplace_reviews_select" ON public.marketplace_reviews FOR SELECT USING (status = 'published');
CREATE POLICY "marketplace_reviews_insert" ON public.marketplace_reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "marketplace_reviews_update" ON public.marketplace_reviews FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "marketplace_reviews_delete" ON public.marketplace_reviews FOR DELETE USING (user_id = auth.uid());

-- Coupons: Public read for active, vendors can manage their own
CREATE POLICY "marketplace_coupons_select" ON public.marketplace_coupons FOR SELECT USING (
  is_active = true AND starts_at <= now() AND expires_at >= now()
);
CREATE POLICY "marketplace_coupons_insert" ON public.marketplace_coupons FOR INSERT WITH CHECK (
  vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()) OR vendor_id IS NULL
);
CREATE POLICY "marketplace_coupons_update" ON public.marketplace_coupons FOR UPDATE USING (
  vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()) OR vendor_id IS NULL
);
CREATE POLICY "marketplace_coupons_delete" ON public.marketplace_coupons FOR DELETE USING (
  vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()) OR vendor_id IS NULL
);

-- Shipping zones: Vendors can manage their own
CREATE POLICY "marketplace_shipping_zones_select" ON public.marketplace_shipping_zones FOR SELECT USING (true);
CREATE POLICY "marketplace_shipping_zones_insert" ON public.marketplace_shipping_zones FOR INSERT WITH CHECK (
  vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()) OR vendor_id IS NULL
);
CREATE POLICY "marketplace_shipping_zones_update" ON public.marketplace_shipping_zones FOR UPDATE USING (
  vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()) OR vendor_id IS NULL
);
CREATE POLICY "marketplace_shipping_zones_delete" ON public.marketplace_shipping_zones FOR DELETE USING (
  vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()) OR vendor_id IS NULL
);

-- Shipping rates: Same as zones
CREATE POLICY "marketplace_shipping_rates_select" ON public.marketplace_shipping_rates FOR SELECT USING (is_active = true);
CREATE POLICY "marketplace_shipping_rates_insert" ON public.marketplace_shipping_rates FOR INSERT WITH CHECK (
  zone_id IN (
    SELECT id FROM public.marketplace_shipping_zones 
    WHERE vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()) OR vendor_id IS NULL
  )
);
CREATE POLICY "marketplace_shipping_rates_update" ON public.marketplace_shipping_rates FOR UPDATE USING (
  zone_id IN (
    SELECT id FROM public.marketplace_shipping_zones 
    WHERE vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()) OR vendor_id IS NULL
  )
);
CREATE POLICY "marketplace_shipping_rates_delete" ON public.marketplace_shipping_rates FOR DELETE USING (
  zone_id IN (
    SELECT id FROM public.marketplace_shipping_zones 
    WHERE vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()) OR vendor_id IS NULL
  )
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_marketplace_categories_parent_id ON public.marketplace_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_categories_slug ON public.marketplace_categories(slug);
CREATE INDEX IF NOT EXISTS idx_marketplace_categories_active ON public.marketplace_categories(is_active);

CREATE INDEX IF NOT EXISTS idx_marketplace_vendors_user_id ON public.marketplace_vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_vendors_verification ON public.marketplace_vendors(verification_status);
CREATE INDEX IF NOT EXISTS idx_marketplace_vendors_featured ON public.marketplace_vendors(is_featured);

CREATE INDEX IF NOT EXISTS idx_marketplace_products_vendor_id ON public.marketplace_products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category_id ON public.marketplace_products(category_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_status ON public.marketplace_products(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_featured ON public.marketplace_products(is_featured);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_slug ON public.marketplace_products(slug);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_created_at ON public.marketplace_products(created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_price ON public.marketplace_products(price);

CREATE INDEX IF NOT EXISTS idx_marketplace_product_variants_product_id ON public.marketplace_product_variants(product_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_cart_user_id ON public.marketplace_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_cart_session_id ON public.marketplace_cart(session_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_wishlists_user_id ON public.marketplace_wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_wishlists_product_id ON public.marketplace_wishlists(product_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer_id ON public.marketplace_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_vendor_id ON public.marketplace_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON public.marketplace_orders(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_created_at ON public.marketplace_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_order_number ON public.marketplace_orders(order_number);

CREATE INDEX IF NOT EXISTS idx_marketplace_order_items_order_id ON public.marketplace_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_order_items_product_id ON public.marketplace_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_order_items_vendor_id ON public.marketplace_order_items(vendor_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_product_id ON public.marketplace_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_vendor_id ON public.marketplace_reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_user_id ON public.marketplace_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_status ON public.marketplace_reviews(status);

CREATE INDEX IF NOT EXISTS idx_marketplace_coupons_code ON public.marketplace_coupons(code);
CREATE INDEX IF NOT EXISTS idx_marketplace_coupons_vendor_id ON public.marketplace_coupons(vendor_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_coupons_active ON public.marketplace_coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_marketplace_coupons_expires_at ON public.marketplace_coupons(expires_at);

-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Update timestamps
CREATE TRIGGER marketplace_categories_updated_at 
  BEFORE UPDATE ON public.marketplace_categories 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER marketplace_vendors_updated_at 
  BEFORE UPDATE ON public.marketplace_vendors 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER marketplace_products_updated_at 
  BEFORE UPDATE ON public.marketplace_products 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER marketplace_product_variants_updated_at 
  BEFORE UPDATE ON public.marketplace_product_variants 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER marketplace_cart_updated_at 
  BEFORE UPDATE ON public.marketplace_cart 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER marketplace_orders_updated_at 
  BEFORE UPDATE ON public.marketplace_orders 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER marketplace_reviews_updated_at 
  BEFORE UPDATE ON public.marketplace_reviews 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER marketplace_coupons_updated_at 
  BEFORE UPDATE ON public.marketplace_coupons 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER marketplace_shipping_zones_updated_at 
  BEFORE UPDATE ON public.marketplace_shipping_zones 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER marketplace_shipping_rates_updated_at 
  BEFORE UPDATE ON public.marketplace_shipping_rates 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate slugs for products
CREATE OR REPLACE FUNCTION public.generate_product_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Create base slug from title
    base_slug := lower(trim(regexp_replace(NEW.title, '[^a-zA-Z0-9\s]', '', 'g')));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(base_slug, '-');
    
    final_slug := base_slug;
    
    -- Check for uniqueness
    WHILE EXISTS (SELECT 1 FROM public.marketplace_products WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER marketplace_products_set_slug 
  BEFORE INSERT OR UPDATE ON public.marketplace_products 
  FOR EACH ROW EXECUTE FUNCTION public.generate_product_slug();

-- Auto-generate order numbers
CREATE TRIGGER marketplace_orders_set_order_number 
  BEFORE INSERT ON public.marketplace_orders 
  FOR EACH ROW EXECUTE FUNCTION public.set_order_number();

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample categories
INSERT INTO public.marketplace_categories (name, slug, description, icon_name, sort_order) VALUES
('Electronics', 'electronics', 'Phones, computers, gadgets and electronic accessories', 'Smartphone', 1),
('Fashion', 'fashion', 'Clothing, shoes, accessories for men, women and children', 'Shirt', 2),
('Food & Beverages', 'food', 'Traditional foods, spices, beverages and snacks', 'Coffee', 3),
('Arts & Crafts', 'arts', 'Traditional art, handmade items, sculptures and paintings', 'Palette', 4),
('Home & Garden', 'home', 'Furniture, decoration, kitchen items and garden tools', 'Home', 5),
('Health & Beauty', 'health', 'Skincare, healthcare products, beauty items and wellness', 'Stethoscope', 6),
('Sports & Fitness', 'sports', 'Sports equipment, fitness gear, clothing and supplements', 'Dumbbell', 7),
('Books & Media', 'books', 'Books, music, movies, games and educational materials', 'Book', 8),
('Automotive', 'automotive', 'Car parts, accessories, tools and care products', 'Car', 9)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample shipping zones
INSERT INTO public.marketplace_shipping_zones (name, countries, regions, cities) VALUES
('Cameroon - Major Cities', '["CM"]', '[]', '["Douala", "Yaoundé", "Bamenda", "Bafoussam", "Limbe"]'),
('Cameroon - Other Cities', '["CM"]', '[]', '[]'),
('Central Africa', '["TD", "CF", "GQ", "GA"]', '[]', '[]'),
('West Africa', '["NG", "GH", "BF", "ML", "SN", "CI"]', '[]', '[]')
ON CONFLICT DO NOTHING;

-- Insert sample shipping rates
INSERT INTO public.marketplace_shipping_rates (zone_id, name, base_price, min_delivery_days, max_delivery_days) 
SELECT 
  z.id,
  CASE 
    WHEN z.name = 'Cameroon - Major Cities' THEN 'Standard Delivery'
    WHEN z.name = 'Cameroon - Other Cities' THEN 'Regional Delivery'
    WHEN z.name = 'Central Africa' THEN 'Central Africa Shipping'
    WHEN z.name = 'West Africa' THEN 'West Africa Shipping'
  END,
  CASE 
    WHEN z.name = 'Cameroon - Major Cities' THEN 1000
    WHEN z.name = 'Cameroon - Other Cities' THEN 2000
    WHEN z.name = 'Central Africa' THEN 5000
    WHEN z.name = 'West Africa' THEN 8000
  END,
  CASE 
    WHEN z.name = 'Cameroon - Major Cities' THEN 1
    WHEN z.name = 'Cameroon - Other Cities' THEN 2
    WHEN z.name = 'Central Africa' THEN 5
    WHEN z.name = 'West Africa' THEN 7
  END,
  CASE 
    WHEN z.name = 'Cameroon - Major Cities' THEN 3
    WHEN z.name = 'Cameroon - Other Cities' THEN 5
    WHEN z.name = 'Central Africa' THEN 10
    WHEN z.name = 'West Africa' THEN 14
  END
FROM public.marketplace_shipping_zones z
ON CONFLICT DO NOTHING;