-- Create budget data tables
CREATE TABLE IF NOT EXISTS public.budget_allocations (
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

-- Create budget comments table
CREATE TABLE IF NOT EXISTS public.budget_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_allocation_id UUID REFERENCES public.budget_allocations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  comment_type TEXT DEFAULT 'general' CHECK (comment_type IN ('general', 'clarification_request', 'concern', 'suggestion')),
  is_verified BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create budget ratings table
CREATE TABLE IF NOT EXISTS public.budget_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_allocation_id UUID REFERENCES public.budget_allocations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  priority_rating INTEGER CHECK (priority_rating >= 1 AND priority_rating <= 5),
  efficiency_rating INTEGER CHECK (efficiency_rating >= 1 AND efficiency_rating <= 5),
  transparency_rating INTEGER CHECK (transparency_rating >= 1 AND transparency_rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(budget_allocation_id, user_id)
);

-- Create budget anomalies table
CREATE TABLE IF NOT EXISTS public.budget_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_allocation_id UUID REFERENCES public.budget_allocations(id) ON DELETE CASCADE,
  anomaly_type TEXT NOT NULL CHECK (anomaly_type IN ('overspend', 'underspend', 'execution_delay', 'suspicious_pattern', 'transparency_issue')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_by UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  resolution_notes TEXT,
  auto_detected BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create budget uploads table for admin use
CREATE TABLE IF NOT EXISTS public.budget_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  fiscal_year INTEGER NOT NULL,
  upload_type TEXT DEFAULT 'official' CHECK (upload_type IN ('official', 'civic_verified', 'draft')),
  uploaded_by UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processing_notes TEXT,
  records_imported INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_allocations
CREATE POLICY "Budget allocations are viewable by everyone" 
ON public.budget_allocations FOR SELECT 
USING (true);

-- RLS Policies for budget_comments
CREATE POLICY "Users can view public comments" 
ON public.budget_comments FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create comments" 
ON public.budget_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.budget_comments FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for budget_ratings
CREATE POLICY "Users can view all ratings" 
ON public.budget_ratings FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own ratings" 
ON public.budget_ratings FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for budget_anomalies
CREATE POLICY "Budget anomalies are viewable by everyone" 
ON public.budget_anomalies FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage anomalies" 
ON public.budget_anomalies FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for budget_uploads
CREATE POLICY "Admins can manage uploads" 
ON public.budget_uploads FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create indexes for performance
CREATE INDEX idx_budget_allocations_fiscal_year ON public.budget_allocations(fiscal_year);
CREATE INDEX idx_budget_allocations_ministry ON public.budget_allocations(ministry_id);
CREATE INDEX idx_budget_allocations_sector ON public.budget_allocations(sector);
CREATE INDEX idx_budget_allocations_region ON public.budget_allocations(region);
CREATE INDEX idx_budget_comments_allocation ON public.budget_comments(budget_allocation_id);
CREATE INDEX idx_budget_ratings_allocation ON public.budget_ratings(budget_allocation_id);

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

-- Create budget statistics function
CREATE OR REPLACE FUNCTION public.get_budget_statistics(p_fiscal_year INTEGER DEFAULT NULL)
RETURNS TABLE(
  total_allocation BIGINT,
  total_spent BIGINT,
  avg_execution_rate NUMERIC,
  total_projects INTEGER,
  completed_projects INTEGER,
  high_risk_projects INTEGER,
  total_ministries INTEGER,
  sectors_count INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(allocated_amount_fcfa), 0) as total_allocation,
    COALESCE(SUM(spent_amount_fcfa), 0) as total_spent,
    COALESCE(AVG(execution_percentage), 0) as avg_execution_rate,
    COUNT(*)::INTEGER as total_projects,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_projects,
    COUNT(*) FILTER (WHERE corruption_risk_level IN ('high', 'critical'))::INTEGER as high_risk_projects,
    COUNT(DISTINCT ministry_id)::INTEGER as total_ministries,
    COUNT(DISTINCT sector)::INTEGER as sectors_count
  FROM public.budget_allocations
  WHERE (p_fiscal_year IS NULL OR fiscal_year = p_fiscal_year);
END;
$$;