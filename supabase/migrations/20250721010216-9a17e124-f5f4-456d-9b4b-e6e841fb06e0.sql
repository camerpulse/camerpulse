-- Add helper functions for monetization

-- Function to increment usage count
CREATE OR REPLACE FUNCTION public.increment_usage_count(license_key_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.plugin_license_keys 
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = license_key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate and assign license key
CREATE OR REPLACE FUNCTION public.assign_license_key(
  p_license_id UUID,
  p_user_id UUID,
  p_trial_mode BOOLEAN DEFAULT false
)
RETURNS TEXT AS $$
DECLARE
  new_license_key TEXT;
  license_record RECORD;
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get license details
  SELECT * INTO license_record FROM public.plugin_licenses WHERE id = p_license_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'License not found';
  END IF;
  
  -- Generate license key
  new_license_key := generate_license_key();
  
  -- Calculate expiry date
  IF license_record.license_type = 'subscription' THEN
    IF license_record.billing_interval = 'month' THEN
      expires_at := now() + INTERVAL '1 month';
    ELSIF license_record.billing_interval = 'year' THEN
      expires_at := now() + INTERVAL '1 year';
    END IF;
  ELSIF p_trial_mode AND license_record.trial_period_days > 0 THEN
    expires_at := now() + (license_record.trial_period_days || ' days')::INTERVAL;
  END IF;
  
  -- Insert license key
  INSERT INTO public.plugin_license_keys (
    license_id,
    user_id,
    license_key,
    status,
    expires_at,
    usage_limit
  ) VALUES (
    p_license_id,
    p_user_id,
    new_license_key,
    CASE WHEN p_trial_mode THEN 'trial' ELSE 'active' END,
    expires_at,
    CASE 
      WHEN license_record.usage_limits ? 'max_calls' THEN
        (license_record.usage_limits->>'max_calls')::INTEGER
      ELSE NULL
    END
  );
  
  RETURN new_license_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate commission
CREATE OR REPLACE FUNCTION public.calculate_commission(
  amount DECIMAL,
  gateway_name TEXT
)
RETURNS DECIMAL AS $$
DECLARE
  commission_rate DECIMAL;
BEGIN
  SELECT commission_percentage INTO commission_rate
  FROM public.payment_gateway_config
  WHERE gateway_name = calculate_commission.gateway_name
    AND is_active = true;
    
  IF NOT FOUND THEN
    commission_rate := 30.00; -- Default commission
  END IF;
  
  RETURN (amount * commission_rate / 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process successful payment
CREATE OR REPLACE FUNCTION public.process_payment_success(
  p_purchase_id UUID,
  p_transaction_id TEXT,
  p_payment_data JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
DECLARE
  purchase_record RECORD;
  license_key TEXT;
BEGIN
  -- Get purchase details
  SELECT * INTO purchase_record FROM public.plugin_purchases WHERE id = p_purchase_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Purchase not found';
  END IF;
  
  -- Update purchase status
  UPDATE public.plugin_purchases
  SET status = 'completed',
      transaction_id = p_transaction_id,
      payment_data = p_payment_data,
      updated_at = now()
  WHERE id = p_purchase_id;
  
  -- Generate and assign license key
  license_key := assign_license_key(
    purchase_record.license_id,
    purchase_record.user_id,
    false
  );
  
  -- TODO: Send confirmation email to user
  -- TODO: Notify developer of new sale
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;