-- Create claim institution system tables (handling existing enum)

-- Create enum for institution types (only if not exists)
DO $$ BEGIN
    CREATE TYPE institution_type AS ENUM ('school', 'hospital', 'pharmacy', 'village', 'government', 'business');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create institutions table
CREATE TABLE public.institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  institution_type institution_type NOT NULL,
  description TEXT,
  location TEXT,
  region TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  coordinates JSONB,
  website_url TEXT,
  social_media_links JSONB DEFAULT '{}',
  operating_hours JSONB DEFAULT '{}',
  services_offered TEXT[],
  verification_status TEXT DEFAULT 'unverified',
  verification_date TIMESTAMP WITH TIME ZONE,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claim_verified_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create institution claims table
CREATE TABLE public.institution_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  claimant_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claimant_full_name TEXT NOT NULL,
  claimant_email TEXT NOT NULL,
  claimant_phone TEXT,
  position_or_relationship TEXT NOT NULL,
  supporting_explanation TEXT,
  proof_documents JSONB DEFAULT '[]',
  claim_status claim_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  rejection_reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '1 year'),
  is_renewable BOOLEAN DEFAULT true,
  renewal_reminder_sent BOOLEAN DEFAULT false,
  flagged_as_fake BOOLEAN DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create claim verification history table
CREATE TABLE public.institution_claim_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID NOT NULL REFERENCES public.institution_claims(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  old_status claim_status,
  new_status claim_status,
  performed_by UUID REFERENCES auth.users(id),
  action_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create claim notifications table
CREATE TABLE public.institution_claim_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID NOT NULL REFERENCES public.institution_claims(id) ON DELETE CASCADE,
  recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_institutions_type ON public.institutions(institution_type);
CREATE INDEX idx_institutions_region ON public.institutions(region);
CREATE INDEX idx_institutions_claimed_by ON public.institutions(claimed_by);
CREATE INDEX idx_institution_claims_status ON public.institution_claims(claim_status);
CREATE INDEX idx_institution_claims_claimant ON public.institution_claims(claimant_user_id);
CREATE INDEX idx_institution_claims_institution ON public.institution_claims(institution_id);
CREATE INDEX idx_claim_notifications_recipient ON public.institution_claim_notifications(recipient_user_id, is_read);

-- Enable RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_claim_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_claim_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institutions
CREATE POLICY "Institutions are viewable by everyone" 
ON public.institutions FOR SELECT USING (true);

CREATE POLICY "Verified owners can update their institutions" 
ON public.institutions FOR UPDATE USING (auth.uid() = claimed_by AND claim_verified_at IS NOT NULL);

CREATE POLICY "Admins can manage all institutions" 
ON public.institutions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for institution claims
CREATE POLICY "Users can view their own claims" 
ON public.institution_claims FOR SELECT USING (auth.uid() = claimant_user_id);

CREATE POLICY "Users can create claims" 
ON public.institution_claims FOR INSERT WITH CHECK (auth.uid() = claimant_user_id);

CREATE POLICY "Users can update their pending claims" 
ON public.institution_claims FOR UPDATE USING (
  auth.uid() = claimant_user_id AND claim_status = 'pending'
);

CREATE POLICY "Admins and moderators can view all claims" 
ON public.institution_claims FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Admins and moderators can update claims" 
ON public.institution_claims FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- RLS Policies for claim history
CREATE POLICY "Claim history viewable by claimants and moderators" 
ON public.institution_claim_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.institution_claims ic WHERE ic.id = claim_id AND ic.claimant_user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- RLS Policies for claim notifications
CREATE POLICY "Users can view their own claim notifications" 
ON public.institution_claim_notifications FOR ALL USING (auth.uid() = recipient_user_id);

-- Insert sample institutions
INSERT INTO public.institutions (name, institution_type, description, location, region, contact_email, services_offered) VALUES
('University of Yaoundé I', 'school', 'Premier public university in Cameroon', 'Yaoundé', 'Centre', 'info@uy1.uninet.cm', ARRAY['Higher Education', 'Research', 'Student Services']),
('Yaoundé Central Hospital', 'hospital', 'Main referral hospital in Yaoundé', 'Yaoundé', 'Centre', 'info@hcy.cm', ARRAY['Emergency Care', 'Surgery', 'Specialized Medicine']),
('Pharmacie du Centre', 'pharmacy', 'Central pharmacy in Yaoundé', 'Yaoundé', 'Centre', 'contact@pharmaciecentre.cm', ARRAY['Prescription Drugs', 'Medical Supplies', 'Consultation']),
('Mvog-Mbi Village', 'village', 'Traditional village in Centre region', 'Mvog-Mbi', 'Centre', 'chief@mvogmbi.cm', ARRAY['Traditional Governance', 'Cultural Events', 'Community Services']),
('Douala General Hospital', 'hospital', 'Major hospital in economic capital', 'Douala', 'Littoral', 'contact@hgd.cm', ARRAY['Emergency Care', 'Maternity', 'Pediatrics']),
('University of Douala', 'school', 'Public university in Douala', 'Douala', 'Littoral', 'info@univ-douala.cm', ARRAY['Engineering', 'Medicine', 'Business Studies']);