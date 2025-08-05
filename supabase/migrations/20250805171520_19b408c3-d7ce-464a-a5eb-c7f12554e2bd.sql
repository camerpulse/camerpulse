-- Priority Assessment Dashboard Tables

-- Enum for priority levels
CREATE TYPE priority_level AS ENUM ('must_have', 'should_have', 'could_have', 'wont_have');

-- Enum for gap categories
CREATE TYPE gap_category AS ENUM ('feature', 'performance', 'security', 'compliance', 'user_experience', 'technical_debt');

-- Enum for gap status
CREATE TYPE gap_status AS ENUM ('identified', 'in_progress', 'completed', 'deferred', 'cancelled');

-- Platform gaps table
CREATE TABLE public.platform_gaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category gap_category NOT NULL,
  priority_level priority_level NOT NULL DEFAULT 'should_have',
  status gap_status NOT NULL DEFAULT 'identified',
  
  -- Scoring criteria
  impact_score INTEGER NOT NULL DEFAULT 1 CHECK (impact_score >= 1 AND impact_score <= 10),
  effort_score INTEGER NOT NULL DEFAULT 1 CHECK (effort_score >= 1 AND effort_score <= 10),
  feasibility_score INTEGER NOT NULL DEFAULT 1 CHECK (feasibility_score >= 1 AND feasibility_score <= 10),
  risk_score INTEGER NOT NULL DEFAULT 1 CHECK (risk_score >= 1 AND risk_score <= 10),
  calculated_priority_score NUMERIC GENERATED ALWAYS AS (
    CAST(impact_score AS NUMERIC) * CAST(feasibility_score AS NUMERIC) / CAST(effort_score AS NUMERIC)
  ) STORED,
  
  -- Additional details
  affected_modules TEXT[],
  stakeholders TEXT[],
  estimated_effort_hours INTEGER,
  target_completion_date DATE,
  business_justification TEXT,
  technical_notes TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gap assessment sessions table
CREATE TABLE public.gap_assessment_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Session details
  facilitator_id UUID REFERENCES auth.users(id),
  participants TEXT[],
  methodology TEXT DEFAULT 'MoSCoW',
  scope_areas TEXT[],
  
  -- Results summary
  total_gaps_identified INTEGER DEFAULT 0,
  must_have_count INTEGER DEFAULT 0,
  should_have_count INTEGER DEFAULT 0,
  could_have_count INTEGER DEFAULT 0,
  wont_have_count INTEGER DEFAULT 0,
  
  -- Status and metadata
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Link gaps to assessment sessions
CREATE TABLE public.gap_session_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gap_id UUID REFERENCES public.platform_gaps(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.gap_assessment_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(gap_id, session_id)
);

-- Development roadmap table
CREATE TABLE public.development_roadmap (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Timeline
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  quarter TEXT, -- e.g., "Q1 2024"
  
  -- Planning details
  theme TEXT, -- e.g., "Security Improvements", "User Experience"
  planned_gaps UUID[], -- Array of gap IDs
  allocated_budget NUMERIC,
  team_capacity_hours INTEGER,
  
  -- Progress tracking
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  actual_effort_hours INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on_hold')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gap_assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gap_session_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_roadmap ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all gaps" ON public.platform_gaps
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view gaps" ON public.platform_gaps
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage assessment sessions" ON public.gap_assessment_sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view assessment sessions" ON public.gap_assessment_sessions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage gap session links" ON public.gap_session_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view gap session links" ON public.gap_session_links
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage roadmap" ON public.development_roadmap
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view roadmap" ON public.development_roadmap
  FOR SELECT USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for timestamp updates
CREATE TRIGGER update_platform_gaps_updated_at
  BEFORE UPDATE ON public.platform_gaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gap_assessment_sessions_updated_at
  BEFORE UPDATE ON public.gap_assessment_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_development_roadmap_updated_at
  BEFORE UPDATE ON public.development_roadmap
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO public.platform_gaps (title, description, category, priority_level, impact_score, effort_score, feasibility_score, risk_score, affected_modules, business_justification) VALUES
('Enhanced Security Authentication', 'Implement multi-factor authentication and security hardening', 'security', 'must_have', 9, 7, 8, 8, ARRAY['auth', 'user_management'], 'Critical for platform security and user trust'),
('Mobile App Performance', 'Optimize mobile application loading times and responsiveness', 'performance', 'should_have', 7, 5, 9, 3, ARRAY['mobile', 'frontend'], 'Improves user experience and retention'),
('Advanced Analytics Dashboard', 'Comprehensive analytics for civic engagement metrics', 'feature', 'could_have', 6, 8, 7, 4, ARRAY['analytics', 'dashboard'], 'Provides valuable insights for decision making'),
('API Rate Limiting', 'Implement proper API rate limiting and throttling', 'technical_debt', 'should_have', 8, 4, 9, 5, ARRAY['api', 'backend'], 'Prevents abuse and ensures system stability');

INSERT INTO public.gap_assessment_sessions (title, description, facilitator_id, participants, scope_areas) VALUES
('Q1 2024 Platform Assessment', 'Comprehensive assessment of platform gaps for Q1 planning', null, ARRAY['Product Team', 'Engineering Team', 'UX Team'], ARRAY['security', 'performance', 'user_experience']);