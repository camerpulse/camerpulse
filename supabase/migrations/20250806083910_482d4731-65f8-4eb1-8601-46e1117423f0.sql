-- Create music_profile table
CREATE TABLE IF NOT EXISTS public.music_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  artist_bio TEXT,
  genres TEXT[],
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create job_profile table
CREATE TABLE IF NOT EXISTS public.job_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  work_experience JSONB DEFAULT '[]',
  resume_url TEXT,
  skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create village_membership table
CREATE TABLE IF NOT EXISTS public.village_membership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  village_id UUID,
  role_in_village TEXT,
  membership_since DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create marketplace_profile table
CREATE TABLE IF NOT EXISTS public.marketplace_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vendor_name TEXT,
  shop_description TEXT,
  product_categories TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.music_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policies for music_profile
CREATE POLICY "Music profiles are viewable by everyone" 
ON public.music_profile 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own music profile" 
ON public.music_profile 
FOR ALL 
USING (user_id IN (SELECT id FROM public.users WHERE id = auth.uid()));

-- RLS Policies for job_profile
CREATE POLICY "Job profiles are viewable by everyone" 
ON public.job_profile 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own job profile" 
ON public.job_profile 
FOR ALL 
USING (user_id IN (SELECT id FROM public.users WHERE id = auth.uid()));

-- RLS Policies for village_membership
CREATE POLICY "Village memberships are viewable by everyone" 
ON public.village_membership 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own village memberships" 
ON public.village_membership 
FOR ALL 
USING (user_id IN (SELECT id FROM public.users WHERE id = auth.uid()));

-- RLS Policies for marketplace_profile
CREATE POLICY "Marketplace profiles are viewable by everyone" 
ON public.marketplace_profile 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own marketplace profile" 
ON public.marketplace_profile 
FOR ALL 
USING (user_id IN (SELECT id FROM public.users WHERE id = auth.uid()));

-- Create triggers for updated_at columns
CREATE TRIGGER update_music_profile_updated_at
BEFORE UPDATE ON public.music_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_users_updated_at();

CREATE TRIGGER update_job_profile_updated_at
BEFORE UPDATE ON public.job_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_users_updated_at();

CREATE TRIGGER update_village_membership_updated_at
BEFORE UPDATE ON public.village_membership
FOR EACH ROW
EXECUTE FUNCTION public.update_users_updated_at();

CREATE TRIGGER update_marketplace_profile_updated_at
BEFORE UPDATE ON public.marketplace_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_users_updated_at();

-- Create indexes for performance
CREATE INDEX idx_music_profile_user_id ON public.music_profile(user_id);
CREATE INDEX idx_job_profile_user_id ON public.job_profile(user_id);
CREATE INDEX idx_village_membership_user_id ON public.village_membership(user_id);
CREATE INDEX idx_marketplace_profile_user_id ON public.marketplace_profile(user_id);