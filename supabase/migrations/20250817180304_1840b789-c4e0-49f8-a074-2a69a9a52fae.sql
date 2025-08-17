-- Insert sample data for demonstration and testing
-- Sample billionaires data
INSERT INTO public.billionaires (full_name, primary_industry, net_worth_usd, net_worth_fcfa, company_name, wealth_source, age, residence_location, bio, verification_status)
VALUES 
  ('Vincent Bolloré', 'Logistics & Media', 8500000000, 5100000000000, 'Bolloré Group', 'Inherited & Business Expansion', 71, 'Paris/Douala', 'French billionaire with significant investments in African logistics and media', 'verified'),
  ('Baba Danpullo', 'Banking & Agriculture', 950000000, 570000000000, 'BICEC Bank', 'Banking & Real Estate', 74, 'Douala', 'Cameroonian businessman, one of the richest people in Central Africa', 'verified'),
  ('Samuel Foyou', 'Agribusiness', 650000000, 390000000000, 'SAFCACAO', 'Cocoa Trading & Processing', 68, 'Douala', 'Major cocoa trader and agricultural businessman in Cameroon', 'unverified'),
  ('Kate Fotso', 'Construction & Industry', 520000000, 312000000000, 'Fotso Group', 'Construction & Manufacturing', 59, 'Douala', 'Leading industrialist and construction magnate', 'verified')
ON CONFLICT (slug) DO NOTHING;

-- Sample artist profiles
INSERT INTO public.artist_profiles (user_id, stage_name, real_name, genre, bio, country, city, verification_status, is_featured, total_streams, total_downloads, monthly_listeners)
SELECT 
  au.id,
  CASE 
    WHEN au.email LIKE '%1%' THEN 'Locko'
    WHEN au.email LIKE '%2%' THEN 'Daphne'
    WHEN au.email LIKE '%3%' THEN 'Mr Leo'
    WHEN au.email LIKE '%4%' THEN 'Salatiel'
    ELSE 'Stanley Enow'
  END,
  CASE 
    WHEN au.email LIKE '%1%' THEN 'Charles Arthur Locko'
    WHEN au.email LIKE '%2%' THEN 'Daphne Njie'
    WHEN au.email LIKE '%3%' THEN 'Azinwi Leonel'
    WHEN au.email LIKE '%4%' THEN 'Salatiel Livenja'
    ELSE 'Stanley Enow Ebai'
  END,
  CASE 
    WHEN au.email LIKE '%1%' THEN ARRAY['Afrobeats', 'R&B']
    WHEN au.email LIKE '%2%' THEN ARRAY['Afropop', 'Urban']
    WHEN au.email LIKE '%3%' THEN ARRAY['Afrobeats', 'Rap']
    WHEN au.email LIKE '%4%' THEN ARRAY['Afrobeats', 'Gospel']
    ELSE ARRAY['Rap', 'Hip-Hop']
  END,
  CASE 
    WHEN au.email LIKE '%1%' THEN 'Award-winning Cameroonian artist known for Afrobeats and R&B'
    WHEN au.email LIKE '%2%' THEN 'Popular Cameroonian singer and performer'
    WHEN au.email LIKE '%3%' THEN 'Multi-talented artist, singer and rapper'
    WHEN au.email LIKE '%4%' THEN 'Gospel-influenced Afrobeats artist and producer'
    ELSE 'Pioneer of Cameroonian hip-hop and rap music'
  END,
  'Cameroon',
  CASE 
    WHEN au.email LIKE '%1%' THEN 'Douala'
    WHEN au.email LIKE '%2%' THEN 'Buea'
    WHEN au.email LIKE '%3%' THEN 'Bamenda'
    WHEN au.email LIKE '%4%' THEN 'Douala'
    ELSE 'Bamenda'
  END,
  'verified',
  true,
  FLOOR(RANDOM() * 5000000 + 1000000)::BIGINT,
  FLOOR(RANDOM() * 500000 + 100000)::BIGINT,
  FLOOR(RANDOM() * 100000 + 50000)::INTEGER
