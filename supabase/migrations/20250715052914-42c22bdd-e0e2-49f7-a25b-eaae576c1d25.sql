-- Create civic view control system for public portal visibility

-- Table to store module visibility settings
CREATE TABLE public.civic_module_visibility (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name TEXT NOT NULL,
  module_description TEXT,
  is_public_visible BOOLEAN NOT NULL DEFAULT true,
  enabled_for_roles TEXT[] DEFAULT ARRAY['admin', 'analyst', 'citizen', 'gov_partner'],
  region_restrictions TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(module_name)
);

-- Table to track visibility changes (audit log)
CREATE TABLE public.civic_visibility_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'enabled', 'disabled', 'region_restricted', 'role_changed'
  previous_state JSONB,
  new_state JSONB,
  affected_regions TEXT[] DEFAULT ARRAY[]::TEXT[],
  changed_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.civic_module_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_visibility_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for civic_module_visibility
CREATE POLICY "Admins can manage module visibility" 
ON public.civic_module_visibility FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Module visibility is publicly readable" 
ON public.civic_module_visibility FOR SELECT 
USING (true);

-- RLS Policies for civic_visibility_audit 
CREATE POLICY "Admins can view audit logs" 
ON public.civic_visibility_audit FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can insert audit logs" 
ON public.civic_visibility_audit FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Function to automatically update updated_at timestamp
CREATE TRIGGER update_civic_module_visibility_updated_at
  BEFORE UPDATE ON public.civic_module_visibility
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Pre-populate with initial modules
INSERT INTO public.civic_module_visibility (module_name, module_description, is_public_visible, enabled_for_roles) VALUES
('civic_feed', 'Main civic sentiment feed and activity stream', true, ARRAY['admin', 'analyst', 'citizen', 'gov_partner']),
('fusion_core', 'Civic event correlation and emotional analysis', true, ARRAY['admin', 'analyst', 'citizen']),
('trust_index', 'Institutional trust scores and metrics', true, ARRAY['admin', 'analyst', 'citizen', 'gov_partner']),
('promise_tracker', 'Political promise tracking and accountability', true, ARRAY['admin', 'analyst', 'citizen', 'gov_partner']),
('red_room_alerts', 'Emergency alerts and critical threat notifications', false, ARRAY['admin', 'analyst']),
('regional_sentiment', 'Regional mood analysis and breakdowns', true, ARRAY['admin', 'analyst', 'citizen']),
('trending_topics', 'Most discussed civic issues and topics', true, ARRAY['admin', 'analyst', 'citizen', 'gov_partner']),
('insider_feed', 'Administrative and government insider information', false, ARRAY['admin', 'gov_partner']),
('sentiment_ledger', 'Detailed sentiment analysis logs and data', true, ARRAY['admin', 'analyst', 'citizen']),
('disinformation_shield', 'Misinformation detection and counter-narratives', false, ARRAY['admin', 'analyst']),
('election_monitoring', 'Election interference and threat monitoring', false, ARRAY['admin', 'analyst', 'gov_partner']),
('civic_reports', 'Citizen reporting and feedback system', true, ARRAY['admin', 'analyst', 'citizen', 'gov_partner']);

-- Function to get module visibility for a specific role and region
CREATE OR REPLACE FUNCTION public.get_module_visibility(
  p_user_role TEXT DEFAULT 'citizen',
  p_region TEXT DEFAULT NULL
)
RETURNS TABLE (
  module_name TEXT,
  is_visible BOOLEAN,
  custom_settings JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cmv.module_name,
    CASE 
      WHEN NOT cmv.is_public_visible THEN false
      WHEN p_user_role = ANY(cmv.enabled_for_roles) THEN true
      ELSE false
    END as is_visible,
    cmv.custom_settings
  FROM public.civic_module_visibility cmv
  WHERE 
    (p_region IS NULL OR p_region != ANY(cmv.region_restrictions))
  ORDER BY cmv.module_name;
END;
$$;