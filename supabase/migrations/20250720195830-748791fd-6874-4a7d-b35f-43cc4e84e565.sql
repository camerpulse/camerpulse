-- Diaspora Engagement & Investment Platform Tables

-- Diaspora profiles table
CREATE TABLE public.diaspora_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  country_of_residence TEXT NOT NULL,
  home_village_town_city TEXT NOT NULL,
  profession_sector TEXT,
  diaspora_association TEXT,
  preferred_donation_interests TEXT[],
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by_consulate BOOLEAN DEFAULT false,
  verification_documents TEXT[],
  total_contributions_fcfa BIGINT DEFAULT 0,
  total_projects_supported INTEGER DEFAULT 0,
  impact_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Investment projects table
CREATE TABLE public.diaspora_investment_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  target_amount_fcfa BIGINT NOT NULL,
  raised_amount_fcfa BIGINT DEFAULT 0,
  location TEXT NOT NULL,
  project_status TEXT DEFAULT 'fundraising' CHECK (project_status IN ('fundraising', 'in_progress', 'completed', 'cancelled')),
  completion_percentage INTEGER DEFAULT 0,
  start_date DATE,
  expected_completion_date DATE,
  actual_completion_date DATE,
  project_manager TEXT,
  contact_email TEXT,
  images TEXT[],
  documents TEXT[],
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Diaspora donations table
CREATE TABLE public.diaspora_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diaspora_profile_id UUID REFERENCES public.diaspora_profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.diaspora_investment_projects(id) ON DELETE CASCADE,
  amount_fcfa BIGINT NOT NULL,
  amount_usd NUMERIC,
  exchange_rate NUMERIC,
  donation_type TEXT DEFAULT 'project' CHECK (donation_type IN ('project', 'general', 'emergency', 'village_development')),
  payment_method TEXT,
  transaction_reference TEXT UNIQUE,
  qr_receipt_data TEXT,
  receipt_url TEXT,
  donation_message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  donation_status TEXT DEFAULT 'pending' CHECK (donation_status IN ('pending', 'completed', 'failed', 'refunded')),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Diaspora recognition table
CREATE TABLE public.diaspora_recognition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diaspora_profile_id UUID REFERENCES public.diaspora_profiles(id) ON DELETE CASCADE NOT NULL,
  recognition_type TEXT NOT NULL CHECK (recognition_type IN ('village_builder_badge', 'civic_hero_monthly', 'top_contributor', 'community_champion')),
  recognition_title TEXT NOT NULL,
  recognition_description TEXT,
  badge_icon TEXT,
  achievement_date DATE DEFAULT CURRENT_DATE,
  recognition_level TEXT DEFAULT 'bronze' CHECK (recognition_level IN ('bronze', 'silver', 'gold', 'platinum')),
  points_awarded INTEGER DEFAULT 0,
  public_display BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Diaspora events table
CREATE TABLE public.diaspora_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('virtual_town_hall', 'civic_summit', 'council_roundtable', 'investment_webinar')),
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  max_attendees INTEGER,
  registration_required BOOLEAN DEFAULT true,
  meeting_url TEXT,
  meeting_password TEXT,
  agenda JSONB DEFAULT '[]',
  speakers JSONB DEFAULT '[]',
  target_regions TEXT[],
  languages TEXT[] DEFAULT '{"French", "English"}',
  registration_deadline TIMESTAMP WITH TIME ZONE,
  event_status TEXT DEFAULT 'upcoming' CHECK (event_status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Diaspora event registrations table
CREATE TABLE public.diaspora_event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.diaspora_events(id) ON DELETE CASCADE NOT NULL,
  diaspora_profile_id UUID REFERENCES public.diaspora_profiles(id) ON DELETE CASCADE NOT NULL,
  registration_status TEXT DEFAULT 'registered' CHECK (registration_status IN ('registered', 'attended', 'no_show', 'cancelled')),
  questions_responses JSONB DEFAULT '{}',
  attended_at TIMESTAMP WITH TIME ZONE,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, diaspora_profile_id)
);

