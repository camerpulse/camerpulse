-- Create plugin monetization tables

-- Plugin licensing and pricing
CREATE TABLE public.plugin_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id UUID NOT NULL,
  license_type TEXT NOT NULL CHECK (license_type IN ('one_time', 'subscription', 'pay_per_call')),
  price_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XAF',
  billing_interval TEXT CHECK (billing_interval IN ('month', 'year', 'one_time', 'per_call')),
  trial_period_days INTEGER DEFAULT 0,
  usage_limits JSONB DEFAULT '{}',
  features_included JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- License keys for purchased plugins
CREATE TABLE public.plugin_license_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id UUID NOT NULL REFERENCES public.plugin_licenses(id),
  user_id UUID NOT NULL,
  license_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'trial')),
  expires_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plugin purchases and payments
CREATE TABLE public.plugin_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plugin_id UUID NOT NULL,
  license_id UUID NOT NULL REFERENCES public.plugin_licenses(id),
  payment_gateway TEXT NOT NULL CHECK (payment_gateway IN ('stripe', 'flutterwave', 'mobile_money')),
  payment_method TEXT,
  transaction_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XAF',
  commission_amount DECIMAL(10,2) NOT NULL,
  developer_payout DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plugin usage tracking
CREATE TABLE public.plugin_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key_id UUID NOT NULL REFERENCES public.plugin_license_keys(id),
  user_id UUID NOT NULL,
  plugin_id UUID NOT NULL,
  usage_type TEXT NOT NULL DEFAULT 'api_call',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Developer payout tracking
CREATE TABLE public.developer_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_earnings DECIMAL(10,2) NOT NULL,
  commission_deducted DECIMAL(10,2) NOT NULL,
  payout_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payout_method TEXT,
  payout_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payment gateway configurations
CREATE TABLE public.payment_gateway_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gateway_name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  config_data JSONB NOT NULL DEFAULT '{}',
  commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 30.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_plugin_licenses_plugin_id ON public.plugin_licenses(plugin_id);
CREATE INDEX idx_plugin_license_keys_user_id ON public.plugin_license_keys(user_id);
CREATE INDEX idx_plugin_license_keys_license_key ON public.plugin_license_keys(license_key);
CREATE INDEX idx_plugin_purchases_user_id ON public.plugin_purchases(user_id);
CREATE INDEX idx_plugin_purchases_plugin_id ON public.plugin_purchases(plugin_id);
CREATE INDEX idx_plugin_usage_logs_license_key_id ON public.plugin_usage_logs(license_key_id);
CREATE INDEX idx_developer_payouts_developer_id ON public.developer_payouts(developer_id);

-- Create update triggers
CREATE OR REPLACE FUNCTION public.update_monetization_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plugin_licenses_updated_at
  BEFORE UPDATE ON public.plugin_licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_monetization_updated_at();

CREATE TRIGGER update_plugin_license_keys_updated_at
  BEFORE UPDATE ON public.plugin_license_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_monetization_updated_at();

CREATE TRIGGER update_plugin_purchases_updated_at
  BEFORE UPDATE ON public.plugin_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_monetization_updated_at();

CREATE TRIGGER update_developer_payouts_updated_at
  BEFORE UPDATE ON public.developer_payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_monetization_updated_at();

-- Enable RLS
ALTER TABLE public.plugin_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_license_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateway_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plugin_licenses
CREATE POLICY "Public can view active plugin licenses" 
ON public.plugin_licenses FOR SELECT 
USING (is_active = true);

CREATE POLICY "Developers can manage their plugin licenses" 
ON public.plugin_licenses FOR ALL 
USING (plugin_id IN (
  SELECT id FROM plugin_marketplace 
  WHERE author_id = auth.uid()
));

-- RLS Policies for plugin_license_keys
CREATE POLICY "Users can view their own license keys" 
ON public.plugin_license_keys FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can manage license keys" 
ON public.plugin_license_keys FOR ALL 
USING (true);

-- RLS Policies for plugin_purchases
CREATE POLICY "Users can view their own purchases" 
ON public.plugin_purchases FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Developers can view their plugin sales" 
ON public.plugin_purchases FOR SELECT 
USING (plugin_id IN (
  SELECT id FROM plugin_marketplace 
  WHERE author_id = auth.uid()
));

-- RLS Policies for plugin_usage_logs
CREATE POLICY "Users can view their own usage logs" 
ON public.plugin_usage_logs FOR SELECT 
USING (user_id = auth.uid());

-- RLS Policies for developer_payouts
CREATE POLICY "Developers can view their own payouts" 
ON public.developer_payouts FOR SELECT 
USING (developer_id = auth.uid());

-- RLS Policies for payment_gateway_config
CREATE POLICY "Admins can manage payment gateway config" 
ON public.payment_gateway_config FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Insert default payment gateway configurations
INSERT INTO public.payment_gateway_config (gateway_name, is_active, commission_percentage) VALUES
('stripe', false, 30.00),
('flutterwave', false, 30.00),
('mobile_money', false, 25.00);

-- License key generation function
CREATE OR REPLACE FUNCTION public.generate_license_key()
RETURNS TEXT AS $$
DECLARE
  key_parts TEXT[];
  i INTEGER;
BEGIN
  key_parts := ARRAY[]::TEXT[];
  
  FOR i IN 1..4 LOOP
    key_parts := array_append(key_parts, upper(substring(encode(gen_random_bytes(3), 'hex'), 1, 6)));
  END LOOP;
  
  RETURN array_to_string(key_parts, '-');
END;
$$ LANGUAGE plpgsql;