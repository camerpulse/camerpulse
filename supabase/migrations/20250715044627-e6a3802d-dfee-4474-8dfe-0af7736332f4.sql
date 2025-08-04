-- Create institutional trust tracking tables

-- Institution types enum
CREATE TYPE public.institution_type AS ENUM (
  'presidency',
  'parliament', 
  'judiciary',
  'police',
  'electoral_commission',
  'state_media',
  'public_health',
  'education_ministry',
  'local_councils'
);

-- Institutions table
CREATE TABLE public.institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  institution_type public.institution_type NOT NULL,
  description TEXT,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Institutional trust scores table
CREATE TABLE public.institutional_trust_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_trust_score NUMERIC(5,2) NOT NULL DEFAULT 50.0 CHECK (overall_trust_score >= 0 AND overall_trust_score <= 100),
  region TEXT,
  sentiment_based_score NUMERIC(5,2) DEFAULT 0,
  keyword_score NUMERIC(5,2) DEFAULT 0,
  user_feedback_score NUMERIC(5,2) DEFAULT 0,
  content_volume INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(institution_id, date_recorded, region)
);

-- User trust feedback table
CREATE TABLE public.user_trust_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  trust_rating INTEGER NOT NULL CHECK (trust_rating >= 1 AND trust_rating <= 5),
  feedback_type TEXT DEFAULT 'rating',
  comment TEXT,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, institution_id)
);

-- Trust events table (links trust changes to specific events)
CREATE TABLE public.trust_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  event_description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_type TEXT NOT NULL,
  trust_impact_score NUMERIC(5,2),
  source_url TEXT,
  regions_affected TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trust_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Institutions - publicly readable, admin manageable
CREATE POLICY "Institutions are publicly readable"
ON public.institutions
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage institutions"
ON public.institutions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Institutional trust scores - publicly readable, admin manageable
CREATE POLICY "Trust scores are publicly readable"
ON public.institutional_trust_scores
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage trust scores"
ON public.institutional_trust_scores
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- User trust feedback - users can manage their own, admins can see all
CREATE POLICY "Users can manage their own trust feedback"
ON public.user_trust_feedback
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all trust feedback"
ON public.user_trust_feedback
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Trust events - publicly readable, admin manageable
CREATE POLICY "Trust events are publicly readable"
ON public.trust_events
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage trust events"
ON public.trust_events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Create indexes for better performance
CREATE INDEX idx_institutional_trust_scores_institution_date ON public.institutional_trust_scores(institution_id, date_recorded DESC);
CREATE INDEX idx_institutional_trust_scores_region ON public.institutional_trust_scores(region);
CREATE INDEX idx_user_trust_feedback_institution ON public.user_trust_feedback(institution_id);
CREATE INDEX idx_trust_events_institution ON public.trust_events(institution_id);
CREATE INDEX idx_trust_events_date ON public.trust_events(event_date DESC);

-- Create update triggers
CREATE TRIGGER update_institutions_updated_at
  BEFORE UPDATE ON public.institutions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institutional_trust_scores_updated_at
  BEFORE UPDATE ON public.institutional_trust_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_trust_feedback_updated_at
  BEFORE UPDATE ON public.user_trust_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trust_events_updated_at
  BEFORE UPDATE ON public.trust_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default institutions
INSERT INTO public.institutions (name, institution_type, description) VALUES
('Office of the President', 'presidency', 'Executive branch of government'),
('National Assembly', 'parliament', 'Legislative branch of government'),
('Supreme Court', 'judiciary', 'Highest court in the judicial system'),
('National Police', 'police', 'National law enforcement agency'),
('Elections Cameroon (ELECAM)', 'electoral_commission', 'National electoral commission'),
('Cameroon Radio Television (CRTV)', 'state_media', 'State-owned media organization'),
('Ministry of Public Health', 'public_health', 'Public health administration'),
('Ministry of Education', 'education_ministry', 'National education administration'),
('Municipal Councils', 'local_councils', 'Local government councils');

-- Insert initial trust scores for each institution
INSERT INTO public.institutional_trust_scores (institution_id, overall_trust_score, region)
SELECT 
  i.id,
  50.0,
  'National'
FROM public.institutions i;