-- Create demo user profiles
INSERT INTO public.profiles (user_id, username, display_name, bio, location, is_diaspora, verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'paul_biya', 'Paul Biya', 'President of the Republic of Cameroon since 1982. Leading the nation towards emergence by 2035.', 'Yaoundé, Cameroon', false, true),
('550e8400-e29b-41d4-a716-446655440002', 'diaspora_jean', 'Jean Mballa', 'Cameroonian entrepreneur based in France. Passionate about tech innovation in Africa.', 'Paris, France', true, false),
('550e8400-e29b-41d4-a716-446655440003', 'marie_douala', 'Marie Nkomo', 'Civil society activist from Douala. Fighting for women rights and education.', 'Douala, Cameroon', false, false),
('550e8400-e29b-41d4-a716-446655440004', 'tech_guy', 'David Tcheutchoua', 'Software developer and startup founder. Building solutions for local problems.', 'Buea, Cameroon', false, true),
('550e8400-e29b-41d4-a716-446655440005', 'mama_africa', 'Aminata Kone', 'Traditional trader and community leader. Promoting local products and culture.', 'Bamenda, Cameroon', false, false);

-- Create demo politicians
INSERT INTO public.politicians (id, name, party, role_title, bio, region, profile_image_url, civic_score, verified) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Paul Biya', 'RDPC', 'President of the Republic', 'President of Cameroon since 1982, leading the country towards emergence.', 'Centre', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 85, true),
('650e8400-e29b-41d4-a716-446655440002', 'Joshua Osih', 'SDF', 'Vice President SDF', 'Opposition leader and advocate for democratic reforms.', 'Southwest', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 72, true),
('650e8400-e29b-41d4-a716-446655440003', 'Edith Kah Walla', 'CPP', 'President CPP', 'First female presidential candidate, champion of womens rights.', 'Northwest', 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=150&h=150&fit=crop&crop=face', 78, true);

-- Create demo marketplace vendors
INSERT INTO public.marketplace_vendors (id, user_id, vendor_id, business_name, description, verification_status, rating) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'CM-1234567', 'TechHub Cameroon', 'Leading electronics and gadgets store in Central Africa', 'verified', 4.8),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'CM-2345678', 'Mama Africa Crafts', 'Authentic African crafts and traditional items', 'verified', 4.6),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'CM-3456789', 'Green Valley Farms', 'Organic produce and agricultural products from Cameroon', 'pending', 4.2);

-- Create demo marketplace products
INSERT INTO public.marketplace_products (id, vendor_id, name, description, price, currency, category, images, stock_quantity, in_stock) VALUES
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'Professional Laptop', 'High-performance laptop perfect for developers and content creators', 750000, 'XAF', 'Electronics', ARRAY['https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500&h=400&fit=crop'], 15, true),
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 'Gaming Setup', 'Complete gaming setup with monitor and accessories', 1200000, 'XAF', 'Electronics', ARRAY['https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=500&h=400&fit=crop'], 8, true),
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440002', 'Traditional Kente Cloth', 'Handwoven Kente cloth with authentic African patterns', 85000, 'XAF', 'Fashion', ARRAY['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&h=400&fit=crop'], 25, true),
('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440002', 'Wooden Sculpture', 'Beautiful handcrafted wooden sculpture by local artisans', 45000, 'XAF', 'Art', ARRAY['https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=500&h=400&fit=crop'], 12, true),
('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440003', 'Organic Coffee Beans', 'Premium Arabica coffee beans grown in the highlands of Cameroon', 12000, 'XAF', 'Food', ARRAY['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&h=400&fit=crop'], 100, true);

