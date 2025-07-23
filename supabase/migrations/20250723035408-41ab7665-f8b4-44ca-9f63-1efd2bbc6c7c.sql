-- Phase 1: CamerTenders Monetization Foundation & Core Billing (Add Missing Parts)

-- Add missing columns to existing tender_payments table
ALTER TABLE public.tender_payments 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
ADD COLUMN IF NOT EXISTS transaction_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_gateway_response JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_reason TEXT;

-- Create enum for business verification status
DO $$ BEGIN
    CREATE TYPE business_verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create business directory integration check table
CREATE TABLE IF NOT EXISTS public.business_tender_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_id UUID REFERENCES public.companies(id),
  verification_status business_verification_status DEFAULT 'unverified',
  can_post_tenders BOOLEAN DEFAULT false,
  can_bid_on_tenders BOOLEAN DEFAULT false,
  membership_active BOOLEAN DEFAULT false,
  membership_expires_at TIMESTAMPTZ,
  last_verification_check TIMESTAMPTZ DEFAULT now(),
  verification_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tender_payments_company ON public.tender_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_business_eligibility_user ON public.business_tender_eligibility(user_id);
CREATE INDEX IF NOT EXISTS idx_business_eligibility_company ON public.business_tender_eligibility(company_id);

-- Enable RLS on new table
ALTER TABLE public.business_tender_eligibility ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_tender_eligibility
CREATE POLICY "Users can view their own eligibility" ON public.business_tender_eligibility
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their eligibility record" ON public.business_tender_eligibility
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all eligibility" ON public.business_tender_eligibility
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- Create trigger for business eligibility updated_at
CREATE TRIGGER update_business_eligibility_updated_at
  BEFORE UPDATE ON public.business_tender_eligibility
  FOR EACH ROW EXECUTE FUNCTION update_tender_updated_at();

-- Function to check business eligibility for tender actions
CREATE OR REPLACE FUNCTION check_business_tender_eligibility(p_user_id UUID, p_action TEXT)
RETURNS JSONB AS $$
DECLARE
  eligibility_record RECORD;
  company_record RECORD;
BEGIN
  -- Get eligibility record
  SELECT * INTO eligibility_record 
  FROM public.business_tender_eligibility 
  WHERE user_id = p_user_id;
  
  -- If no record exists, create one and return false
  IF NOT FOUND THEN
    INSERT INTO public.business_tender_eligibility (user_id, verification_status)
    VALUES (p_user_id, 'unverified');
    
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'Business not registered in directory',
      'action_required', 'register_business',
      'redirect_url', '/business/register'
    );
  END IF;
  
  -- Check company exists and is active
  IF eligibility_record.company_id IS NOT NULL THEN
    SELECT id, company_name, status INTO company_record 
    FROM public.companies 
    WHERE id = eligibility_record.company_id;
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'eligible', false,
        'reason', 'Company not found in directory',
        'action_required', 'link_business'
      );
    END IF;
  ELSE
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'No business linked to account',
      'action_required', 'link_business',
      'redirect_url', '/business/register'
    );
  END IF;
  
  -- Check specific action permissions
  IF p_action = 'post_tender' AND NOT eligibility_record.can_post_tenders THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'Business not authorized to post tenders',
      'action_required', 'verify_business'
    );
  END IF;
  
  IF p_action = 'bid_tender' AND NOT eligibility_record.can_bid_on_tenders THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'Business not authorized to bid on tenders',
      'action_required', 'verify_business'
    );
  END IF;
  
  -- Check membership status
  IF NOT eligibility_record.membership_active OR 
     (eligibility_record.membership_expires_at IS NOT NULL AND eligibility_record.membership_expires_at < now()) THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'Business membership expired or inactive',
      'action_required', 'renew_membership'
    );
  END IF;
  
  -- All checks passed
  RETURN jsonb_build_object(
    'eligible', true,
    'company_id', eligibility_record.company_id,
    'company_name', company_record.company_name,
    'verification_status', eligibility_record.verification_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;