-- Create institution_payments table
CREATE TABLE public.institution_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  institution_name TEXT NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('school', 'hospital', 'pharmacy')),
  user_id UUID NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('claim_fee', 'feature_upgrade', 'inbox_unlock', 'promotional_boost')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XAF',
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  flutterwave_transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create revenue_analytics table
CREATE TABLE public.revenue_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  school_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  hospital_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  pharmacy_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  claim_fees DECIMAL(12,2) NOT NULL DEFAULT 0,
  feature_fees DECIMAL(12,2) NOT NULL DEFAULT 0,
  inbox_fees DECIMAL(12,2) NOT NULL DEFAULT 0,
  promotional_fees DECIMAL(12,2) NOT NULL DEFAULT 0,
  transactions_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Enable RLS
ALTER TABLE public.institution_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institution_payments
CREATE POLICY "Users can view their own payments" 
ON public.institution_payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" 
ON public.institution_payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" 
ON public.institution_payments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'::app_role
));

-- RLS Policies for revenue_analytics  
CREATE POLICY "Admins can manage revenue analytics" 
ON public.revenue_analytics 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'::app_role
));

-- Function to get revenue dashboard data
CREATE OR REPLACE FUNCTION public.get_revenue_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  total_revenue_today DECIMAL(12,2);
  total_revenue_month DECIMAL(12,2);
  transactions_today INTEGER;
  transactions_month INTEGER;
BEGIN
  -- Get today's revenue
  SELECT COALESCE(SUM(amount), 0) INTO total_revenue_today
  FROM public.institution_payments
  WHERE payment_status = 'completed'
  AND DATE(created_at) = CURRENT_DATE;
  
  -- Get this month's revenue
  SELECT COALESCE(SUM(amount), 0) INTO total_revenue_month
  FROM public.institution_payments
  WHERE payment_status = 'completed'
  AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE);
  
  -- Get today's transaction count
  SELECT COUNT(*) INTO transactions_today
  FROM public.institution_payments
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Get this month's transaction count
  SELECT COUNT(*) INTO transactions_month
  FROM public.institution_payments
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE);
  
  result := jsonb_build_object(
    'total_revenue_today', total_revenue_today,
    'total_revenue_month', total_revenue_month,
    'transactions_today', transactions_today,
    'transactions_month', transactions_month,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$;

-- Trigger to update revenue analytics
CREATE OR REPLACE FUNCTION public.update_revenue_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND (OLD IS NULL OR OLD.payment_status != 'completed') THEN
    INSERT INTO public.revenue_analytics (
      date, total_revenue, 
      school_revenue, hospital_revenue, pharmacy_revenue,
      claim_fees, feature_fees, inbox_fees, promotional_fees,
      transactions_count
    ) VALUES (
      CURRENT_DATE, NEW.amount,
      CASE WHEN NEW.institution_type = 'school' THEN NEW.amount ELSE 0 END,
      CASE WHEN NEW.institution_type = 'hospital' THEN NEW.amount ELSE 0 END,
      CASE WHEN NEW.institution_type = 'pharmacy' THEN NEW.amount ELSE 0 END,
      CASE WHEN NEW.payment_type = 'claim_fee' THEN NEW.amount ELSE 0 END,
      CASE WHEN NEW.payment_type = 'feature_upgrade' THEN NEW.amount ELSE 0 END,
      CASE WHEN NEW.payment_type = 'inbox_unlock' THEN NEW.amount ELSE 0 END,
      CASE WHEN NEW.payment_type = 'promotional_boost' THEN NEW.amount ELSE 0 END,
      1
    )
    ON CONFLICT (date) DO UPDATE SET
      total_revenue = revenue_analytics.total_revenue + NEW.amount,
      school_revenue = revenue_analytics.school_revenue + CASE WHEN NEW.institution_type = 'school' THEN NEW.amount ELSE 0 END,
      hospital_revenue = revenue_analytics.hospital_revenue + CASE WHEN NEW.institution_type = 'hospital' THEN NEW.amount ELSE 0 END,
      pharmacy_revenue = revenue_analytics.pharmacy_revenue + CASE WHEN NEW.institution_type = 'pharmacy' THEN NEW.amount ELSE 0 END,
      claim_fees = revenue_analytics.claim_fees + CASE WHEN NEW.payment_type = 'claim_fee' THEN NEW.amount ELSE 0 END,
      feature_fees = revenue_analytics.feature_fees + CASE WHEN NEW.payment_type = 'feature_upgrade' THEN NEW.amount ELSE 0 END,
      inbox_fees = revenue_analytics.inbox_fees + CASE WHEN NEW.payment_type = 'inbox_unlock' THEN NEW.amount ELSE 0 END,
      promotional_fees = revenue_analytics.promotional_fees + CASE WHEN NEW.payment_type = 'promotional_boost' THEN NEW.amount ELSE 0 END,
      transactions_count = revenue_analytics.transactions_count + 1,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_revenue_analytics_trigger
  AFTER INSERT OR UPDATE ON public.institution_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_revenue_analytics();