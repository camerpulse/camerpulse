-- Create table for tender payment plans
CREATE TABLE public.tender_payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'priority', 'featured')),
  price_fcfa BIGINT NOT NULL,
  price_usd BIGINT NOT NULL, -- price in cents
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_days INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default payment plans
INSERT INTO public.tender_payment_plans (plan_name, plan_type, price_fcfa, price_usd, features, duration_days) VALUES
('Basic Listing', 'basic', 25000, 4999, '["Basic tender listing", "30 days visibility", "Email notifications"]'::jsonb, 30),
('Priority Listing', 'priority', 50000, 9999, '["Priority placement", "60 days visibility", "Featured in search", "Email & SMS notifications", "Analytics dashboard"]'::jsonb, 60),
('Featured Tender', 'featured', 100000, 19999, '["Top featured placement", "90 days visibility", "Homepage carousel", "Social media promotion", "Premium analytics", "Dedicated support"]'::jsonb, 90);

-- Create table for tender payments
CREATE TABLE public.tender_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tender_id UUID REFERENCES public.tenders(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.tender_payment_plans(id) ON DELETE RESTRICT,
  stripe_session_id TEXT UNIQUE,
  amount_fcfa BIGINT NOT NULL,
  amount_usd BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'fcfa',
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tender_payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment plans (public read)
CREATE POLICY "Payment plans are viewable by everyone" 
ON public.tender_payment_plans 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" 
ON public.tender_payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" 
ON public.tender_payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payments" 
ON public.tender_payments 
FOR UPDATE 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_tender_payment_plans_updated_at
BEFORE UPDATE ON public.tender_payment_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_tender_updated_at();

CREATE TRIGGER update_tender_payments_updated_at
BEFORE UPDATE ON public.tender_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_tender_updated_at();

-- Add payment tracking to tenders table
ALTER TABLE public.tenders 
ADD COLUMN payment_plan_id UUID REFERENCES public.tender_payment_plans(id),
ADD COLUMN payment_status TEXT DEFAULT 'free' CHECK (payment_status IN ('free', 'pending_payment', 'paid'));

-- Update existing tenders to have free status
UPDATE public.tenders SET payment_status = 'free' WHERE payment_status IS NULL;