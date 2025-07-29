-- Enhance political parties table with new fields
ALTER TABLE public.political_parties 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS headquarters_address text,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS official_website text,
ADD COLUMN IF NOT EXISTS mission_statement text,
ADD COLUMN IF NOT EXISTS vision_statement text,
ADD COLUMN IF NOT EXISTS ideology text,
ADD COLUMN IF NOT EXISTS party_history jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS public_promises jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_claimable boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_claimed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS claim_fee_paid boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS claim_payment_reference text,
ADD COLUMN IF NOT EXISTS claim_documents_url text[],
ADD COLUMN IF NOT EXISTS claim_status text DEFAULT 'unclaimed',
ADD COLUMN IF NOT EXISTS verification_notes text,
ADD COLUMN IF NOT EXISTS auto_imported boolean DEFAULT false;

-- Add check constraint for claim_status
ALTER TABLE public.political_parties 
ADD CONSTRAINT IF NOT EXISTS chk_party_claim_status 
CHECK (claim_status IN ('unclaimed', 'pending', 'approved', 'rejected'));

-- Enhance politicians table with new fields  
ALTER TABLE public.politicians 
ADD COLUMN IF NOT EXISTS profile_image_url text,
ADD COLUMN IF NOT EXISTS biography text,
ADD COLUMN IF NOT EXISTS term_start_date date,
ADD COLUMN IF NOT EXISTS term_end_date date,
ADD COLUMN IF NOT EXISTS campaign_promises jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS performance_score numeric(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_claimable boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_claimed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS claim_fee_paid boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS claim_payment_reference text,
ADD COLUMN IF NOT EXISTS claim_documents_url text[],
ADD COLUMN IF NOT EXISTS claim_status text DEFAULT 'unclaimed',
ADD COLUMN IF NOT EXISTS verification_notes text,
ADD COLUMN IF NOT EXISTS auto_imported boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS timeline_events jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS contact_details jsonb DEFAULT '{}'::jsonb;

-- Add check constraint for politician claim_status
ALTER TABLE public.politicians 
ADD CONSTRAINT IF NOT EXISTS chk_politician_claim_status 
CHECK (claim_status IN ('unclaimed', 'pending', 'approved', 'rejected'));