FROM auth.users au
WHERE au.email IS NOT NULL
LIMIT 5
ON CONFLICT (user_id) DO NOTHING;

-- Sample sentiment analysis data
INSERT INTO public.sentiment_analysis (content_source, content_text, sentiment_score, sentiment_label, confidence_score, emotion_scores, keywords, topics, region, language)
VALUES 
  ('social_media', 'The new infrastructure projects in Douala are bringing real change to our community!', 0.7, 'positive', 0.85, '{"joy": 0.8, "trust": 0.7}', '["infrastructure", "development", "community"]', '["infrastructure", "development"]', 'Littoral', 'en'),
  ('news', 'Government announces new education reforms for rural areas', 0.3, 'positive', 0.72, '{"trust": 0.6, "anticipation": 0.5}', '["education", "reforms", "rural"]', '["education", "government"]', 'Centre', 'en'),
  ('polls', 'Concerns raised about economic policies and their impact on small businesses', -0.4, 'negative', 0.78, '{"fear": 0.6, "anger": 0.4}', '["economy", "business", "policies"]', '["economy", "politics"]', 'West', 'en'),
  ('comments', 'Healthcare services have improved significantly in the North region', 0.6, 'positive', 0.82, '{"joy": 0.7, "trust": 0.8}', '["healthcare", "improvement", "services"]', '["health", "development"]', 'North', 'en'),
  ('social_media', 'Traffic congestion in Yaoundé continues to be a major problem', -0.5, 'negative', 0.75, '{"anger": 0.7, "disgust": 0.3}', '["traffic", "congestion", "transport"]', '["infrastructure", "urban"]', 'Centre', 'en'),
  ('news', 'New cultural festival celebrates Cameroon''s diversity and unity', 0.8, 'positive', 0.88, '{"joy": 0.9, "trust": 0.7}', '["culture", "festival", "unity"]', '["culture", "arts"]', 'West', 'en')
ON CONFLICT DO NOTHING;

-- Sample media sources if not already populated
INSERT INTO public.media_sources (name, source_type, website_url, description, founded_year, headquarters, ownership_type, bias_score, trust_score, fact_check_score, transparency_score, reliability_score, is_verified)
VALUES 
  ('L''Effort Camerounais', 'newspaper', 'https://www.leffortcamerounais.com', 'Catholic Church newspaper', 1955, 'Yaoundé', 'nonprofit', 30, 88, 90, 85, 87, true),
  ('The Post', 'newspaper', 'https://www.thepostng.com', 'Private English-language newspaper', 1996, 'Buea', 'private', 25, 85, 88, 80, 84, true),
  ('Canal 2 International', 'tv', 'https://www.canal2.tv', 'Private television station', 2001, 'Douala', 'private', 45, 75, 72, 68, 73, true),
  ('STV', 'tv', 'https://www.stv.cm', 'Private television network', 2005, 'Douala', 'private', 50, 78, 75, 70, 76, true)
ON CONFLICT (slug) DO NOTHING;

-- Update existing media sources with complete required fields if missing
UPDATE public.media_sources 
SET 
  name = COALESCE(name, 'Unknown Source'),
  source_type = COALESCE(source_type, 'online'),
  ownership_type = COALESCE(ownership_type, 'private'),
  bias_score = COALESCE(bias_score, 50),
  trust_score = COALESCE(trust_score, 50),
  fact_check_score = COALESCE(fact_check_score, 50),
  transparency_score = COALESCE(transparency_score, 50),
  reliability_score = COALESCE(reliability_score, 50),
  is_verified = COALESCE(is_verified, false),
  created_at = COALESCE(created_at, now()),
  updated_at = COALESCE(updated_at, now())
WHERE name IS NULL OR source_type IS NULL OR ownership_type IS NULL;