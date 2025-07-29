-- Create enums for the brand ambassador system
CREATE TYPE brand_ambassador_status AS ENUM ('available', 'not_available', 'negotiable');
CREATE TYPE company_size AS ENUM ('startup', 'sme', 'large_corp');
CREATE TYPE campaign_type AS ENUM ('event', 'product_launch', 'awareness', 'sponsorship', 'content_creation');
CREATE TYPE connection_status AS ENUM ('pending', 'paid', 'connected', 'completed', 'cancelled');
CREATE TYPE contract_type AS ENUM ('branding', 'exclusivity', 'nda', 'general');

-- Artist branding profiles table
CREATE TABLE public.artist_branding_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL,
  user_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  branding_status brand_ambassador_status NOT NULL DEFAULT 'available',
  
  -- Current and past brands
  current_brands JSONB DEFAULT '[]'::jsonb, -- [{name, logo_url, website}]
  past_partnerships JSONB DEFAULT '[]'::jsonb, -- [{name, year, description, proof_url}]
  
  -- Audience and interests
  audience_types TEXT[] NOT NULL DEFAULT '{}', -- Youth, Women, Musicians, etc.
  industry_interests TEXT[] NOT NULL DEFAULT '{}', -- Fashion, Telecom, etc.
  
  -- Conditions and pricing
  minimum_contract_weeks INTEGER,
  minimum_fee_fcfa BIGINT,
  preferred_regions TEXT[] NOT NULL DEFAULT '{}', -- National, Local, International
  exclusivity_available BOOLEAN DEFAULT false,
  expected_deliverables TEXT[] DEFAULT '{}', -- posting, appearances, photoshoots
  
  -- Additional info
  bio_ambassador TEXT,
  media_kit_url TEXT,
  portfolio_links JSONB DEFAULT '[]'::jsonb,
  
  -- Stats
  total_connections INTEGER DEFAULT 0,
  total_campaigns INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Brand ambassador connection requests
CREATE TABLE public.brand_ambassador_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_profile_id UUID NOT NULL REFERENCES public.artist_branding_profiles(id) ON DELETE CASCADE,
  
  -- Company information
  company_name TEXT NOT NULL,
  company_email TEXT NOT NULL,
  company_website TEXT,
  company_size company_size NOT NULL,
  company_description TEXT,
  
  -- Campaign details
  campaign_type campaign_type NOT NULL,
  campaign_description TEXT NOT NULL,
  campaign_duration_weeks INTEGER,
  budget_range_min BIGINT,
  budget_range_max BIGINT,
  target_regions TEXT[] DEFAULT '{}',
  expected_deliverables TEXT[] DEFAULT '{}',
  
  -- Connection process
  connection_fee_fcfa BIGINT NOT NULL,
  status connection_status NOT NULL DEFAULT 'pending',
  payment_intent_id TEXT,
  
  -- Communication
  initial_message TEXT,
  artist_contacted_at TIMESTAMP WITH TIME ZONE,
  company_notified_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Brand ambassador connections (after payment)
CREATE TABLE public.brand_ambassador_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.brand_ambassador_requests(id) ON DELETE CASCADE,
  artist_profile_id UUID NOT NULL REFERENCES public.artist_branding_profiles(id) ON DELETE CASCADE,
  
  -- Contact information revealed after payment
  artist_contact_email TEXT,
  artist_contact_phone TEXT,
  company_contact_email TEXT,
  company_contact_phone TEXT,
  
  -- Contract and collaboration
  contract_signed BOOLEAN DEFAULT false,
  contract_url TEXT,
  campaign_started_at TIMESTAMP WITH TIME ZONE,
  campaign_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Final status
  campaign_success BOOLEAN,
  final_amount_paid BIGINT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ratings and reviews
CREATE TABLE public.brand_ambassador_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES public.brand_ambassador_connections(id) ON DELETE CASCADE,
  artist_profile_id UUID NOT NULL REFERENCES public.artist_branding_profiles(id) ON DELETE CASCADE,
  
  -- Ratings (1-5 scale)
  artist_rating INTEGER CHECK (artist_rating >= 1 AND artist_rating <= 5),
  company_rating INTEGER CHECK (company_rating >= 1 AND company_rating <= 5),
  
  -- Reviews
  artist_review TEXT,
  company_review TEXT,
  
  -- Who can see what
  artist_review_public BOOLEAN DEFAULT true,
  company_review_public BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contract templates
CREATE TABLE public.brand_ambassador_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  contract_type contract_type NOT NULL,
  template_content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Customization
  variables JSONB DEFAULT '[]'::jsonb, -- [{name, description, type}]
  
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.artist_branding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_ambassador_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_ambassador_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_ambassador_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_ambassador_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artist_branding_profiles
CREATE POLICY "Artists can manage their own branding profiles"
ON public.artist_branding_profiles
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Public can view active branding profiles"
ON public.artist_branding_profiles
FOR SELECT
USING (is_active = true);

