-- Create enum for wealth sources
CREATE TYPE wealth_source AS ENUM (
  'technology',
  'oil_gas',
  'real_estate', 
  'banking_finance',
  'agriculture',
  'mining',
  'telecommunications',
  'manufacturing',
  'retail_trade',
  'construction',
  'entertainment',
  'healthcare',
  'logistics',
  'other'
);

-- Create enum for application tiers
CREATE TYPE application_tier AS ENUM (
  'bronze',    -- 10M-50M FCFA
  'silver',    -- 50M-500M FCFA  
  'gold'       -- 500M+ FCFA
);

-- Create billionaires table
CREATE TABLE public.billionaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  profile_picture_url TEXT,
  company_affiliation TEXT,
  wealth_source wealth_source NOT NULL,
  verified_net_worth_fcfa BIGINT NOT NULL, -- in FCFA
  net_worth_usd BIGINT, -- auto-calculated equivalent
  region TEXT NOT NULL,
  biography TEXT,
  business_investments TEXT[],
  contact_info TEXT,
  media_profiles JSONB DEFAULT '{}',
  social_media_handles JSONB DEFAULT '{}',
  
  -- Admin verification
  is_verified BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false, -- for privacy
  display_alias TEXT, -- if anonymous
  
  -- Ranking and stats
  current_rank INTEGER,
  previous_rank INTEGER,
  year_on_year_change NUMERIC,
  profile_views INTEGER DEFAULT 0,
  
  -- Meta data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create billionaire applications table
CREATE TABLE public.billionaire_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  
  -- Application details
  claimed_net_worth_fcfa BIGINT NOT NULL,
  wealth_source wealth_source NOT NULL,
  business_background TEXT NOT NULL,
  proof_documents TEXT[], -- URLs to uploaded documents
  
  -- Payment information
  application_tier application_tier NOT NULL,
  payment_amount INTEGER NOT NULL, -- in FCFA
  payment_status TEXT DEFAULT 'pending',
  payment_reference TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Application status
  status TEXT DEFAULT 'pending', -- pending, under_review, approved, rejected
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Link to created billionaire profile (if approved)
  billionaire_id UUID REFERENCES public.billionaires(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create billionaire payments table for tracking
CREATE TABLE public.billionaire_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.billionaire_applications(id),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'FCFA',
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT DEFAULT 'pending',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.billionaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billionaire_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billionaire_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for billionaires table
CREATE POLICY "Billionaires are publicly viewable" ON public.billionaires
  FOR SELECT USING (is_verified = true);

CREATE POLICY "Admins can manage billionaires" ON public.billionaires
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for applications
CREATE POLICY "Users can view their own applications" ON public.billionaire_applications
  FOR SELECT USING (applicant_email = auth.email());

CREATE POLICY "Users can create applications" ON public.billionaire_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all applications" ON public.billionaire_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for payments
CREATE POLICY "Admins can view all payments" ON public.billionaire_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_billionaires_verified ON public.billionaires (is_verified);
CREATE INDEX idx_billionaires_rank ON public.billionaires (current_rank);
CREATE INDEX idx_billionaires_net_worth ON public.billionaires (verified_net_worth_fcfa DESC);
CREATE INDEX idx_billionaires_region ON public.billionaires (region);
CREATE INDEX idx_billionaires_wealth_source ON public.billionaires (wealth_source);

CREATE INDEX idx_applications_status ON public.billionaire_applications (status);
CREATE INDEX idx_applications_tier ON public.billionaire_applications (application_tier);
CREATE INDEX idx_applications_email ON public.billionaire_applications (applicant_email);

-- Function to calculate USD equivalent
CREATE OR REPLACE FUNCTION update_usd_equivalent()
RETURNS TRIGGER AS $$
BEGIN
  -- Assuming 1 USD = 600 FCFA (this should be updated based on real exchange rates)
  NEW.net_worth_usd = NEW.verified_net_worth_fcfa / 600;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate USD equivalent
CREATE TRIGGER update_billionaire_usd_trigger
  BEFORE INSERT OR UPDATE ON public.billionaires
  FOR EACH ROW
  EXECUTE FUNCTION update_usd_equivalent();

-- Function to update rankings
CREATE OR REPLACE FUNCTION update_billionaire_rankings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  WITH ranked_billionaires AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY verified_net_worth_fcfa DESC) as new_rank
    FROM public.billionaires 
    WHERE is_verified = true
  )
  UPDATE public.billionaires 
  SET 
    previous_rank = current_rank,
    current_rank = ranked_billionaires.new_rank,
    updated_at = now()
  FROM ranked_billionaires 
  WHERE public.billionaires.id = ranked_billionaires.id;
END;
$$;

-- Function to get billionaire statistics
CREATE OR REPLACE FUNCTION get_billionaire_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  total_billionaires integer;
  total_wealth_fcfa bigint;
  pending_applications integer;
BEGIN
  -- Count verified billionaires
  SELECT COUNT(*) INTO total_billionaires
  FROM public.billionaires 
  WHERE is_verified = true;
  
  -- Calculate total wealth
  SELECT COALESCE(SUM(verified_net_worth_fcfa), 0) INTO total_wealth_fcfa
  FROM public.billionaires 
  WHERE is_verified = true;
  
  -- Count pending applications
  SELECT COUNT(*) INTO pending_applications
  FROM public.billionaire_applications 
  WHERE status = 'pending';
  
  result := jsonb_build_object(
    'total_billionaires', total_billionaires,
    'total_wealth_fcfa', total_wealth_fcfa,
    'total_wealth_usd', total_wealth_fcfa / 600,
    'pending_applications', pending_applications,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$;

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_billionaires_updated_at 
  BEFORE UPDATE ON public.billionaires
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
  BEFORE UPDATE ON public.billionaire_applications
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();