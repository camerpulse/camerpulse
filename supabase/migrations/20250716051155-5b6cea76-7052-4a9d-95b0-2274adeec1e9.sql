-- Create table for debt data scraping results
CREATE TABLE public.debt_data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'government', -- 'government', 'international', 'bank'
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  scraping_frequency TEXT NOT NULL DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for scraped debt data
CREATE TABLE public.debt_scraping_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES public.debt_data_sources(id),
  scraping_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending', -- 'success', 'failed', 'partial'
  raw_data JSONB,
  parsed_data JSONB,
  total_debt_detected NUMERIC,
  creditors_found TEXT[],
  borrowing_purposes TEXT[],
  data_quality_score NUMERIC DEFAULT 0.0,
  error_message TEXT,
  changes_detected BOOLEAN DEFAULT false,
  comparison_with_previous JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for debt data comparisons
CREATE TABLE public.debt_data_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comparison_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  previous_record_id UUID,
  current_record_id UUID,
  source_id UUID NOT NULL REFERENCES public.debt_data_sources(id),
  changes_summary JSONB,
  significant_changes BOOLEAN DEFAULT false,
  threshold_violations TEXT[],
  alert_triggered BOOLEAN DEFAULT false,
  alert_sent_at TIMESTAMP WITH TIME ZONE,
  comparison_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.debt_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_scraping_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_data_comparisons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admins
CREATE POLICY "Admins can manage debt data sources" 
ON public.debt_data_sources 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can view scraping results" 
ON public.debt_scraping_results 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can view comparisons" 
ON public.debt_data_comparisons 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Insert default data sources
INSERT INTO public.debt_data_sources (source_name, source_url, source_type, metadata) VALUES
('Ministry of Finance - Cameroon', 'https://www.minfi.gov.cm', 'government', '{"country": "Cameroon", "language": "fr", "data_format": "html"}'),
('International Monetary Fund', 'https://www.imf.org', 'international', '{"organization": "IMF", "api_available": true, "data_format": "json"}'),
('Bank of Central African States', 'https://www.beac.int', 'bank', '{"region": "Central Africa", "currency": "FCFA", "data_format": "pdf"}'),
('World Bank Data', 'https://data.worldbank.org', 'international', '{"organization": "World Bank", "api_available": true, "data_format": "json"}');