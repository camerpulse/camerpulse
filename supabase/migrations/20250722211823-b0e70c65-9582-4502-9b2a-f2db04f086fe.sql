-- Create judiciary system tables

-- Create enum for court levels
CREATE TYPE court_level AS ENUM (
  'supreme_court',
  'constitutional_council', 
  'court_of_appeal',
  'high_court',
  'military_tribunal',
  'magistrate_court',
  'district_court'
);

-- Create enum for case status
CREATE TYPE case_status AS ENUM (
  'ongoing',
  'closed',
  'delayed',
  'appeal',
  'suspended'
);

-- Create enum for case types
CREATE TYPE case_type AS ENUM (
  'landmark_ruling',
  'human_rights',
  'anti_corruption',
  'constitutional',
  'military',
  'political_prosecution',
  'civil',
  'criminal'
);

-- Create judiciary members table
CREATE TABLE public.judiciary_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  position_title TEXT NOT NULL,
  court_level court_level NOT NULL,
  region TEXT,
  district TEXT,
  term_start_date DATE,
  term_end_date DATE,
  education_background TEXT,
  career_background TEXT,
  cases_handled INTEGER DEFAULT 0,
  integrity_score NUMERIC(3,2) DEFAULT 0.0,
  verified_source_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  claimed_by_user BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create legal cases table
CREATE TABLE public.legal_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_reference TEXT NOT NULL UNIQUE,
  case_title TEXT NOT NULL,
  case_type case_type NOT NULL,
  case_status case_status NOT NULL DEFAULT 'ongoing',
  court_id UUID REFERENCES public.judiciary_members(id),
  court_level court_level NOT NULL,
  region TEXT,
  defendant TEXT,
  plaintiff TEXT,
  case_summary TEXT,
  verdict TEXT,
  case_documents JSONB DEFAULT '[]'::jsonb,
  timeline_events JSONB DEFAULT '[]'::jsonb,
  public_interest_score INTEGER DEFAULT 0,
  media_coverage_count INTEGER DEFAULT 0,
  citizen_comments_count INTEGER DEFAULT 0,
  is_high_profile BOOLEAN DEFAULT false,
  started_date DATE,
  closed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create judicial ratings table
CREATE TABLE public.judicial_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  judiciary_member_id UUID REFERENCES public.judiciary_members(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  public_trust_rating INTEGER CHECK (public_trust_rating >= 1 AND public_trust_rating <= 5),
  ethical_conduct_rating INTEGER CHECK (ethical_conduct_rating >= 1 AND ethical_conduct_rating <= 5),
  case_handling_rating INTEGER CHECK (case_handling_rating >= 1 AND case_handling_rating <= 5),
  neutrality_rating INTEGER CHECK (neutrality_rating >= 1 AND neutrality_rating <= 5),
  overall_rating NUMERIC(3,2),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(judiciary_member_id, user_id)
);

-- Create judicial misconduct reports table
CREATE TABLE public.judicial_misconduct_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  judiciary_member_id UUID REFERENCES public.judiciary_members(id),
  case_id UUID REFERENCES public.legal_cases(id),
  reporter_user_id UUID REFERENCES auth.users(id),
  report_type TEXT NOT NULL,
  incident_date DATE,
  description TEXT NOT NULL,
  evidence_files JSONB DEFAULT '[]'::jsonb,
  is_anonymous BOOLEAN DEFAULT true,
  severity_level TEXT DEFAULT 'medium',
  investigation_status TEXT DEFAULT 'pending',
  investigated_by UUID REFERENCES auth.users(id),
  investigation_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case comments table (moderated)
