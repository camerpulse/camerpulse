-- Create payment notifications tracking table
CREATE TABLE IF NOT EXISTS public.payment_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  email_status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (transaction_id) REFERENCES nokash_transactions(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.payment_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for payment notifications
CREATE POLICY "Admins can manage payment notifications" 
ON public.payment_notifications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create index for better performance
CREATE INDEX idx_payment_notifications_transaction_id ON public.payment_notifications(transaction_id);
CREATE INDEX idx_payment_notifications_sent_at ON public.payment_notifications(sent_at);

-- Add missing functions that edge function might call
CREATE OR REPLACE FUNCTION public.process_nokash_webhook(
  webhook_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_record RECORD;
  result JSONB := '{"success": false}';
  order_id TEXT;
  new_status TEXT;
BEGIN
  -- Extract order ID and status from webhook data
  order_id := webhook_data->>'order_id';
  new_status := webhook_data->>'status';
  
  IF order_id IS NULL OR new_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing required fields');
  END IF;
  
  -- Find and update the transaction
  UPDATE public.nokash_transactions 
  SET 
    status = new_status,
    completed_at = CASE WHEN new_status = 'SUCCESS' THEN now() ELSE completed_at END,
    updated_at = now()
  WHERE order_id = order_id
  RETURNING * INTO transaction_record;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transaction not found');
  END IF;
  
  -- Log the webhook processing
  INSERT INTO public.webhook_logs (
    webhook_type,
    order_id,
    status,
    webhook_data,
    processed_at
  ) VALUES (
    'nokash_payment',
    order_id,
    new_status,
    webhook_data,
    now()
  );
  
  result := jsonb_build_object(
    'success', true,
    'transaction_id', transaction_record.id,
    'order_id', order_id,
    'status', new_status
  );
  
  RETURN result;
END;
$$;

-- Create webhook logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_type TEXT NOT NULL,
  order_id TEXT,
  status TEXT,
  webhook_data JSONB,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for webhook logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for webhook logs
CREATE POLICY "Admins can view webhook logs" 
ON public.webhook_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);