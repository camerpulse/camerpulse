-- Insert vendor data for the 5 Cameroonian marketplace vendors

-- First, let's ensure we have the necessary tables with the right structure
-- Insert vendors into marketplace_vendors table
INSERT INTO public.marketplace_vendors (
  id, user_id, business_name, business_type, business_description, 
  business_category, business_email, business_phone, 
  delivery_areas, accepted_payment_methods, verification_status,
  is_verified, total_sales, total_products, average_rating,
  created_at, updated_at
) VALUES 
-- Vendor 1: Bantu Essentials
(
  gen_random_uuid(),
  gen_random_uuid(), -- This would be the actual user_id in practice
  'Bantu Essentials',
  'Food & Natural Products',
  'Vendor specializing in traditional food staples, spices, and natural beauty products sourced locally.',
  ARRAY['Food Staples', 'Spices', 'Beauty Products', 'Beverages'],
  'bantuessentials@example.com',
  '+237 6XX XXX XXX',
  ARRAY['Douala', 'Yaoundé', 'Bafoussam'],
  ARRAY['Mobile Money', 'Cash', 'Bank Transfer'],
  'verified',
  true,
  125,
  20,
  4.5,
  now(),
  now()
),
-- Vendor 2: Douala Tech Supplies  
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Douala Tech Supplies',
  'Electronics & Technology',
  'Specializes in affordable electronics, phone accessories, and small gadgets popular in Cameroon.',
  ARRAY['Electronics', 'Phone Accessories', 'Gadgets'],
  'doualatechsupplies@example.com',
  '+237 6XX XXX XXX',
  ARRAY['Douala', 'Limbe', 'Buea'],
  ARRAY['Mobile Money', 'Cash', 'Card Payment'],
  'verified',
  true,
  89,
  20,
  4.3,
  now(),
  now()
),
-- Vendor 3: Yaoundé Fashion Hub
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Yaoundé Fashion Hub',
  'Fashion & Apparel',
  'Seller of local and modern apparel, traditional wax prints, jewelry, and accessories.',
  ARRAY['Apparel', 'Jewelry', 'Footwear', 'Accessories'],
  'yaoundefashionhub@example.com',
  '+237 6XX XXX XXX',
  ARRAY['Yaoundé', 'Douala', 'Bamenda'],
  ARRAY['Mobile Money', 'Cash', 'Bank Transfer'],
  'verified',
  true,
  67,
  20,
  4.7,
  now(),
  now()
),
-- Vendor 4: Bamenda Home Goods
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Bamenda Home Goods',
  'Home & Handicrafts',
  'Specializing in household items, kitchenware, ceramics, and local handicrafts.',
  ARRAY['Home Decor', 'Kitchenware', 'Handicrafts', 'Furniture'],
  'bamendahomegoods@example.com',
  '+237 6XX XXX XXX',
  ARRAY['Bamenda', 'Yaoundé', 'Douala'],
  ARRAY['Mobile Money', 'Cash'],
  'verified',
  true,
  43,
  20,
  4.4,
  now(),
  now()
),
-- Vendor 5: Limbe Electronics & Appliances
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Limbe Electronics & Appliances',
  'Electronics & Appliances',
  'Vendor specializing in household electronics, small appliances, and electrical goods.',
  ARRAY['Electronics', 'Appliances', 'Solar Products'],
  'limbeelectronics@example.com',
  '+237 6XX XXX XXX',
  ARRAY['Limbe', 'Douala', 'Buea', 'Yaoundé'],
  ARRAY['Mobile Money', 'Cash', 'Bank Transfer', 'Card Payment'],
  'verified',
  true,
  156,
  20,
  4.2,
  now(),
  now()
);