CREATE TABLE public.case_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.legal_cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  flagged_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create judicial performance metrics table
CREATE TABLE public.judicial_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  judiciary_member_id UUID REFERENCES public.judiciary_members(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  cases_completed INTEGER DEFAULT 0,
  cases_pending INTEGER DEFAULT 0,
  average_case_duration_days NUMERIC(10,2),
  citizen_satisfaction_score NUMERIC(3,2),
  misconduct_reports_count INTEGER DEFAULT 0,
  transparency_score NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.judiciary_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judicial_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judicial_misconduct_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judicial_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for judiciary_members
CREATE POLICY "Public can view active judiciary members" 
ON public.judiciary_members 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage judiciary members" 
ON public.judiciary_members 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Judiciary members can update their own profiles"
ON public.judiciary_members
FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policies for legal_cases
CREATE POLICY "Public can view legal cases" 
ON public.legal_cases 
FOR SELECT 
USING (true);

CREATE POLICY "Admins and judiciary can manage cases" 
ON public.legal_cases 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  OR EXISTS (SELECT 1 FROM judiciary_members WHERE user_id = auth.uid() AND is_active = true)
);

-- Create RLS policies for judicial_ratings
CREATE POLICY "Users can view all ratings" 
ON public.judicial_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own ratings" 
ON public.judicial_ratings 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for judicial_misconduct_reports
CREATE POLICY "Admins can view all misconduct reports" 
ON public.judicial_misconduct_reports 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Users can create misconduct reports" 
ON public.judicial_misconduct_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reporter_user_id OR reporter_user_id IS NULL);

CREATE POLICY "Users can view their own reports" 
ON public.judicial_misconduct_reports 
FOR SELECT 
USING (auth.uid() = reporter_user_id);

-- Create RLS policies for case_comments
CREATE POLICY "Public can view approved comments" 
ON public.case_comments 
FOR SELECT 
USING (is_approved = true AND is_hidden = false);

CREATE POLICY "Users can manage their own comments" 
ON public.case_comments 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments" 
ON public.case_comments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create RLS policies for judicial_performance_metrics
CREATE POLICY "Public can view performance metrics" 
ON public.judicial_performance_metrics 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage performance metrics" 
ON public.judicial_performance_metrics 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create indexes for better performance
CREATE INDEX idx_judiciary_members_court_level ON public.judiciary_members(court_level);
CREATE INDEX idx_judiciary_members_region ON public.judiciary_members(region);
CREATE INDEX idx_legal_cases_status ON public.legal_cases(case_status);
CREATE INDEX idx_legal_cases_type ON public.legal_cases(case_type);
CREATE INDEX idx_legal_cases_court_level ON public.legal_cases(court_level);
CREATE INDEX idx_judicial_ratings_member ON public.judicial_ratings(judiciary_member_id);
CREATE INDEX idx_misconduct_reports_member ON public.judicial_misconduct_reports(judiciary_member_id);
CREATE INDEX idx_case_comments_case ON public.case_comments(case_id);

-- Create update triggers
CREATE TRIGGER update_judiciary_members_updated_at
  BEFORE UPDATE ON public.judiciary_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_cases_updated_at
  BEFORE UPDATE ON public.legal_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_judicial_ratings_updated_at
  BEFORE UPDATE ON public.judicial_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_misconduct_reports_updated_at
  BEFORE UPDATE ON public.judicial_misconduct_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_comments_updated_at
  BEFORE UPDATE ON public.case_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_metrics_updated_at
  BEFORE UPDATE ON public.judicial_performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate judicial ratings
CREATE OR REPLACE FUNCTION public.calculate_judicial_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update overall rating for the judiciary member
  UPDATE public.judiciary_members 
  SET integrity_score = (
    SELECT AVG(
      (timeliness_rating + public_trust_rating + ethical_conduct_rating + 
       case_handling_rating + neutrality_rating) / 5.0
    )
    FROM public.judicial_ratings 
    WHERE judiciary_member_id = NEW.judiciary_member_id
  )
  WHERE id = NEW.judiciary_member_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for rating calculations
CREATE TRIGGER calculate_judicial_ratings_trigger
  AFTER INSERT OR UPDATE ON public.judicial_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_judicial_ratings();