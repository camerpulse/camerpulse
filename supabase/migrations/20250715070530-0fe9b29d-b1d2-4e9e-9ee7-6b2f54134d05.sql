-- Face Verification Engine Database Schema

-- Create image verification table
CREATE TABLE public.politician_image_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id uuid NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  image_url text,
  verification_status text NOT NULL DEFAULT 'pending',
  confidence_score numeric(4,2),
  verification_method text,
  source_type text,
  source_url text,
  admin_reviewed boolean DEFAULT false,
  admin_notes text,
  flagged_by_users text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  verified_by uuid,
  verified_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.politician_image_verifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Image verifications are publicly readable" 
ON public.politician_image_verifications FOR SELECT USING (true);

CREATE POLICY "Admins can manage image verifications" 
ON public.politician_image_verifications FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Add verification fields to politicians table
ALTER TABLE public.politicians 
ADD COLUMN IF NOT EXISTS image_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS image_confidence_score numeric(4,2),
ADD COLUMN IF NOT EXISTS image_last_verified timestamp with time zone,
ADD COLUMN IF NOT EXISTS image_verification_id uuid REFERENCES politician_image_verifications(id);

-- Add verification fields to political_parties table for logos
ALTER TABLE public.political_parties 
ADD COLUMN IF NOT EXISTS logo_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS logo_confidence_score numeric(4,2),
ADD COLUMN IF NOT EXISTS logo_last_verified timestamp with time zone;

-- Create party logo verification table
CREATE TABLE public.party_logo_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES political_parties(id) ON DELETE CASCADE,
  logo_url text,
  verification_status text NOT NULL DEFAULT 'pending',
  confidence_score numeric(4,2),
  source_type text,
  source_url text,
  admin_reviewed boolean DEFAULT false,
  admin_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  verified_by uuid,
  verified_at timestamp with time zone
);

-- Enable RLS for party logos
ALTER TABLE public.party_logo_verifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for party logos
CREATE POLICY "Logo verifications are publicly readable" 
ON public.party_logo_verifications FOR SELECT USING (true);

CREATE POLICY "Admins can manage logo verifications" 
ON public.party_logo_verifications FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create verification audit log
CREATE TABLE public.image_verification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action_type text NOT NULL,
  old_status text,
  new_status text,
  confidence_change numeric(4,2),
  performed_by uuid,
  admin_notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for audit logs
ALTER TABLE public.image_verification_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit logs
CREATE POLICY "Verification logs are admin only" 
ON public.image_verification_logs FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create function to update verification timestamps
CREATE OR REPLACE FUNCTION public.update_image_verification_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_politician_image_verifications_updated_at
  BEFORE UPDATE ON public.politician_image_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_image_verification_updated_at();

CREATE TRIGGER update_party_logo_verifications_updated_at
  BEFORE UPDATE ON public.party_logo_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_image_verification_updated_at();

-- Create indexes for performance
CREATE INDEX idx_politician_image_verifications_politician_id ON public.politician_image_verifications(politician_id);
CREATE INDEX idx_politician_image_verifications_status ON public.politician_image_verifications(verification_status);
CREATE INDEX idx_party_logo_verifications_party_id ON public.party_logo_verifications(party_id);
CREATE INDEX idx_image_verification_logs_entity ON public.image_verification_logs(entity_type, entity_id);

-- Create verification status enum for consistency
CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected', 'flagged', 'missing');

-- Update tables to use enum (optional, for better data consistency)
-- ALTER TABLE public.politician_image_verifications ALTER COLUMN verification_status TYPE verification_status_enum USING verification_status::verification_status_enum;