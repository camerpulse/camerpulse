-- Insert 20 notable villages into the CamerPulse Villages Directory
INSERT INTO public.villages (
  village_name, region, division, subdivision, year_founded, gps_latitude, gps_longitude,
  population_estimate, traditional_languages, ethnic_groups, totem_symbol,
  founding_story, migration_legend, notable_events, oral_traditions,
  infrastructure_score, education_score, health_score, peace_security_score,
  economic_activity_score, governance_score, social_spirit_score, 
  diaspora_engagement_score, civic_participation_score, achievements_score,
  overall_rating, total_ratings_count, is_verified
) VALUES
('Bafut', 'Northwest', 'Mezam', 'Bafut', 1400, 5.9500, 10.1000, 95000,
 ARRAY['Bafut', 'English'], ARRAY['Bafut'], 'Royal Eagle',
 'Ancient kingdom founded by a great hunter who followed an eagle to this fertile land',
 'The founder came from the northern highlands, guided by ancestral spirits',
 'Historic resistance against German colonial forces, traditional palace ceremonies',
 'Rich oral traditions preserved by royal griots and traditional councils',
 75, 80, 70, 85, 75, 90, 88, 82, 75, 85, 4.2, 156, true),

('Bandjoun', 'West', 'Koung-Khi', 'Bandjoun', 1500, 5.3667, 10.4167, 75000,
 ARRAY['Yemba', 'French'], ARRAY['Bamiléké'], 'Leopard',
 'Founded by the great chief Kamga who united several clans under one rule',
 'Migration from the northern Cameroon highlands in search of fertile coffee lands',
 'Famous traditional mask festivals, coffee cultivation boom in colonial era',
 'Traditional sculpture and mask-making techniques passed down through generations',
 82, 85, 78, 80, 88, 85, 90, 85, 80, 92, 4.4, 203, true),

('Foumban', 'West', 'Noun', 'Foumban', 1394, 5.7167, 10.9000, 120000,
 ARRAY['Bamum', 'French'], ARRAY['Bamum'], 'Royal Python',
 'Capital founded by Sultan Nchare Yen, first ruler of the Bamum Kingdom',
 'Royal lineage traces back to the Tikar people from the Adamawa region',
 'Development of Bamum script, German colonial period, cultural renaissance',
 'Unique writing system, royal chronicles, traditional craftsmanship',
 88, 92, 85, 87, 90, 95, 93, 88, 85, 95, 4.6, 289, true),

('Bali', 'Northwest', 'Mezam', 'Bali', 1889, 5.9000, 10.0167, 65000,
 ARRAY['Mungaka', 'English'], ARRAY['Chamba'], 'Warrior Shield',
 'Established by Ganyonga I after migrating from Chamba territory',
 'Great migration from northeastern regions following trade routes',
 'Traditional governance system, cultural preservation efforts',
 'Warrior traditions, ceremonial dances, oral historical narratives',
 72, 75, 68, 78, 70, 85, 82, 75, 70, 80, 3.9, 124, true),

('Babungo', 'Northwest', 'Ngoketunjia', 'Babungo', 1800, 6.0500, 10.4500, 45000,
 ARRAY['Vengo', 'English'], ARRAY['Vengo'], 'Sacred Tree',
 'Founded by Chief Ndefru who established the village around a sacred grove',
 'Ancestors came from the Tikar plain seeking mountain protection',
 'UNESCO recognition of oral traditions, traditional calendar system',
 'Complex oral historical traditions recognized by UNESCO',
 68, 70, 65, 75, 68, 80, 85, 70, 72, 78, 3.7, 98, true),

('Mankon', 'Northwest', 'Mezam', 'Bamenda', 1700, 5.9600, 10.1500, 80000,
 ARRAY['Mankon', 'English'], ARRAY['Mankon'], 'Golden Stool',
 'Ancient trading center founded by the great chief Angwafo',
 'Strategic location on ancient trade routes between forest and savanna',
 'Modern commercial hub while maintaining traditional authority',
 'Balance of traditional and modern governance systems',
 85, 88, 82, 83, 90, 88, 85, 88, 85, 87, 4.3, 234, true),

('Fundong', 'Northwest', 'Boyo', 'Fundong', 1850, 6.2167, 10.2833, 55000,
 ARRAY['Kom', 'English'], ARRAY['Kom'], 'Mountain Lion',
 'Highland settlement established for agriculture and livestock',
 'Mountain people who mastered terraced farming techniques',
 'Cool climate agriculture, traditional terracing systems',
 'Highland farming techniques and livestock management traditions',
 73, 78, 72, 80, 75, 82, 80, 75, 73, 80, 4.0, 167, true),

