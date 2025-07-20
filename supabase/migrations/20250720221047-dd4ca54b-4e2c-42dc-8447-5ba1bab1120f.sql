-- Diaspora Engagement & Investment Platform Tables

-- Diaspora user profiles
CREATE TABLE public.diaspora_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  country_of_residence TEXT NOT NULL,
  home_village_town_city TEXT NOT NULL,
  home_region TEXT NOT NULL,
  profession_sector TEXT,
  diaspora_association TEXT,
  years_abroad INTEGER,
  preferred_donation_interests TEXT[],
  civic_interests TEXT[],
  is_verified BOOLEAN DEFAULT false,
  verification_method TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Diaspora donations and investments
CREATE TABLE public.diaspora_donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID NOT NULL REFERENCES diaspora_profiles(id) ON DELETE CASCADE,
  donation_type TEXT NOT NULL, -- 'project', 'emergency', 'community', 'general'
  target_type TEXT NOT NULL, -- 'village', 'project', 'ministry', 'general'
  target_id UUID,
  amount_fcfa BIGINT NOT NULL,
  amount_usd NUMERIC,
  currency TEXT NOT NULL DEFAULT 'FCFA',
  payment_method TEXT NOT NULL,
  transaction_reference TEXT,
  purpose TEXT NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  receipt_url TEXT,
  qr_code_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Verified projects for diaspora investment
CREATE TABLE public.diaspora_investment_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  project_description TEXT NOT NULL,
  target_region TEXT NOT NULL,
  target_community TEXT,
  project_category TEXT NOT NULL, -- 'education', 'health', 'infrastructure', 'agriculture', 'technology'
  funding_goal_fcfa BIGINT NOT NULL,
  funding_raised_fcfa BIGINT DEFAULT 0,
  project_status TEXT NOT NULL DEFAULT 'active', -- 'active', 'funded', 'completed', 'cancelled'
  project_manager TEXT,
  project_manager_contact TEXT,
  expected_completion_date DATE,
  actual_completion_date DATE,
  progress_percentage INTEGER DEFAULT 0,
  verification_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  project_images TEXT[],
  project_documents TEXT[],
  impact_metrics JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Diaspora recognition and impact tracking
CREATE TABLE public.diaspora_recognition (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diaspora_id UUID NOT NULL REFERENCES diaspora_profiles(id) ON DELETE CASCADE,
  recognition_type TEXT NOT NULL, -- 'wall_of_impact', 'village_builder', 'civic_hero', 'top_donor'
  recognition_title TEXT NOT NULL,
  recognition_description TEXT,
  recognition_period TEXT, -- 'monthly', 'quarterly', 'yearly', 'lifetime'
  ranking_position INTEGER,
  total_contribution_fcfa BIGINT,
  projects_supported INTEGER,
  communities_impacted INTEGER,
  recognition_date DATE NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  badge_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Diaspora events and community engagement
CREATE TABLE public.diaspora_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'town_hall', 'summit', 'roundtable', 'fundraiser', 'cultural'
  event_description TEXT NOT NULL,
  target_audience TEXT[], -- 'all_diaspora', 'specific_country', 'specific_region', 'specific_profession'
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_hours INTEGER DEFAULT 2,
  is_virtual BOOLEAN DEFAULT true,
  meeting_link TEXT,
  physical_location TEXT,
  organizer_id UUID REFERENCES auth.users(id),
  organizer_name TEXT NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  registration_required BOOLEAN DEFAULT true,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  event_status TEXT NOT NULL DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed', 'cancelled'
  recording_url TEXT,
  event_notes TEXT,
  follow_up_actions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Diaspora event registrations
CREATE TABLE public.diaspora_event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES diaspora_events(id) ON DELETE CASCADE,
  diaspora_id UUID NOT NULL REFERENCES diaspora_profiles(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attendance_status TEXT DEFAULT 'registered', -- 'registered', 'attended', 'missed', 'cancelled'
  feedback_rating INTEGER, -- 1-5 stars
  feedback_comment TEXT,
  UNIQUE(event_id, diaspora_id)
);

-- Diaspora engagement analytics
CREATE TABLE public.diaspora_engagement_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diaspora_id UUID NOT NULL REFERENCES diaspora_profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'donations', 'civic_participation', 'event_attendance', 'community_impact'
  metric_value NUMERIC NOT NULL,
  metric_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
  metric_date DATE NOT NULL,
  additional_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.diaspora_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_investment_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_recognition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_engagement_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for diaspora_profiles
CREATE POLICY "Users can view their own diaspora profile" 
ON public.diaspora_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diaspora profile" 
ON public.diaspora_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diaspora profile" 
ON public.diaspora_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view verified diaspora profiles" 
ON public.diaspora_profiles 
FOR SELECT 
USING (is_verified = true);

-- RLS Policies for diaspora_donations
CREATE POLICY "Users can view their own donations" 
ON public.diaspora_donations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM diaspora_profiles 
  WHERE diaspora_profiles.id = diaspora_donations.donor_id 
  AND diaspora_profiles.user_id = auth.uid()
));

CREATE POLICY "Users can create donations" 
ON public.diaspora_donations 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM diaspora_profiles 
  WHERE diaspora_profiles.id = diaspora_donations.donor_id 
  AND diaspora_profiles.user_id = auth.uid()
));

CREATE POLICY "Public can view non-anonymous donations" 
ON public.diaspora_donations 
FOR SELECT 
USING (is_anonymous = false AND status = 'completed');

-- RLS Policies for diaspora_investment_projects
CREATE POLICY "Public can view verified projects" 
ON public.diaspora_investment_projects 
FOR SELECT 
USING (verification_status = 'verified');

