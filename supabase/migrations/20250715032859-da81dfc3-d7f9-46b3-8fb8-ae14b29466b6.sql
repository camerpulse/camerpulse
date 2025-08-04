-- Create Pan-African expansion tables for multi-country support

-- Countries configuration table
CREATE TABLE public.pan_africa_countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL UNIQUE, -- e.g., 'CM', 'NG', 'GH'
  country_name TEXT NOT NULL,
  country_name_local TEXT,
  flag_emoji TEXT NOT NULL,
  flag_url TEXT,
  primary_language TEXT NOT NULL DEFAULT 'en',
  supported_languages TEXT[] DEFAULT ARRAY['en'],
  currency_code TEXT NOT NULL DEFAULT 'XAF',
  is_active BOOLEAN DEFAULT true,
  continent TEXT DEFAULT 'Africa',
  region TEXT, -- e.g., 'West Africa', 'Central Africa'
  population BIGINT,
  capital_city TEXT,
  time_zone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Administrative divisions table (states, regions, provinces)
CREATE TABLE public.country_administrative_divisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL REFERENCES public.pan_africa_countries(country_code),
  division_type TEXT NOT NULL, -- 'state', 'region', 'province', 'district'
  division_level INTEGER NOT NULL DEFAULT 1, -- 1=top level, 2=second level, etc.
  division_code TEXT,
  division_name TEXT NOT NULL,
  division_name_local TEXT,
  parent_division_id UUID REFERENCES public.country_administrative_divisions(id),
  population INTEGER,
  is_major_city BOOLEAN DEFAULT false,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Country-specific civic configuration
CREATE TABLE public.country_civic_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL REFERENCES public.pan_africa_countries(country_code),
  config_type TEXT NOT NULL, -- 'political_parties', 'civic_issues', 'languages', 'slang_terms'
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(country_code, config_type, config_key)
);

-- Multi-country sentiment logs (enhanced version)
CREATE TABLE public.pan_africa_sentiment_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL REFERENCES public.pan_africa_countries(country_code),
  content_text TEXT NOT NULL,
  content_id TEXT,
  platform TEXT NOT NULL,
  sentiment_polarity TEXT NOT NULL,
  sentiment_score NUMERIC,
  confidence_score NUMERIC,
  language_detected TEXT DEFAULT 'unknown',
  emotional_tone TEXT[],
  content_category TEXT[],
  keywords_detected TEXT[],
  hashtags TEXT[],
  mentions TEXT[],
  administrative_division_id UUID REFERENCES public.country_administrative_divisions(id),
  coordinates JSONB,
  author_handle TEXT,
  author_influence_score NUMERIC DEFAULT 0,
  engagement_metrics JSONB,
  multimodal_confidence NUMERIC DEFAULT 1.0,
  media_type TEXT DEFAULT 'text',
  media_url TEXT,
  audio_transcript TEXT,
  audio_emotion_analysis JSONB DEFAULT '{}',
  visual_emotions JSONB DEFAULT '{}',
  facial_emotion_scores JSONB DEFAULT '{}',
  media_metadata JSONB DEFAULT '{}',
  threat_level TEXT DEFAULT 'none',
  flagged_for_review BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Country-specific trending topics
CREATE TABLE public.pan_africa_trending_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL REFERENCES public.pan_africa_countries(country_code),
  topic_text TEXT NOT NULL,
  category TEXT,
  sentiment_score NUMERIC,
  volume_score INTEGER DEFAULT 0,
  growth_rate NUMERIC,
  trend_status TEXT DEFAULT 'rising',
  platform_breakdown JSONB,
  emotional_breakdown JSONB,
  regional_breakdown JSONB,
  related_hashtags TEXT[],
  influencer_mentions TEXT[],
  threat_indicators BOOLEAN DEFAULT false,
  first_detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Cross-country comparison analytics