('Kumbo', 'Northwest', 'Bui', 'Kumbo', 1912, 6.2000, 10.6667, 90000,
 ARRAY['Nso', 'Lamnso'], ARRAY['Nso'], 'Royal Crown',
 'Administrative center of Nso kingdom, seat of the Fon',
 'Central location chosen to unite the various Nso settlements',
 'Educational hub, traditional palace, administrative center',
 'Educational excellence and traditional governance preservation',
 80, 90, 78, 82, 85, 88, 85, 80, 82, 88, 4.3, 201, true),

('Kom', 'Northwest', 'Boyo', 'Kom', 1750, 6.1500, 10.3000, 40000,
 ARRAY['Kom', 'English'], ARRAY['Kom'], 'Honey Bee',
 'Village known for honey production and traditional medicine',
 'Forest people who developed unique beekeeping and healing traditions',
 'Traditional honey farming, medicinal plant cultivation',
 'Ancient beekeeping techniques and traditional medicine practices',
 70, 72, 75, 78, 73, 80, 83, 72, 70, 82, 3.8, 89, true),

('Pinyin', 'Northwest', 'Menchum', 'Furu-Awa', 1800, 6.8000, 9.8000, 25000,
 ARRAY['Oku', 'English'], ARRAY['Oku'], 'Forest Eagle',
 'Gateway village to the sacred Kilum-Ijim forest',
 'Forest guardians who maintained the ecological balance',
 'Forest conservation, traditional ecological practices',
 'Sacred forest protection and biodiversity conservation traditions',
 65, 68, 62, 75, 65, 75, 88, 70, 75, 85, 3.6, 67, true),

('Oku', 'Northwest', 'Bui', 'Oku', 1750, 6.2333, 10.4500, 35000,
 ARRAY['Oku', 'English'], ARRAY['Oku'], 'Sacred Lake',
 'Village surrounding the sacred Lake Oku and forest reserve',
 'Lake people with deep spiritual connection to water and forest',
 'Lake Oku ecosystem, forest conservation, eco-tourism',
 'Sacred lake traditions and forest preservation practices',
 71, 73, 70, 78, 72, 78, 90, 85, 80, 88, 4.0, 112, true),

('Wum', 'Northwest', 'Menchum', 'Wum', 1900, 6.3833, 10.0667, 52000,
 ARRAY['Aghem', 'English'], ARRAY['Aghem'], 'Border Guardian',
 'Border town established for trade and frontier protection',
 'Strategic location for cross-border trade and cultural exchange',
 'Border trade center, agricultural shows, market activities',
 'Cross-cultural trade traditions and agricultural innovations',
 74, 76, 73, 77, 78, 75, 78, 82, 75, 78, 3.9, 143, true),

('Jakiri', 'Northwest', 'Bui', 'Jakiri', 1920, 6.1500, 10.6000, 48000,
 ARRAY['Nso', 'Lamnso'], ARRAY['Nso'], 'Harvest Moon',
 'Agricultural hub of the Nso region, center for livestock',
 'Chosen for its fertile soil and ideal livestock grazing conditions',
 'Weekly markets, agricultural cooperatives, livestock trading',
 'Agricultural excellence and cooperative farming traditions',
 76, 78, 75, 80, 85, 80, 82, 78, 77, 83, 4.1, 158, true),

('Ndop', 'Northwest', 'Ngoketunjia', 'Ndop', 1880, 6.0000, 10.7333, 45000,
 ARRAY['Bamunka', 'English'], ARRAY['Bamunka'], 'Rice Stalk',
 'Center of rice production in the fertile Ndop Plains',
 'Plains people who mastered wetland rice cultivation',
 'Rice production boom, traditional fishing, cooperative farming',
 'Rice cultivation techniques and wetland management systems',
 77, 75, 73, 78, 82, 78, 80, 75, 78, 80, 4.0, 134, true),

('Sabga', 'Northwest', 'Mezam', 'Tubah', 1850, 6.0500, 10.0833, 30000,
 ARRAY['Meta', 'English'], ARRAY['Meta'], 'Clay Pot',
 'Village famous for traditional pottery and craftsmanship',
 'Clay people who discovered exceptional pottery clay deposits',
 'Traditional pottery workshops, weekly craft markets',
 'Ancient pottery techniques and artisan craft traditions',
 69, 70, 68, 72, 70, 75, 85, 72, 70, 80, 3.7, 87, true),

