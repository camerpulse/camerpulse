-- Create table for civic service events (health, education, security)
CREATE TABLE public.civic_service_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL DEFAULT 'CM',
  region TEXT NOT NULL,
  city_town TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('health', 'education', 'security')),
  event_category TEXT NOT NULL, -- e.g., 'hospital_strike', 'school_closure', 'security_incident'
  event_title TEXT NOT NULL,
  event_description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  affected_population INTEGER,
  impact_areas TEXT[], -- array of affected districts/neighborhoods
  data_source TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'api', 'csv_import', 'news_feed'
  source_url TEXT,
  coordinates JSONB, -- lat/lng for mapping
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for performance
CREATE INDEX idx_civic_service_events_country_type ON public.civic_service_events(country_code, event_type);
CREATE INDEX idx_civic_service_events_region_date ON public.civic_service_events(region, start_date);
CREATE INDEX idx_civic_service_events_active ON public.civic_service_events(is_active, start_date);

-- Enable RLS
ALTER TABLE public.civic_service_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service events are publicly readable" 
ON public.civic_service_events 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage service events" 
ON public.civic_service_events 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create trigger for auto-updating timestamps
CREATE TRIGGER update_civic_service_events_updated_at
BEFORE UPDATE ON public.civic_service_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for service-emotion correlations
CREATE TABLE public.service_emotion_correlations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_event_id UUID NOT NULL REFERENCES public.civic_service_events(id) ON DELETE CASCADE,
  region TEXT NOT NULL,
  date_analyzed DATE NOT NULL DEFAULT CURRENT_DATE,
  emotion_type TEXT NOT NULL, -- 'anger', 'sadness', 'fear', 'hope', 'joy'
  emotion_intensity NUMERIC NOT NULL DEFAULT 0, -- -1 to 1 scale
  sentiment_volume INTEGER NOT NULL DEFAULT 0, -- number of posts/reports
  correlation_strength NUMERIC NOT NULL DEFAULT 0, -- 0 to 1, how strong the correlation
  analysis_confidence NUMERIC NOT NULL DEFAULT 0, -- 0 to 1, confidence in correlation
  insights JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for correlations
CREATE INDEX idx_service_emotion_correlations_event ON public.service_emotion_correlations(service_event_id);
CREATE INDEX idx_service_emotion_correlations_region_date ON public.service_emotion_correlations(region, date_analyzed);

-- Enable RLS for correlations
ALTER TABLE public.service_emotion_correlations ENABLE ROW LEVEL SECURITY;

-- Create policies for correlations
CREATE POLICY "Service correlations are publicly readable" 
ON public.service_emotion_correlations 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage service correlations" 
ON public.service_emotion_correlations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Insert some sample service events for Cameroon
INSERT INTO public.civic_service_events (
  country_code, region, city_town, event_type, event_category, event_title, event_description, 
  severity, start_date, affected_population, impact_areas, data_source
) VALUES 
  ('CM', 'Centre', 'Yaoundé', 'health', 'hospital_strike', 'Central Hospital Nurses Strike', 'Nurses at Yaoundé Central Hospital on strike for better working conditions', 'high', '2025-01-10 08:00:00+00', 500000, ARRAY['Yaoundé 1', 'Yaoundé 2', 'Yaoundé 3'], 'news_feed'),
  ('CM', 'Northwest', 'Bamenda', 'education', 'school_closure', 'Schools Closed Due to Security', 'Primary and secondary schools closed indefinitely due to security concerns', 'critical', '2025-01-05 06:00:00+00', 200000, ARRAY['Bamenda', 'Ndop', 'Wum'], 'manual'),
  ('CM', 'Far North', 'Maroua', 'security', 'security_incident', 'Border Security Alert', 'Increased security measures along Chad border', 'high', '2025-01-12 12:00:00+00', 100000, ARRAY['Maroua', 'Mokolo', 'Kousseri'], 'api'),
  ('CM', 'Littoral', 'Douala', 'health', 'drug_shortage', 'Essential Drug Stockout', 'Critical shortage of essential medications at public hospitals', 'high', '2025-01-08 00:00:00+00', 800000, ARRAY['Douala 1', 'Douala 2', 'Douala 3', 'Douala 4'], 'csv_import'),
  ('CM', 'West', 'Bafoussam', 'education', 'teacher_strike', 'Teachers Strike for Salary', 'Secondary school teachers on strike for unpaid salaries', 'medium', '2025-01-15 07:00:00+00', 150000, ARRAY['Bafoussam', 'Dschang', 'Mbouda'], 'news_feed'),
  ('CM', 'East', 'Bertoua', 'security', 'checkpoint_tension', 'Checkpoint Security Tensions', 'Increased tensions at border checkpoints with CAR', 'medium', '2025-01-11 00:00:00+00', 75000, ARRAY['Bertoua', 'Batouri', 'Yokadouma'], 'manual');

-- Insert sample correlation data
INSERT INTO public.service_emotion_correlations (
  service_event_id, region, emotion_type, emotion_intensity, sentiment_volume, 
  correlation_strength, analysis_confidence, insights
) VALUES 
  ((SELECT id FROM public.civic_service_events WHERE event_title = 'Central Hospital Nurses Strike'), 'Centre', 'anger', 0.7, 1250, 0.85, 0.92, '{"key_phrases": ["hospital corruption", "nurse exploitation"], "peak_times": ["morning", "evening"]}'),
  ((SELECT id FROM public.civic_service_events WHERE event_title = 'Schools Closed Due to Security'), 'Northwest', 'fear', 0.8, 2100, 0.91, 0.89, '{"key_phrases": ["children safety", "education crisis"], "trending_hashtags": ["#SaveOurSchools", "#AnglophoneCrisis"]}'),
  ((SELECT id FROM public.civic_service_events WHERE event_title = 'Essential Drug Stockout'), 'Littoral', 'sadness', 0.6, 980, 0.78, 0.85, '{"key_phrases": ["sick children", "no medicine"], "affected_groups": ["elderly", "children", "chronic_patients"]}'),
  ((SELECT id FROM public.civic_service_events WHERE event_title = 'Teachers Strike for Salary'), 'West', 'anger', 0.5, 650, 0.72, 0.81, '{"key_phrases": ["unpaid teachers", "education suffering"], "support_level": "high"}');