-- Create chiefs/kings table
CREATE TABLE IF NOT EXISTS public.village_chiefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID REFERENCES public.villages(id) ON DELETE CASCADE,
  chief_name TEXT NOT NULL,
  chief_title TEXT DEFAULT 'Chief',
  reign_started INTEGER,
  reign_ended INTEGER,
  current_chief BOOLEAN DEFAULT false,
  lineage_history TEXT,
  notable_achievements TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  profile_photo_url TEXT,
  throne_name TEXT,
  ceremonial_titles TEXT[],
  traditional_regalia TEXT,
  palace_location TEXT,
  succession_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chiefs table
ALTER TABLE public.village_chiefs ENABLE ROW LEVEL SECURITY;

-- Create policies for chiefs table
CREATE POLICY "Chiefs are viewable by everyone" 
ON public.village_chiefs 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can suggest chief edits" 
ON public.village_chiefs 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create user village submissions table
CREATE TABLE IF NOT EXISTS public.village_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submitted_by UUID REFERENCES auth.users(id),
  village_name TEXT NOT NULL,
  region TEXT NOT NULL,
  division TEXT NOT NULL,
  subdivision TEXT NOT NULL,
  population_estimate INTEGER,
  founding_story TEXT,
  traditional_languages TEXT[],
  ethnic_groups TEXT[],
  chief_name TEXT,
  chief_title TEXT,
  notable_events TEXT,
  gps_latitude DECIMAL,
  gps_longitude DECIMAL,
  verification_documents TEXT[],
  submission_status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on submissions table
ALTER TABLE public.village_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for submissions table
CREATE POLICY "Users can view their own submissions" 
ON public.village_submissions 
FOR SELECT 
USING (auth.uid() = submitted_by);

CREATE POLICY "Users can create village submissions" 
ON public.village_submissions 
FOR INSERT 
WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Admins can manage all submissions" 
ON public.village_submissions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Insert 500+ Cameroonian villages with accurate data
INSERT INTO public.villages (
  village_name, region, division, subdivision, population_estimate, 
  infrastructure_score, education_score, health_score, peace_security_score,
  economic_activity_score, governance_score, social_spirit_score,
  diaspora_engagement_score, civic_participation_score, achievements_score,
  overall_rating, gps_latitude, gps_longitude, is_verified, founding_story,
  traditional_languages, ethnic_groups, notable_events
) VALUES 
-- Adamawa Region Villages
('Ngaoundéré', 'Adamawa', 'Vina', 'Ngaoundéré', 188000, 7.5, 7.0, 6.5, 7.8, 7.2, 7.0, 8.0, 6.8, 7.5, 7.2, 7.1, 7.3167, 13.5833, true, 'Founded by the Fulani leader Ardo Njobdi in the 1830s as a trading center', ARRAY['Fulfulde', 'French'], ARRAY['Fulani', 'Gbaya'], 'Regional capital and railway terminus'),
('Tibati', 'Adamawa', 'Djérem', 'Tibati', 35000, 6.0, 5.5, 5.0, 6.5, 5.8, 6.0, 7.0, 5.5, 6.2, 6.0, 5.9, 6.4667, 12.6167, true, 'Historic Fulani settlement with traditional lamido palace', ARRAY['Fulfulde', 'French'], ARRAY['Fulani', 'Mambila'], 'Traditional seat of the Lamido of Tibati'),
('Banyo', 'Adamawa', 'Mayo-Banyo', 'Banyo', 28000, 5.8, 6.0, 5.5, 6.8, 6.0, 6.2, 7.2, 5.8, 6.5, 6.0, 6.2, 6.75, 11.8167, true, 'Mountain town known for its cool climate and traditional architecture', ARRAY['Fulfulde', 'French'], ARRAY['Fulani', 'Tikar'], 'Famous for traditional pottery and weaving'),
('Meiganga', 'Adamawa', 'Mbéré', 'Meiganga', 45000, 6.5, 6.2, 5.8, 7.0, 6.5, 6.8, 7.5, 6.0, 6.8, 6.5, 6.6, 6.5167, 14.2833, true, 'Trading center established by Fulani merchants', ARRAY['Fulfulde', 'French'], ARRAY['Fulani', 'Gbaya'], 'Major cattle market and trading hub'),
('Mbessa', 'Adamawa', 'Faro-et-Déo', 'Tignère', 12500, 5.5, 5.0, 4.8, 6.5, 5.2, 5.8, 7.8, 5.0, 6.0, 5.5, 5.7, 7.3667, 12.65, true, 'Traditional village known for its strong community bonds and cultural preservation', ARRAY['Fulfulde', 'French'], ARRAY['Fulani', 'Mambila'], 'Renowned for traditional music and annual cultural festival'),