-- Diaspora transaction logs table (for audit trail)
CREATE TABLE public.diaspora_transaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diaspora_profile_id UUID REFERENCES public.diaspora_profiles(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL,
  transaction_data JSONB NOT NULL,
  ip_address INET,
  user_agent TEXT,
  location_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.diaspora_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_investment_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_recognition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_transaction_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Diaspora Profiles
CREATE POLICY "Users can view their own diaspora profile" 
ON public.diaspora_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diaspora profile" 
ON public.diaspora_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diaspora profile" 
ON public.diaspora_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view verified diaspora profiles (limited data)" 
ON public.diaspora_profiles FOR SELECT 
USING (verification_status = 'verified');

-- RLS Policies for Investment Projects
CREATE POLICY "Anyone can view verified projects" 
ON public.diaspora_investment_projects FOR SELECT 
USING (verification_status = 'verified');

CREATE POLICY "Users can create investment projects" 
ON public.diaspora_investment_projects FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project creators can update their projects" 
ON public.diaspora_investment_projects FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all projects" 
ON public.diaspora_investment_projects FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS Policies for Donations
CREATE POLICY "Users can view their own donations" 
ON public.diaspora_donations FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.diaspora_profiles WHERE id = diaspora_profile_id AND user_id = auth.uid()));

CREATE POLICY "Users can create their own donations" 
ON public.diaspora_donations FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.diaspora_profiles WHERE id = diaspora_profile_id AND user_id = auth.uid()));

CREATE POLICY "Project owners can view donations to their projects" 
ON public.diaspora_donations FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.diaspora_investment_projects WHERE id = project_id AND created_by = auth.uid()));

-- RLS Policies for Recognition
CREATE POLICY "Anyone can view public recognition" 
ON public.diaspora_recognition FOR SELECT 
USING (public_display = true);

CREATE POLICY "Users can view their own recognition" 
ON public.diaspora_recognition FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.diaspora_profiles WHERE id = diaspora_profile_id AND user_id = auth.uid()));

-- RLS Policies for Events
CREATE POLICY "Anyone can view diaspora events" 
ON public.diaspora_events FOR SELECT 
USING (true);

CREATE POLICY "Event creators can manage their events" 
ON public.diaspora_events FOR ALL 
USING (auth.uid() = created_by);

-- RLS Policies for Event Registrations
CREATE POLICY "Users can view their own event registrations" 
ON public.diaspora_event_registrations FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.diaspora_profiles WHERE id = diaspora_profile_id AND user_id = auth.uid()));

CREATE POLICY "Users can create their own event registrations" 
ON public.diaspora_event_registrations FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.diaspora_profiles WHERE id = diaspora_profile_id AND user_id = auth.uid()));

CREATE POLICY "Event creators can view registrations for their events" 
ON public.diaspora_event_registrations FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.diaspora_events WHERE id = event_id AND created_by = auth.uid()));

-- RLS Policies for Transaction Logs
CREATE POLICY "Users can view their own transaction logs" 
ON public.diaspora_transaction_logs FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.diaspora_profiles WHERE id = diaspora_profile_id AND user_id = auth.uid()));

CREATE POLICY "System can create transaction logs" 
ON public.diaspora_transaction_logs FOR INSERT 
WITH CHECK (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_diaspora_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_diaspora_profiles_updated_at
BEFORE UPDATE ON public.diaspora_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_diaspora_updated_at();

CREATE TRIGGER update_diaspora_projects_updated_at
BEFORE UPDATE ON public.diaspora_investment_projects
FOR EACH ROW EXECUTE FUNCTION public.update_diaspora_updated_at();

CREATE TRIGGER update_diaspora_events_updated_at
BEFORE UPDATE ON public.diaspora_events
FOR EACH ROW EXECUTE FUNCTION public.update_diaspora_updated_at();