-- Create pharmacies table if not exists
CREATE TABLE IF NOT EXISTS public.pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  division TEXT NOT NULL,
  village_or_city TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'independent' CHECK (type IN ('chain', 'independent', 'hospital', 'herbal')),
  ownership TEXT NOT NULL DEFAULT 'private' CHECK (ownership IN ('private', 'public', 'ngo')),
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  working_hours TEXT,
  services_offered TEXT[],
  specialties TEXT[],
  accepts_insurance BOOLEAN DEFAULT false,
  emergency_services BOOLEAN DEFAULT false,
  delivery_available BOOLEAN DEFAULT false,
  overall_rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  pharmacist_name TEXT,
  is_claimable BOOLEAN DEFAULT true,
  claimed_by UUID,
  claimed_at TIMESTAMP WITH TIME ZONE,
  submitted_by UUID,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create companies table if not exists
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  division TEXT NOT NULL,
  village_or_city TEXT NOT NULL,
  industry TEXT NOT NULL,
  company_type TEXT NOT NULL DEFAULT 'sme' CHECK (company_type IN ('startup', 'sme', 'large', 'multinational', 'ngo')),
  ownership TEXT NOT NULL DEFAULT 'private' CHECK (ownership IN ('private', 'public', 'mixed')),
  founded_year INTEGER,
  employee_count INTEGER,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  services_offered TEXT[],
  certifications TEXT[],
  is_hiring BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  overall_rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  ceo_name TEXT,
  is_claimable BOOLEAN DEFAULT true,
  claimed_by UUID,
  claimed_at TIMESTAMP WITH TIME ZONE,
  submitted_by UUID,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on pharmacies
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;

-- Enable RLS on companies  
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pharmacies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pharmacies' AND policyname = 'Pharmacies are viewable by everyone') THEN
    CREATE POLICY "Pharmacies are viewable by everyone" ON public.pharmacies FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pharmacies' AND policyname = 'Authenticated users can add pharmacies') THEN
    CREATE POLICY "Authenticated users can add pharmacies" ON public.pharmacies FOR INSERT WITH CHECK (auth.uid() = submitted_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pharmacies' AND policyname = 'Pharmacy owners can update their pharmacies') THEN
    CREATE POLICY "Pharmacy owners can update their pharmacies" ON public.pharmacies FOR UPDATE USING ((auth.uid() = claimed_by) OR (auth.uid() = submitted_by));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pharmacies' AND policyname = 'Admins can manage all pharmacies') THEN
    CREATE POLICY "Admins can manage all pharmacies" ON public.pharmacies FOR ALL USING (
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END $$;

-- Create RLS policies for companies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Companies are viewable by everyone') THEN
    CREATE POLICY "Companies are viewable by everyone" ON public.companies FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Authenticated users can add companies') THEN
    CREATE POLICY "Authenticated users can add companies" ON public.companies FOR INSERT WITH CHECK (auth.uid() = submitted_by);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Company owners can update their companies') THEN
    CREATE POLICY "Company owners can update their companies" ON public.companies FOR UPDATE USING ((auth.uid() = claimed_by) OR (auth.uid() = submitted_by));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Admins can manage all companies') THEN
    CREATE POLICY "Admins can manage all companies" ON public.companies FOR ALL USING (
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pharmacies_region ON public.pharmacies(region);
CREATE INDEX IF NOT EXISTS idx_pharmacies_type ON public.pharmacies(type);
CREATE INDEX IF NOT EXISTS idx_pharmacies_rating ON public.pharmacies(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_pharmacies_emergency ON public.pharmacies(emergency_services) WHERE emergency_services = true;

CREATE INDEX IF NOT EXISTS idx_companies_region ON public.companies(region);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_type ON public.companies(company_type);
CREATE INDEX IF NOT EXISTS idx_companies_rating ON public.companies(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_companies_hiring ON public.companies(is_hiring) WHERE is_hiring = true;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_pharmacy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_company_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pharmacy_updated_at ON public.pharmacies;
CREATE TRIGGER trigger_update_pharmacy_updated_at
  BEFORE UPDATE ON public.pharmacies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pharmacy_updated_at();

DROP TRIGGER IF EXISTS trigger_update_company_updated_at ON public.companies;
CREATE TRIGGER trigger_update_company_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_company_updated_at();

-- Insert sample pharmacies data
INSERT INTO public.pharmacies (name, region, division, village_or_city, type, phone, accepts_insurance, emergency_services, delivery_available, overall_rating, total_ratings, verification_status) VALUES
('CamPharma Central', 'Centre', 'Mfoundi', 'Yaoundé', 'chain', '+237670123456', true, true, true, 4.5, 234, 'verified'),
('Pharmacie Moderne', 'Littoral', 'Wouri', 'Douala', 'independent', '+237675234567', true, false, true, 4.2, 156, 'verified'),
('Hopital General Pharmacy', 'Centre', 'Mfoundi', 'Yaoundé', 'hospital', '+237678345678', true, true, false, 4.0, 89, 'verified'),
('Traditional Herbal Center', 'West', 'Menoua', 'Dschang', 'herbal', '+237679456789', false, false, true, 3.8, 67, 'pending'),
('Pharmacie du Peuple', 'Northwest', 'Mezam', 'Bamenda', 'independent', '+237680567890', true, false, true, 4.3, 123, 'verified'),
('Express Pharmacy', 'Littoral', 'Wouri', 'Douala', 'chain', '+237681678901', true, true, true, 4.6, 198, 'verified')
ON CONFLICT (name, region) DO NOTHING;

-- Insert sample companies data
INSERT INTO public.companies (name, region, division, village_or_city, industry, company_type, founded_year, employee_count, phone, website, is_hiring, is_verified, overall_rating, total_ratings) VALUES
('CamerTech Solutions', 'Centre', 'Mfoundi', 'Yaoundé', 'Technology', 'startup', 2020, 45, '+237670111222', 'www.camertech.cm', true, true, 4.7, 89),
('Douala Health Services', 'Littoral', 'Wouri', 'Douala', 'Healthcare', 'sme', 2015, 120, '+237675333444', 'www.doualahealth.cm', true, true, 4.4, 156),
('Agribusiness Cameroon', 'West', 'Koung-Khi', 'Bandjoun', 'Agriculture', 'large', 2010, 450, '+237679555666', 'www.agribusiness.cm', false, true, 4.2, 234),
('EduTech Africa', 'Centre', 'Mfoundi', 'Yaoundé', 'Education', 'startup', 2021, 25, '+237682777888', 'www.edutech-africa.com', true, true, 4.5, 67),
('Cameroon Logistics', 'Littoral', 'Wouri', 'Douala', 'Transportation', 'sme', 2012, 200, '+237683999000', 'www.camlogistics.cm', false, true, 4.1, 145),
('Green Energy Cameroon', 'Centre', 'Lekie', 'Monatele', 'Energy', 'large', 2018, 300, '+237684111222', 'www.greenenergy.cm', true, true, 4.6, 178)
ON CONFLICT (name, region) DO NOTHING;