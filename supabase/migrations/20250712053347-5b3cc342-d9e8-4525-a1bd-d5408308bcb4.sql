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

-- Create party claims table
CREATE TABLE IF NOT EXISTS public.party_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES public.political_parties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claim_fee_amount numeric NOT NULL DEFAULT 1000000,
  payment_method text,
  payment_reference text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  documents_uploaded text[],
  admin_notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES auth.users(id)
);

-- Create politician claims table
CREATE TABLE IF NOT EXISTS public.politician_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id uuid NOT NULL REFERENCES public.politicians(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claim_fee_amount numeric NOT NULL DEFAULT 500000,
  payment_method text,
  payment_reference text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  documents_uploaded text[],
  admin_notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES auth.users(id)
);