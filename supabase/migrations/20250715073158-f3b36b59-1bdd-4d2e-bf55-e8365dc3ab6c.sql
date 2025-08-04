-- Create table for tracking government official changes
CREATE TABLE public.official_change_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  official_id UUID REFERENCES politicians(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('new_official', 'removed_official', 'role_switch', 'party_change', 'deceased_status', 'data_update')),
  official_name TEXT NOT NULL,
  previous_data JSONB,
  new_data JSONB,
  change_description TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('MINAT', 'PRC', 'Senate', 'AssNat', 'Admin', 'Auto')),
  source_url TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed BOOLEAN DEFAULT false,
  admin_reviewed BOOLEAN DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for monitoring configuration
CREATE TABLE public.gov_change_monitoring_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL,
  base_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  check_frequency_hours INTEGER DEFAULT 12,
  last_check_at TIMESTAMP WITH TIME ZONE,
  last_successful_check_at TIMESTAMP WITH TIME ZONE,
  total_checks INTEGER DEFAULT 0,
  successful_checks INTEGER DEFAULT 0,
  monitoring_rules JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_official_change_log_type ON public.official_change_log(change_type);
CREATE INDEX idx_official_change_log_date ON public.official_change_log(detected_at);
CREATE INDEX idx_official_change_log_source ON public.official_change_log(source_type);
CREATE INDEX idx_official_change_log_processed ON public.official_change_log(processed, admin_reviewed);

-- Create RLS policies
ALTER TABLE public.official_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gov_change_monitoring_config ENABLE ROW LEVEL SECURITY;

-- Change log policies
CREATE POLICY "Admins can manage change logs" 
ON public.official_change_log 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Change logs are publicly readable" 
ON public.official_change_log 
FOR SELECT 
USING (processed = true);

-- Monitoring config policies
CREATE POLICY "Admins can manage monitoring config" 
ON public.gov_change_monitoring_config 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Monitoring config is publicly readable" 
ON public.gov_change_monitoring_config 
FOR SELECT 
USING (true);

-- Insert default monitoring sources
INSERT INTO public.gov_change_monitoring_config (source_name, source_type, base_url, monitoring_rules) VALUES
('MINAT Political Parties', 'MINAT', 'https://www.minat.gov.cm', '{"track_parties": true, "track_appointments": true}'),
('PRC Presidential Decrees', 'PRC', 'https://www.prc.cm', '{"track_ministers": true, "track_reshuffles": true}'),
('Senate Website', 'Senate', 'https://www.senat.cm', '{"track_senators": true, "track_deaths": true}'),
('National Assembly', 'AssNat', 'https://www.assnat.cm', '{"track_mps": true, "track_elections": true}');

-- Function to detect changes
CREATE OR REPLACE FUNCTION public.detect_official_changes()
RETURNS TABLE(change_detected BOOLEAN, changes_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  changes_detected INTEGER := 0;
BEGIN
  -- This function would be called by the edge function
  -- For now, it returns a placeholder
  RETURN QUERY SELECT true, 0;
END;
$$;