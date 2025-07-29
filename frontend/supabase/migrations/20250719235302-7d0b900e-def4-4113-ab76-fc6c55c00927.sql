-- Create the main institutions table
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
  listing_type TEXT NOT NULL,
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
ALTER TABLE public.village_data ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Everyone can view institutions" 
ON public.institutions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create institutions" 
ON public.institutions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their sponsored listings" 
ON public.sponsored_listings 
FOR ALL 
USING (sponsor_user_id = auth.uid());

CREATE POLICY "Everyone can view village data" 
ON public.village_data 
FOR SELECT 
USING (true);