-- Insert vendor data for the 5 Cameroonian marketplace vendors
-- Create vendors and products with proper UUIDs

-- Insert vendors into marketplace_vendors table
INSERT INTO public.marketplace_vendors (
  vendor_id, business_name, description, 
  contact_email, contact_phone, address, verification_status,
  is_verified, total_sales, rating, created_at, updated_at
) VALUES 
-- Vendor 1: Bantu Essentials
(
  'bantu_essentials',
  'Bantu Essentials',
  'Vendor specializing in traditional food staples, spices, and natural beauty products sourced locally.',
  'bantuessentials@example.com',
  '+237 6XX XXX XXX',
  'Douala, Cameroon',
  'verified',
  true,
  125,
  4.5,
  now(),
  now()
),
-- Vendor 2: Douala Tech Supplies  
(
  'douala_tech',
  'Douala Tech Supplies',
  'Specializes in affordable electronics, phone accessories, and small gadgets popular in Cameroon.',
  'doualatechsupplies@example.com',
  '+237 6XX XXX XXX',
  'Douala, Cameroon',
  'verified',
  true,
  89,
  4.3,
  now(),
  now()
),
-- Vendor 3: Yaoundé Fashion Hub
(
  'yaoundefashion',
  'Yaoundé Fashion Hub',
  'Seller of local and modern apparel, traditional wax prints, jewelry, and accessories.',
  'yaoundefashionhub@example.com',
  '+237 6XX XXX XXX',
  'Yaoundé, Cameroon',
  'verified',
  true,
  67,
  4.7,
  now(),
  now()
),
-- Vendor 4: Bamenda Home Goods
(
  'bamendahome',
  'Bamenda Home Goods',
  'Specializing in household items, kitchenware, ceramics, and local handicrafts.',
  'bamendahomegoods@example.com',
  '+237 6XX XXX XXX',
  'Bamenda, Cameroon',
  'verified',
  true,
  43,
  4.4,
  now(),
  now()
),
-- Vendor 5: Limbe Electronics & Appliances
(
  'limbebiz',
  'Limbe Electronics & Appliances',
  'Vendor specializing in household electronics, small appliances, and electrical goods.',
  'limbeelectronics@example.com',
  '+237 6XX XXX XXX',
  'Limbe, Cameroon',
  'verified',
  true,
  156,
  4.2,
  now(),
  now()
);

-- Insert products for all vendors
WITH vendor_products AS (
  SELECT v.id as vendor_id, p.name, p.description, p.price, p.category, p.stock
  FROM (
    SELECT 'bantu_essentials' as vendor_id, 'Cassava Fufu (Water Fufu)' as name, 'Freshly prepared cassava fufu, staple Cameroonian dish' as description, 1500 as price, 'Food Staples' as category, 50 as stock
    UNION ALL SELECT 'bantu_essentials', 'Ndop Rice', 'Locally grown rice variety from Ndop', 1800, 'Food Staples', 75
    UNION ALL SELECT 'bantu_essentials', 'Palm Oil', 'Traditional Cameroonian red palm oil', 2000, 'Cooking Oil', 30
    UNION ALL SELECT 'bantu_essentials', 'Maggi Cubes', 'Popular seasoning cubes used widely in cooking', 500, 'Condiments', 100
    UNION ALL SELECT 'bantu_essentials', 'Cameroon Crushed Pepper Flakes', 'Ground hot pepper flakes for authentic seasoning', 1200, 'Spices', 25
    UNION ALL SELECT 'bantu_essentials', 'Cameroon Tea', 'Native Cameroonian tea leaves, aromatic', 1500, 'Beverage', 40
    UNION ALL SELECT 'bantu_essentials', 'Cocoa Powder', 'Premium cocoa for local baking and drinks', 3500, 'Ingredients', 20
    UNION ALL SELECT 'bantu_essentials', 'Smoked Wild Catfish', 'Traditionally smoked wild catfish', 8000, 'Protein', 15
    UNION ALL SELECT 'bantu_essentials', 'Bio Ginger Root Powder', 'Natural powdered ginger root', 2500, 'Spices', 35
    UNION ALL SELECT 'bantu_essentials', 'Miyonndo Cassava Processed Food', 'Processed cassava-based ready-to-eat', 1000, 'Food Staples', 60
    UNION ALL SELECT 'bantu_essentials', 'Fresh Bio Juice (Mango)', 'Natural mango juice without additives', 800, 'Beverage', 45
    UNION ALL SELECT 'bantu_essentials', 'Extra Fresco Natural Juice', 'Variety pack of fresh fruit juices', 900, 'Beverage', 50
    UNION ALL SELECT 'bantu_essentials', 'African Shea Butter', 'Organic shea butter for skin care', 3000, 'Beauty Product', 25
    UNION ALL SELECT 'bantu_essentials', 'Natural Black Soap', 'Traditional Cameroonian herbal soap', 1200, 'Beauty Product', 80
    UNION ALL SELECT 'bantu_essentials', 'Local Honey', 'Pure honey from Cameroonian highlands', 4000, 'Food Ingredients', 18
    UNION ALL SELECT 'bantu_essentials', 'Dried Crayfish', 'Popular seasoning and protein source for soups', 9000, 'Protein', 12
    UNION ALL SELECT 'bantu_essentials', 'Traditional Palm Wine', 'Fermented palm wine, locally brewed', 1500, 'Beverage', 30
    UNION ALL SELECT 'bantu_essentials', 'Banana Chips', 'Homemade dried and fried banana chips', 700, 'Snacks', 90
    UNION ALL SELECT 'bantu_essentials', 'Cassava Flour', 'Flour made from ground cassava', 1000, 'Baking', 65
    UNION ALL SELECT 'bantu_essentials', 'Groundnut Oil', 'Pressed peanut oil', 2500, 'Cooking Oil', 40
  ) p
  JOIN public.marketplace_vendors v ON v.vendor_id = p.vendor_id
)
INSERT INTO public.marketplace_products (
  vendor_id, name, description, price, currency, category,
  stock_quantity, in_stock, images, created_at, updated_at
)
SELECT 
  vendor_id, name, description, price, 'XAF', category,
  stock, true, 
  ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'],
  now(), now()
FROM vendor_products;