-- Create demo polls
INSERT INTO public.polls (id, creator_id, title, description, options, votes_count, is_active, ends_at) VALUES
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Should Cameroon invest more in renewable energy?', 'As we move towards Vision 2035, what should be our energy priorities?', '["Solar and wind power", "Hydroelectric dams", "Current fossil fuel approach", "Mixed approach"]', 1247, true, '2024-12-31 23:59:59'),
('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'What is the biggest challenge for Cameroon diaspora?', 'Share your experience as a Cameroonian living abroad', '["Language barriers", "Cultural integration", "Financial remittances", "Staying connected to home"]', 892, true, '2024-11-30 23:59:59'),
('950e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'Priority for Cameroon tech development?', 'Which area should get the most government support?', '["Digital infrastructure", "Tech education", "Startup funding", "Innovation hubs"]', 634, true, '2024-10-30 23:59:59');

-- Create demo pulse posts
INSERT INTO public.pulse_posts (id, user_id, content, hashtags, mentions, likes_count, comments_count, sentiment_label, sentiment_score) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Just attended an amazing conference on womens entrepreneurship in Douala! So many inspiring stories of success. #WomenInBusiness #CameroonEntrepreneurs #Inspiration', ARRAY['WomenInBusiness', 'CameroonEntrepreneurs', 'Inspiration'], ARRAY[], 45, 12, 'positive', 0.87),
('a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'Working on a new mobile app to help farmers access market prices in real-time. Technology can truly transform agriculture in Cameroon! #AgriTech #Innovation #FarmersFirst', ARRAY['AgriTech', 'Innovation', 'FarmersFirst'], ARRAY[], 78, 23, 'positive', 0.92),
('a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Missing the beautiful landscapes of Cameroon from here in Paris. Nothing beats the sunset over Mount Cameroon! 🌅 #HomeSick #Diaspora #MountCameroon', ARRAY['HomeSick', 'Diaspora', 'MountCameroon'], ARRAY[], 156, 34, 'neutral', 0.65);

-- Create demo news articles
INSERT INTO public.news_articles (id, title, excerpt, content, source_name, source_url, sentiment_label, sentiment_score, is_pinned, published_at) VALUES
('b50e8400-e29b-41d4-a716-446655440001', 'Cameroon Launches Digital Economy Initiative', 'Government announces massive investment in digital infrastructure to boost economic growth', 'The Cameroonian government has unveiled an ambitious digital economy initiative aimed at transforming the countrys economic landscape. The program includes investments in fiber optic networks, digital literacy programs, and support for tech startups. President Paul Biya emphasized that this initiative is crucial for achieving the Vision 2035 emergence goals.', 'CameroonTribune', 'https://example.com/digital-economy', 'positive', 0.85, true, '2024-01-15 10:00:00'),
('b50e8400-e29b-41d4-a716-446655440002', 'New University Opens in Northern Cameroon', 'Educational expansion continues with state-of-the-art facility in Maroua', 'A new university campus has officially opened in Maroua, bringing higher education opportunities closer to students in northern Cameroon. The facility features modern laboratories, digital classrooms, and focuses on agriculture and engineering programs suited to the regions needs.', 'Cameroon News Agency', 'https://example.com/university-maroua', 'positive', 0.78, false, '2024-01-10 14:30:00'),
('b50e8400-e29b-41d4-a716-446655440003', 'Infrastructure Challenges in Rural Areas', 'Report highlights ongoing connectivity issues affecting development', 'A recent study by development partners reveals that rural areas in Cameroon continue to face significant infrastructure challenges, particularly in road connectivity and internet access. The report calls for increased investment and innovative solutions to bridge the digital divide.', 'Development Today', 'https://example.com/rural-challenges', 'negative', -0.45, false, '2024-01-08 09:15:00');

-- Create demo donations
INSERT INTO public.donations (id, user_id, amount, currency, message, payment_status, is_anonymous) VALUES
('c50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 50000, 'XAF', 'Supporting education initiatives in rural Cameroon. Every child deserves quality education!', 'completed', false),
('c50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 25000, 'XAF', 'For clean water projects in the North region.', 'completed', false),
('c50e8400-e29b-41d4-a716-446655440003', NULL, 100000, 'XAF', 'Anonymous donation for healthcare improvements', 'completed', true),
('c50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 15000, 'XAF', 'Supporting local artisans and craftspeople', 'completed', false);

-- Create demo follows
INSERT INTO public.follows (id, follower_id, following_id) VALUES
('d50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'),
('d50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004'),
('d50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004'),
('d50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003'),
('d50e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002');

-- Create demo approval ratings for politicians
INSERT INTO public.approval_ratings (id, politician_id, user_id, rating, comment) VALUES
('e50e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 7, 'Good progress on infrastructure but need more focus on youth employment'),
('e50e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 8, 'Strong advocate for democratic reforms and transparency'),
('e50e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 9, 'Excellent work promoting womens rights and gender equality');