CREATE POLICY "Users can create projects" 
ON public.diaspora_investment_projects 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project creators can update their projects" 
ON public.diaspora_investment_projects 
FOR UPDATE 
USING (auth.uid() = created_by);

-- RLS Policies for diaspora_recognition
CREATE POLICY "Public can view diaspora recognition" 
ON public.diaspora_recognition 
FOR SELECT 
USING (true);

-- RLS Policies for diaspora_events
CREATE POLICY "Public can view diaspora events" 
ON public.diaspora_events 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create events" 
ON public.diaspora_events 
FOR INSERT 
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Event organizers can update their events" 
ON public.diaspora_events 
FOR UPDATE 
USING (auth.uid() = organizer_id);

-- RLS Policies for diaspora_event_registrations
CREATE POLICY "Users can view their own registrations" 
ON public.diaspora_event_registrations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM diaspora_profiles 
  WHERE diaspora_profiles.id = diaspora_event_registrations.diaspora_id 
  AND diaspora_profiles.user_id = auth.uid()
));

CREATE POLICY "Users can register for events" 
ON public.diaspora_event_registrations 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM diaspora_profiles 
  WHERE diaspora_profiles.id = diaspora_event_registrations.diaspora_id 
  AND diaspora_profiles.user_id = auth.uid()
));

-- RLS Policies for diaspora_engagement_metrics
CREATE POLICY "Users can view their own metrics" 
ON public.diaspora_engagement_metrics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM diaspora_profiles 
  WHERE diaspora_profiles.id = diaspora_engagement_metrics.diaspora_id 
  AND diaspora_profiles.user_id = auth.uid()
));

-- Admin policies for all tables
CREATE POLICY "Admins can manage all diaspora data" 
ON public.diaspora_profiles 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'
));

CREATE POLICY "Admins can manage all donations" 
ON public.diaspora_donations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'
));

CREATE POLICY "Admins can manage all projects" 
ON public.diaspora_investment_projects 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'
));

CREATE POLICY "Admins can manage all events" 
ON public.diaspora_events 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'
));

-- Functions for diaspora analytics
CREATE OR REPLACE FUNCTION public.calculate_diaspora_impact_score(p_diaspora_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_donations BIGINT := 0;
  projects_supported INTEGER := 0;
  event_participation INTEGER := 0;
  impact_score NUMERIC := 0;
BEGIN
  -- Calculate total donations
  SELECT COALESCE(SUM(amount_fcfa), 0) INTO total_donations
  FROM diaspora_donations 
  WHERE donor_id = p_diaspora_id AND status = 'completed';
  
  -- Count projects supported
  SELECT COUNT(DISTINCT target_id) INTO projects_supported
  FROM diaspora_donations 
  WHERE donor_id = p_diaspora_id AND target_type = 'project' AND status = 'completed';
  
  -- Count event participation
  SELECT COUNT(*) INTO event_participation
  FROM diaspora_event_registrations 
  WHERE diaspora_id = p_diaspora_id AND attendance_status = 'attended';
  
  -- Calculate impact score (weighted formula)
  impact_score := (
    (total_donations / 1000000.0) * 0.5 +  -- Donations weight: 50%
    projects_supported * 0.3 +             -- Projects weight: 30%
    event_participation * 0.2              -- Events weight: 20%
  );
  
  RETURN impact_score;
END;
$$;

-- Function to update diaspora recognition
CREATE OR REPLACE FUNCTION public.update_diaspora_recognition()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  diaspora_record RECORD;
  current_month TEXT;
BEGIN
  current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Clear existing monthly recognitions
  DELETE FROM diaspora_recognition 
  WHERE recognition_period = 'monthly' 
  AND recognition_date = CURRENT_DATE;
  
  -- Calculate top donors for the month
  FOR diaspora_record IN
    SELECT 
      dp.id,
      dp.full_name,
      SUM(dd.amount_fcfa) as total_donated,
      COUNT(DISTINCT dd.target_id) as projects_supported
    FROM diaspora_profiles dp
    JOIN diaspora_donations dd ON dp.id = dd.donor_id
    WHERE dd.status = 'completed'
    AND DATE_TRUNC('month', dd.completed_at) = DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY dp.id, dp.full_name
    ORDER BY total_donated DESC
    LIMIT 10
  LOOP
    INSERT INTO diaspora_recognition (
      diaspora_id,
      recognition_type,
      recognition_title,
      recognition_description,
      recognition_period,
      ranking_position,
      total_contribution_fcfa,
      projects_supported,
      recognition_date
    ) VALUES (
      diaspora_record.id,
      'wall_of_impact',
      'Top Monthly Contributor',
      'Recognized for outstanding contribution to community development',
      'monthly',
      (SELECT COUNT(*) FROM diaspora_recognition 
       WHERE recognition_period = 'monthly' 
       AND recognition_date = CURRENT_DATE) + 1,
      diaspora_record.total_donated,
      diaspora_record.projects_supported,
      CURRENT_DATE
    );
  END LOOP;
END;
$$;

-- Triggers
CREATE OR REPLACE FUNCTION public.update_diaspora_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_diaspora_profiles_updated_at
  BEFORE UPDATE ON public.diaspora_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_diaspora_updated_at();

CREATE TRIGGER update_diaspora_investment_projects_updated_at
  BEFORE UPDATE ON public.diaspora_investment_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_diaspora_updated_at();

CREATE TRIGGER update_diaspora_events_updated_at
  BEFORE UPDATE ON public.diaspora_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_diaspora_updated_at();