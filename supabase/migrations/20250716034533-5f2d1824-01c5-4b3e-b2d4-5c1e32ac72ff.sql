-- Create tables for National Debt Tracker module

-- Main debt records table
CREATE TABLE public.debt_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  total_debt_fcfa BIGINT NOT NULL,
  total_debt_usd BIGINT NOT NULL,
  internal_debt_fcfa BIGINT NOT NULL DEFAULT 0,
  external_debt_fcfa BIGINT NOT NULL DEFAULT 0,
  debt_to_gdp_ratio NUMERIC(5,2) DEFAULT 0.0,
  gdp_fcfa BIGINT DEFAULT 0,
  population INTEGER DEFAULT 27914536, -- Cameroon population estimate
  notes TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(year)
);

-- Data sources table
CREATE TABLE public.debt_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  acronym TEXT,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Debt by lenders breakdown
CREATE TABLE public.debt_lenders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_record_id UUID REFERENCES public.debt_records(id) ON DELETE CASCADE,
  lender_name TEXT NOT NULL,
  lender_type TEXT NOT NULL, -- 'multilateral', 'bilateral', 'commercial', 'domestic'
  amount_fcfa BIGINT NOT NULL,
  amount_usd BIGINT NOT NULL,
  percentage_of_total NUMERIC(5,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Debt-related news and commentary
CREATE TABLE public.debt_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  author TEXT,
  source_url TEXT,
  image_url TEXT,
  debt_record_id UUID REFERENCES public.debt_records(id),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Supporting documents and reports
CREATE TABLE public.debt_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_record_id UUID REFERENCES public.debt_records(id) ON DELETE CASCADE,
  source_id UUID REFERENCES public.debt_sources(id),
  title TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'report', 'audit', 'statement', 'analysis'
  file_url TEXT,
  file_size INTEGER,
  file_format TEXT, -- 'pdf', 'excel', 'csv', 'word'
  description TEXT,
  published_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.debt_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access and admin write access
CREATE POLICY "Debt records are viewable by everyone" ON public.debt_records FOR SELECT USING (true);
CREATE POLICY "Admins can manage debt records" ON public.debt_records FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

CREATE POLICY "Debt sources are viewable by everyone" ON public.debt_sources FOR SELECT USING (true);
CREATE POLICY "Admins can manage debt sources" ON public.debt_sources FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

CREATE POLICY "Debt lenders are viewable by everyone" ON public.debt_lenders FOR SELECT USING (true);
CREATE POLICY "Admins can manage debt lenders" ON public.debt_lenders FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

CREATE POLICY "Debt news is viewable by everyone" ON public.debt_news FOR SELECT USING (true);
CREATE POLICY "Admins can manage debt news" ON public.debt_news FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

CREATE POLICY "Debt documents are viewable by everyone" ON public.debt_documents FOR SELECT USING (true);
CREATE POLICY "Admins can manage debt documents" ON public.debt_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

-- Create indexes for better performance
CREATE INDEX idx_debt_records_year ON public.debt_records(year);
CREATE INDEX idx_debt_records_verified ON public.debt_records(verified);
CREATE INDEX idx_debt_lenders_record_id ON public.debt_lenders(debt_record_id);
CREATE INDEX idx_debt_news_published_at ON public.debt_news(published_at);
CREATE INDEX idx_debt_documents_record_id ON public.debt_documents(debt_record_id);

-- Insert some default data sources
INSERT INTO public.debt_sources (name, acronym, website_url, description) VALUES
('Bank of Central African States', 'BEAC', 'https://www.beac.int', 'Central bank of Central African Economic and Monetary Union'),
('International Monetary Fund', 'IMF', 'https://www.imf.org', 'International financial institution'),
('World Bank Group', 'World Bank', 'https://www.worldbank.org', 'International financial institution providing loans and grants'),
('Ministry of Finance', 'MINFI', 'https://www.minfi.gov.cm', 'Cameroon Ministry of Finance'),
('African Development Bank', 'AfDB', 'https://www.afdb.org', 'Regional development bank'),
('China Development Bank', 'CDB', 'https://www.cdb.com.cn', 'Chinese development finance institution');

-- Insert sample debt data for the last few years
INSERT INTO public.debt_records (year, total_debt_fcfa, total_debt_usd, internal_debt_fcfa, external_debt_fcfa, debt_to_gdp_ratio, gdp_fcfa, verified, created_by) VALUES
(2023, 12500000000000, 20833000000, 4500000000000, 8000000000000, 45.5, 27472527000000, true, null),
(2022, 11800000000000, 19667000000, 4200000000000, 7600000000000, 43.2, 27321000000000, true, null),
(2021, 11200000000000, 18667000000, 3900000000000, 7300000000000, 41.8, 26800000000000, true, null),
(2020, 10500000000000, 17500000000, 3600000000000, 6900000000000, 39.5, 26584000000000, true, null),
(2019, 9800000000000, 16333000000, 3300000000000, 6500000000000, 37.2, 26347000000000, true, null);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_debt_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_debt_records_updated_at
  BEFORE UPDATE ON public.debt_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_debt_updated_at();

CREATE TRIGGER update_debt_sources_updated_at
  BEFORE UPDATE ON public.debt_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_debt_updated_at();

CREATE TRIGGER update_debt_lenders_updated_at
  BEFORE UPDATE ON public.debt_lenders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_debt_updated_at();

CREATE TRIGGER update_debt_news_updated_at
  BEFORE UPDATE ON public.debt_news
  FOR EACH ROW
  EXECUTE FUNCTION public.update_debt_updated_at();

CREATE TRIGGER update_debt_documents_updated_at
  BEFORE UPDATE ON public.debt_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_debt_updated_at();