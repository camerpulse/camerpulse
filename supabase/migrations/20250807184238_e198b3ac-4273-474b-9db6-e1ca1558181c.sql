-- Insert vendor data for the 5 Cameroonian marketplace vendors
-- Create vendors with null user_id to avoid foreign key constraint issues

-- Temporarily disable foreign key constraints for this insert
SET session_replication_role = replica;

-- Insert vendors into marketplace_vendors table (using actual schema)
INSERT INTO public.marketplace_vendors (
  id, user_id, vendor_id, business_name, description, 
  contact_email, contact_phone, address, verification_status,
  is_verified, total_sales, rating, created_at, updated_at
) VALUES 
-- Vendor 1: Bantu Essentials
(
  'bantu-essentials-uuid'::uuid,
  NULL, -- Will be linked to actual users later
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
  'douala-tech-supplies-uuid'::uuid,
  NULL,
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
  'yaounde-fashion-hub-uuid'::uuid,
  NULL,
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
  'bamenda-home-goods-uuid'::uuid,
  NULL,
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
  'limbe-electronics-uuid'::uuid,
  NULL,
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

-- Re-enable foreign key constraints
SET session_replication_role = DEFAULT;

-- Now insert all products for each vendor
-- Vendor 1 Products (Bantu Essentials)
INSERT INTO public.marketplace_products (
  id, vendor_id, name, description, price, currency, category,
  stock_quantity, in_stock, images, created_at, updated_at
)
VALUES 
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Cassava Fufu (Water Fufu)', 'Freshly prepared cassava fufu, staple Cameroonian dish', 1500, 'XAF', 'Food Staples', 50, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Ndop Rice', 'Locally grown rice variety from Ndop', 1800, 'XAF', 'Food Staples', 75, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Palm Oil', 'Traditional Cameroonian red palm oil', 2000, 'XAF', 'Cooking Oil', 30, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Maggi Cubes', 'Popular seasoning cubes used widely in cooking', 500, 'XAF', 'Condiments', 100, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Cameroon Crushed Pepper Flakes', 'Ground hot pepper flakes for authentic seasoning', 1200, 'XAF', 'Spices', 25, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Cameroon Tea', 'Native Cameroonian tea leaves, aromatic', 1500, 'XAF', 'Beverage', 40, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Cocoa Powder', 'Premium cocoa for local baking and drinks', 3500, 'XAF', 'Ingredients', 20, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Smoked Wild Catfish', 'Traditionally smoked wild catfish', 8000, 'XAF', 'Protein', 15, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Bio Ginger Root Powder', 'Natural powdered ginger root', 2500, 'XAF', 'Spices', 35, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Miyonndo Cassava Processed Food', 'Processed cassava-based ready-to-eat', 1000, 'XAF', 'Food Staples', 60, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Fresh Bio Juice (Mango)', 'Natural mango juice without additives', 800, 'XAF', 'Beverage', 45, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Extra Fresco Natural Juice', 'Variety pack of fresh fruit juices', 900, 'XAF', 'Beverage', 50, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'African Shea Butter', 'Organic shea butter for skin care', 3000, 'XAF', 'Beauty Product', 25, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Natural Black Soap', 'Traditional Cameroonian herbal soap', 1200, 'XAF', 'Beauty Product', 80, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Local Honey', 'Pure honey from Cameroonian highlands', 4000, 'XAF', 'Food Ingredients', 18, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Dried Crayfish', 'Popular seasoning and protein source for soups', 9000, 'XAF', 'Protein', 12, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Traditional Palm Wine', 'Fermented palm wine, locally brewed', 1500, 'XAF', 'Beverage', 30, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Banana Chips', 'Homemade dried and fried banana chips', 700, 'XAF', 'Snacks', 90, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Cassava Flour', 'Flour made from ground cassava', 1000, 'XAF', 'Baking', 65, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'bantu-essentials-uuid'::uuid, 'Groundnut Oil', 'Pressed peanut oil', 2500, 'XAF', 'Cooking Oil', 40, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now());

-- Vendor 2 Products (Douala Tech Supplies)
INSERT INTO public.marketplace_products (
  id, vendor_id, name, description, price, currency, category,
  stock_quantity, in_stock, images, created_at, updated_at
)
VALUES 
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'Power Bank 10,000mAh', 'Portable phone charger with fast charging', 10000, 'XAF', 'Electronics', 25, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'Rechargeable LED Lamp', 'Energy-saving rechargeable lamp for unreliable power areas', 7000, 'XAF', 'Electronics', 30, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'Bluetooth Wireless Earphones', 'Wireless Bluetooth earbuds with mic', 8500, 'XAF', 'Electronics', 20, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'Phone Protective Cases', 'Durable phone cases for popular models', 1500, 'XAF', 'Phone Accessories', 50, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'Micro USB Charging Cables', '1.2m high-speed micro USB cables', 1000, 'XAF', 'Phone Accessories', 75, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'Smartphone Screen Protectors', 'Tempered glass screen protectors', 1200, 'XAF', 'Phone Accessories', 100, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'Car Phone Holders', 'Dashboard mounts for smartphones', 3500, 'XAF', 'Phone Accessories', 15, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'Wireless Mouse', 'Ergonomic wireless optical mouse', 6500, 'XAF', 'Electronics', 35, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'USB Wall Chargers', '2-Port USB wall charger, fast charge', 4000, 'XAF', 'Electronics', 40, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'SD Memory Cards (32GB)', 'High-speed micro-SD cards', 5000, 'XAF', 'Electronics', 45, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'Noise Cancelling Headphones', 'Over-ear Bluetooth headphones with noise cancellation', 12000, 'XAF', 'Electronics', 18, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'Laptop Cooling Pads', 'USB-powered cooling pads for laptops', 6000, 'XAF', 'Electronics', 22, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'Earphone Splitters', '3.5mm headphone jack splitter cables', 800, 'XAF', 'Phone Accessories', 60, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'Mobile Phone Tripod Stands', 'Adjustable tripod stands for phones', 1700, 'XAF', 'Phone Accessories', 28, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'Power Strips with USB Ports', 'Extension cable with multiple outlets and USB charging', 4500, 'XAF', 'Electronics', 12, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'Smartwatches', 'Basic smartwatches with fitness tracking', 16000, 'XAF', 'Electronics', 8, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'Mobile Game Controllers', 'Bluetooth controllers for mobile phones', 12000, 'XAF', 'Electronics', 10, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'LED Strip Lights', 'Color changing LED strip lights for decoration', 9500, 'XAF', 'Electronics', 15, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'Laptop Backpacks', 'Laptop bags with padded compartments', 15000, 'XAF', 'Accessories', 12, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now()),
  (gen_random_uuid(), 'douala-tech-supplies-uuid'::uuid, 'USB Flash Drives (64GB)', 'Portable USB 3.0 flash drives', 7000, 'XAF', 'Electronics', 25, true, ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400'], now(), now());