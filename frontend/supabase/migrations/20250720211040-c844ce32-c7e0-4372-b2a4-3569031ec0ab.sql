-- Add only missing diaspora tables

-- Virtual town halls and events system (if not exists)
CREATE TABLE IF NOT EXISTS public.diaspora_virtual_townhalls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'town_hall', -- 'town_hall', 'summit', 'roundtable'
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  platform TEXT NOT NULL DEFAULT 'zoom', -- 'zoom', 'teams', 'meet'
  meeting_link TEXT,
  meeting_password TEXT,
  organizer_id UUID REFERENCES public.diaspora_profiles(id),
  max_participants INTEGER DEFAULT 500,
  registration_required BOOLEAN DEFAULT true,
  agenda JSONB DEFAULT '[]',
  regions_focus TEXT[] DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  livestream_url TEXT,
  recording_url TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'live', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Town hall registrations (if not exists)
CREATE TABLE IF NOT EXISTS public.diaspora_townhall_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  townhall_id UUID REFERENCES public.diaspora_virtual_townhalls(id) ON DELETE CASCADE,
  diaspora_profile_id UUID REFERENCES public.diaspora_profiles(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attended BOOLEAN DEFAULT false,
  questions_submitted JSONB DEFAULT '[]',
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comments TEXT,
  UNIQUE(townhall_id, diaspora_profile_id)
);

-- Diaspora civic engagement tracking (if not exists)
CREATE TABLE IF NOT EXISTS public.diaspora_civic_engagement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diaspora_profile_id UUID REFERENCES public.diaspora_profiles(id) ON DELETE CASCADE,
  engagement_type TEXT NOT NULL, -- 'petition_signed', 'poll_participated', 'townhall_attended', 'project_funded'
  target_id UUID, -- petition_id, poll_id, project_id, etc.
  target_type TEXT, -- 'petition', 'poll', 'project', 'townhall'
  engagement_data JSONB DEFAULT '{}',
  impact_score INTEGER DEFAULT 1,
  home_region_relevant BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- QR receipt system (if not exists)
CREATE TABLE IF NOT EXISTS public.diaspora_qr_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_log_id UUID REFERENCES public.diaspora_transaction_logs(id) ON DELETE CASCADE,
  qr_code_data TEXT NOT NULL UNIQUE,
  receipt_data JSONB NOT NULL,
  download_count INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'valid', -- 'valid', 'expired', 'revoked'
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payment gateway configurations (if not exists)
CREATE TABLE IF NOT EXISTS public.payment_gateway_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gateway_name TEXT NOT NULL UNIQUE, -- 'flutterwave', 'stripe', 'paypal'
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  supported_currencies TEXT[] DEFAULT '{"FCFA", "USD", "EUR"}',
  configuration JSONB NOT NULL DEFAULT '{}',
  test_mode BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cross-platform integration tracking (if not exists)
CREATE TABLE IF NOT EXISTS public.diaspora_cross_platform_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diaspora_profile_id UUID REFERENCES public.diaspora_profiles(id) ON DELETE CASCADE,
  source_platform TEXT NOT NULL, -- 'diaspora_connect', 'village_directory', 'petition_system'
  target_platform TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'project_investment', 'petition_signature', 'village_donation'
  reference_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.diaspora_virtual_townhalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_townhall_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_civic_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_qr_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateway_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_cross_platform_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for virtual townhalls
CREATE POLICY "Anyone can view scheduled townhalls"
ON public.diaspora_virtual_townhalls
FOR SELECT
USING (status IN ('scheduled', 'live'));

CREATE POLICY "Organizers can manage their townhalls"
ON public.diaspora_virtual_townhalls
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.diaspora_profiles
  WHERE diaspora_profiles.id = diaspora_virtual_townhalls.organizer_id
  AND diaspora_profiles.user_id = auth.uid()
));

-- RLS Policies for townhall registrations
CREATE POLICY "Users can manage their own registrations"
ON public.diaspora_townhall_registrations
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.diaspora_profiles
  WHERE diaspora_profiles.id = diaspora_townhall_registrations.diaspora_profile_id
  AND diaspora_profiles.user_id = auth.uid()
));

-- RLS Policies for civic engagement
CREATE POLICY "Users can view their own engagement"
ON public.diaspora_civic_engagement
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.diaspora_profiles
  WHERE diaspora_profiles.id = diaspora_civic_engagement.diaspora_profile_id
  AND diaspora_profiles.user_id = auth.uid()
));

CREATE POLICY "System can track engagement"
ON public.diaspora_civic_engagement
FOR INSERT
WITH CHECK (true);

-- RLS Policies for QR receipts
CREATE POLICY "Users can view their own receipts"
ON public.diaspora_qr_receipts
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.diaspora_transaction_logs dtl
  JOIN public.diaspora_profiles dp ON dtl.diaspora_profile_id = dp.id
  WHERE dtl.id = diaspora_qr_receipts.transaction_log_id
  AND dp.user_id = auth.uid()
));

-- RLS Policies for payment configs (admin only)
CREATE POLICY "Admins can manage payment configs"
ON public.payment_gateway_configs
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
));

-- RLS Policies for cross-platform actions
CREATE POLICY "Users can view their own cross-platform actions"
ON public.diaspora_cross_platform_actions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.diaspora_profiles
  WHERE diaspora_profiles.id = diaspora_cross_platform_actions.diaspora_profile_id
  AND diaspora_profiles.user_id = auth.uid()
));

-- Insert default Flutterwave configuration if not exists
INSERT INTO public.payment_gateway_configs (
  gateway_name,
  is_active,
  is_primary,
  supported_currencies,
  configuration,
  test_mode
) 
SELECT 
  'flutterwave',
  false, -- Will be activated when admin configures it
  true,  -- Set as primary payment gateway
  ARRAY['FCFA', 'USD', 'EUR', 'GBP', 'CAD'],
  '{"public_key": "", "secret_key": "", "webhook_url": "", "encryption_key": ""}',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.payment_gateway_configs WHERE gateway_name = 'flutterwave'
);