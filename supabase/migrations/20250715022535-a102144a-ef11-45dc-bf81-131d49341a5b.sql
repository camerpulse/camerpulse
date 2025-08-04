-- Create local sentiment tracking table for city/town level analysis
CREATE TABLE public.camerpulse_intelligence_local_sentiment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  division TEXT,
  subdivision TEXT,
  city_town TEXT NOT NULL,
  locality TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_sentiment NUMERIC DEFAULT 0,
  sentiment_breakdown JSONB DEFAULT '{}',
  dominant_emotions TEXT[] DEFAULT '{}',
  top_concerns TEXT[] DEFAULT '{}',
  trending_hashtags TEXT[] DEFAULT '{}',
  content_volume INTEGER DEFAULT 0,
  threat_level TEXT DEFAULT 'none',
  notable_events TEXT[] DEFAULT '{}',
  population_estimate INTEGER,
  is_major_city BOOLEAN DEFAULT false,
  urban_rural TEXT DEFAULT 'urban',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(city_town, region, date_recorded)
);

-- Enable RLS
ALTER TABLE public.camerpulse_intelligence_local_sentiment ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Local sentiment is publicly readable" 
ON public.camerpulse_intelligence_local_sentiment 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage local sentiment" 
ON public.camerpulse_intelligence_local_sentiment 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Add city/subdivision columns to sentiment logs
ALTER TABLE public.camerpulse_intelligence_sentiment_logs 
ADD COLUMN city_detected TEXT,
ADD COLUMN subdivision_detected TEXT,
ADD COLUMN locality_detected TEXT,
ADD COLUMN coordinates JSONB;

-- Create index for location queries
CREATE INDEX idx_sentiment_logs_location ON public.camerpulse_intelligence_sentiment_logs(region_detected, city_detected);
CREATE INDEX idx_local_sentiment_location ON public.camerpulse_intelligence_local_sentiment(region, city_town);
CREATE INDEX idx_local_sentiment_date ON public.camerpulse_intelligence_local_sentiment(date_recorded);

-- Create comprehensive location reference table
CREATE TABLE public.cameroon_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  division TEXT,
  subdivision TEXT,
  city_town TEXT NOT NULL,
  locality TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  population INTEGER,
  is_major_city BOOLEAN DEFAULT false,
  urban_rural TEXT DEFAULT 'urban',
  alternative_names TEXT[] DEFAULT '{}',
  region_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for locations
ALTER TABLE public.cameroon_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locations are publicly readable" 
ON public.cameroon_locations 
FOR SELECT 
USING (true);

-- Insert major Cameroon cities and towns
INSERT INTO public.cameroon_locations 
(region, division, city_town, latitude, longitude, population, is_major_city, alternative_names) VALUES
-- Centre Region
('Centre', 'Mfoundi', 'Yaoundé', 3.848, 11.502, 4100000, true, ARRAY['Yaounde', 'Yde']),
('Centre', 'Mbam-et-Inoubou', 'Bafia', 4.75, 11.23, 65000, false, ARRAY['Bafia']),
('Centre', 'Haute-Sanaga', 'Nanga-Eboko', 4.69, 12.37, 30000, false, ARRAY[]),

-- Littoral Region  
('Littoral', 'Wouri', 'Douala', 4.048, 9.754, 3800000, true, ARRAY['Dla', 'Economic Capital']),
('Littoral', 'Sanaga-Maritime', 'Edéa', 3.8, 10.13, 120000, false, ARRAY['Edea']),
('Littoral', 'Mungo', 'Nkongsamba', 4.95, 9.94, 150000, false, ARRAY[]),

-- Northwest Region
('Northwest', 'Mezam', 'Bamenda', 5.96, 10.15, 500000, true, ARRAY['Abakwa', 'Mankon']),
('Northwest', 'Bui', 'Kumbo', 6.2, 10.67, 80000, false, ARRAY[]),
('Northwest', 'Donga-Mantung', 'Nkambe', 6.58, 10.77, 45000, false, ARRAY[]),
('Northwest', 'Momo', 'Mbengwi', 6.17, 9.68, 35000, false, ARRAY[]),

-- Southwest Region
('Southwest', 'Fako', 'Buea', 4.15, 9.24, 200000, true, ARRAY['Buea Town']),
('Southwest', 'Fako', 'Limbe', 4.02, 9.2, 120000, true, ARRAY['Victoria']),
('Southwest', 'Meme', 'Kumba', 4.63, 9.45, 180000, true, ARRAY[]),
('Southwest', 'Manyu', 'Mamfe', 5.75, 9.3, 25000, false, ARRAY[]),
('Southwest', 'Ndian', 'Mundemba', 4.57, 8.87, 15000, false, ARRAY[]),

-- Far North Region
('Far North', 'Diamaré', 'Maroua', 10.6, 14.32, 400000, true, ARRAY[]),
('Far North', 'Bénoué', 'Garoua', 9.3, 13.4, 350000, true, ARRAY[]),
('Far North', 'Mayo-Danay', 'Yagoua', 10.33, 15.23, 80000, false, ARRAY[]),
('Far North', 'Logone-et-Chari', 'Kousséri', 12.08, 15.03, 90000, false, ARRAY['Kousseri']),

-- North Region
('North', 'Bénoué', 'Garoua', 9.3, 13.4, 350000, true, ARRAY[]),
('North', 'Faro', 'Poli', 8.42, 13.25, 25000, false, ARRAY[]),
('North', 'Mayo-Rey', 'Tcholliré', 8.38, 14.17, 20000, false, ARRAY['Tchollire']),

-- Adamawa Region  
('Adamawa', 'Vina', 'Ngaoundéré', 7.32, 13.58, 300000, true, ARRAY['Ngaoundere']),
('Adamawa', 'Mbéré', 'Meiganga', 6.52, 14.3, 45000, false, ARRAY[]),
('Adamawa', 'Djérem', 'Tibati', 6.47, 12.63, 35000, false, ARRAY[]),

-- East Region
('East', 'Haut-Nyong', 'Bertoua', 4.58, 13.68, 180000, true, ARRAY[]),
('East', 'Kadey', 'Batouri', 4.43, 14.37, 35000, false, ARRAY[]),
('East', 'Lom-et-Djérem', 'Bélabo', 4.93, 13.3, 25000, false, ARRAY['Belabo']),

-- South Region
('South', 'Mvila', 'Ebolowa', 2.92, 11.15, 120000, true, ARRAY[]),
('South', 'Dja-et-Lobo', 'Sangmélima', 2.93, 11.98, 25000, false, ARRAY['Sangmelima']),
('South', 'Océan', 'Kribi', 2.95, 9.91, 65000, false, ARRAY[]),

-- West Region
('West', 'Bamboutos', 'Mbouda', 5.62, 10.25, 120000, false, ARRAY[]),
('West', 'Haut-Nkam', 'Bafang', 5.15, 10.18, 80000, false, ARRAY[]),
('West', 'Mifi', 'Bafoussam', 5.48, 10.42, 300000, true, ARRAY[]),
('West', 'Noun', 'Foumban', 5.72, 10.9, 90000, false, ARRAY[]);

-- Update trigger for local sentiment
CREATE OR REPLACE FUNCTION update_local_sentiment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_local_sentiment_updated_at
  BEFORE UPDATE ON public.camerpulse_intelligence_local_sentiment
  FOR EACH ROW
  EXECUTE FUNCTION update_local_sentiment_updated_at();