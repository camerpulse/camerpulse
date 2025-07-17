-- Create payment configuration table for admin management
CREATE TABLE public.payment_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL, -- stripe, mtn_momo, orange_money, paypal, crypto
  is_enabled BOOLEAN DEFAULT false,
  config_data JSONB DEFAULT '{}', -- API keys, endpoints, etc
  commission_percentage NUMERIC(5,2) DEFAULT 5.00,
  currency TEXT DEFAULT 'XAF',
  test_mode BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(provider)
);

-- Enable RLS
ALTER TABLE public.payment_config ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can manage payment config" 
ON public.payment_config 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Insert default payment providers
INSERT INTO public.payment_config (provider, is_enabled, config_data, commission_percentage) VALUES
('stripe', false, '{"publishable_key": "", "secret_key": "", "webhook_secret": ""}', 2.90),
('mtn_momo', false, '{"api_key": "", "user_id": "", "subscription_key": ""}', 1.50),
('orange_money', false, '{"merchant_key": "", "api_endpoint": ""}', 1.50),
('paypal', false, '{"client_id": "", "client_secret": ""}', 3.49),
('crypto_bitcoin', false, '{"wallet_address": "", "api_key": ""}', 1.00),
('crypto_usdt', false, '{"wallet_address": "", "network": "tron"}', 1.00);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_payment_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_config_updated_at
BEFORE UPDATE ON public.payment_config
FOR EACH ROW
EXECUTE FUNCTION update_payment_config_updated_at();