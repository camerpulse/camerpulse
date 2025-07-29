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