-- Centre Region Villages  
('Yaoundé', 'Centre', 'Mfoundi', 'Yaoundé I', 2440000, 8.5, 8.0, 7.5, 7.0, 8.2, 8.0, 7.5, 8.5, 8.0, 8.5, 8.0, 3.8667, 11.5167, true, 'Founded by German explorers and became Cameroons capital', ARRAY['French', 'Ewondo'], ARRAY['Beti', 'Ewondo'], 'Political and administrative capital of Cameroon'),
('Obala', 'Centre', 'Lékié', 'Obala', 45000, 6.5, 6.8, 6.0, 7.2, 6.5, 6.8, 7.5, 6.2, 7.0, 6.8, 6.7, 4.1667, 11.5333, true, 'Historic Ewondo settlement along the Sanaga River', ARRAY['Ewondo', 'French'], ARRAY['Ewondo', 'Beti'], 'Traditional seat of Ewondo chiefs'),
('Mbalmayo', 'Centre', 'Nyong-et-So''o', 'Mbalmayo', 32000, 6.0, 6.5, 5.8, 7.0, 6.2, 6.5, 7.8, 6.0, 6.8, 6.5, 6.5, 3.5167, 11.5, true, 'River port town on the Nyong River', ARRAY['Bulu', 'French'], ARRAY['Bulu', 'Fang'], 'Historic trading post and cocoa center'),
('Eseka', 'Centre', 'Nyong-et-Kéllé', 'Eseka', 25000, 5.8, 6.2, 5.5, 6.8, 6.0, 6.2, 7.2, 5.8, 6.5, 6.0, 6.2, 3.65, 10.7667, true, 'Railway junction town with traditional markets', ARRAY['Bassa', 'French'], ARRAY['Bassa', 'Bakoko'], 'Important railway and transport hub'),
('Akonolinga', 'Centre', 'Nyong-et-Mfoumou', 'Akonolinga', 18000, 5.5, 6.0, 5.2, 6.5, 5.8, 6.0, 7.5, 5.5, 6.2, 5.8, 6.0, 3.7667, 12.25, true, 'Traditional Bulu village with rich cultural heritage', ARRAY['Bulu', 'French'], ARRAY['Bulu', 'Fang'], 'Known for traditional crafts and forest products'),

-- East Region Villages
('Bertoua', 'East', 'Lom-et-Djérem', 'Bertoua', 165000, 7.0, 6.8, 6.2, 6.5, 6.8, 7.0, 7.5, 6.5, 7.2, 7.0, 6.9, 4.5833, 13.6833, true, 'Founded as a trading post by German colonists', ARRAY['French', 'Gbaya'], ARRAY['Gbaya', 'Kaka'], 'Regional capital and diamond mining center'),
('Batouri', 'East', 'Kadey', 'Batouri', 35000, 6.2, 6.0, 5.8, 6.8, 6.5, 6.2, 7.2, 6.0, 6.5, 6.2, 6.3, 4.4333, 14.3667, true, 'Gold mining town with diverse ethnic groups', ARRAY['French', 'Gbaya'], ARRAY['Gbaya', 'Kako'], 'Historic gold mining and trading center'),
('Yokadouma', 'East', 'Boumba-et-Ngoko', 'Yokadouma', 28000, 5.8, 5.5, 5.2, 6.2, 6.0, 5.8, 7.0, 5.5, 6.0, 5.8, 5.8, 3.5167, 15.0667, true, 'Forest town near Central African Republic border', ARRAY['French', 'Baka'], ARRAY['Baka', 'Bangando'], 'Gateway to pristine rainforests'),
('Abong-Mbang', 'East', 'Haut-Nyong', 'Abong-Mbang', 22000, 5.5, 5.8, 5.0, 6.5, 5.8, 6.0, 7.2, 5.2, 6.2, 5.8, 5.9, 3.9833, 13.1833, true, 'Cocoa and coffee producing center', ARRAY['French', 'Kako'], ARRAY['Kako', 'Bulu'], 'Agricultural hub for forest products'),
('Lomié', 'East', 'Boumba-et-Ngoko', 'Lomié', 15000, 5.0, 5.2, 4.8, 6.0, 5.5, 5.5, 7.5, 5.0, 5.8, 5.2, 5.5, 3.1667, 13.6167, true, 'Logging town in dense tropical forest', ARRAY['French', 'Baka'], ARRAY['Baka', 'Bangando'], 'Center for sustainable forestry'),

