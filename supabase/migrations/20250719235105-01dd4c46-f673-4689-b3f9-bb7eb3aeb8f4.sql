-- Create tables for directory system (without recreating enum)

-- Main institutions table
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type institution_type NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  region TEXT,
  city TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_sponsored BOOLEAN NOT NULL DEFAULT false,
  sponsored_until TIMESTAMP WITH TIME ZONE,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verification_documents TEXT[],
  average_rating NUMERIC(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  claimed_by UUID,
  claim_status TEXT DEFAULT 'unclaimed',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Institution claims table
CREATE TABLE IF NOT EXISTS public.institution_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  claimant_id UUID NOT NULL,
  claim_evidence TEXT[],
  claim_reason TEXT,
  admin_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sponsored listings table
CREATE TABLE IF NOT EXISTS public.sponsored_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  sponsor_user_id UUID NOT NULL,
  listing_type TEXT NOT NULL, -- 'homepage_banner', 'top_of_search', 'map_pin_priority'
  duration_days INTEGER NOT NULL,
  amount_paid DECIMAL(10,2),
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  analytics_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Moderation assignments table
CREATE TABLE IF NOT EXISTS public.moderation_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moderator_id UUID NOT NULL,
  institution_type institution_type,
  region TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  assigned_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Moderation actions table
CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moderator_id UUID NOT NULL,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL, -- 'institution', 'review', 'claim'
  action_type TEXT NOT NULL, -- 'verify', 'flag', 'approve', 'reject', 'edit'
  action_details JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Village specific data
CREATE TABLE IF NOT EXISTS public.village_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  chief_name TEXT,
  chief_contact TEXT,
  population INTEGER,
  development_score INTEGER DEFAULT 0,
  culture_score INTEGER DEFAULT 0,
  education_score INTEGER DEFAULT 0,
  conflict_resolution_score INTEGER DEFAULT 0,
  heritage_info TEXT,
  major_projects TEXT[],
  fundraising_campaigns JSONB DEFAULT '[]',
  petitions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institutions
CREATE POLICY "Everyone can view verified institutions" 
ON public.institutions 
FOR SELECT 
USING (verification_status = 'verified' OR is_verified = true);

CREATE POLICY "Users can create institutions" 
ON public.institutions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Claimed institutions can be updated by owners" 
ON public.institutions 
FOR UPDATE 
USING (claimed_by = auth.uid());

CREATE POLICY "Moderators can manage institutions" 
ON public.institutions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
));

-- RLS Policies for claims
CREATE POLICY "Users can create claims" 
ON public.institution_claims 
FOR INSERT 
WITH CHECK (claimant_id = auth.uid());

CREATE POLICY "Users can view their own claims" 
ON public.institution_claims 
FOR SELECT 
USING (claimant_id = auth.uid());

CREATE POLICY "Moderators can manage claims" 
ON public.institution_claims 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
));

-- RLS Policies for sponsored listings
CREATE POLICY "Users can manage their sponsored listings" 
ON public.sponsored_listings 
FOR ALL 
USING (sponsor_user_id = auth.uid());

CREATE POLICY "Everyone can view active sponsored listings" 
ON public.sponsored_listings 
FOR SELECT 
USING (is_active = true AND expires_at > now());

-- RLS Policies for moderation
CREATE POLICY "Moderators can view assignments" 
ON public.moderation_assignments 
FOR SELECT 
USING (moderator_id = auth.uid() OR EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can manage assignments" 
ON public.moderation_assignments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Moderators can create actions" 
ON public.moderation_actions 
FOR INSERT 
WITH CHECK (moderator_id = auth.uid() AND EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
));

CREATE POLICY "Moderators can view actions" 
ON public.moderation_actions 
FOR SELECT 
USING (moderator_id = auth.uid() OR EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for village data
CREATE POLICY "Everyone can view village data" 
ON public.village_data 
FOR SELECT 
USING (true);

CREATE POLICY "Village owners can update data" 
ON public.village_data 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.institutions 
  WHERE id = village_data.institution_id 
  AND claimed_by = auth.uid()
));

CREATE POLICY "Moderators can manage village data" 
ON public.village_data 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_institutions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_institutions_updated_at
  BEFORE UPDATE ON public.institutions
  FOR EACH ROW
  EXECUTE FUNCTION update_institutions_updated_at();

CREATE TRIGGER update_institution_claims_updated_at
  BEFORE UPDATE ON public.institution_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_institutions_updated_at();

CREATE TRIGGER update_sponsored_listings_updated_at
  BEFORE UPDATE ON public.sponsored_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_institutions_updated_at();

CREATE TRIGGER update_village_data_updated_at
  BEFORE UPDATE ON public.village_data
  FOR EACH ROW
  EXECUTE FUNCTION update_institutions_updated_at();