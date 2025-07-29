-- Create tables for Politica AI fact-checking system

-- AI activity logs table
CREATE TABLE public.politica_ai_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('politician', 'political_party')),
  target_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('verification', 'update', 'correction', 'scan')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'requires_review')),
  changes_made JSONB DEFAULT '[]'::jsonb,
  sources_verified JSONB DEFAULT '[]'::jsonb,
  proof_urls TEXT[],
  ai_confidence_score NUMERIC CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- AI verification status for politicians
CREATE TABLE public.politician_ai_verification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  politician_id UUID NOT NULL REFERENCES public.politicians(id) ON DELETE CASCADE,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified', 'disputed', 'pending')),
  verification_score NUMERIC CHECK (verification_score >= 0 AND verification_score <= 1),
  sources_count INTEGER DEFAULT 0,
  last_sources_checked JSONB DEFAULT '[]'::jsonb,
  outdated_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
  disputed_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(politician_id)
);

-- AI verification status for political parties
CREATE TABLE public.party_ai_verification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL REFERENCES public.political_parties(id) ON DELETE CASCADE,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified', 'disputed', 'pending')),
  verification_score NUMERIC CHECK (verification_score >= 0 AND verification_score <= 1),
  sources_count INTEGER DEFAULT 0,
  last_sources_checked JSONB DEFAULT '[]'::jsonb,
  outdated_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
  disputed_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(party_id)
);

-- AI scan schedules and configurations
CREATE TABLE public.politica_ai_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default AI configuration
INSERT INTO public.politica_ai_config (config_key, config_value, description) VALUES 
('scan_schedule', '{"frequency": "daily", "time": "02:00", "timezone": "UTC"}', 'Automatic scanning schedule'),
('trusted_sources', '["elecam.cm", "gov.cm", "minat.gov.cm", "mincom.gov.cm", "cameroon-tribune.cm", "assemblee-nationale.cm", "senat.cm"]', 'List of trusted government sources'),
('verification_thresholds', '{"minimum_sources": 2, "confidence_threshold": 0.8, "auto_update_threshold": 0.9}', 'AI verification thresholds'),
('scan_fields', '["name", "position", "party", "education", "bio", "contact_info", "status"]', 'Fields to scan and verify');

-- Enable RLS
ALTER TABLE public.politica_ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politician_ai_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_ai_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politica_ai_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI logs
CREATE POLICY "AI logs viewable by admins and public summary" ON public.politica_ai_logs
FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)
  OR true -- Public can see basic activity
);

CREATE POLICY "Only admins can manage AI logs" ON public.politica_ai_logs
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)
);

-- RLS Policies for verification tables
CREATE POLICY "AI verification data viewable by everyone" ON public.politician_ai_verification
FOR SELECT USING (true);

CREATE POLICY "AI verification data viewable by everyone" ON public.party_ai_verification
FOR SELECT USING (true);

CREATE POLICY "Only admins can manage AI verification" ON public.politician_ai_verification
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)
);

CREATE POLICY "Only admins can manage AI verification" ON public.party_ai_verification
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)
);

-- RLS Policies for AI config
CREATE POLICY "AI config viewable by admins" ON public.politica_ai_config
FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)
);

CREATE POLICY "Only admins can manage AI config" ON public.politica_ai_config
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role)
);

-- Create function to update verification timestamps
CREATE OR REPLACE FUNCTION update_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_politician_ai_verification_updated_at
  BEFORE UPDATE ON public.politician_ai_verification
  FOR EACH ROW EXECUTE FUNCTION update_verification_updated_at();

CREATE TRIGGER update_party_ai_verification_updated_at
  BEFORE UPDATE ON public.party_ai_verification
  FOR EACH ROW EXECUTE FUNCTION update_verification_updated_at();

CREATE TRIGGER update_politica_ai_config_updated_at
  BEFORE UPDATE ON public.politica_ai_config
  FOR EACH ROW EXECUTE FUNCTION update_verification_updated_at();