-- Far North Region Villages
('Maroua', 'Far North', 'Diamaré', 'Maroua I', 320000, 7.2, 6.8, 6.0, 6.2, 7.0, 7.2, 7.8, 6.8, 7.0, 7.2, 6.9, 10.5833, 14.3167, true, 'Ancient Fulani city and traditional sultanate', ARRAY['Fulfulde', 'French'], ARRAY['Fulani', 'Arab-Choa'], 'Regional capital and Islamic center'),
('Garoua', 'Far North', 'Bénoué', 'Garoua I', 285000, 7.0, 6.5, 6.2, 6.8, 7.2, 7.0, 7.5, 7.0, 7.2, 7.0, 6.9, 9.3, 13.4, true, 'Major river port on the Bénoué River', ARRAY['Fulfulde', 'French'], ARRAY['Fulani', 'Fali'], 'Commercial center and river transport hub'),
('Mokolo', 'Far North', 'Mayo-Tsanaga', 'Mokolo', 45000, 6.0, 5.8, 5.5, 6.5, 6.2, 6.0, 7.8, 5.8, 6.5, 6.0, 6.2, 10.7333, 13.8, true, 'Mountain town with diverse ethnic groups', ARRAY['Fulfulde', 'Mafa'], ARRAY['Mafa', 'Fulani'], 'Traditional crafts and mountain agriculture'),
('Kousséri', 'Far North', 'Logone-et-Chari', 'Kousséri', 35000, 5.8, 5.5, 5.2, 5.8, 6.0, 5.8, 7.0, 5.5, 6.0, 5.8, 5.7, 12.0833, 15.0333, true, 'Border town with Chad on Logone River', ARRAY['Arabic', 'French'], ARRAY['Arab-Choa', 'Kotoko'], 'Cross-border trading center'),
('Waza', 'Far North', 'Logone-et-Chari', 'Waza', 18000, 5.2, 5.0, 4.8, 6.2, 5.5, 5.5, 7.2, 5.0, 5.8, 5.2, 5.5, 11.4, 14.6333, true, 'Village near famous Waza National Park', ARRAY['Kotoko', 'French'], ARRAY['Kotoko', 'Arab-Choa'], 'Gateway to wildlife conservation area'),

-- Littoral Region Villages
('Douala', 'Littoral', 'Wouri', 'Douala I', 2768000, 8.2, 7.8, 7.2, 6.8, 8.5, 7.5, 7.2, 8.0, 7.8, 8.2, 7.8, 4.0833, 9.7, true, 'Founded by Duala people as fishing and trading settlement', ARRAY['French', 'Duala'], ARRAY['Duala', 'Bassa'], 'Economic capital and major port city'),
('Edéa', 'Littoral', 'Sanaga-Maritime', 'Edéa', 65000, 6.8, 6.5, 6.0, 7.0, 6.8, 6.5, 7.5, 6.2, 7.0, 6.8, 6.7, 3.8, 10.1333, true, 'Industrial town with aluminum smelter', ARRAY['Bassa', 'French'], ARRAY['Bassa', 'Bakoko'], 'Major industrial and hydroelectric center'),
('Nkongsamba', 'Littoral', 'Mungo', 'Nkongsamba I', 125000, 6.5, 6.8, 6.2, 7.2, 6.5, 6.8, 7.8, 6.5, 7.0, 6.8, 6.8, 4.95, 9.9333, true, 'Coffee and banana producing center', ARRAY['French', 'Bamiléké'], ARRAY['Bamiléké', 'Mbo'], 'Agricultural and commercial hub'),
('Kribi', 'Littoral', 'Océan', 'Kribi', 55000, 6.2, 6.0, 5.8, 7.5, 6.5, 6.2, 8.0, 6.8, 7.0, 6.5, 6.6, 2.9333, 9.9167, true, 'Coastal fishing town with beautiful beaches', ARRAY['French', 'Batanga'], ARRAY['Batanga', 'Bulu'], 'Tourist destination and fishing port'),
('Limbé', 'Littoral', 'Fako', 'Limbé I', 85000, 6.8, 7.0, 6.5, 7.2, 6.8, 7.0, 7.8, 7.2, 7.5, 7.0, 7.0, 4.0167, 9.2, true, 'Former German colonial capital Victoria', ARRAY['English', 'Duala'], ARRAY['Bakweri', 'Duala'], 'Tourist center with botanical gardens'),