-- RLS Policies for brand_ambassador_requests
CREATE POLICY "Companies can create requests"
ON public.brand_ambassador_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Artists can view requests for their profiles"
ON public.brand_ambassador_requests
FOR SELECT
USING (
  artist_profile_id IN (
    SELECT id FROM public.artist_branding_profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all requests"
ON public.brand_ambassador_requests
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- RLS Policies for brand_ambassador_connections
CREATE POLICY "Artists can view their connections"
ON public.brand_ambassador_connections
FOR SELECT
USING (
  artist_profile_id IN (
    SELECT id FROM public.artist_branding_profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all connections"
ON public.brand_ambassador_connections
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- RLS Policies for brand_ambassador_ratings
CREATE POLICY "Artists can manage ratings for their connections"
ON public.brand_ambassador_ratings
FOR ALL
USING (
  artist_profile_id IN (
    SELECT id FROM public.artist_branding_profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Public can view public ratings"
ON public.brand_ambassador_ratings
FOR SELECT
USING (artist_review_public = true OR company_review_public = true);

-- RLS Policies for brand_ambassador_contracts
CREATE POLICY "Everyone can view active contracts"
ON public.brand_ambassador_contracts
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage contracts"
ON public.brand_ambassador_contracts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_artist_branding_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.artist_branding_profiles 
  SET 
    total_connections = (
      SELECT COUNT(*) FROM public.brand_ambassador_connections 
      WHERE artist_profile_id = NEW.artist_profile_id
    ),
    average_rating = (
      SELECT COALESCE(AVG(company_rating), 0) 
      FROM public.brand_ambassador_ratings 
      WHERE artist_profile_id = NEW.artist_profile_id
    ),
    updated_at = now()
  WHERE id = NEW.artist_profile_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_stats_on_connection
AFTER INSERT ON public.brand_ambassador_connections
FOR EACH ROW
EXECUTE FUNCTION update_artist_branding_profile_stats();

CREATE TRIGGER update_profile_stats_on_rating
AFTER INSERT OR UPDATE ON public.brand_ambassador_ratings
FOR EACH ROW
EXECUTE FUNCTION update_artist_branding_profile_stats();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_brand_ambassador_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_artist_branding_profiles_timestamp
BEFORE UPDATE ON public.artist_branding_profiles
FOR EACH ROW
EXECUTE FUNCTION update_brand_ambassador_timestamp();

CREATE TRIGGER update_brand_ambassador_requests_timestamp
BEFORE UPDATE ON public.brand_ambassador_requests
FOR EACH ROW
EXECUTE FUNCTION update_brand_ambassador_timestamp();

CREATE TRIGGER update_brand_ambassador_connections_timestamp
BEFORE UPDATE ON public.brand_ambassador_connections
FOR EACH ROW
EXECUTE FUNCTION update_brand_ambassador_timestamp();

CREATE TRIGGER update_brand_ambassador_contracts_timestamp
BEFORE UPDATE ON public.brand_ambassador_contracts
FOR EACH ROW
EXECUTE FUNCTION update_brand_ambassador_timestamp();

-- Insert default contract templates
INSERT INTO public.brand_ambassador_contracts (template_name, contract_type, template_content, is_default, variables) VALUES
('Standard Branding Agreement', 'branding', 
'BRAND AMBASSADOR AGREEMENT

This agreement is between {{company_name}} and {{artist_name}} for brand ambassador services.

TERMS:
- Duration: {{contract_duration}} weeks
- Fee: {{ambassador_fee}} FCFA
- Region: {{target_regions}}
- Deliverables: {{deliverables}}

RESPONSIBILITIES:
Artist agrees to:
- Represent the brand professionally
- Create content as specified
- Maintain brand image standards

Company agrees to:
- Pay agreed fee on time
- Provide necessary brand materials
- Respect artist''s creative input

EXCLUSIVITY: {{exclusivity_clause}}

Both parties agree to the terms outlined above.

Signatures:
Artist: ______________________
Company: ____________________
Date: _______________________',
true,
'[
  {"name": "company_name", "description": "Company Name", "type": "text"},
  {"name": "artist_name", "description": "Artist Name", "type": "text"},
  {"name": "contract_duration", "description": "Contract Duration (weeks)", "type": "number"},
  {"name": "ambassador_fee", "description": "Ambassador Fee (FCFA)", "type": "number"},
  {"name": "target_regions", "description": "Target Regions", "type": "text"},
  {"name": "deliverables", "description": "Expected Deliverables", "type": "text"},
  {"name": "exclusivity_clause", "description": "Exclusivity Terms", "type": "text"}
]'::jsonb),

('Non-Disclosure Agreement', 'nda',
'NON-DISCLOSURE AGREEMENT

This NDA is between {{company_name}} and {{artist_name}}.

CONFIDENTIAL INFORMATION:
Both parties agree to keep confidential any proprietary information shared during collaboration.

TERM: This agreement remains in effect for {{nda_duration}} months.

EXCEPTIONS: Public information and independently developed information are excluded.

Signatures:
Artist: ______________________
Company: ____________________
Date: _______________________',
true,
'[
  {"name": "company_name", "description": "Company Name", "type": "text"},
  {"name": "artist_name", "description": "Artist Name", "type": "text"},
  {"name": "nda_duration", "description": "NDA Duration (months)", "type": "number"}
]'::jsonb);

-- Calculate connection fees function
CREATE OR REPLACE FUNCTION calculate_connection_fee(
  p_company_size company_size,
  p_campaign_type campaign_type
) RETURNS BIGINT AS $$
DECLARE
  base_fee BIGINT;
  multiplier NUMERIC := 1.0;
BEGIN
  -- Base fees by company size (in FCFA)
  CASE p_company_size
    WHEN 'startup' THEN base_fee := 25000; -- 25k FCFA
    WHEN 'sme' THEN base_fee := 50000;     -- 50k FCFA  
    WHEN 'large_corp' THEN base_fee := 100000; -- 100k FCFA
  END CASE;
  
  -- Campaign type multipliers
  CASE p_campaign_type
    WHEN 'event' THEN multiplier := 1.0;
    WHEN 'product_launch' THEN multiplier := 1.5;
    WHEN 'awareness' THEN multiplier := 1.2;
    WHEN 'sponsorship' THEN multiplier := 2.0;
    WHEN 'content_creation' THEN multiplier := 1.3;
  END CASE;
  
  RETURN (base_fee * multiplier)::BIGINT;
END;
$$ LANGUAGE plpgsql;