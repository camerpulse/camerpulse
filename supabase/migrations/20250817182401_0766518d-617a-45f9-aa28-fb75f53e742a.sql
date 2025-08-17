-- Check if pharmacies table exists and clean up any existing constraints
DO $$ BEGIN
  -- Drop existing constraints if they exist
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'pharmacies' AND constraint_name = 'pharmacies_type_check') THEN
    ALTER TABLE public.pharmacies DROP CONSTRAINT pharmacies_type_check;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'pharmacies' AND constraint_name = 'pharmacies_ownership_check') THEN
    ALTER TABLE public.pharmacies DROP CONSTRAINT pharmacies_ownership_check;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'companies' AND constraint_name = 'companies_company_type_check') THEN
    ALTER TABLE public.companies DROP CONSTRAINT companies_company_type_check;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'companies' AND constraint_name = 'companies_ownership_check') THEN
    ALTER TABLE public.companies DROP CONSTRAINT companies_ownership_check;
  END IF;
END $$;

-- Create or update table structures
CREATE TABLE IF NOT EXISTS public.pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  division TEXT NOT NULL,
  village_or_city TEXT NOT NULL,
  type TEXT DEFAULT 'independent',
  ownership TEXT DEFAULT 'private',
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
  verification_status TEXT DEFAULT 'unverified',
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

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  division TEXT NOT NULL,
  village_or_city TEXT NOT NULL,
  industry TEXT DEFAULT 'Technology',
  company_type TEXT DEFAULT 'sme',
  ownership TEXT DEFAULT 'private',
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

-- Add new constraints with different names to avoid conflicts
ALTER TABLE public.pharmacies DROP CONSTRAINT IF EXISTS chk_pharmacies_type_new;
ALTER TABLE public.pharmacies ADD CONSTRAINT chk_pharmacies_type_new CHECK (type IN ('chain','independent','hospital','herbal'));

ALTER TABLE public.pharmacies DROP CONSTRAINT IF EXISTS chk_pharmacies_owner_new;
ALTER TABLE public.pharmacies ADD CONSTRAINT chk_pharmacies_owner_new CHECK (ownership IN ('private','public','ngo'));

ALTER TABLE public.pharmacies DROP CONSTRAINT IF EXISTS chk_pharmacies_verif_new;
ALTER TABLE public.pharmacies ADD CONSTRAINT chk_pharmacies_verif_new CHECK (verification_status IN ('unverified','pending','verified','rejected'));

ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS chk_companies_type_new;
ALTER TABLE public.companies ADD CONSTRAINT chk_companies_type_new CHECK (company_type IN ('startup','sme','large','multinational','ngo'));

ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS chk_companies_owner_new;
ALTER TABLE public.companies ADD CONSTRAINT chk_companies_owner_new CHECK (ownership IN ('private','public','mixed'));