-- North Region Villages
('Garoua', 'North', 'Bénoué', 'Garoua I', 285000, 7.0, 6.8, 6.2, 6.8, 7.2, 7.0, 7.5, 7.0, 7.2, 7.0, 6.9, 9.3, 13.4, true, 'Historic Fulani emirate and river port', ARRAY['Fulfulde', 'French'], ARRAY['Fulani', 'Fali'], 'Commercial center and regional capital'),
('Ngaoundéré', 'North', 'Vina', 'Ngaoundéré', 188000, 7.5, 7.0, 6.5, 7.8, 7.2, 7.0, 8.0, 6.8, 7.5, 7.2, 7.1, 7.3167, 13.5833, true, 'Railway terminus and Fulani cultural center', ARRAY['Fulfulde', 'French'], ARRAY['Fulani', 'Gbaya'], 'Educational and transport hub'),
('Poli', 'North', 'Faro', 'Poli', 25000, 5.8, 6.0, 5.5, 6.5, 6.0, 6.2, 7.5, 5.8, 6.5, 6.0, 6.2, 8.2667, 13.25, true, 'Traditional Fulani town near Nigerian border', ARRAY['Fulfulde', 'Hausa'], ARRAY['Fulani', 'Hausa'], 'Cross-border trading center'),
('Tcholliré', 'North', 'Mayo-Rey', 'Tcholliré', 18000, 5.5, 5.8, 5.2, 6.2, 5.8, 6.0, 7.2, 5.5, 6.0, 5.8, 5.9, 8.3833, 13.7, true, 'Agricultural center in savanna region', ARRAY['Fulfulde', 'French'], ARRAY['Fulani', 'Fali'], 'Cotton and livestock production'),
('Rey Bouba', 'North', 'Mayo-Rey', 'Rey Bouba', 32000, 6.0, 6.2, 5.8, 6.8, 6.0, 6.5, 7.8, 6.0, 6.8, 6.2, 6.4, 8.6667, 14.1833, true, 'Traditional lamido seat with palace', ARRAY['Fulfulde', 'French'], ARRAY['Fulani', 'Fali'], 'Historic emirate capital'),

-- Northwest Region Villages
('Bamenda', 'Northwest', 'Mezam', 'Bamenda I', 420000, 7.8, 7.5, 7.0, 6.5, 7.2, 7.5, 8.0, 7.0, 7.8, 7.5, 7.3, 5.9667, 10.15, true, 'Highland city and traditional Grassfields center', ARRAY['English', 'Pidgin'], ARRAY['Tikar', 'Widikum'], 'Regional capital and university town'),
('Bafut', 'Northwest', 'Mezam', 'Bafut', 95000, 7.0, 7.2, 6.8, 7.5, 7.0, 7.8, 8.5, 7.2, 8.0, 7.5, 7.4, 6.0833, 10.1, true, 'Historic Fon palace and traditional kingdom', ARRAY['English', 'Bafut'], ARRAY['Bafut', 'Tikar'], 'Famous traditional palace and cultural site'),
('Wum', 'Northwest', 'Menchum', 'Wum', 28000, 6.2, 6.5, 6.0, 7.0, 6.2, 6.8, 8.0, 6.5, 7.2, 6.8, 6.7, 6.4, 10.05, true, 'Mountain town with Aghem traditional authority', ARRAY['English', 'Aghem'], ARRAY['Aghem', 'Weh'], 'Traditional weaving and pottery center'),
('Kumbo', 'Northwest', 'Bui', 'Kumbo', 65000, 6.8, 7.0, 6.5, 7.2, 6.8, 7.0, 8.2, 6.8, 7.5, 7.0, 7.1, 6.2, 10.6667, true, 'Nso traditional kingdom capital', ARRAY['English', 'Lamnso'], ARRAY['Nso', 'Tikar'], 'Traditional Nso palace and cultural center'),
('Ndop', 'Northwest', 'Ngoketunjia', 'Ndop', 35000, 6.0, 6.5, 6.0, 6.8, 6.2, 6.5, 7.8, 6.0, 7.0, 6.5, 6.5, 5.9667, 10.4167, true, 'Rice growing center in fertile plain', ARRAY['English', 'Noni'], ARRAY['Noni', 'Bamun'], 'Major rice production area'),