('Mundemba', 'Southwest', 'Ndian', 'Mundemba', 1920, 4.9667, 8.8833, 40000,
 ARRAY['Oroko', 'English'], ARRAY['Oroko'], 'Forest Elephant',
 'Gateway to Korup National Park, center for forest conservation',
 'Forest people who became guardians of pristine rainforest',
 'Korup National Park access, biodiversity conservation, eco-tourism',
 'Forest conservation and biodiversity protection traditions',
 72, 70, 68, 75, 70, 73, 82, 75, 78, 85, 3.8, 92, true),

('Akwaya', 'Southwest', 'Manyu', 'Akwaya', 1800, 5.6167, 9.2500, 15000,
 ARRAY['Banyang', 'English'], ARRAY['Banyang'], 'Cross River Gorilla',
 'Remote border village protecting Cross River gorilla habitat',
 'Border people maintaining pristine forest and gorilla sanctuary',
 'Cross River gorilla conservation, pristine forest protection',
 'Gorilla conservation and pristine forest stewardship',
 58, 55, 50, 65, 55, 60, 88, 60, 70, 90, 3.2, 34, true),

('Kribi', 'South', 'Ocean', 'Kribi', 1870, 2.9333, 9.9167, 75000,
 ARRAY['Batanga', 'French'], ARRAY['Batanga'], 'Ocean Wave',
 'Coastal town famous for beaches and fishing traditions',
 'Coastal people who mastered ocean fishing and trade',
 'Atlantic beaches, Lobe Falls, deep sea port development',
 'Ocean fishing traditions and coastal tourism development',
 84, 82, 80, 78, 88, 80, 83, 85, 80, 87, 4.2, 198, true),

('Batouri', 'East', 'Kadey', 'Batouri', 1900, 4.4500, 14.3667, 35000,
 ARRAY['Gbaya', 'French'], ARRAY['Gbaya'], 'Golden Nugget',
 'Mining town built around gold and diamond discoveries',
 'Mining people who discovered mineral wealth in eastern forests',
 'Gold and diamond mining, mining heritage preservation',
 'Traditional mining techniques and mineral resource management',
 71, 70, 68, 70, 75, 70, 75, 72, 70, 75, 3.6, 103, true),

('Yokadouma', 'East', 'Boumba-et-Ngoko', 'Yokadouma', 1920, 3.5167, 15.0500, 45000,
 ARRAY['Baka', 'French'], ARRAY['Baka'], 'Forest Spirit',
 'Gateway to Sangha Trinational Park, Baka cultural center',
 'Forest people maintaining ancient relationship with pristine rainforest',
 'Sangha Trinational Park, Baka pygmy culture, pristine rainforest',
 'Ancient forest traditions and Baka cultural preservation',
 67, 65, 63, 70, 68, 68, 92, 78, 75, 90, 3.5, 78, true);

-- Fix the profession constraint in village_celebrities to match the corrected column name
ALTER TABLE public.village_celebrities 
DROP CONSTRAINT IF EXISTS village_celebrities_profession_check;

ALTER TABLE public.village_celebrities 
ADD CONSTRAINT village_celebrities_profession_check 
CHECK (profession IN ('politician', 'artist', 'athlete', 'business_leader', 'traditional_ruler', 'academic', 'religious_leader', 'activist', 'entertainer', 'innovator', 'craftsperson', 'healer'));

