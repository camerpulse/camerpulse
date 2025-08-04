-- Check if orders table exists and fix the migration
DO $$
BEGIN
    -- Check if orders table exists and has user_id column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN
        -- Add buyer_id as alias for user_id if needed
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS buyer_id UUID;
        UPDATE public.orders SET buyer_id = user_id WHERE buyer_id IS NULL;
    END IF;
END $$;

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

-- Enable RLS
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor_subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.vendor_subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON public.vendor_subscriptions
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.vendor_subscriptions;
CREATE POLICY "Users can create their own subscriptions" ON public.vendor_subscriptions  
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.vendor_subscriptions;
CREATE POLICY "Users can update their own subscriptions" ON public.vendor_subscriptions
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage subscriptions" ON public.vendor_subscriptions;
CREATE POLICY "System can manage subscriptions" ON public.vendor_subscriptions
FOR ALL USING (true);

-- Create updated_at trigger for vendor_subscriptions
DROP TRIGGER IF EXISTS update_vendor_subscriptions_updated_at ON public.vendor_subscriptions;
CREATE TRIGGER update_vendor_subscriptions_updated_at 
BEFORE UPDATE ON public.vendor_subscriptions 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();