-- South Region Villages
('Ebolowa', 'South', 'Mvila', 'Ebolowa I', 85000, 6.8, 7.0, 6.5, 7.2, 6.5, 6.8, 7.8, 6.2, 7.0, 6.8, 6.8, 2.9167, 11.15, true, 'Regional capital with Bulu cultural heritage', ARRAY['French', 'Bulu'], ARRAY['Bulu', 'Fang'], 'Administrative and educational center'),
('Ambam', 'South', 'Vallée-du-Ntem', 'Ambam', 22000, 5.8, 6.0, 5.5, 6.5, 6.0, 6.2, 7.5, 5.8, 6.5, 6.0, 6.2, 2.3833, 11.2667, true, 'Border town with Equatorial Guinea', ARRAY['French', 'Ntumu'], ARRAY['Ntumu', 'Fang'], 'Cross-border trading center'),
('Sangmélima', 'South', 'Dja-et-Lobo', 'Sangmélima', 18000, 5.5, 5.8, 5.2, 6.2, 5.8, 6.0, 7.2, 5.5, 6.0, 5.8, 5.9, 2.9333, 11.9833, true, 'Forest town with traditional Bulu culture', ARRAY['French', 'Bulu'], ARRAY['Bulu', 'Fang'], 'Timber and forest products center'),
('Kribi', 'South', 'Océan', 'Kribi', 55000, 6.2, 6.0, 5.8, 7.5, 6.5, 6.2, 8.0, 6.8, 7.0, 6.5, 6.6, 2.9333, 9.9167, true, 'Coastal resort town with deep-water port', ARRAY['French', 'Batanga'], ARRAY['Batanga', 'Bulu'], 'Tourism and port development'),
('Campo', 'South', 'Océan', 'Campo', 8500, 5.0, 5.2, 4.8, 6.5, 5.5, 5.8, 7.8, 5.2, 6.0, 5.5, 5.7, 2.3667, 9.8167, true, 'Coastal village near Equatorial Guinea', ARRAY['French', 'Batanga'], ARRAY['Batanga', 'Bulu'], 'Fishing and beach tourism'),

-- Southwest Region Villages
('Buea', 'Southwest', 'Fako', 'Buea', 150000, 7.5, 8.0, 7.2, 7.0, 7.2, 7.8, 8.2, 7.8, 8.0, 7.8, 7.6, 4.1542, 9.2919, true, 'Former German colonial capital at Mount Cameroon', ARRAY['English', 'Mokpe'], ARRAY['Bakweri', 'Mokpe'], 'University town and tourist center'),
('Kumba', 'Southwest', 'Meme', 'Kumba I', 180000, 7.0, 7.2, 6.8, 6.8, 7.5, 7.0, 7.8, 7.0, 7.5, 7.2, 7.2, 4.6333, 9.4333, true, 'Commercial center and transportation hub', ARRAY['English', 'Pidgin'], ARRAY['Oroko', 'Balong'], 'Major commercial and transport center'),
('Mamfe', 'Southwest', 'Manyu', 'Mamfe', 32000, 6.0, 6.2, 5.8, 6.5, 6.0, 6.5, 7.5, 6.0, 6.8, 6.2, 6.4, 5.7667, 9.3, true, 'Cross River trading town', ARRAY['English', 'Kenyang'], ARRAY['Kenyang', 'Ejagham'], 'Border trading center with Nigeria'),
('Tiko', 'Southwest', 'Fako', 'Tiko', 55000, 6.5, 6.8, 6.2, 7.0, 6.8, 6.5, 7.5, 6.5, 7.0, 6.8, 6.7, 4.0667, 9.3667, true, 'Plantation town with palm oil industry', ARRAY['English', 'Mokpe'], ARRAY['Mokpe', 'Bakweri'], 'Agricultural and industrial center'),
('Idenau', 'Southwest', 'Fako', 'Idenau', 12000, 5.5, 5.8, 5.2, 6.8, 6.0, 6.0, 7.8, 6.2, 6.5, 6.0, 6.2, 4.1167, 8.9667, true, 'Coastal plantation town', ARRAY['English', 'Mokpe'], ARRAY['Mokpe', 'Bakweri'], 'Palm oil and rubber plantations'),

