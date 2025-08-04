-- Create expert profiles table
CREATE TABLE public.expert_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  professional_title TEXT NOT NULL,
  bio TEXT,
  hourly_rate_min INTEGER,
  hourly_rate_max INTEGER,
  currency TEXT DEFAULT 'FCFA',
  availability TEXT CHECK (availability IN ('available', 'busy', 'not_available')) DEFAULT 'available',
  work_preference TEXT[] DEFAULT ARRAY['remote'],
  expertise_areas TEXT[] NOT NULL DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT ARRAY['English', 'French'],
  years_experience INTEGER DEFAULT 0,
  education JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  portfolio_items JSONB DEFAULT '[]',
  location TEXT,
  region TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  payment_status TEXT DEFAULT 'pending',
  featured_until TIMESTAMPTZ,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_projects INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  response_time_hours INTEGER DEFAULT 24,
  profile_completion INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expert_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view active expert profiles" 
ON public.expert_profiles 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can manage their own expert profile" 
ON public.expert_profiles 
FOR ALL 
USING (auth.uid() = user_id);

-- Create expert reviews table
CREATE TABLE public.expert_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID REFERENCES public.expert_profiles(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  skills_rating INTEGER CHECK (skills_rating >= 1 AND skills_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  deadline_rating INTEGER CHECK (deadline_rating >= 1 AND deadline_rating <= 5),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view public reviews" 
ON public.expert_reviews 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can manage reviews they created" 
ON public.expert_reviews 
FOR ALL 
USING (auth.uid() = reviewer_id);

-- Create project proposals table
CREATE TABLE public.project_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID REFERENCES public.expert_profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_title TEXT NOT NULL,
  project_description TEXT NOT NULL,
  proposed_rate INTEGER NOT NULL,
  currency TEXT DEFAULT 'FCFA',
  rate_type TEXT CHECK (rate_type IN ('hourly', 'fixed', 'daily', 'weekly', 'monthly')) DEFAULT 'fixed',
  estimated_duration TEXT,
  proposal_text TEXT NOT NULL,
  attachments TEXT[],
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_proposals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Experts can view proposals they created" 
ON public.project_proposals 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM expert_profiles WHERE id = expert_id));

CREATE POLICY "Clients can view proposals for their projects" 
ON public.project_proposals 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Experts can create proposals" 
ON public.project_proposals 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM expert_profiles WHERE id = expert_id));

CREATE POLICY "Users can update their own proposals" 
ON public.project_proposals 
FOR UPDATE 
USING (auth.uid() = client_id OR auth.uid() = (SELECT user_id FROM expert_profiles WHERE id = expert_id));

-- Create project requests table (clients posting projects)
CREATE TABLE public.project_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  currency TEXT DEFAULT 'FCFA',
  budget_type TEXT CHECK (budget_type IN ('hourly', 'fixed', 'daily', 'weekly', 'monthly')) DEFAULT 'fixed',
  duration_estimate TEXT,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  experience_level TEXT CHECK (experience_level IN ('entry_level', 'mid_level', 'senior_level', 'expert_level')) DEFAULT 'mid_level',
  location_requirement TEXT,
  is_remote BOOLEAN DEFAULT true,
  deadline TIMESTAMPTZ,
  attachments TEXT[],
  proposals_count INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view open project requests" 
ON public.project_requests 
FOR SELECT 
USING (status = 'open');

CREATE POLICY "Clients can manage their project requests" 
ON public.project_requests 
FOR ALL 
USING (auth.uid() = client_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_expert_profiles_updated_at BEFORE UPDATE ON public.expert_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expert_reviews_updated_at BEFORE UPDATE ON public.expert_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_proposals_updated_at BEFORE UPDATE ON public.project_proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_requests_updated_at BEFORE UPDATE ON public.project_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();