CREATE TABLE public.pan_africa_cross_country_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  countries_compared TEXT[] NOT NULL,
  analysis_type TEXT NOT NULL, -- 'sentiment_comparison', 'issue_comparison', 'threat_comparison'
  analysis_data JSONB NOT NULL,
  insights JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial African countries data
INSERT INTO public.pan_africa_countries (
  country_code, country_name, country_name_local, flag_emoji, primary_language, 
  supported_languages, currency_code, region, capital_city, time_zone
) VALUES 
-- Central Africa
('CM', 'Cameroon', 'Cameroun', '🇨🇲', 'fr', ARRAY['fr','en'], 'XAF', 'Central Africa', 'Yaoundé', 'Africa/Douala'),
('TD', 'Chad', 'Tchad', '🇹🇩', 'fr', ARRAY['fr','ar'], 'XAF', 'Central Africa', 'N''Djamena', 'Africa/Ndjamena'),
('CF', 'Central African Republic', 'République centrafricaine', '🇨🇫', 'fr', ARRAY['fr'], 'XAF', 'Central Africa', 'Bangui', 'Africa/Bangui'),
('GQ', 'Equatorial Guinea', 'Guinea Ecuatorial', '🇬🇶', 'es', ARRAY['es','fr'], 'XAF', 'Central Africa', 'Malabo', 'Africa/Malabo'),
('GA', 'Gabon', 'Gabon', '🇬🇦', 'fr', ARRAY['fr'], 'XAF', 'Central Africa', 'Libreville', 'Africa/Libreville'),
('CG', 'Republic of the Congo', 'République du Congo', '🇨🇬', 'fr', ARRAY['fr'], 'XAF', 'Central Africa', 'Brazzaville', 'Africa/Brazzaville'),

-- West Africa  
('NG', 'Nigeria', 'Nigeria', '🇳🇬', 'en', ARRAY['en','ha','yo','ig'], 'NGN', 'West Africa', 'Abuja', 'Africa/Lagos'),
('GH', 'Ghana', 'Ghana', '🇬🇭', 'en', ARRAY['en','tw','ha'], 'GHS', 'West Africa', 'Accra', 'Africa/Accra'),
('SN', 'Senegal', 'Sénégal', '🇸🇳', 'fr', ARRAY['fr','wo'], 'XOF', 'West Africa', 'Dakar', 'Africa/Dakar'),
('CI', 'Côte d''Ivoire', 'Côte d''Ivoire', '🇨🇮', 'fr', ARRAY['fr'], 'XOF', 'West Africa', 'Yamoussoukro', 'Africa/Abidjan'),
('BF', 'Burkina Faso', 'Burkina Faso', '🇧🇫', 'fr', ARRAY['fr'], 'XOF', 'West Africa', 'Ouagadougou', 'Africa/Ouagadougou'),
('ML', 'Mali', 'Mali', '🇲🇱', 'fr', ARRAY['fr'], 'XOF', 'West Africa', 'Bamako', 'Africa/Bamako'),

-- East Africa
('KE', 'Kenya', 'Kenya', '🇰🇪', 'sw', ARRAY['sw','en'], 'KES', 'East Africa', 'Nairobi', 'Africa/Nairobi'),
('TZ', 'Tanzania', 'Tanzania', '🇹🇿', 'sw', ARRAY['sw','en'], 'TZS', 'East Africa', 'Dodoma', 'Africa/Dar_es_Salaam'),
('UG', 'Uganda', 'Uganda', '🇺🇬', 'en', ARRAY['en','sw'], 'UGX', 'East Africa', 'Kampala', 'Africa/Kampala'),
('RW', 'Rwanda', 'Rwanda', '🇷🇼', 'rw', ARRAY['rw','fr','en'], 'RWF', 'East Africa', 'Kigali', 'Africa/Kigali'),
('ET', 'Ethiopia', 'ኢትዮጵያ', '🇪🇹', 'am', ARRAY['am','or','en'], 'ETB', 'East Africa', 'Addis Ababa', 'Africa/Addis_Ababa'),

