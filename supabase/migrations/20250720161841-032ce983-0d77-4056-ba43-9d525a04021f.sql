-- Create budget data tables
CREATE TABLE public.budget_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year INTEGER NOT NULL,
  ministry_id TEXT NOT NULL,
  ministry_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  region TEXT,
  allocated_amount_fcfa BIGINT NOT NULL,
  spent_amount_fcfa BIGINT DEFAULT 0,
  execution_percentage NUMERIC DEFAULT 0,
  project_name TEXT,
  project_description TEXT,
  status TEXT DEFAULT 'budgeted' CHECK (status IN ('budgeted', 'executing', 'completed', 'cancelled')),
  corruption_risk_level TEXT DEFAULT 'low' CHECK (corruption_risk_level IN ('low', 'medium', 'high', 'critical')),
  transparency_score INTEGER DEFAULT 50 CHECK (transparency_score >= 0 AND transparency_score <= 100),
  oversight_mp TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.budget_allocations ENABLE ROW LEVEL SECURITY;

-- RLS Policy for budget_allocations
CREATE POLICY "Budget allocations are viewable by everyone" 
ON public.budget_allocations FOR SELECT 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_budget_allocations_fiscal_year ON public.budget_allocations(fiscal_year);
CREATE INDEX idx_budget_allocations_ministry ON public.budget_allocations(ministry_id);
CREATE INDEX idx_budget_allocations_sector ON public.budget_allocations(sector);
CREATE INDEX idx_budget_allocations_region ON public.budget_allocations(region);

-- Insert sample budget data
INSERT INTO public.budget_allocations (fiscal_year, ministry_id, ministry_name, sector, region, allocated_amount_fcfa, spent_amount_fcfa, execution_percentage, project_name, project_description, status, corruption_risk_level, transparency_score, oversight_mp) VALUES
(2024, 'MINSANTE', 'Ministry of Public Health', 'Health', 'Centre', 850000000000, 663000000000, 78, 'National Vaccination Campaign', 'Nationwide COVID-19 and routine vaccination program', 'executing', 'low', 85, 'Dr. Mbarga Joseph'),
(2024, 'MINEDUB', 'Ministry of Basic Education', 'Education', 'Centre', 1200000000000, 984000000000, 82, 'School Infrastructure Development', 'Construction of 500 new classrooms nationwide', 'executing', 'medium', 76, 'Hon. Atanga Marie'),
(2024, 'MINTRANS', 'Ministry of Transport', 'Infrastructure', 'Littoral', 650000000000, 422500000000, 65, 'Douala Port Modernization', 'Upgrade port facilities and equipment', 'executing', 'high', 62, 'Hon. Ndongo Paul'),
(2024, 'MINADER', 'Ministry of Agriculture', 'Agriculture', 'Northwest', 920000000000, 652800000000, 71, 'Agricultural Modernization', 'Support for smallholder farmers with modern equipment', 'executing', 'low', 79, 'Hon. Fru John'),
(2024, 'MINFI', 'Ministry of Finance', 'Administration', 'Centre', 2800000000000, 2464000000000, 88, 'Digital Tax System', 'Implementation of electronic tax collection system', 'executing', 'medium', 82, 'Hon. Motaze Louis'),
(2024, 'MINDEF', 'Ministry of Defence', 'Security', 'Far North', 1500000000000, 1275000000000, 85, 'Boko Haram Counter-Operations', 'Military operations in Far North region', 'executing', 'medium', 45, 'General Eko Eko'),
(2023, 'MINSANTE', 'Ministry of Public Health', 'Health', 'Centre', 780000000000, 702000000000, 90, 'Hospital Equipment Upgrade', 'Medical equipment for regional hospitals', 'completed', 'low', 88, 'Dr. Mbarga Joseph'),
(2023, 'MINEDUB', 'Ministry of Basic Education', 'Education', 'West', 1100000000000, 946000000000, 86, 'Teacher Training Program', 'Professional development for 10,000 teachers', 'completed', 'low', 83, 'Hon. Atanga Marie');