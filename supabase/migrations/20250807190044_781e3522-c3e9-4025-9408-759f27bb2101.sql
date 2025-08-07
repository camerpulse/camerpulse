-- Make user_id nullable in marketplace_vendors table and add sample data

-- First, make user_id nullable
ALTER TABLE public.marketplace_vendors ALTER COLUMN user_id DROP NOT NULL;

-- Insert vendor data for the 5 Cameroonian marketplace vendors
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
  '+237 670 123 456',
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
  '+237 670 234 567',
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
  '+237 670 345 678',
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
  '+237 670 456 789',
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
  '+237 670 567 890',
  'Limbe, Cameroon',
  'verified',
  true,
  156,
  4.2,
  now(),
  now()
);

-- Insert sample products for demonstration
-- Get vendor IDs for product insertion
DO $$
DECLARE
    bantu_id UUID;
    douala_id UUID;
    yaounde_id UUID;
    bamenda_id UUID;
    limbe_id UUID;
BEGIN
    -- Get vendor UUIDs
    SELECT id INTO bantu_id FROM public.marketplace_vendors WHERE vendor_id = 'bantu_essentials';
    SELECT id INTO douala_id FROM public.marketplace_vendors WHERE vendor_id = 'douala_tech';
    SELECT id INTO yaounde_id FROM public.marketplace_vendors WHERE vendor_id = 'yaoundefashion';
    SELECT id INTO bamenda_id FROM public.marketplace_vendors WHERE vendor_id = 'bamendahome';
    SELECT id INTO limbe_id FROM public.marketplace_vendors WHERE vendor_id = 'limbebiz';

    -- Insert products for Bantu Essentials
    INSERT INTO public.marketplace_products (vendor_id, name, description, price, currency, category, stock_quantity, in_stock, images, created_at, updated_at)
    VALUES 
        (bantu_id, 'Cassava Fufu (Water Fufu)', 'Freshly prepared cassava fufu, staple Cameroonian dish', 1500, 'XAF', 'Food Staples', 50, true, ARRAY['https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400'], now(), now()),
        (bantu_id, 'Ndop Rice', 'Locally grown rice variety from Ndop', 1800, 'XAF', 'Food Staples', 75, true, ARRAY['https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400'], now(), now()),
        (bantu_id, 'Palm Oil', 'Traditional Cameroonian red palm oil', 2000, 'XAF', 'Cooking Oil', 30, true, ARRAY['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400'], now(), now()),
        (bantu_id, 'Maggi Cubes', 'Popular seasoning cubes used widely in cooking', 500, 'XAF', 'Condiments', 100, true, ARRAY['https://images.unsplash.com/photo-1596040827629-79f6b21ebe6a?w=400'], now(), now()),
        (bantu_id, 'Cameroon Crushed Pepper Flakes', 'Ground hot pepper flakes for authentic seasoning', 1200, 'XAF', 'Spices', 25, true, ARRAY['https://images.unsplash.com/photo-1583054010840-7ddc4e7d3b17?w=400'], now(), now()),
        (bantu_id, 'Cameroon Tea', 'Native Cameroonian tea leaves, aromatic', 1500, 'XAF', 'Beverage', 40, true, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], now(), now()),
        (bantu_id, 'Cocoa Powder', 'Premium cocoa for local baking and drinks', 3500, 'XAF', 'Ingredients', 20, true, ARRAY['https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400'], now(), now()),
        (bantu_id, 'African Shea Butter', 'Organic shea butter for skin care', 3000, 'XAF', 'Beauty Product', 25, true, ARRAY['https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400'], now(), now()),
        (bantu_id, 'Natural Black Soap', 'Traditional Cameroonian herbal soap', 1200, 'XAF', 'Beauty Product', 80, true, ARRAY['https://images.unsplash.com/photo-1617897903246-719242758050?w=400'], now(), now()),
        (bantu_id, 'Local Honey', 'Pure honey from Cameroonian highlands', 4000, 'XAF', 'Food Ingredients', 18, true, ARRAY['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400'], now(), now());

    -- Insert products for Douala Tech Supplies
    INSERT INTO public.marketplace_products (vendor_id, name, description, price, currency, category, stock_quantity, in_stock, images, created_at, updated_at)
    VALUES 
        (douala_id, 'Power Bank 10,000mAh', 'Portable phone charger with fast charging', 10000, 'XAF', 'Electronics', 25, true, ARRAY['https://images.unsplash.com/photo-1609592806787-6270daa80744?w=400'], now(), now()),
        (douala_id, 'Rechargeable LED Lamp', 'Energy-saving rechargeable lamp for unreliable power areas', 7000, 'XAF', 'Electronics', 30, true, ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'], now(), now()),
        (douala_id, 'Bluetooth Wireless Earphones', 'Wireless Bluetooth earbuds with mic', 8500, 'XAF', 'Electronics', 20, true, ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'], now(), now()),
        (douala_id, 'Phone Protective Cases', 'Durable phone cases for popular models', 1500, 'XAF', 'Phone Accessories', 50, true, ARRAY['https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=400'], now(), now()),
        (douala_id, 'Micro USB Charging Cables', '1.2m high-speed micro USB cables', 1000, 'XAF', 'Phone Accessories', 75, true, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], now(), now()),
        (douala_id, 'Smartphone Screen Protectors', 'Tempered glass screen protectors', 1200, 'XAF', 'Phone Accessories', 100, true, ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'], now(), now()),
        (douala_id, 'Wireless Mouse', 'Ergonomic wireless optical mouse', 6500, 'XAF', 'Electronics', 35, true, ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'], now(), now()),
        (douala_id, 'USB Wall Chargers', '2-Port USB wall charger, fast charge', 4000, 'XAF', 'Electronics', 40, true, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], now(), now()),
        (douala_id, 'Smartwatches', 'Basic smartwatches with fitness tracking', 16000, 'XAF', 'Electronics', 8, true, ARRAY['https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400'], now(), now()),
        (douala_id, 'USB Flash Drives (64GB)', 'Portable USB 3.0 flash drives', 7000, 'XAF', 'Electronics', 25, true, ARRAY['https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400'], now(), now());

    -- Insert products for Yaoundé Fashion Hub  
    INSERT INTO public.marketplace_products (vendor_id, name, description, price, currency, category, stock_quantity, in_stock, images, created_at, updated_at)
    VALUES 
        (yaounde_id, 'Traditional Wax Print Dress', 'Vibrant African wax print fabric-made dresses', 25000, 'XAF', 'Apparel', 15, true, ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'], now(), now()),
        (yaounde_id, 'Men''s Dashiki Shirt', 'Colorful dashiki shirts for casual/traditional wear', 15000, 'XAF', 'Apparel', 20, true, ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'], now(), now()),
        (yaounde_id, 'Ankara Headwraps', 'Stylish headwraps, various patterns', 5000, 'XAF', 'Apparel', 35, true, ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'], now(), now()),
        (yaounde_id, 'Beaded Necklaces', 'Handmade colorful bead necklaces', 7000, 'XAF', 'Jewelry', 25, true, ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'], now(), now()),
        (yaounde_id, 'Leather Sandals', 'Genuine leather sandals handcrafted locally', 12000, 'XAF', 'Footwear', 18, true, ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'], now(), now()),
        (yaounde_id, 'Women''s Bag', 'Fabric bags with traditional print designs', 10000, 'XAF', 'Accessories', 22, true, ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'], now(), now()),
        (yaounde_id, 'Brass Bangles', 'Fashionable brass surface bangles', 6500, 'XAF', 'Jewelry', 30, true, ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'], now(), now()),
        (yaounde_id, 'Custom Tailored Blazers', 'Made-to-measure lightweight blazers', 35000, 'XAF', 'Apparel', 8, true, ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'], now(), now()),
        (yaounde_id, 'Cotton T-shirts with Prints', 'Locally printed graphic t-shirts', 7000, 'XAF', 'Apparel', 40, true, ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'], now(), now()),
        (yaounde_id, 'Handmade Earrings', 'Earrings made with local beads', 5500, 'XAF', 'Jewelry', 28, true, ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'], now(), now());

    -- Insert products for Bamenda Home Goods
    INSERT INTO public.marketplace_products (vendor_id, name, description, price, currency, category, stock_quantity, in_stock, images, created_at, updated_at)
    VALUES 
        (bamenda_id, 'Handwoven Basket', 'Traditional Bamenda woven shopping basket', 8000, 'XAF', 'Home Decor', 12, true, ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'], now(), now()),
        (bamenda_id, 'Clay Cooking Pot', 'Earthenware cooking pot for stews', 9000, 'XAF', 'Kitchenware', 15, true, ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'], now(), now()),
        (bamenda_id, 'Wooden Salad Bowls', 'Smooth polished wooden salad bowls', 6000, 'XAF', 'Kitchenware', 20, true, ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'], now(), now()),
        (bamenda_id, 'Traditional Dinnerware Set', 'Ceramic plates & mugs set decorated with ethnic patterns', 18000, 'XAF', 'Home Decor', 8, true, ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'], now(), now()),
        (bamenda_id, 'Decorative Wood Masks', 'African tribal masks for wall decoration', 25000, 'XAF', 'Home Decor', 5, true, ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'], now(), now()),
        (bamenda_id, 'Bamboo Floor Mat', 'Eco-friendly bamboo woven mats', 10000, 'XAF', 'Home Decor', 10, true, ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'], now(), now()),
        (bamenda_id, 'Metal Cooking Utensil Set', 'Stainless steel utensils set with wooden handles', 16000, 'XAF', 'Kitchenware', 12, true, ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'], now(), now()),
        (bamenda_id, 'Local Raffia Rugs', 'Decorative floor rugs woven from raffia', 18000, 'XAF', 'Home Decor', 6, true, ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'], now(), now()),
        (bamenda_id, 'Wooden Carved Figurines', 'Small wooden sculptures and figurines', 15000, 'XAF', 'Home Decor', 14, true, ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'], now(), now()),
        (bamenda_id, 'Traditional Water Gourds', 'Decorated gourds used for water storage', 15000, 'XAF', 'Handicrafts', 8, true, ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'], now(), now());

    -- Insert products for Limbe Electronics & Appliances
    INSERT INTO public.marketplace_products (vendor_id, name, description, price, currency, category, stock_quantity, in_stock, images, created_at, updated_at)
    VALUES 
        (limbe_id, 'Solar Home Lighting System', 'Solar panel kits with LED bulbs', 45000, 'XAF', 'Electronics', 8, true, ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'], now(), now()),
        (limbe_id, 'Mini Refrigerator', 'Compact fridge ideal for small homes', 75000, 'XAF', 'Appliances', 5, true, ARRAY['https://images.unsplash.com/photo-1571670070931-d6d7ab5d74d8?w=400'], now(), now()),
        (limbe_id, 'Electric Kettle', 'Fast boiling electric kettles', 12000, 'XAF', 'Appliances', 15, true, ARRAY['https://images.unsplash.com/photo-1571670070931-d6d7ab5d74d8?w=400'], now(), now()),
        (limbe_id, 'Ceiling Fan', 'Energy-efficient ceiling fans', 25000, 'XAF', 'Electronics', 10, true, ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'], now(), now()),
        (limbe_id, 'Microwave Oven', 'Compact microwave ovens', 60000, 'XAF', 'Appliances', 6, true, ARRAY['https://images.unsplash.com/photo-1571670070931-d6d7ab5d74d8?w=400'], now(), now()),
        (limbe_id, 'Electric Iron', 'Steam irons for clothing', 13000, 'XAF', 'Appliances', 20, true, ARRAY['https://images.unsplash.com/photo-1571670070931-d6d7ab5d74d8?w=400'], now(), now()),
        (limbe_id, 'LED TV 32 inches', 'HD LED television', 90000, 'XAF', 'Electronics', 4, true, ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'], now(), now()),
        (limbe_id, 'Electric Blender', 'Heavy-duty food blender', 19000, 'XAF', 'Appliances', 12, true, ARRAY['https://images.unsplash.com/photo-1571670070931-d6d7ab5d74d8?w=400'], now(), now()),
        (limbe_id, 'Rice Cooker', 'Electric rice cooker with timer', 15000, 'XAF', 'Appliances', 18, true, ARRAY['https://images.unsplash.com/photo-1571670070931-d6d7ab5d74d8?w=400'], now(), now()),
        (limbe_id, 'Solar Lantern', 'Bright rechargeable solar lantern', 8000, 'XAF', 'Electronics', 25, true, ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'], now(), now());
END $$;