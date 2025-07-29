-- Create weather and agriculture data tables
CREATE TABLE IF NOT EXISTS public.weather_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  village_id UUID,
  date DATE NOT NULL,
  temperature_celsius NUMERIC(4,1),
  humidity_percentage NUMERIC(5,2),
  rainfall_mm NUMERIC(6,2),
  wind_speed_kmh NUMERIC(5,2),
  weather_condition TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agriculture_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  village_id UUID,
  crop_type TEXT NOT NULL,
  planting_season TEXT,
  harvest_season TEXT,
  yield_per_hectare NUMERIC(8,2),
  land_area_hectares NUMERIC(10,2),
  irrigation_method TEXT,
  soil_type TEXT,
  challenges JSONB DEFAULT '[]',
  opportunities JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create economic opportunities tracking
CREATE TABLE IF NOT EXISTS public.economic_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  opportunity_type TEXT NOT NULL, -- 'business', 'investment', 'funding', 'job'
  region TEXT NOT NULL,
  village_id UUID,
  funding_amount BIGINT,
  funding_currency TEXT DEFAULT 'XAF',
  application_deadline DATE,
  eligibility_criteria JSONB DEFAULT '[]',
  contact_info JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  priority_level TEXT DEFAULT 'medium',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create advanced scholarship programs
CREATE TABLE IF NOT EXISTS public.scholarship_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_name TEXT NOT NULL,
  description TEXT,
  provider_organization TEXT NOT NULL,
  scholarship_type TEXT NOT NULL, -- 'academic', 'vocational', 'research', 'community'
  target_level TEXT NOT NULL, -- 'primary', 'secondary', 'university', 'postgraduate'
  amount_xaf BIGINT,
  available_slots INTEGER DEFAULT 1,
  application_start_date DATE,
  application_end_date DATE,
  eligibility_criteria JSONB DEFAULT '[]',
  required_documents JSONB DEFAULT '[]',
  selection_criteria JSONB DEFAULT '[]',
  regions_eligible JSONB DEFAULT '[]',
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  status TEXT DEFAULT 'open',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scholarship_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scholarship_id UUID NOT NULL REFERENCES public.scholarship_programs(id),
  applicant_user_id UUID NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  region TEXT NOT NULL,
  village TEXT,
  application_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'submitted',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agriculture_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economic_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for weather_data
CREATE POLICY "Public can view weather data" ON public.weather_data FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert weather data" ON public.weather_data FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for agriculture_data
CREATE POLICY "Public can view agriculture data" ON public.agriculture_data FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage agriculture data" ON public.agriculture_data FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for economic_opportunities
CREATE POLICY "Public can view active opportunities" ON public.economic_opportunities FOR SELECT USING (status = 'active');
CREATE POLICY "Users can create opportunities" ON public.economic_opportunities FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their opportunities" ON public.economic_opportunities FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for scholarship_programs
CREATE POLICY "Public can view open scholarships" ON public.scholarship_programs FOR SELECT USING (status = 'open');
CREATE POLICY "Users can create scholarships" ON public.scholarship_programs FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their scholarships" ON public.scholarship_programs FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for scholarship_applications
CREATE POLICY "Users can view their applications" ON public.scholarship_applications FOR SELECT USING (auth.uid() = applicant_user_id);
CREATE POLICY "Users can create applications" ON public.scholarship_applications FOR INSERT WITH CHECK (auth.uid() = applicant_user_id);
CREATE POLICY "Users can update their pending applications" ON public.scholarship_applications FOR UPDATE USING (auth.uid() = applicant_user_id AND status = 'submitted');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_weather_data_region_date ON public.weather_data(region, date);
CREATE INDEX IF NOT EXISTS idx_agriculture_data_region_crop ON public.agriculture_data(region, crop_type);
CREATE INDEX IF NOT EXISTS idx_economic_opportunities_region_status ON public.economic_opportunities(region, status);
CREATE INDEX IF NOT EXISTS idx_scholarship_programs_status_deadline ON public.scholarship_programs(status, application_end_date);
CREATE INDEX IF NOT EXISTS idx_scholarship_applications_user_status ON public.scholarship_applications(applicant_user_id, status);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_weather_data_updated_at
    BEFORE UPDATE ON public.weather_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agriculture_data_updated_at
    BEFORE UPDATE ON public.agriculture_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_economic_opportunities_updated_at
    BEFORE UPDATE ON public.economic_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scholarship_programs_updated_at
    BEFORE UPDATE ON public.scholarship_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scholarship_applications_updated_at
    BEFORE UPDATE ON public.scholarship_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();