-- Now insert all products for each vendor
-- Vendor 1 Products (Bantu Essentials)
INSERT INTO public.marketplace_products (
  id, vendor_id, title, description, price, currency, category,
  stock_quantity, sku, weight, dimensions, is_featured,
  status, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  v.id,
  p.title,
  p.description,
  p.price,
  'FCFA',
  p.category,
  FLOOR(RANDOM() * 100) + 10, -- Random stock between 10-110
  'BANTU-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
  p.weight,
  p.dimensions,
  RANDOM() > 0.8, -- 20% chance of being featured
  'active',
  now(),
  now()
FROM (VALUES
  ('Cassava Fufu (Water Fufu)', 'Freshly prepared cassava fufu, staple Cameroonian dish', 1500, 'Food Staples', '1kg', '20x15x10cm'),
  ('Ndop Rice', 'Locally grown rice variety from Ndop', 1800, 'Food Staples', '1kg', '25x15x8cm'),
  ('Palm Oil', 'Traditional Cameroonian red palm oil', 2000, 'Cooking Oil', '1L', '25x8x8cm'),
  ('Maggi Cubes', 'Popular seasoning cubes used widely in cooking', 500, 'Condiments', '100g', '10x8x5cm'),
  ('Cameroon Crushed Pepper Flakes', 'Ground hot pepper flakes for authentic seasoning', 1200, 'Spices', '100g', '12x8x8cm'),
  ('Cameroon Tea', 'Native Cameroonian tea leaves, aromatic', 1500, 'Beverage', '100g', '15x10x5cm'),
  ('Cocoa Powder', 'Premium cocoa for local baking and drinks', 3500, 'Ingredients', '500g', '20x12x8cm'),
  ('Smoked Wild Catfish', 'Traditionally smoked wild catfish', 8000, 'Protein', '1kg', '30x20x5cm'),
  ('Bio Ginger Root Powder', 'Natural powdered ginger root', 2500, 'Spices', '100g', '12x8x8cm'),
  ('Miyonndo Cassava Processed Food', 'Processed cassava-based ready-to-eat', 1000, 'Food Staples', '500g', '20x15x5cm'),
  ('Fresh Bio Juice (Mango)', 'Natural mango juice without additives', 800, 'Beverage', '330ml', '15x6x6cm'),
  ('Extra Fresco Natural Juice', 'Variety pack of fresh fruit juices', 900, 'Beverage', '330ml', '15x6x6cm'),
  ('African Shea Butter', 'Organic shea butter for skin care', 3000, 'Beauty Product', '100g', '10x8x5cm'),
  ('Natural Black Soap', 'Traditional Cameroonian herbal soap', 1200, 'Beauty Product', '150g', '8x6x4cm'),
  ('Local Honey', 'Pure honey from Cameroonian highlands', 4000, 'Food Ingredients', '500g', '15x8x8cm'),
  ('Dried Crayfish', 'Popular seasoning and protein source for soups', 9000, 'Protein', '1kg', '25x20x10cm'),
  ('Traditional Palm Wine', 'Fermented palm wine, locally brewed', 1500, 'Beverage', '1L', '25x8x8cm'),
  ('Banana Chips', 'Homemade dried and fried banana chips', 700, 'Snacks', '200g', '20x15x5cm'),
  ('Cassava Flour', 'Flour made from ground cassava', 1000, 'Baking', '1kg', '25x15x8cm'),
  ('Groundnut Oil', 'Pressed peanut oil', 2500, 'Cooking Oil', '1L', '25x8x8cm')
) AS p(title, description, price, category, weight, dimensions)
CROSS JOIN (SELECT id FROM public.marketplace_vendors WHERE business_name = 'Bantu Essentials') v;

-- Vendor 2 Products (Douala Tech Supplies)
INSERT INTO public.marketplace_products (
  id, vendor_id, title, description, price, currency, category,
  stock_quantity, sku, weight, dimensions, is_featured,
  status, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  v.id,
  p.title,
  p.description,
  p.price,
  'FCFA',
  p.category,
  FLOOR(RANDOM() * 50) + 5,
  'TECH-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
  p.weight,
  p.dimensions,
  RANDOM() > 0.8,
  'active',
  now(),
  now()
FROM (VALUES
  ('Power Bank 10,000mAh', 'Portable phone charger with fast charging', 10000, 'Electronics', '300g', '15x8x2cm'),
  ('Rechargeable LED Lamp', 'Energy-saving rechargeable lamp for unreliable power areas', 7000, 'Electronics', '400g', '20x10x10cm'),
  ('Bluetooth Wireless Earphones', 'Wireless Bluetooth earbuds with mic', 8500, 'Electronics', '100g', '8x6x4cm'),
  ('Phone Protective Cases', 'Durable phone cases for popular models', 1500, 'Phone Accessories', '50g', '15x8x1cm'),
  ('Micro USB Charging Cables', '1.2m high-speed micro USB cables', 1000, 'Phone Accessories', '100g', '15x5x2cm'),
  ('Smartphone Screen Protectors', 'Tempered glass screen protectors', 1200, 'Phone Accessories', '20g', '12x6x1cm'),
  ('Car Phone Holders', 'Dashboard mounts for smartphones', 3500, 'Phone Accessories', '200g', '12x10x8cm'),
  ('Wireless Mouse', 'Ergonomic wireless optical mouse', 6500, 'Electronics', '150g', '12x6x4cm'),
  ('USB Wall Chargers', '2-Port USB wall charger, fast charge', 4000, 'Electronics', '200g', '8x6x4cm'),
  ('SD Memory Cards (32GB)', 'High-speed micro-SD cards', 5000, 'Electronics', '10g', '3x2x1cm'),
  ('Noise Cancelling Headphones', 'Over-ear Bluetooth headphones with noise cancellation', 12000, 'Electronics', '300g', '20x18x8cm'),
  ('Laptop Cooling Pads', 'USB-powered cooling pads for laptops', 6000, 'Electronics', '500g', '35x25x3cm'),
  ('Earphone Splitters', '3.5mm headphone jack splitter cables', 800, 'Phone Accessories', '50g', '10x5x2cm'),
  ('Mobile Phone Tripod Stands', 'Adjustable tripod stands for phones', 1700, 'Phone Accessories', '300g', '20x5x5cm'),
  ('Power Strips with USB Ports', 'Extension cable with multiple outlets and USB charging', 4500, 'Electronics', '600g', '30x8x5cm'),
  ('Smartwatches', 'Basic smartwatches with fitness tracking', 16000, 'Electronics', '200g', '15x10x5cm'),
  ('Mobile Game Controllers', 'Bluetooth controllers for mobile phones', 12000, 'Electronics', '250g', '15x10x5cm'),
  ('LED Strip Lights', 'Color changing LED strip lights for decoration', 9500, 'Electronics', '200g', '50x2x1cm'),
  ('Laptop Backpacks', 'Laptop bags with padded compartments', 15000, 'Accessories', '800g', '40x30x15cm'),
  ('USB Flash Drives (64GB)', 'Portable USB 3.0 flash drives', 7000, 'Electronics', '20g', '6x2x1cm')
) AS p(title, description, price, category, weight, dimensions)
CROSS JOIN (SELECT id FROM public.marketplace_vendors WHERE business_name = 'Douala Tech Supplies') v;

-- Vendor 3 Products (Yaoundé Fashion Hub)
INSERT INTO public.marketplace_products (
  id, vendor_id, title, description, price, currency, category,
  stock_quantity, sku, weight, dimensions, is_featured,
  status, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  v.id,
  p.title,
  p.description,
  p.price,
  'FCFA',
  p.category,
  FLOOR(RANDOM() * 30) + 5,
  'FASHION-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
  p.weight,
  p.dimensions,
  RANDOM() > 0.8,
  'active',
  now(),
  now()
FROM (VALUES
  ('Traditional Wax Print Dress', 'Vibrant African wax print fabric-made dresses', 25000, 'Apparel', '400g', 'Size varies'),
  ('Men''s Dashiki Shirt', 'Colorful dashiki shirts for casual/traditional wear', 15000, 'Apparel', '300g', 'Size varies'),
  ('Ankara Headwraps', 'Stylish headwraps, various patterns', 5000, 'Apparel', '100g', '120x20cm'),
  ('Beaded Necklaces', 'Handmade colorful bead necklaces', 7000, 'Jewelry', '150g', '40cm length'),
  ('Leather Sandals', 'Genuine leather sandals handcrafted locally', 12000, 'Footwear', '500g', 'Size varies'),
  ('Women''s Bag', 'Fabric bags with traditional print designs', 10000, 'Accessories', '300g', '35x25x10cm'),
  ('Brass Bangles', 'Fashionable brass surface bangles', 6500, 'Jewelry', '100g', '6cm diameter'),
  ('Boys Traditional Shirts', 'Miniature men''s traditional shirts', 8000, 'Apparel', '200g', 'Size varies'),
  ('Men''s Cowboy Hats', 'Classic cowboy-style hats popular in Cameroon', 9000, 'Accessories', '200g', '30cm diameter'),
  ('Custom Tailored Blazers', 'Made-to-measure lightweight blazers', 35000, 'Apparel', '600g', 'Size varies'),
  ('African Pattern Scarves', 'Soft, stylish scarves made from local fabrics', 6000, 'Accessories', '150g', '180x30cm'),
  ('Leather Belts', 'Handmade leather belts, various sizes', 7500, 'Accessories', '200g', 'Size varies'),
  ('Women''s High Heel Shoes', 'Trendy comfortable heels for formal occasions', 14000, 'Footwear', '600g', 'Size varies'),
  ('Traditional Wedding Outfit', 'Full matching sets for traditional ceremonies', 60000, 'Apparel', '1kg', 'Complete set'),
  ('Costume Rings', 'Affordable fashion rings', 3500, 'Jewelry', '20g', 'Various sizes'),
  ('Kids Shoes', 'Durable casual shoes for children', 8000, 'Footwear', '300g', 'Size varies'),
  ('Handmade Earrings', 'Earrings made with local beads', 5500, 'Jewelry', '30g', '5cm length'),
  ('Afro Hairstyle Wigs', 'Synthetic wigs styled with Afro hair patterns', 12000, 'Accessories', '200g', 'One size'),
  ('Cotton T-shirts with Prints', 'Locally printed graphic t-shirts', 7000, 'Apparel', '200g', 'Size varies'),
  ('Men''s Dress Pants', 'Light, breathable dress pants', 12000, 'Apparel', '400g', 'Size varies')
) AS p(title, description, price, category, weight, dimensions)
CROSS JOIN (SELECT id FROM public.marketplace_vendors WHERE business_name = 'Yaoundé Fashion Hub') v;

-- Vendor 4 Products (Bamenda Home Goods)
INSERT INTO public.marketplace_products (
  id, vendor_id, title, description, price, currency, category,
  stock_quantity, sku, weight, dimensions, is_featured,
  status, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  v.id,
  p.title,
  p.description,
  p.price,
  'FCFA',
  p.category,
  FLOOR(RANDOM() * 25) + 3,
  'HOME-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
  p.weight,
  p.dimensions,
  RANDOM() > 0.8,
  'active',
  now(),
  now()
FROM (VALUES
  ('Handwoven Basket', 'Traditional Bamenda woven shopping basket', 8000, 'Home Decor', '300g', '40x30x20cm'),
  ('Clay Cooking Pot', 'Earthenware cooking pot for stews', 9000, 'Kitchenware', '2kg', '25x25x15cm'),
  ('Wooden Salad Bowls', 'Smooth polished wooden salad bowls', 6000, 'Kitchenware', '400g', '25x25x8cm'),
  ('Traditional Dinnerware Set', 'Ceramic plates & mugs set decorated with ethnic patterns', 18000, 'Home Decor', '3kg', 'Complete set'),
  ('Handcrafted Table Mats', 'Textile table mats with Cameroonian prints', 7000, 'Home Decor', '200g', '40x30cm'),
  ('Colored Glass Tumblers', 'Glasses with decorative African motifs', 4000, 'Kitchenware', '1kg', '6 pieces set'),
  ('Decorative Wood Masks', 'African tribal masks for wall decoration', 25000, 'Home Decor', '800g', '30x20x10cm'),
  ('Ceramic Flower Vase', 'Painted ceramic vases with traditional designs', 12000, 'Home Decor', '1kg', '25x15x15cm'),
  ('Bamboo Floor Mat', 'Eco-friendly bamboo woven mats', 10000, 'Home Decor', '1.5kg', '180x120cm'),
  ('Metal Cooking Utensil Set', 'Stainless steel utensils set with wooden handles', 16000, 'Kitchenware', '1kg', 'Complete set'),
  ('Handmade Throw Pillows', 'Cushions with local fabric covers', 7000, 'Home Decor', '500g', '40x40cm'),
  ('Local Raffia Rugs', 'Decorative floor rugs woven from raffia', 18000, 'Home Decor', '2kg', '150x100cm'),
  ('Bamboo Cutlery Set', 'Portable bamboo knives, forks, spoons', 9000, 'Kitchenware', '300g', 'Complete set'),
  ('Traditional Raffia Fans', 'Handheld fans made of raffia & wood', 6500, 'Handicrafts', '200g', '30x20cm'),
  ('Matching Tablecloths', 'Vibrant patterned tablecloths', 8000, 'Home Decor', '400g', '150x150cm'),
  ('Wooden Carved Figurines', 'Small wooden sculptures and figurines', 15000, 'Home Decor', '500g', '20x10x10cm'),
  ('Colored Ceramic Tile Set', 'Tiles used for flooring & decoration', 20000, 'Home Improvement', '10kg', '20 pieces set'),
  ('Woven Wall Art Hangings', 'Handwoven textile wall hangings', 12000, 'Home Decor', '600g', '80x60cm'),
  ('Traditional Water Gourds', 'Decorated gourds used for water storage', 15000, 'Handicrafts', '1kg', '30x20cm'),
  ('Portable Folding Stools', 'Compact stools made from wood', 10000, 'Furniture', '2kg', '35x30x45cm')
) AS p(title, description, price, category, weight, dimensions)
CROSS JOIN (SELECT id FROM public.marketplace_vendors WHERE business_name = 'Bamenda Home Goods') v;

-- Vendor 5 Products (Limbe Electronics & Appliances)
INSERT INTO public.marketplace_products (
  id, vendor_id, title, description, price, currency, category,
  stock_quantity, sku, weight, dimensions, is_featured,
  status, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  v.id,
  p.title,
  p.description,
  p.price,
  'FCFA',
  p.category,
  FLOOR(RANDOM() * 15) + 2,
  'APPLIANCE-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
  p.weight,
  p.dimensions,
  RANDOM() > 0.8,
  'active',
  now(),
  now()
FROM (VALUES
  ('Solar Home Lighting System', 'Solar panel kits with LED bulbs', 45000, 'Electronics', '5kg', 'Complete kit'),
  ('Mini Refrigerator', 'Compact fridge ideal for small homes', 75000, 'Appliances', '25kg', '60x50x85cm'),
  ('Electric Kettle', 'Fast boiling electric kettles', 12000, 'Appliances', '1.5kg', '25x20x25cm'),
  ('Ceiling Fan', 'Energy-efficient ceiling fans', 25000, 'Electronics', '3kg', '120cm diameter'),
  ('Portable Gas Stove', 'Two-burner portable stove for camping/cooking', 18000, 'Appliances', '5kg', '60x35x15cm'),
  ('Microwave Oven', 'Compact microwave ovens', 60000, 'Appliances', '15kg', '50x40x30cm'),
  ('Electric Iron', 'Steam irons for clothing', 13000, 'Appliances', '1.5kg', '30x15x15cm'),
  ('LED TV 32 inches', 'HD LED television', 90000, 'Electronics', '8kg', '73x43x8cm'),
  ('Electric Blender', 'Heavy-duty food blender', 19000, 'Appliances', '3kg', '40x20x20cm'),
  ('Solar Phone Charger', 'Small solar panels for charging phones', 9000, 'Electronics', '500g', '20x15x2cm'),
  ('Electric Water Pump', 'Used for wells and household water retrieval', 75000, 'Appliances', '15kg', '40x30x25cm'),
  ('Hair Dryer', 'Compact hand-held hair dryers', 15000, 'Electronics', '800g', '25x8x20cm'),
  ('Air Conditioner Unit', 'Window air conditioning unit', 200000, 'Appliances', '35kg', '60x40x45cm'),
  ('Rice Cooker', 'Electric rice cooker with timer', 15000, 'Appliances', '2kg', '30x25x20cm'),
  ('Electric Oven Toaster', 'Multi-function oven toaster', 20000, 'Appliances', '8kg', '45x35x25cm'),
  ('Home Security Camera', 'Wi-Fi enabled security cameras', 30000, 'Electronics', '500g', '12x8x8cm'),
  ('Electric Water Heater', 'Small instant water heaters', 35000, 'Appliances', '5kg', '40x25x15cm'),
  ('Electric Pressure Cooker', 'Multi-use pressure cooker', 30000, 'Appliances', '4kg', '35x30x25cm'),
  ('Wireless Router', 'High-speed WiFi router', 25000, 'Electronics', '800g', '25x15x5cm'),
  ('Solar Lantern', 'Bright rechargeable solar lantern', 8000, 'Electronics', '600g', '20x15x15cm')
) AS p(title, description, price, category, weight, dimensions)
CROSS JOIN (SELECT id FROM public.marketplace_vendors WHERE business_name = 'Limbe Electronics & Appliances') v;

-- Add some sample product images (placeholder URLs)
UPDATE public.marketplace_products 
SET images = ARRAY[
  'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400',
  'https://images.unsplash.com/photo-1580913428706-c311637a0d9d?w=400'
]
WHERE images IS NULL OR array_length(images, 1) IS NULL;