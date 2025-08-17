-- Enhanced database schema for production-ready Nokash payments

-- Add new columns to nokash_transactions for better tracking
ALTER TABLE public.nokash_transactions ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
ALTER TABLE public.nokash_transactions ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.nokash_transactions ADD COLUMN IF NOT EXISTS failed_reason TEXT;
ALTER TABLE public.nokash_transactions ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE public.nokash_transactions ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE public.nokash_transactions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '1 hour');
ALTER TABLE public.nokash_transactions ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false;
ALTER TABLE public.nokash_transactions ADD COLUMN IF NOT EXISTS refund_requested BOOLEAN DEFAULT false;
ALTER TABLE public.nokash_transactions ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMP WITH TIME ZONE;

-- Create payment rate limiting table
CREATE TABLE IF NOT EXISTS public.payment_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  phone_number TEXT,
  user_id UUID,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment analytics table
CREATE TABLE IF NOT EXISTS public.payment_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE DEFAULT CURRENT_DATE,
  total_transactions INTEGER DEFAULT 0,
  successful_transactions INTEGER DEFAULT 0,
  failed_transactions INTEGER DEFAULT 0,
  pending_transactions INTEGER DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  successful_amount NUMERIC DEFAULT 0,
  average_amount NUMERIC DEFAULT 0,
  mtn_transactions INTEGER DEFAULT 0,
  orange_transactions INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(date)
);

