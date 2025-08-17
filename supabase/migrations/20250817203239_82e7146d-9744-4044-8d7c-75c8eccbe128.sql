-- Create table for Nokash payment configurations
CREATE TABLE public.nokash_payment_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_space_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  supported_networks TEXT[] NOT NULL DEFAULT ARRAY['MTN', 'ORANGE'],
  default_network TEXT NOT NULL DEFAULT 'MTN',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Nokash payment transactions
CREATE TABLE public.nokash_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  user_id UUID,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XAF',
  phone_number TEXT NOT NULL,
  payment_method TEXT NOT NULL, -- MTN, ORANGE
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED
  nokash_response JSONB,
  callback_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.nokash_payment_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nokash_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nokash_payment_config
CREATE POLICY "Admins can manage Nokash config" 
ON public.nokash_payment_config 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'::app_role
));

CREATE POLICY "Public can view active Nokash config" 
ON public.nokash_payment_config 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for nokash_transactions
CREATE POLICY "Admins can view all Nokash transactions" 
ON public.nokash_transactions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'::app_role
));

CREATE POLICY "Users can view their own transactions" 
ON public.nokash_transactions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can create transactions" 
ON public.nokash_transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update transactions" 
ON public.nokash_transactions 
FOR UPDATE 
USING (true);

-- Add trigger for updating timestamps
CREATE TRIGGER update_nokash_payment_config_updated_at
  BEFORE UPDATE ON public.nokash_payment_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nokash_transactions_updated_at
  BEFORE UPDATE ON public.nokash_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default configuration
INSERT INTO public.nokash_payment_config (app_space_key, supported_networks, default_network)
VALUES ('default_app_key', ARRAY['MTN', 'ORANGE'], 'MTN');