-- Create pricing configuration table
CREATE TABLE IF NOT EXISTS public.pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_type TEXT NOT NULL, -- 'subscription', 'vendor_fee', 'commission', 'transaction_fee'
  config_key TEXT NOT NULL, -- 'basic_monthly', 'premium_yearly', 'registration_annual', etc.
  amount INTEGER NOT NULL DEFAULT 500000, -- 5000 XAF in cents (XAF doesn't use decimals typically, but using cents for consistency)
  currency TEXT NOT NULL DEFAULT 'XAF',
  billing_cycle TEXT, -- 'monthly', 'yearly', 'one_time'
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(config_type, config_key)
);

-- Insert default pricing configurations
INSERT INTO public.pricing_config (config_type, config_key, amount, currency, billing_cycle, description) VALUES
-- Subscription plans
('subscription', 'basic_monthly', 500000, 'XAF', 'monthly', 'Basic vendor plan - monthly billing'),
('subscription', 'basic_yearly', 5000000, 'XAF', 'yearly', 'Basic vendor plan - yearly billing (10 months price)'),
('subscription', 'premium_monthly', 500000, 'XAF', 'monthly', 'Premium vendor plan - monthly billing'),
('subscription', 'premium_yearly', 5000000, 'XAF', 'yearly', 'Premium vendor plan - yearly billing'),
('subscription', 'enterprise_monthly', 500000, 'XAF', 'monthly', 'Enterprise vendor plan - monthly billing'),
('subscription', 'enterprise_yearly', 5000000, 'XAF', 'yearly', 'Enterprise vendor plan - yearly billing'),

-- Vendor fees
('vendor_fee', 'registration_annual', 500000, 'XAF', 'yearly', 'Annual vendor registration fee'),
('vendor_fee', 'listing_fee', 500000, 'XAF', 'one_time', 'Product listing fee'),

-- Commission and transaction fees
('commission', 'marketplace_commission', 1000, 'XAF', 'percentage', 'Marketplace commission rate (10% = 1000 basis points)'),
('transaction_fee', 'payment_processing', 50000, 'XAF', 'one_time', 'Payment processing fee per transaction'),
('transaction_fee', 'withdrawal_fee', 25000, 'XAF', 'one_time', 'Vendor withdrawal fee'),

-- Product pricing defaults
('product', 'minimum_price', 100000, 'XAF', 'one_time', 'Minimum product price (1000 XAF)'),
('product', 'maximum_price', 10000000, 'XAF', 'one_time', 'Maximum product price (100,000 XAF)');

-- Enable RLS
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage pricing config" ON public.pricing_config
FOR ALL USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Public can view active pricing" ON public.pricing_config
FOR SELECT USING (is_active = true);

-- Create updated_at trigger
CREATE TRIGGER update_pricing_config_updated_at 
BEFORE UPDATE ON public.pricing_config 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing tables to use XAF
UPDATE public.vendor_subscriptions SET currency = 'XAF', amount = 500000 WHERE currency != 'XAF';
UPDATE public.orders SET currency = 'XAF' WHERE currency != 'XAF';