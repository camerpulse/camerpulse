-- Phase 1: CamerTenders Monetization Foundation & Core Billing (Fixed)

-- Create enum for payment status if not exists
DO $$ BEGIN
    CREATE TYPE tender_payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for business verification status
DO $$ BEGIN
    CREATE TYPE business_verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tender payment plans table (pricing configuration)
CREATE TABLE IF NOT EXISTS public.tender_payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'standard', -- standard, urgent, featured
  base_price_fcfa BIGINT NOT NULL DEFAULT 10000, -- 10,000 XAF default
  base_price_usd NUMERIC(10,2) NOT NULL DEFAULT 15.00,
  duration_days INTEGER NOT NULL DEFAULT 30,
  features JSONB DEFAULT '{"homepage_listing": true, "search_visibility": true}',
  category_overrides JSONB DEFAULT '{}', -- category-specific pricing
  is_active BOOLEAN DEFAULT true,
  is_free_for_government BOOLEAN DEFAULT false,
  max_bids_allowed INTEGER DEFAULT NULL,
  priority_score INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tender payments table (transaction records)
CREATE TABLE IF NOT EXISTS public.tender_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.tender_payment_plans(id),
  company_id UUID REFERENCES public.companies(id),
  user_id UUID REFERENCES auth.users(id),
  amount_fcfa BIGINT NOT NULL,
  amount_usd NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'XAF',
  payment_status tender_payment_status DEFAULT 'pending',
  payment_method TEXT, -- 'stripe', 'mtn_momo', 'orange_money', 'camerWallet'
  stripe_session_id TEXT,
  transaction_reference TEXT,
  payment_gateway_response JSONB DEFAULT '{}',
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

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
CREATE INDEX IF NOT EXISTS idx_tender_payments_tender_id ON public.tender_payments(tender_id);
CREATE INDEX IF NOT EXISTS idx_tender_payments_status ON public.tender_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_tender_payments_company ON public.tender_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_business_eligibility_user ON public.business_tender_eligibility(user_id);
CREATE INDEX IF NOT EXISTS idx_business_eligibility_company ON public.business_tender_eligibility(company_id);
CREATE INDEX IF NOT EXISTS idx_tender_payment_plans_active ON public.tender_payment_plans(is_active);

-- Enable RLS
ALTER TABLE public.tender_payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_tender_eligibility ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tender_payment_plans
CREATE POLICY "Public can view active payment plans" ON public.tender_payment_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage payment plans" ON public.tender_payment_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- RLS Policies for tender_payments
CREATE POLICY "Users can view their own payments" ON public.tender_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments" ON public.tender_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending payments" ON public.tender_payments
  FOR UPDATE USING (auth.uid() = user_id AND payment_status = 'pending');

CREATE POLICY "Admins can view all payments" ON public.tender_payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- RLS Policies for business_tender_eligibility
CREATE POLICY "Users can view their own eligibility" ON public.business_tender_eligibility
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their eligibility record" ON public.business_tender_eligibility
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all eligibility" ON public.business_tender_eligibility
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_tender_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tender_payment_plans_updated_at
  BEFORE UPDATE ON public.tender_payment_plans
  FOR EACH ROW EXECUTE FUNCTION update_tender_payment_updated_at();

CREATE TRIGGER update_tender_payments_updated_at
  BEFORE UPDATE ON public.tender_payments
  FOR EACH ROW EXECUTE FUNCTION update_tender_payment_updated_at();

CREATE TRIGGER update_business_eligibility_updated_at
  BEFORE UPDATE ON public.business_tender_eligibility
  FOR EACH ROW EXECUTE FUNCTION update_tender_payment_updated_at();

-- Insert default payment plans
INSERT INTO public.tender_payment_plans (plan_name, plan_type, base_price_fcfa, base_price_usd, duration_days, features, priority_score) VALUES
('Standard Tender', 'standard', 10000, 15.00, 30, '{"homepage_listing": true, "search_visibility": true, "basic_analytics": true}', 1),
('Urgent Tender', 'urgent', 25000, 40.00, 14, '{"homepage_listing": true, "search_visibility": true, "urgent_badge": true, "priority_placement": true, "basic_analytics": true}', 3),
('Featured Tender', 'featured', 50000, 75.00, 45, '{"homepage_listing": true, "search_visibility": true, "featured_badge": true, "homepage_placement": true, "priority_placement": true, "advanced_analytics": true, "email_promotion": true}', 5),
('Government Free', 'government', 0, 0.00, 30, '{"homepage_listing": true, "search_visibility": true, "government_badge": true}', 2)
ON CONFLICT DO NOTHING;

-- Function to check business eligibility for tender actions (Fixed to use correct column name)
CREATE OR REPLACE FUNCTION check_business_tender_eligibility(p_user_id UUID, p_action TEXT)
RETURNS JSONB AS $$
DECLARE
  eligibility_record RECORD;
  company_record RECORD;
  result JSONB;
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
    SELECT * INTO company_record 
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