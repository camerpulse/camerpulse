-- Create vendor subscriptions table
CREATE TABLE IF NOT EXISTS public.vendor_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  vendor_id UUID,
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  interval TEXT NOT NULL DEFAULT 'month',
  features JSONB DEFAULT '[]'::jsonb,
  stripe_customer_id TEXT,
  stripe_session_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMPTZ
);

-- Create orders table if not exists (for one-off payments)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID,
  vendor_id UUID,
  product_id UUID,
  quantity INTEGER NOT NULL DEFAULT 1,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.vendor_subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.vendor_subscriptions  
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.vendor_subscriptions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage subscriptions" ON public.vendor_subscriptions
FOR ALL USING (true);

-- Create policies for orders
CREATE POLICY "Users can view their orders" ON public.orders
FOR SELECT USING (auth.uid() = buyer_id OR EXISTS (
  SELECT 1 FROM marketplace_vendors v WHERE v.id = orders.vendor_id AND v.user_id = auth.uid()
));

CREATE POLICY "System can manage orders" ON public.orders
FOR ALL USING (true);

-- Create payment analytics view
CREATE OR REPLACE VIEW public.payment_analytics AS
SELECT 
  'order' as payment_type,
  o.amount,
  o.currency,
  o.status,
  o.payment_method,
  o.created_at,
  o.buyer_id as user_id,
  o.vendor_id,
  'one_time' as billing_type
FROM public.orders o
WHERE o.status = 'paid'

UNION ALL

SELECT 
  'subscription' as payment_type,
  vs.amount,
  vs.currency,
  vs.status,
  'stripe' as payment_method,
  vs.created_at,
  vs.user_id,
  vs.vendor_id,
  'recurring' as billing_type
FROM public.vendor_subscriptions vs
WHERE vs.status IN ('active', 'trialing');

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendor_subscriptions_updated_at 
BEFORE UPDATE ON public.vendor_subscriptions 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
BEFORE UPDATE ON public.orders 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();