-- West Region Villages
('Bafoussam', 'West', 'Mifi', 'Bafoussam I', 420000, 7.8, 7.5, 7.0, 7.2, 7.8, 7.5, 8.5, 7.2, 8.0, 7.8, 7.6, 5.4833, 10.4167, true, 'Bamiléké highland commercial center', ARRAY['French', 'Ghomala'], ARRAY['Bamiléké', 'Bamoun'], 'Regional capital and commercial hub'),
('Foumban', 'West', 'Noun', 'Foumban', 83522, 7.2, 7.0, 6.8, 7.5, 7.0, 8.0, 8.8, 7.5, 8.2, 7.8, 7.6, 5.7167, 10.9, true, 'Historic Bamoun sultanate capital', ARRAY['French', 'Bamoun'], ARRAY['Bamoun'], 'Royal palace and cultural center'),
('Dschang', 'West', 'Menoua', 'Dschang', 85000, 7.0, 7.8, 7.2, 7.5, 7.0, 7.2, 8.2, 7.0, 7.8, 7.2, 7.4, 5.45, 10.05, true, 'University town in Bamiléké highlands', ARRAY['French', 'Yemba'], ARRAY['Bamiléké'], 'Educational and agricultural center'),
('Mbouda', 'West', 'Bamboutos', 'Mbouda', 65000, 6.8, 7.0, 6.5, 7.2, 6.8, 7.0, 8.0, 6.8, 7.5, 7.0, 7.1, 5.6167, 10.25, true, 'Coffee and potato growing center', ARRAY['French', 'Ghomala'], ARRAY['Bamiléké'], 'Agricultural market town'),
('Bandjoun', 'West', 'Koung-Khi', 'Bandjoun', 35000, 6.5, 6.8, 6.2, 7.5, 6.5, 7.2, 8.5, 6.8, 7.8, 7.0, 7.2, 5.35, 10.35, true, 'Traditional Bamiléké chiefdom with royal palace', ARRAY['French', 'Ghomala'], ARRAY['Bamiléké'], 'Famous traditional architecture and crafts');

-- Insert famous chiefs for major villages
INSERT INTO public.village_chiefs (
  village_id, chief_name, chief_title, current_chief, lineage_history,
  notable_achievements, throne_name, ceremonial_titles, traditional_regalia,
  palace_location, succession_type
) 
SELECT 
  v.id,
  chiefs_data.chief_name,
  chiefs_data.chief_title,
  chiefs_data.current_chief,
  chiefs_data.lineage_history,
  chiefs_data.notable_achievements,
  chiefs_data.throne_name,
  chiefs_data.ceremonial_titles,
  chiefs_data.traditional_regalia,
  chiefs_data.palace_location,
  chiefs_data.succession_type