-- Create payment alerts table
CREATE TABLE IF NOT EXISTS public.payment_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- 'failed_payment', 'high_failure_rate', 'suspicious_activity'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transaction status history table
CREATE TABLE IF NOT EXISTS public.transaction_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES nokash_transactions(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Create duplicate payment prevention table
CREATE TABLE IF NOT EXISTS public.payment_idempotency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT UNIQUE NOT NULL,
  user_id UUID,
  phone_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  order_id TEXT,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours')
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nokash_transactions_user_id ON public.nokash_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_nokash_transactions_status ON public.nokash_transactions(status);
CREATE INDEX IF NOT EXISTS idx_nokash_transactions_created_at ON public.nokash_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_nokash_transactions_phone ON public.nokash_transactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_payment_rate_limits_ip ON public.payment_rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_payment_rate_limits_window ON public.payment_rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_payment_analytics_date ON public.payment_analytics(date);
CREATE INDEX IF NOT EXISTS idx_transaction_status_history_transaction_id ON public.transaction_status_history(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_idempotency_key ON public.payment_idempotency(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_payment_idempotency_expires ON public.payment_idempotency(expires_at);

-- Enable RLS on new tables
ALTER TABLE public.payment_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_idempotency ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_rate_limits
CREATE POLICY "Admins can manage rate limits" ON public.payment_rate_limits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for payment_analytics
CREATE POLICY "Admins can view analytics" ON public.payment_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for payment_alerts
CREATE POLICY "Admins can manage alerts" ON public.payment_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for transaction_status_history
CREATE POLICY "Users can view their transaction history" ON public.transaction_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM nokash_transactions nt 
      WHERE nt.id = transaction_status_history.transaction_id 
      AND nt.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all transaction history" ON public.transaction_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for payment_idempotency
CREATE POLICY "Users can view their own idempotency records" ON public.payment_idempotency
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage idempotency records" ON public.payment_idempotency
  FOR ALL USING (true);

-- Functions for analytics automation
CREATE OR REPLACE FUNCTION update_payment_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily analytics when transaction status changes
  INSERT INTO public.payment_analytics (
    date,
    total_transactions,
    successful_transactions,
    failed_transactions,
    pending_transactions,
    total_amount,
    successful_amount,
    mtn_transactions,
    orange_transactions,
    unique_users
  )
  SELECT 
    CURRENT_DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'SUCCESS'),
    COUNT(*) FILTER (WHERE status IN ('FAILED', 'CANCELLED')),
    COUNT(*) FILTER (WHERE status = 'PENDING'),
    SUM(amount),
    SUM(amount) FILTER (WHERE status = 'SUCCESS'),
    COUNT(*) FILTER (WHERE payment_method = 'MTN'),
    COUNT(*) FILTER (WHERE payment_method = 'ORANGE'),
    COUNT(DISTINCT user_id)
  FROM public.nokash_transactions 
  WHERE DATE(created_at) = CURRENT_DATE
  ON CONFLICT (date) DO UPDATE SET
    total_transactions = EXCLUDED.total_transactions,
    successful_transactions = EXCLUDED.successful_transactions,
    failed_transactions = EXCLUDED.failed_transactions,
    pending_transactions = EXCLUDED.pending_transactions,
    total_amount = EXCLUDED.total_amount,
    successful_amount = EXCLUDED.successful_amount,
    average_amount = CASE 
      WHEN EXCLUDED.successful_transactions > 0 
      THEN EXCLUDED.successful_amount / EXCLUDED.successful_transactions 
      ELSE 0 
    END,
    mtn_transactions = EXCLUDED.mtn_transactions,
    orange_transactions = EXCLUDED.orange_transactions,
    unique_users = EXCLUDED.unique_users,
    updated_at = now();
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for analytics
DROP TRIGGER IF EXISTS trigger_update_payment_analytics ON public.nokash_transactions;
CREATE TRIGGER trigger_update_payment_analytics
  AFTER INSERT OR UPDATE ON public.nokash_transactions
  FOR EACH ROW EXECUTE FUNCTION update_payment_analytics();

-- Function to create transaction status history
CREATE OR REPLACE FUNCTION log_transaction_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.transaction_status_history (
      transaction_id,
      old_status,
      new_status,
      reason,
      metadata
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      'Status updated via ' || TG_OP,
      jsonb_build_object(
        'updated_at', NEW.updated_at,
        'callback_data', NEW.callback_data
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for status history
DROP TRIGGER IF EXISTS trigger_log_status_change ON public.nokash_transactions;
CREATE TRIGGER trigger_log_status_change
  AFTER UPDATE ON public.nokash_transactions
  FOR EACH ROW EXECUTE FUNCTION log_transaction_status_change();

-- Function to check and create payment alerts
CREATE OR REPLACE FUNCTION check_payment_alerts()
RETURNS void AS $$
DECLARE
  failure_rate NUMERIC;
  failed_count INTEGER;
  total_count INTEGER;
BEGIN
  -- Check failure rate in the last hour
  SELECT 
    COUNT(*) FILTER (WHERE status IN ('FAILED', 'CANCELLED')),
    COUNT(*)
  INTO failed_count, total_count
  FROM public.nokash_transactions 
  WHERE created_at >= now() - INTERVAL '1 hour';
  
  IF total_count > 10 THEN
    failure_rate := (failed_count::NUMERIC / total_count::NUMERIC) * 100;
    
    -- Alert if failure rate is above 30%
    IF failure_rate > 30 THEN
      INSERT INTO public.payment_alerts (
        alert_type,
        severity,
        title,
        description,
        metadata
      ) VALUES (
        'high_failure_rate',
        CASE WHEN failure_rate > 50 THEN 'critical' ELSE 'high' END,
        'High Payment Failure Rate Detected',
        format('Payment failure rate is %.1f%% in the last hour (%s failed out of %s total)', 
               failure_rate, failed_count, total_count),
        jsonb_build_object(
          'failure_rate', failure_rate,
          'failed_count', failed_count,
          'total_count', total_count,
          'time_window', '1 hour'
        )
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function for expired records
CREATE OR REPLACE FUNCTION cleanup_expired_payment_data()
RETURNS void AS $$
BEGIN
  -- Clean expired idempotency records
  DELETE FROM public.payment_idempotency 
  WHERE expires_at < now();
  
  -- Clean expired rate limit records (older than 24 hours)
  DELETE FROM public.payment_rate_limits 
  WHERE window_start < now() - INTERVAL '24 hours';
  
  -- Archive old transaction status history (older than 90 days)
  -- In a real production system, you might want to move to archive table instead
  DELETE FROM public.transaction_status_history 
  WHERE created_at < now() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;