-- Southern Africa
('ZA', 'South Africa', 'South Africa', '🇿🇦', 'en', ARRAY['af','en','zu','xh'], 'ZAR', 'Southern Africa', 'Cape Town', 'Africa/Johannesburg'),
('ZW', 'Zimbabwe', 'Zimbabwe', '🇿🇼', 'en', ARRAY['en','sn','nd'], 'ZWL', 'Southern Africa', 'Harare', 'Africa/Harare'),
('BW', 'Botswana', 'Botswana', '🇧🇼', 'en', ARRAY['en','tn'], 'BWP', 'Southern Africa', 'Gaborone', 'Africa/Gaborone'),
('ZM', 'Zambia', 'Zambia', '🇿🇲', 'en', ARRAY['en','ny','bem'], 'ZMW', 'Southern Africa', 'Lusaka', 'Africa/Lusaka'),

-- North Africa
('EG', 'Egypt', 'مصر', '🇪🇬', 'ar', ARRAY['ar','en'], 'EGP', 'North Africa', 'Cairo', 'Africa/Cairo'),
('MA', 'Morocco', 'المغرب', '🇲🇦', 'ar', ARRAY['ar','fr'], 'MAD', 'North Africa', 'Rabat', 'Africa/Casablanca'),
('TN', 'Tunisia', 'تونس', '🇹🇳', 'ar', ARRAY['ar','fr'], 'TND', 'North Africa', 'Tunis', 'Africa/Tunis'),
('DZ', 'Algeria', 'الجزائر', '🇩🇿', 'ar', ARRAY['ar','fr'], 'DZD', 'North Africa', 'Algiers', 'Africa/Algiers');

-- Insert Cameroon administrative divisions (migrate existing data)
INSERT INTO public.country_administrative_divisions (
  country_code, division_type, division_level, division_name, division_code
) VALUES 
('CM', 'region', 1, 'Adamawa', 'AD'),
('CM', 'region', 1, 'Centre', 'CE'),
('CM', 'region', 1, 'East', 'ES'),
('CM', 'region', 1, 'Far North', 'FN'),
('CM', 'region', 1, 'Littoral', 'LT'),
('CM', 'region', 1, 'North', 'NO'),
('CM', 'region', 1, 'Northwest', 'NW'),
('CM', 'region', 1, 'South', 'SU'),
('CM', 'region', 1, 'Southwest', 'SW'),
('CM', 'region', 1, 'West', 'OU');

-- Insert sample administrative divisions for Nigeria
INSERT INTO public.country_administrative_divisions (
  country_code, division_type, division_level, division_name, division_code
) VALUES 
('NG', 'state', 1, 'Lagos', 'LA'),
('NG', 'state', 1, 'Kano', 'KN'),
('NG', 'state', 1, 'Rivers', 'RI'),
('NG', 'state', 1, 'Kaduna', 'KD'),
('NG', 'state', 1, 'Oyo', 'OY'),
('NG', 'state', 1, 'Imo', 'IM'),
('NG', 'state', 1, 'Borno', 'BO'),
('NG', 'state', 1, 'Anambra', 'AN'),
('NG', 'state', 1, 'Ondo', 'ON'),
('NG', 'state', 1, 'Osun', 'OS'),
('NG', 'state', 1, 'Delta', 'DE'),
('NG', 'state', 1, 'Plateau', 'PL');

-- Insert sample administrative divisions for Ghana
INSERT INTO public.country_administrative_divisions (
  country_code, division_type, division_level, division_name, division_code
) VALUES 
('GH', 'region', 1, 'Greater Accra', 'AA'),
('GH', 'region', 1, 'Ashanti', 'AH'),
('GH', 'region', 1, 'Western', 'WP'),
('GH', 'region', 1, 'Eastern', 'EP'),
('GH', 'region', 1, 'Central', 'CP'),
('GH', 'region', 1, 'Northern', 'NP'),
('GH', 'region', 1, 'Volta', 'TV'),
('GH', 'region', 1, 'Upper East', 'UE'),
('GH', 'region', 1, 'Upper West', 'UW'),
('GH', 'region', 1, 'Brong-Ahafo', 'BA');