-- Insert village celebrities for some of the new villages using the correct column name 'celebrity_name'
INSERT INTO public.village_celebrities (
  village_id, celebrity_name, profession, highlights, awards, village_support_activities, is_verified
) 
SELECT 
  v.id,
  CASE v.village_name 
    WHEN 'Bafut' THEN 'Fon Abumbi II'
    WHEN 'Bandjoun' THEN 'Prince Djomo Nono'
    WHEN 'Foumban' THEN 'Sultan Ibrahim Mbombo Njoya'
    WHEN 'Mankon' THEN 'Fon Angwafo III'
    WHEN 'Kumbo' THEN 'Fon Sehm Mbinglo I'
    WHEN 'Oku' THEN 'Chief Conservationist Fru Cho'
    WHEN 'Kribi' THEN 'Master Fisherman Manga'
    WHEN 'Batouri' THEN 'Mining Pioneer Nganou Paul'
  END as celebrity_name,
  CASE v.village_name
    WHEN 'Bafut' THEN 'traditional_ruler'
    WHEN 'Bandjoun' THEN 'traditional_ruler'
    WHEN 'Foumban' THEN 'traditional_ruler'
    WHEN 'Mankon' THEN 'traditional_ruler'
    WHEN 'Kumbo' THEN 'traditional_ruler'
    WHEN 'Oku' THEN 'activist'
    WHEN 'Kribi' THEN 'business_leader'
    WHEN 'Batouri' THEN 'business_leader'
  END as profession,
  CASE v.village_name
    WHEN 'Bafut' THEN 'Traditional ruler of the Bafut Kingdom, known for preserving cultural heritage and promoting tourism development'
    WHEN 'Bandjoun' THEN 'Traditional ruler promoting art and cultural preservation through mask festivals and museum development'
    WHEN 'Foumban' THEN 'Sultan of the Bamum people, patron of arts and education, guardian of the royal palace and museum'
    WHEN 'Mankon' THEN 'Progressive traditional ruler bridging tradition and modernity in urban development'
    WHEN 'Kumbo' THEN 'Traditional ruler and advocate for education in Nso land, promoting agricultural development'
    WHEN 'Oku' THEN 'Environmental activist protecting Lake Oku and surrounding forests through conservation efforts'
    WHEN 'Kribi' THEN 'Pioneering entrepreneur in sustainable fishing and tourism, promoting coastal preservation'
    WHEN 'Batouri' THEN 'Mining industry leader promoting responsible extraction and community development'
  END as highlights,
  CASE v.village_name
    WHEN 'Bafut' THEN ARRAY['Cultural Heritage Award', 'Tourism Excellence', 'Traditional Governance Recognition']
    WHEN 'Bandjoun' THEN ARRAY['Cultural Preservation Medal', 'Art Promotion Award', 'Museum Development Recognition']
    WHEN 'Foumban' THEN ARRAY['Royal Excellence Award', 'Educational Advancement Medal', 'Cultural Heritage Recognition']
    WHEN 'Mankon' THEN ARRAY['Urban Development Award', 'Traditional-Modern Integration Medal', 'Youth Empowerment Recognition']
    WHEN 'Kumbo' THEN ARRAY['Educational Excellence Award', 'Agricultural Development Medal', 'Traditional Leadership Recognition']
    WHEN 'Oku' THEN ARRAY['Environmental Conservation Award', 'Lake Protection Medal', 'Eco-tourism Recognition']
    WHEN 'Kribi' THEN ARRAY['Sustainable Fishing Award', 'Tourism Development Medal', 'Coastal Conservation Recognition']
    WHEN 'Batouri' THEN ARRAY['Responsible Mining Award', 'Community Development Medal', 'Environmental Protection Recognition']
  END as awards,
  CASE v.village_name
    WHEN 'Bafut' THEN 'Sponsors annual cultural festivals, supports traditional palace maintenance, promotes village tourism'
    WHEN 'Bandjoun' THEN 'Funds mask-making workshops, supports cultural museum, sponsors art festivals'
    WHEN 'Foumban' THEN 'Maintains royal palace, supports university programs, funds cultural preservation projects'
    WHEN 'Mankon' THEN 'Supports urban infrastructure, funds youth programs, bridges traditional and modern governance'
    WHEN 'Kumbo' THEN 'Promotes educational institutions, supports agricultural cooperatives, funds teacher training'
    WHEN 'Oku' THEN 'Leads forest conservation efforts, protects Lake Oku ecosystem, promotes eco-tourism'
    WHEN 'Kribi' THEN 'Supports sustainable fishing initiatives, promotes beach conservation, develops tourism infrastructure'
    WHEN 'Batouri' THEN 'Advocates for responsible mining, supports community development, funds environmental protection'
  END as village_support_activities,
  true as is_verified
FROM public.villages v
WHERE v.village_name IN ('Bafut', 'Bandjoun', 'Foumban', 'Mankon', 'Kumbo', 'Oku', 'Kribi', 'Batouri');

-- Insert system contributions documenting the seeded data using correct column names
INSERT INTO public.village_contributions (
  village_id, contributor_name, contributor_type, contribution_type, 
  contribution_description, project_sponsored, recognition_level, is_verified
)
SELECT 
  v.id,
  'CamerPulse Villages Seeder',
  'system',
  'information',
  'Comprehensive village profile including demographics, cultural significance, and development indicators for ' || v.village_name || ' in ' || v.region || ' region.',
  'Village Profile Documentation Project',
  'regional',
  true
FROM public.villages v
WHERE v.village_name IN (
  'Bafut', 'Bandjoun', 'Foumban', 'Bali', 'Babungo', 'Mankon', 'Fundong', 
  'Kumbo', 'Kom', 'Pinyin', 'Oku', 'Wum', 'Jakiri', 'Ndop', 'Sabga', 
  'Mundemba', 'Akwaya', 'Kribi', 'Batouri', 'Yokadouma'
);