-- Populate sample village data with realistic information
INSERT INTO villages (
  village_name, region, division, subdivision, 
  year_founded, population_estimate, traditional_languages, ethnic_groups,
  village_motto, founding_story, overall_rating, infrastructure_score,
  education_score, health_score, peace_security_score, economic_activity_score,
  governance_score, social_spirit_score, diaspora_engagement_score,
  civic_participation_score, achievements_score, total_ratings_count,
  sons_daughters_count, view_count, is_verified, whatsapp_link, facebook_link,
  schools_count, hospitals_count, water_sources_count, electricity_coverage_percentage,
  mtn_coverage, orange_coverage, nexttel_coverage, main_economic_activity,
  flag_image_url, logo_image_url
) VALUES 
-- Centre Region Villages
('Mvog-Mbi', 'Centre', 'Mfoundi', 'Yaoundé I', 1885, 45000, 
 ARRAY['Ewondo', 'French'], ARRAY['Beti', 'Ewondo'],
 'Unity in Diversity', 'Founded by Chief Mvog-Mbi in the late 19th century as a trading post', 
 8.7, 18, 16, 15, 17, 16, 19, 18, 14, 17, 16, 156, 2340, 8950, true,
 'https://wa.me/group/abc123', 'https://facebook.com/mvogmbi',
 8, 3, 12, 85, true, true, true, 'Trade and Services',
 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop',
 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=400&h=400&fit=crop'),

('Obala', 'Centre', 'Lekié', 'Obala', 1920, 28000,
 ARRAY['Ewondo', 'French'], ARRAY['Beti'],
 'Progress Through Unity', 'Historic village known for its resistance during colonial times',
 7.9, 15, 14, 13, 16, 15, 17, 16, 12, 15, 14, 89, 1890, 5670, true,
 'https://wa.me/group/def456', 'https://facebook.com/obala',
 6, 2, 8, 70, true, true, false, 'Agriculture',
 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop',
 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=400&fit=crop'),

-- Northwest Region Villages  
('Kumbo', 'Northwest', 'Bui', 'Kumbo', 1912, 98000,
 ARRAY['Lamnso', 'English', 'Pidgin'], ARRAY['Nso'],
 'Strength in Tradition', 'Ancient kingdom seat of the Nso people, rich in cultural heritage',
 9.1, 17, 18, 16, 15, 17, 18, 19, 16, 18, 17, 234, 4560, 12340, true,
 'https://wa.me/group/ghi789', 'https://facebook.com/kumbo',
 12, 4, 15, 75, true, true, true, 'Agriculture and Trade',
 'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=800&h=600&fit=crop',
 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=400&fit=crop'),

('Wum', 'Northwest', 'Menchum', 'Wum', 1895, 52000,
 ARRAY['Aghem', 'English'], ARRAY['Aghem', 'Wimbum'],
 'Unity is Strength', 'Mountain village known for its scenic beauty and traditional architecture',
 8.4, 14, 15, 14, 16, 14, 16, 17, 13, 16, 15, 112, 2890, 7820, true,
 'https://wa.me/group/jkl012', 'https://facebook.com/wum',
 7, 2, 10, 60, true, false, true, 'Agriculture',
 'https://images.unsplash.com/photo-1501286353178-1ec881214838?w=800&h=600&fit=crop',
 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&h=400&fit=crop'),

-- Southwest Region Villages
('Buea', 'Southwest', 'Fako', 'Buea', 1890, 150000,
 ARRAY['English', 'Duala', 'Bakweri'], ARRAY['Bakweri', 'Duala'],
 'Mountain of Hope', 'Colonial capital nestled on Mount Cameroon, center of learning',
 9.3, 19, 19, 18, 17, 18, 19, 18, 17, 19, 18, 298, 6780, 15670, true,
 'https://wa.me/group/mno345', 'https://facebook.com/buea',
 15, 5, 20, 90, true, true, true, 'Education and Tourism',
 'https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?w=800&h=600&fit=crop',
 'https://images.unsplash.com/photo-1438565434616-3ef039228b15?w=400&h=400&fit=crop'),

('Limbe', 'Southwest', 'Fako', 'Limbe I', 1858, 125000,
 ARRAY['English', 'Duala'], ARRAY['Bakweri', 'Duala'], 
 'Gateway to the Sea', 'Historic coastal town, first Baptist mission in Cameroon',
 8.9, 18, 17, 17, 16, 19, 17, 17, 15, 17, 16, 187, 5230, 11890, true,
 'https://wa.me/group/pqr678', 'https://facebook.com/limbe',
 11, 4, 18, 85, true, true, true, 'Tourism and Fishing',
 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=800&h=600&fit=crop',
 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=400&h=400&fit=crop'),

-- West Region Villages
('Bafoussam', 'West', 'Mifi', 'Bafoussam I', 1903, 290000,
 ARRAY['Ghomala', 'French'], ARRAY['Bamileke'],
 'Land of Abundance', 'Commercial hub of the West, known for entrepreneurial spirit',
 8.8, 17, 16, 16, 17, 19, 18, 18, 14, 17, 16, 203, 7890, 13450, true,
 'https://wa.me/group/stu901', 'https://facebook.com/bafoussam',
 18, 6, 25, 80, true, true, true, 'Commerce and Agriculture',
 'https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=800&h=600&fit=crop',
 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=400&h=400&fit=crop'),

('Dschang', 'West', 'Menoua', 'Dschang', 1895, 87000,
 ARRAY['Yemba', 'French'], ARRAY['Bamileke'],
 'City of Universities', 'Educational center with beautiful highland climate',
 8.6, 16, 18, 15, 16, 15, 17, 17, 13, 16, 15, 145, 3450, 9870, true,
 'https://wa.me/group/vwx234', 'https://facebook.com/dschang',
 10, 3, 15, 75, true, true, false, 'Education and Agriculture',
 'https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=800&h=600&fit=crop',
 'https://images.unsplash.com/photo-1452960962994-acf4fd70b632?w=400&h=400&fit=crop'),

-- Littoral Region Villages  
('Douala', 'Littoral', 'Wouri', 'Douala I', 1860, 3200000,
 ARRAY['French', 'Duala', 'English'], ARRAY['Duala', 'Bassa'],
 'Economic Capital', 'Major port city and economic hub of Central Africa',
 9.0, 19, 17, 18, 16, 20, 18, 17, 16, 18, 17, 456, 12340, 25670, true,
 'https://wa.me/group/yz1234', 'https://facebook.com/douala',
 25, 8, 30, 95, true, true, true, 'Industry and Commerce',
 'https://images.unsplash.com/photo-1439886183900-e79ec0057170?w=800&h=600&fit=crop',
 'https://images.unsplash.com/photo-1441057206919-63d19fac2369?w=400&h=400&fit=crop'),

-- Far North Region Villages
('Maroua', 'Far North', 'Diamare', 'Maroua I', 1830, 420000,
 ARRAY['Fulfulde', 'French', 'Arabic'], ARRAY['Fulani', 'Arab-Choa'],
 'Pearl of the North', 'Ancient trading center and cultural crossroads',
 7.8, 15, 14, 13, 14, 16, 15, 16, 12, 15, 14, 134, 8970, 11230, true,
 'https://wa.me/group/abc567', 'https://facebook.com/maroua',
 14, 4, 12, 65, true, true, false, 'Trade and Livestock',
 'https://images.unsplash.com/photo-1469041797191-50ace28483c3?w=800&h=600&fit=crop',
 'https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=400&h=400&fit=crop'),

-- East Region Villages
('Bertoua', 'East', 'Lom-et-Djerem', 'Bertoua I', 1927, 218000,
 ARRAY['Gbaya', 'French'], ARRAY['Gbaya', 'Baya'],
 'Gateway to the Forest', 'Regional capital surrounded by dense rainforest',
 7.5, 14, 13, 12, 15, 14, 16, 15, 11, 14, 13, 98, 4560, 8910, false,
 'https://wa.me/group/def890', 'https://facebook.com/bertoua',
 9, 3, 8, 60, true, false, false, 'Forestry and Mining',
 'https://images.unsplash.com/photo-1487252665478-49b61b47f302?w=800&h=600&fit=crop',
 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=400&h=400&fit=crop'),

-- South Region Villages
('Ebolowa', 'South', 'Mvila', 'Ebolowa I', 1898, 79000,
 ARRAY['Bulu', 'French'], ARRAY['Bulu', 'Fang'],
 'Forest Heritage', 'Cocoa growing region with rich cultural traditions',
 7.3, 13, 14, 11, 14, 13, 15, 16, 10, 13, 12, 76, 2890, 6540, false,
 'https://wa.me/group/ghi123', 'https://facebook.com/ebolowa',
 7, 2, 6, 55, true, false, false, 'Agriculture (Cocoa)',
 'https://images.unsplash.com/photo-1501286353178-1ec881214838?w=800&h=600&fit=crop',
 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=400&fit=crop'),

-- North Region Villages
('Garoua', 'North', 'Benoue', 'Garoua I', 1839, 436000,
 ARRAY['Fulfulde', 'French'], ARRAY['Fulani', 'Hausa'],
 'River of Commerce', 'Historic trading post on the Benue River',
 7.9, 16, 15, 14, 15, 17, 16, 16, 13, 15, 14, 167, 6780, 10890, true,
 'https://wa.me/group/jkl456', 'https://facebook.com/garoua',
 12, 4, 14, 70, true, true, false, 'Trade and Livestock',
 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=800&h=600&fit=crop',
 'https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=400&h=400&fit=crop'),

-- Adamawa Region Villages  
('Ngaoundere', 'Adamawa', 'Vina', 'Ngaoundere I', 1835, 152000,
 ARRAY['Fulfulde', 'French'], ARRAY['Fulani', 'Gbaya'],
 'Highland Gateway', 'Educational and cultural center of the Adamawa plateau',
 8.1, 15, 16, 14, 15, 15, 16, 17, 12, 15, 14, 123, 4230, 9450, true,
 'https://wa.me/group/mno789', 'https://facebook.com/ngaoundere',
 10, 3, 11, 65, true, true, false, 'Education and Livestock',
 'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=800&h=600&fit=crop',
 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=400&fit=crop');

-- Create village photo gallery entries
INSERT INTO village_photos (village_id, photo_url, photo_caption, photo_type, is_featured)
SELECT 
  v.id,
  'https://images.unsplash.com/photo-' || (
    CASE 
      WHEN v.region = 'Centre' THEN '1506744038136-46273834b3fb'
      WHEN v.region = 'Northwest' THEN '1615729947596-a598e5de0ab3'
      WHEN v.region = 'Southwest' THEN '1465379944081-7f47de8d74ac'
      WHEN v.region = 'West' THEN '1517022812141-23620dba5c23'
      WHEN v.region = 'Littoral' THEN '1439886183900-e79ec0057170'
      WHEN v.region = 'Far North' THEN '1469041797191-50ace28483c3'
      WHEN v.region = 'East' THEN '1487252665478-49b61b47f302'
      WHEN v.region = 'South' THEN '1501286353178-1ec881214838'
      WHEN v.region = 'North' THEN '1452378174528-3090a4bba7b2'
      ELSE '1485833077593-4278bba3f11f'
    END
  ) || '?w=800&h=600&fit=crop',
  v.village_name || ' landscape view',
  'landscape',
  true
FROM villages v;

-- Add sample village ratings
INSERT INTO village_ratings (village_id, user_id, overall_rating, infrastructure_rating, education_rating, health_rating)
SELECT 
  v.id,
  gen_random_uuid(),
  (RANDOM() * 4 + 6)::numeric(3,1), -- Random rating between 6.0-10.0
  (RANDOM() * 4 + 6)::numeric(3,1),
  (RANDOM() * 4 + 6)::numeric(3,1),
  (RANDOM() * 4 + 6)::numeric(3,1)
FROM villages v
CROSS JOIN generate_series(1, 5); -- 5 ratings per village

-- Generate village slugs
UPDATE villages SET slug = generate_village_slug(village_name, region) WHERE slug IS NULL;