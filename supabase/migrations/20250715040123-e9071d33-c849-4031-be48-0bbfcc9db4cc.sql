-- Create government agencies table
CREATE TABLE public.government_agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_name TEXT NOT NULL,
  agency_code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('health', 'security', 'elections', 'communication', 'judiciary', 'defense', 'territorial_administration', 'education', 'economy', 'environment')),
  contact_person_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone_number TEXT,
  role_type TEXT NOT NULL DEFAULT 'observer' CHECK (role_type IN ('observer', 'responder', 'contributor')),
  security_clearance TEXT NOT NULL DEFAULT 'basic' CHECK (security_clearance IN ('basic', 'intermediate', 'high', 'critical')),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  api_key_hash TEXT,
  two_fa_enabled BOOLEAN NOT NULL DEFAULT false,
  regions_access TEXT[] DEFAULT ARRAY[]::TEXT[],
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create government agency users table
CREATE TABLE public.government_agency_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES public.government_agencies(id) ON DELETE CASCADE,
  role_in_agency TEXT NOT NULL DEFAULT 'analyst' CHECK (role_in_agency IN ('analyst', 'coordinator', 'director', 'administrator')),
  access_level TEXT NOT NULL DEFAULT 'read_only' CHECK (access_level IN ('read_only', 'analyst', 'incident_commander')),
  is_primary_contact BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, agency_id)
);

-- Create agency alert routing table
CREATE TABLE public.agency_alert_routing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.government_agencies(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  regions TEXT[] DEFAULT ARRAY[]::TEXT[],
  min_severity_level TEXT NOT NULL DEFAULT 'medium' CHECK (min_severity_level IN ('low', 'medium', 'high', 'critical')),
  notification_channels TEXT[] NOT NULL DEFAULT ARRAY['dashboard']::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agency responses table
CREATE TABLE public.agency_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.government_agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  response_type TEXT NOT NULL CHECK (response_type IN ('situation_report', 'misinformation_flag', 'emergency_response', 'status_update')),
  alert_reference_id UUID,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  verified_status TEXT NOT NULL DEFAULT 'pending' CHECK (verified_status IN ('pending', 'verified', 'disputed')),
  visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal', 'inter_agency', 'public')),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agency action logs table  
CREATE TABLE public.agency_action_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.government_agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  action_description TEXT NOT NULL,
  target_resource TEXT,
  target_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.government_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_agency_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_alert_routing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_action_logs ENABLE ROW LEVEL SECURITY;

-- Policies for government_agencies
CREATE POLICY "Admins can manage agencies" ON public.government_agencies
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ));

CREATE POLICY "Agency users can view their agency" ON public.government_agencies
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.government_agency_users 
    WHERE user_id = auth.uid() AND agency_id = id
  ));

-- Policies for government_agency_users
CREATE POLICY "Admins can manage agency users" ON public.government_agency_users
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ));

CREATE POLICY "Agency users can view their agency members" ON public.government_agency_users
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.government_agency_users AS gau
    WHERE gau.user_id = auth.uid() AND gau.agency_id = agency_id
  ));

-- Policies for agency_alert_routing
CREATE POLICY "Admins and agency coordinators can manage alert routing" ON public.agency_alert_routing
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
    OR 
    EXISTS (
      SELECT 1 FROM public.government_agency_users 
      WHERE user_id = auth.uid() AND agency_id = agency_alert_routing.agency_id 
      AND role_in_agency IN ('coordinator', 'director', 'administrator')
    )
  );

-- Policies for agency_responses
CREATE POLICY "Agency users can manage their responses" ON public.agency_responses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.government_agency_users 
      WHERE user_id = auth.uid() AND agency_id = agency_responses.agency_id
    )
  );

-- Policies for agency_action_logs
CREATE POLICY "Admins can view all action logs" ON public.agency_action_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ));

CREATE POLICY "Agency users can view their agency logs" ON public.agency_action_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.government_agency_users 
    WHERE user_id = auth.uid() AND agency_id = agency_action_logs.agency_id
  ));

-- Create indexes for performance
CREATE INDEX idx_government_agencies_category ON public.government_agencies(category);
CREATE INDEX idx_government_agencies_verified ON public.government_agencies(is_verified, is_active);
CREATE INDEX idx_government_agency_users_agency_id ON public.government_agency_users(agency_id);
CREATE INDEX idx_government_agency_users_user_id ON public.government_agency_users(user_id);
CREATE INDEX idx_agency_alert_routing_agency_id ON public.agency_alert_routing(agency_id);
CREATE INDEX idx_agency_responses_agency_id ON public.agency_responses(agency_id);
CREATE INDEX idx_agency_action_logs_agency_id ON public.agency_action_logs(agency_id);
CREATE INDEX idx_agency_action_logs_created_at ON public.agency_action_logs(created_at);

-- Create triggers for updated_at
CREATE TRIGGER update_government_agencies_updated_at
  BEFORE UPDATE ON public.government_agencies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_government_agency_users_updated_at
  BEFORE UPDATE ON public.government_agency_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agency_alert_routing_updated_at
  BEFORE UPDATE ON public.agency_alert_routing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agency_responses_updated_at
  BEFORE UPDATE ON public.agency_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();