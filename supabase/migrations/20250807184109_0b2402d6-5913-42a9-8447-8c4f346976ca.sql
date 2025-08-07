-- Insert vendor data for the 5 Cameroonian marketplace vendors

-- Insert vendors into marketplace_vendors table (using actual schema)
INSERT INTO public.marketplace_vendors (
  id, user_id, vendor_id, business_name, description, 
  contact_email, contact_phone, address, verification_status,
  is_verified, total_sales, rating, created_at, updated_at
) VALUES 
-- Vendor 1: Bantu Essentials
(
  gen_random_uuid(),
  gen_random_uuid(), -- This would be the actual user_id in practice
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
  gen_random_uuid(),
  gen_random_uuid(),
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
  gen_random_uuid(),
  gen_random_uuid(),
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
  gen_random_uuid(),
  gen_random_uuid(),
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
  gen_random_uuid(),
  gen_random_uuid(),
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

-- Now insert all products for each vendor
-- Vendor 1 Products (Bantu Essentials)
INSERT INTO public.marketplace_products (
  id, vendor_id, name, description, price, currency, category,
  stock_quantity, in_stock, images, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  v.id,
  p.title,
  p.description,
  p.price,
  'XAF',
  p.category,
  FLOOR(RANDOM() * 100) + 10, -- Random stock between 10-110
  true,
  ARRAY[
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400',
    'https://images.unsplash.com/photo-1580913428706-c311637a0d9d?w=400'
  ],
  now(),
  now()
FROM (VALUES
  ('Cassava Fufu (Water Fufu)', 'Freshly prepared cassava fufu, staple Cameroonian dish', 1500, 'Food Staples'),
  ('Ndop Rice', 'Locally grown rice variety from Ndop', 1800, 'Food Staples'),
  ('Palm Oil', 'Traditional Cameroonian red palm oil', 2000, 'Cooking Oil'),
  ('Maggi Cubes', 'Popular seasoning cubes used widely in cooking', 500, 'Condiments'),
  ('Cameroon Crushed Pepper Flakes', 'Ground hot pepper flakes for authentic seasoning', 1200, 'Spices'),
  ('Cameroon Tea', 'Native Cameroonian tea leaves, aromatic', 1500, 'Beverage'),
  ('Cocoa Powder', 'Premium cocoa for local baking and drinks', 3500, 'Ingredients'),
  ('Smoked Wild Catfish', 'Traditionally smoked wild catfish', 8000, 'Protein'),
  ('Bio Ginger Root Powder', 'Natural powdered ginger root', 2500, 'Spices'),
  ('Miyonndo Cassava Processed Food', 'Processed cassava-based ready-to-eat', 1000, 'Food Staples'),
  ('Fresh Bio Juice (Mango)', 'Natural mango juice without additives', 800, 'Beverage'),
  ('Extra Fresco Natural Juice', 'Variety pack of fresh fruit juices', 900, 'Beverage'),
  ('African Shea Butter', 'Organic shea butter for skin care', 3000, 'Beauty Product'),
  ('Natural Black Soap', 'Traditional Cameroonian herbal soap', 1200, 'Beauty Product'),
  ('Local Honey', 'Pure honey from Cameroonian highlands', 4000, 'Food Ingredients'),
  ('Dried Crayfish', 'Popular seasoning and protein source for soups', 9000, 'Protein'),
  ('Traditional Palm Wine', 'Fermented palm wine, locally brewed', 1500, 'Beverage'),
  ('Banana Chips', 'Homemade dried and fried banana chips', 700, 'Snacks'),
  ('Cassava Flour', 'Flour made from ground cassava', 1000, 'Baking'),
  ('Groundnut Oil', 'Pressed peanut oil', 2500, 'Cooking Oil')
) AS p(title, description, price, category)
CROSS JOIN (SELECT id FROM public.marketplace_vendors WHERE vendor_id = 'bantu_essentials') v;

-- Vendor 2 Products (Douala Tech Supplies)
INSERT INTO public.marketplace_products (
  id, vendor_id, name, description, price, currency, category,
  stock_quantity, in_stock, images, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  v.id,
  p.title,
  p.description,
  p.price,
  'XAF',
  p.category,
  FLOOR(RANDOM() * 50) + 5,
  true,
  ARRAY[
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400',
    'https://images.unsplash.com/photo-1580913428706-c311637a0d9d?w=400'
  ],
  now(),
  now()
FROM (VALUES
  ('Power Bank 10,000mAh', 'Portable phone charger with fast charging', 10000, 'Electronics'),
  ('Rechargeable LED Lamp', 'Energy-saving rechargeable lamp for unreliable power areas', 7000, 'Electronics'),
  ('Bluetooth Wireless Earphones', 'Wireless Bluetooth earbuds with mic', 8500, 'Electronics'),
  ('Phone Protective Cases', 'Durable phone cases for popular models', 1500, 'Phone Accessories'),
  ('Micro USB Charging Cables', '1.2m high-speed micro USB cables', 1000, 'Phone Accessories'),
  ('Smartphone Screen Protectors', 'Tempered glass screen protectors', 1200, 'Phone Accessories'),
  ('Car Phone Holders', 'Dashboard mounts for smartphones', 3500, 'Phone Accessories'),
  ('Wireless Mouse', 'Ergonomic wireless optical mouse', 6500, 'Electronics'),
  ('USB Wall Chargers', '2-Port USB wall charger, fast charge', 4000, 'Electronics'),
  ('SD Memory Cards (32GB)', 'High-speed micro-SD cards', 5000, 'Electronics'),
  ('Noise Cancelling Headphones', 'Over-ear Bluetooth headphones with noise cancellation', 12000, 'Electronics'),
  ('Laptop Cooling Pads', 'USB-powered cooling pads for laptops', 6000, 'Electronics'),
  ('Earphone Splitters', '3.5mm headphone jack splitter cables', 800, 'Phone Accessories'),
  ('Mobile Phone Tripod Stands', 'Adjustable tripod stands for phones', 1700, 'Phone Accessories'),
  ('Power Strips with USB Ports', 'Extension cable with multiple outlets and USB charging', 4500, 'Electronics'),
  ('Smartwatches', 'Basic smartwatches with fitness tracking', 16000, 'Electronics'),
  ('Mobile Game Controllers', 'Bluetooth controllers for mobile phones', 12000, 'Electronics'),
  ('LED Strip Lights', 'Color changing LED strip lights for decoration', 9500, 'Electronics'),
  ('Laptop Backpacks', 'Laptop bags with padded compartments', 15000, 'Accessories'),
  ('USB Flash Drives (64GB)', 'Portable USB 3.0 flash drives', 7000, 'Electronics')
) AS p(title, description, price, category)
CROSS JOIN (SELECT id FROM public.marketplace_vendors WHERE vendor_id = 'douala_tech') v;

-- Vendor 3 Products (Yaoundé Fashion Hub)
INSERT INTO public.marketplace_products (
  id, vendor_id, name, description, price, currency, category,
  stock_quantity, in_stock, images, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  v.id,
  p.title,
  p.description,
  p.price,
  'XAF',
  p.category,
  FLOOR(RANDOM() * 30) + 5,
  true,
  ARRAY[
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400',
    'https://images.unsplash.com/photo-1580913428706-c311637a0d9d?w=400'
  ],
  now(),
  now()
FROM (VALUES
  ('Traditional Wax Print Dress', 'Vibrant African wax print fabric-made dresses', 25000, 'Apparel'),
  ('Men''s Dashiki Shirt', 'Colorful dashiki shirts for casual/traditional wear', 15000, 'Apparel'),
  ('Ankara Headwraps', 'Stylish headwraps, various patterns', 5000, 'Apparel'),
  ('Beaded Necklaces', 'Handmade colorful bead necklaces', 7000, 'Jewelry'),
  ('Leather Sandals', 'Genuine leather sandals handcrafted locally', 12000, 'Footwear'),
  ('Women''s Bag', 'Fabric bags with traditional print designs', 10000, 'Accessories'),
  ('Brass Bangles', 'Fashionable brass surface bangles', 6500, 'Jewelry'),
  ('Boys Traditional Shirts', 'Miniature men''s traditional shirts', 8000, 'Apparel'),
  ('Men''s Cowboy Hats', 'Classic cowboy-style hats popular in Cameroon', 9000, 'Accessories'),
  ('Custom Tailored Blazers', 'Made-to-measure lightweight blazers', 35000, 'Apparel'),
  ('African Pattern Scarves', 'Soft, stylish scarves made from local fabrics', 6000, 'Accessories'),
  ('Leather Belts', 'Handmade leather belts, various sizes', 7500, 'Accessories'),
  ('Women''s High Heel Shoes', 'Trendy comfortable heels for formal occasions', 14000, 'Footwear'),
  ('Traditional Wedding Outfit', 'Full matching sets for traditional ceremonies', 60000, 'Apparel'),
  ('Costume Rings', 'Affordable fashion rings', 3500, 'Jewelry'),
  ('Kids Shoes', 'Durable casual shoes for children', 8000, 'Footwear'),
  ('Handmade Earrings', 'Earrings made with local beads', 5500, 'Jewelry'),
  ('Afro Hairstyle Wigs', 'Synthetic wigs styled with Afro hair patterns', 12000, 'Accessories'),
  ('Cotton T-shirts with Prints', 'Locally printed graphic t-shirts', 7000, 'Apparel'),
  ('Men''s Dress Pants', 'Light, breathable dress pants', 12000, 'Apparel')
) AS p(title, description, price, category)
CROSS JOIN (SELECT id FROM public.marketplace_vendors WHERE vendor_id = 'yaoundefashion') v;

-- Vendor 4 Products (Bamenda Home Goods)
INSERT INTO public.marketplace_products (
  id, vendor_id, name, description, price, currency, category,
  stock_quantity, in_stock, images, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  v.id,
  p.title,
  p.description,
  p.price,
  'XAF',
  p.category,
  FLOOR(RANDOM() * 25) + 3,
  true,
  ARRAY[
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400',
    'https://images.unsplash.com/photo-1580913428706-c311637a0d9d?w=400'
  ],
  now(),
  now()
FROM (VALUES
  ('Handwoven Basket', 'Traditional Bamenda woven shopping basket', 8000, 'Home Decor'),
  ('Clay Cooking Pot', 'Earthenware cooking pot for stews', 9000, 'Kitchenware'),
  ('Wooden Salad Bowls', 'Smooth polished wooden salad bowls', 6000, 'Kitchenware'),
  ('Traditional Dinnerware Set', 'Ceramic plates & mugs set decorated with ethnic patterns', 18000, 'Home Decor'),
  ('Handcrafted Table Mats', 'Textile table mats with Cameroonian prints', 7000, 'Home Decor'),
  ('Colored Glass Tumblers', 'Glasses with decorative African motifs', 4000, 'Kitchenware'),
  ('Decorative Wood Masks', 'African tribal masks for wall decoration', 25000, 'Home Decor'),
  ('Ceramic Flower Vase', 'Painted ceramic vases with traditional designs', 12000, 'Home Decor'),
  ('Bamboo Floor Mat', 'Eco-friendly bamboo woven mats', 10000, 'Home Decor'),
  ('Metal Cooking Utensil Set', 'Stainless steel utensils set with wooden handles', 16000, 'Kitchenware'),
  ('Handmade Throw Pillows', 'Cushions with local fabric covers', 7000, 'Home Decor'),
  ('Local Raffia Rugs', 'Decorative floor rugs woven from raffia', 18000, 'Home Decor'),
  ('Bamboo Cutlery Set', 'Portable bamboo knives, forks, spoons', 9000, 'Kitchenware'),
  ('Traditional Raffia Fans', 'Handheld fans made of raffia & wood', 6500, 'Handicrafts'),
  ('Matching Tablecloths', 'Vibrant patterned tablecloths', 8000, 'Home Decor'),
  ('Wooden Carved Figurines', 'Small wooden sculptures and figurines', 15000, 'Home Decor'),
  ('Colored Ceramic Tile Set', 'Tiles used for flooring & decoration', 20000, 'Home Improvement'),
  ('Woven Wall Art Hangings', 'Handwoven textile wall hangings', 12000, 'Home Decor'),
  ('Traditional Water Gourds', 'Decorated gourds used for water storage', 15000, 'Handicrafts'),
  ('Portable Folding Stools', 'Compact stools made from wood', 10000, 'Furniture')
) AS p(title, description, price, category)
CROSS JOIN (SELECT id FROM public.marketplace_vendors WHERE vendor_id = 'bamendahome') v;

-- Vendor 5 Products (Limbe Electronics & Appliances)
INSERT INTO public.marketplace_products (
  id, vendor_id, name, description, price, currency, category,
  stock_quantity, in_stock, images, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  v.id,
  p.title,
  p.description,
  p.price,
  'XAF',
  p.category,
  FLOOR(RANDOM() * 15) + 2,
  true,
  ARRAY[
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400',
    'https://images.unsplash.com/photo-1580913428706-c311637a0d9d?w=400'
  ],
  now(),
  now()
FROM (VALUES
  ('Solar Home Lighting System', 'Solar panel kits with LED bulbs', 45000, 'Electronics'),
  ('Mini Refrigerator', 'Compact fridge ideal for small homes', 75000, 'Appliances'),
  ('Electric Kettle', 'Fast boiling electric kettles', 12000, 'Appliances'),
  ('Ceiling Fan', 'Energy-efficient ceiling fans', 25000, 'Electronics'),
  ('Portable Gas Stove', 'Two-burner portable stove for camping/cooking', 18000, 'Appliances'),
  ('Microwave Oven', 'Compact microwave ovens', 60000, 'Appliances'),
  ('Electric Iron', 'Steam irons for clothing', 13000, 'Appliances'),
  ('LED TV 32 inches', 'HD LED television', 90000, 'Electronics'),
  ('Electric Blender', 'Heavy-duty food blender', 19000, 'Appliances'),
  ('Solar Phone Charger', 'Small solar panels for charging phones', 9000, 'Electronics'),
  ('Electric Water Pump', 'Used for wells and household water retrieval', 75000, 'Appliances'),
  ('Hair Dryer', 'Compact hand-held hair dryers', 15000, 'Electronics'),
  ('Air Conditioner Unit', 'Window air conditioning unit', 200000, 'Appliances'),
  ('Rice Cooker', 'Electric rice cooker with timer', 15000, 'Appliances'),
  ('Electric Oven Toaster', 'Multi-function oven toaster', 20000, 'Appliances'),
  ('Home Security Camera', 'Wi-Fi enabled security cameras', 30000, 'Electronics'),
  ('Electric Water Heater', 'Small instant water heaters', 35000, 'Appliances'),
  ('Electric Pressure Cooker', 'Multi-use pressure cooker', 30000, 'Appliances'),
  ('Wireless Router', 'High-speed WiFi router', 25000, 'Electronics'),
  ('Solar Lantern', 'Bright rechargeable solar lantern', 8000, 'Electronics')
) AS p(title, description, price, category)
CROSS JOIN (SELECT id FROM public.marketplace_vendors WHERE vendor_id = 'limbebiz') v;