-- Enable RLS
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Pharmacies are viewable by everyone" ON public.pharmacies;
CREATE POLICY "Pharmacies are viewable by everyone" ON public.pharmacies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can add pharmacies" ON public.pharmacies;
CREATE POLICY "Authenticated users can add pharmacies" ON public.pharmacies FOR INSERT WITH CHECK (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "Pharmacy owners can update their pharmacies" ON public.pharmacies;
CREATE POLICY "Pharmacy owners can update their pharmacies" ON public.pharmacies FOR UPDATE USING ((auth.uid() = claimed_by) OR (auth.uid() = submitted_by));

DROP POLICY IF EXISTS "Admins can manage all pharmacies" ON public.pharmacies;
CREATE POLICY "Admins can manage all pharmacies" ON public.pharmacies FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Companies are viewable by everyone" ON public.companies;
CREATE POLICY "Companies are viewable by everyone" ON public.companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can add companies" ON public.companies;
CREATE POLICY "Authenticated users can add companies" ON public.companies FOR INSERT WITH CHECK (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "Company owners can update their companies" ON public.companies;
CREATE POLICY "Company owners can update their companies" ON public.companies FOR UPDATE USING ((auth.uid() = claimed_by) OR (auth.uid() = submitted_by));

DROP POLICY IF EXISTS "Admins can manage all companies" ON public.companies;
CREATE POLICY "Admins can manage all companies" ON public.companies FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pharmacies_region_v2 ON public.pharmacies(region);
CREATE INDEX IF NOT EXISTS idx_pharmacies_type_v2 ON public.pharmacies(type);
CREATE INDEX IF NOT EXISTS idx_pharmacies_rating_v2 ON public.pharmacies(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_pharmacies_emergency_v2 ON public.pharmacies(emergency_services) WHERE emergency_services = true;

CREATE INDEX IF NOT EXISTS idx_companies_region_v2 ON public.companies(region);
CREATE INDEX IF NOT EXISTS idx_companies_industry_v2 ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_type_v2 ON public.companies(company_type);
CREATE INDEX IF NOT EXISTS idx_companies_rating_v2 ON public.companies(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_companies_hiring_v2 ON public.companies(is_hiring) WHERE is_hiring = true;

-- Update triggers
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

-- Sample data (with conflict handling)
INSERT INTO public.pharmacies (name, region, division, village_or_city, type, phone, accepts_insurance, emergency_services, delivery_available, overall_rating, total_ratings, verification_status) 
VALUES
('CamPharma Central', 'Centre', 'Mfoundi', 'Yaoundé', 'chain', '+237670123456', true, true, true, 4.5, 234, 'verified'),
('Pharmacie Moderne', 'Littoral', 'Wouri', 'Douala', 'independent', '+237675234567', true, false, true, 4.2, 156, 'verified'),
('Hopital General Pharmacy', 'Centre', 'Mfoundi', 'Yaoundé', 'hospital', '+237678345678', true, true, false, 4.0, 89, 'verified'),
('Traditional Herbal Center', 'West', 'Menoua', 'Dschang', 'herbal', '+237679456789', false, false, true, 3.8, 67, 'pending'),
('Pharmacie du Peuple', 'Northwest', 'Mezam', 'Bamenda', 'independent', '+237680567890', true, false, true, 4.3, 123, 'verified'),
('Express Pharmacy', 'Littoral', 'Wouri', 'Douala', 'chain', '+237681678901', true, true, true, 4.6, 198, 'verified')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.companies (name, region, division, village_or_city, industry, company_type, founded_year, employee_count, phone, website, is_hiring, is_verified, overall_rating, total_ratings) 
VALUES
('CamerTech Solutions', 'Centre', 'Mfoundi', 'Yaoundé', 'Technology', 'startup', 2020, 45, '+237670111222', 'www.camertech.cm', true, true, 4.7, 89),
('Douala Health Services', 'Littoral', 'Wouri', 'Douala', 'Healthcare', 'sme', 2015, 120, '+237675333444', 'www.doualahealth.cm', true, true, 4.4, 156),
('Agribusiness Cameroon', 'West', 'Koung-Khi', 'Bandjoun', 'Agriculture', 'large', 2010, 450, '+237679555666', 'www.agribusiness.cm', false, true, 4.2, 234),
('EduTech Africa', 'Centre', 'Mfoundi', 'Yaoundé', 'Education', 'startup', 2021, 25, '+237682777888', 'www.edutech-africa.com', true, true, 4.5, 67),
('Cameroon Logistics', 'Littoral', 'Wouri', 'Douala', 'Transportation', 'sme', 2012, 200, '+237683999000', 'www.camlogistics.cm', false, true, 4.1, 145),
('Green Energy Cameroon', 'Centre', 'Lekie', 'Monatele', 'Energy', 'large', 2018, 300, '+237684111222', 'www.greenenergy.cm', true, true, 4.6, 178)
ON CONFLICT (id) DO NOTHING;