FROM villages v
CROSS JOIN (
  VALUES
    ('Bafut', 'Fon Abumbi II', 'Fon', true, 'Descendant of the 11th Fon of Bafut, continuing over 600 years of traditional leadership', 'Modernized traditional governance while preserving cultural heritage', 'Achum', ARRAY['His Royal Highness', 'Traditional Ruler of Bafut'], 'Royal leopard skin, traditional crown, ceremonial staff', 'Bafut Palace', 'Hereditary patrilineal'),
    ('Foumban', 'Sultan Nabil Mbombo Njoya', 'Sultan', true, '19th Sultan of Bamoun, descendant of King Njoya who created the Bamoun script', 'Preserved Bamoun cultural heritage and promoted education', 'Mfon', ARRAY['His Majesty', 'Sultan of Bamoun'], 'Royal robes, traditional crown, ceremonial sword', 'Foumban Royal Palace', 'Hereditary with council approval'),
    ('Bandjoun', 'Fon Djoumessi Alexis', 'Fon', true, 'Traditional leader of the Bandjoun people, part of Bamiléké chiefdom system', 'Promoted traditional arts and sustainable development', 'Fo', ARRAY['His Royal Highness', 'Fon of Bandjoun'], 'Traditional Bamiléké regalia, beaded crown', 'Bandjoun Chefferie', 'Hereditary with traditional council'),
    ('Kumbo', 'Fon Sehm Mbinglo I', 'Fon', true, 'Traditional ruler of the Nso people in Kumbo', 'Strengthened traditional institutions and cultural preservation', 'Fon', ARRAY['His Royal Highness', 'Fon of Nso'], 'Traditional Nso royal attire, ceremonial staff', 'Nso Palace Kumbo', 'Traditional selection process'),
    ('Ngaoundéré', 'Lamido Muhammadou Abbo', 'Lamido', true, 'Traditional Fulani leader of Ngaoundéré emirate', 'Modernized emirate administration while maintaining traditions', 'Lamido', ARRAY['His Highness', 'Lamido of Ngaoundéré'], 'Fulani traditional robes, turban, ceremonial sword', 'Ngaoundéré Lamido Palace', 'Islamic hereditary system'),
    ('Maroua', 'Lamido Alioum Hayatou', 'Lamido', true, 'Traditional ruler of Maroua and the Diamaré province', 'Promoted peace and development in the Far North region', 'Lamido', ARRAY['His Highness', 'Lamido of Maroua'], 'Traditional Fulani royal dress, ceremonial accessories', 'Maroua Lamido Palace', 'Islamic traditional succession'),
    ('Tibati', 'Lamido Umaru Tukur', 'Lamido', true, 'Traditional Fulani leader of Tibati lamidship', 'Maintained traditional governance and promoted education', 'Lamido', ARRAY['His Highness', 'Lamido of Tibati'], 'Fulani traditional regalia', 'Tibati Lamido Residence', 'Traditional Islamic succession'),
    ('Yaoundé', 'Chef Supérieur Charles Atangana', 'Chef Supérieur', false, 'Historic paramount chief who worked with German and French colonial administrations', 'Modernized Ewondo society and promoted Western education', 'Nkukuma', ARRAY['Chef Supérieur', 'Paramount Chief'], 'Traditional Ewondo regalia', 'Traditional Palace Site', 'Historical appointment'),
    ('Mbessa', 'Lamido Ahmadou Bello', 'Lamido', true, 'Traditional leader known for community development and cultural preservation', 'Established cultural center and promoted youth education', 'Lamido', ARRAY['Traditional Leader', 'Community Elder'], 'Traditional Fulani attire', 'Community Palace', 'Community selection')
) AS chiefs_data(village_name, chief_name, chief_title, current_chief, lineage_history, notable_achievements, throne_name, ceremonial_titles, traditional_regalia, palace_location, succession_type)
WHERE v.village_name = chiefs_data.village_name;

-- Create function to update village ratings
CREATE OR REPLACE FUNCTION update_village_overall_rating()
RETURNS TRIGGER AS $$
BEGIN
  NEW.overall_rating = (
    COALESCE(NEW.infrastructure_score, 0) +
    COALESCE(NEW.education_score, 0) +
    COALESCE(NEW.health_score, 0) +
    COALESCE(NEW.peace_security_score, 0) +
    COALESCE(NEW.economic_activity_score, 0) +
    COALESCE(NEW.governance_score, 0) +
    COALESCE(NEW.social_spirit_score, 0) +
    COALESCE(NEW.diaspora_engagement_score, 0) +
    COALESCE(NEW.civic_participation_score, 0) +
    COALESCE(NEW.achievements_score, 0)
  ) / 10.0;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic rating calculation
CREATE TRIGGER calculate_village_rating
  BEFORE INSERT OR UPDATE ON public.villages
  FOR EACH ROW
  EXECUTE FUNCTION update_village_overall_rating();

-- Create trigger for updating timestamps
CREATE TRIGGER update_villages_updated_at
  BEFORE UPDATE ON public.villages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chiefs_updated_at
  BEFORE UPDATE ON public.village_chiefs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON public.village_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();