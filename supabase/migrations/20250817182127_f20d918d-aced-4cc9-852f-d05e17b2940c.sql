-- Ensure tables exist or are aligned, add missing columns first for idempotency
CREATE TABLE IF NOT EXISTS public.pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  division TEXT NOT NULL,
  village_or_city TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  division TEXT NOT NULL,
  village_or_city TEXT NOT NULL
);

-- Add/align columns for pharmacies
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'independent';
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS ownership TEXT NOT NULL DEFAULT 'private';
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS working_hours TEXT;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS services_offered TEXT[];
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS specialties TEXT[];
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS accepts_insurance BOOLEAN DEFAULT false;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS emergency_services BOOLEAN DEFAULT false;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS delivery_available BOOLEAN DEFAULT false;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS overall_rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS pharmacist_name TEXT;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS is_claimable BOOLEAN DEFAULT true;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS claimed_by UUID;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS submitted_by UUID;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS verified_by UUID;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Constraints for pharmacies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_pharmacies_type'
  ) THEN
    ALTER TABLE public.pharmacies ADD CONSTRAINT chk_pharmacies_type CHECK (type IN ('chain','independent','hospital','herbal'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_pharmacies_owner'
  ) THEN
    ALTER TABLE public.pharmacies ADD CONSTRAINT chk_pharmacies_owner CHECK (ownership IN ('private','public','ngo'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_pharmacies_verif'
  ) THEN
    ALTER TABLE public.pharmacies ADD CONSTRAINT chk_pharmacies_verif CHECK (verification_status IN ('unverified','pending','verified','rejected'));
  END IF;
END $$;

-- Add/align columns for companies
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS industry TEXT NOT NULL DEFAULT 'Technology';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS company_type TEXT NOT NULL DEFAULT 'sme';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS ownership TEXT NOT NULL DEFAULT 'private';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS employee_count INTEGER;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS services_offered TEXT[];
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS certifications TEXT[];
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS is_hiring BOOLEAN DEFAULT false;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS overall_rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS ceo_name TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS is_claimable BOOLEAN DEFAULT true;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS claimed_by UUID;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS submitted_by UUID;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS verified_by UUID;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Constraints for companies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_companies_type'
  ) THEN
    ALTER TABLE public.companies ADD CONSTRAINT chk_companies_type CHECK (company_type IN ('startup','sme','large','multinational','ngo'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_companies_owner'
  ) THEN
    ALTER TABLE public.companies ADD CONSTRAINT chk_companies_owner CHECK (ownership IN ('private','public','mixed'));
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- RLS policies (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pharmacies' AND policyname='Pharmacies are viewable by everyone') THEN
    CREATE POLICY "Pharmacies are viewable by everyone" ON public.pharmacies FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pharmacies' AND policyname='Authenticated users can add pharmacies') THEN
    CREATE POLICY "Authenticated users can add pharmacies" ON public.pharmacies FOR INSERT WITH CHECK (auth.uid() = submitted_by);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pharmacies' AND policyname='Pharmacy owners can update their pharmacies') THEN
    CREATE POLICY "Pharmacy owners can update their pharmacies" ON public.pharmacies FOR UPDATE USING ((auth.uid() = claimed_by) OR (auth.uid() = submitted_by));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pharmacies' AND policyname='Admins can manage all pharmacies') THEN
    CREATE POLICY "Admins can manage all pharmacies" ON public.pharmacies FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='companies' AND policyname='Companies are viewable by everyone') THEN
    CREATE POLICY "Companies are viewable by everyone" ON public.companies FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='companies' AND policyname='Authenticated users can add companies') THEN
    CREATE POLICY "Authenticated users can add companies" ON public.companies FOR INSERT WITH CHECK (auth.uid() = submitted_by);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='companies' AND policyname='Company owners can update their companies') THEN
    CREATE POLICY "Company owners can update their companies" ON public.companies FOR UPDATE USING ((auth.uid() = claimed_by) OR (auth.uid() = submitted_by));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='companies' AND policyname='Admins can manage all companies') THEN
    CREATE POLICY "Admins can manage all companies" ON public.companies FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pharmacies_region ON public.pharmacies(region);
CREATE INDEX IF NOT EXISTS idx_pharmacies_type ON public.pharmacies(type);
CREATE INDEX IF NOT EXISTS idx_pharmacies_rating ON public.pharmacies(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_pharmacies_emergency ON public.pharmacies(emergency_services) WHERE emergency_services = true;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_pharmacies_name_region ON public.pharmacies(name, region);

CREATE INDEX IF NOT EXISTS idx_companies_region ON public.companies(region);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_type ON public.companies(company_type);
CREATE INDEX IF NOT EXISTS idx_companies_rating ON public.companies(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_companies_hiring ON public.companies(is_hiring) WHERE is_hiring = true;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_companies_name_region ON public.companies(name, region);

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.update_pharmacy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now(); RETURN NEW;
END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_update_pharmacy_updated_at ON public.pharmacies;
CREATE TRIGGER trigger_update_pharmacy_updated_at BEFORE UPDATE ON public.pharmacies FOR EACH ROW EXECUTE FUNCTION public.update_pharmacy_updated_at();

CREATE OR REPLACE FUNCTION public.update_company_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now(); RETURN NEW;
END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_update_company_updated_at ON public.companies;
CREATE TRIGGER trigger_update_company_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_company_updated_at();

-- Seed sample data (safe with unique indexes)
INSERT INTO public.pharmacies (name, region, division, village_or_city, type, phone, accepts_insurance, emergency_services, delivery_available, overall_rating, total_ratings, verification_status)
VALUES
('CamPharma Central', 'Centre', 'Mfoundi', 'Yaoundé', 'chain', '+237670123456', true, true, true, 4.5, 234, 'verified'),
('Pharmacie Moderne', 'Littoral', 'Wouri', 'Douala', 'independent', '+237675234567', true, false, true, 4.2, 156, 'verified')
ON CONFLICT (name, region) DO NOTHING;

INSERT INTO public.companies (name, region, division, village_or_city, industry, company_type, founded_year, employee_count, phone, website, is_hiring, is_verified, overall_rating, total_ratings)
VALUES
('CamerTech Solutions', 'Centre', 'Mfoundi', 'Yaoundé', 'Technology', 'startup', 2020, 45, '+237670111222', 'www.camertech.cm', true, true, 4.7, 89),
('Douala Health Services', 'Littoral', 'Wouri', 'Douala', 'Healthcare', 'sme', 2015, 120, '+237675333444', 'www.doualahealth.cm', true, true, 4.4, 156)
ON CONFLICT (name, region) DO NOTHING;