-- Insert country-specific civic configurations
INSERT INTO public.country_civic_config (country_code, config_type, config_key, config_value) VALUES 
-- Cameroon civic issues
('CM', 'civic_issues', 'primary_issues', '["Education", "Healthcare", "Security", "Infrastructure", "Fuel/Energy", "Employment", "Governance", "Elections", "Anglophone Crisis", "Economy"]'),
('CM', 'political_parties', 'major_parties', '["CPDM", "SDF", "UNDP", "UDC", "MRC", "PCRN"]'),
('CM', 'languages', 'slang_terms', '{"pidgin": ["massa", "oya", "waka", "chop"], "french_cm": ["benskin", "pousse-pousse", "ya foye"], "english_cm": ["na so", "barlok", "tcha"]}'),

-- Nigeria civic issues  
('NG', 'civic_issues', 'primary_issues', '["Security", "Fuel Subsidy", "Education", "Healthcare", "Infrastructure", "Employment", "Corruption", "Elections", "Economy", "Power Supply"]'),
('NG', 'political_parties', 'major_parties', '["APC", "PDP", "LP", "NNPP", "APGA", "ADC"]'),
('NG', 'languages', 'slang_terms', '{"pidgin": ["wetin", "abi", "no wahala", "gbege"], "hausa": ["sannu", "yaya"], "yoruba": ["abi", "oya"], "igbo": ["nne", "oga"]}'),

-- Ghana civic issues
('GH', 'civic_issues', 'primary_issues', '["Education", "Healthcare", "Infrastructure", "Employment", "Governance", "Economy", "Security", "Elections", "Dumsor", "Galamsey"]'),
('GH', 'political_parties', 'major_parties', '["NPP", "NDC", "CPP", "PNC", "PPP", "GFP"]'),
('GH', 'languages', 'slang_terms', '{"twi": ["yɛ bɛ ka", "asante sana"], "ga": ["bawo ni"], "english_gh": ["chale", "bro", "yawa"]}');

-- Enable RLS on new tables
ALTER TABLE public.pan_africa_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_administrative_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_civic_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pan_africa_sentiment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pan_africa_trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pan_africa_cross_country_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access
CREATE POLICY "Countries are publicly readable" ON public.pan_africa_countries FOR SELECT USING (true);
CREATE POLICY "Administrative divisions are publicly readable" ON public.country_administrative_divisions FOR SELECT USING (true);
CREATE POLICY "Civic config is publicly readable" ON public.country_civic_config FOR SELECT USING (true);
CREATE POLICY "Pan-Africa sentiment is publicly readable" ON public.pan_africa_sentiment_logs FOR SELECT USING (true);
CREATE POLICY "Pan-Africa trending topics are publicly readable" ON public.pan_africa_trending_topics FOR SELECT USING (true);
CREATE POLICY "Cross-country analytics are publicly readable" ON public.pan_africa_cross_country_analytics FOR SELECT USING (true);

-- Admin policies
CREATE POLICY "Admins can manage countries" ON public.pan_africa_countries FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage administrative divisions" ON public.country_administrative_divisions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage civic config" ON public.country_civic_config FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage pan-africa sentiment" ON public.pan_africa_sentiment_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage pan-africa trending topics" ON public.pan_africa_trending_topics FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage cross-country analytics" ON public.pan_africa_cross_country_analytics FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create triggers for updated_at columns
CREATE TRIGGER update_pan_africa_countries_updated_at
  BEFORE UPDATE ON public.pan_africa_countries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_country_administrative_divisions_updated_at
  BEFORE UPDATE ON public.country_administrative_divisions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_country_civic_config_updated_at
  BEFORE UPDATE ON public.country_civic_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();