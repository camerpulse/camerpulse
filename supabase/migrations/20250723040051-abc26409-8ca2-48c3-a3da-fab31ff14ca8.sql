-- Phase 2: Payment Integration & Wallet - Add invoice system

-- Create tender invoices table
CREATE TABLE IF NOT EXISTS public.tender_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.tender_payments(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount_fcfa BIGINT NOT NULL,
  amount_usd NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'XAF',
  tax_amount NUMERIC(10,2) DEFAULT 0,
  tax_percentage NUMERIC(5,2) DEFAULT 19.25, -- Cameroon VAT
  subtotal_fcfa BIGINT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now(),
  due_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, paid, overdue, cancelled
  notes TEXT,
  billing_address JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create wallet transactions table for CamerWallet integration
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  payment_id UUID REFERENCES public.tender_payments(id),
  transaction_type TEXT NOT NULL, -- debit, credit, refund
  amount_fcfa BIGINT NOT NULL,
  amount_usd NUMERIC(10,2),
  currency TEXT DEFAULT 'XAF',
  balance_before BIGINT,
  balance_after BIGINT,
  reference_number TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'completed', -- pending, completed, failed
  gateway_response JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create payment receipts table
CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.tender_payments(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL UNIQUE,
  receipt_data JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  downloaded_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.tender_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tender_invoices
CREATE POLICY "Users can view their own invoices" ON public.tender_invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tender_payments tp 
      WHERE tp.id = tender_invoices.payment_id AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all invoices" ON public.tender_invoices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- RLS Policies for wallet_transactions
CREATE POLICY "Users can view their own transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all transactions" ON public.wallet_transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- RLS Policies for payment_receipts
CREATE POLICY "Users can view their own receipts" ON public.payment_receipts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tender_payments tp 
      WHERE tp.id = payment_receipts.payment_id AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create receipts" ON public.payment_receipts
  FOR INSERT WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tender_invoices_payment_id ON public.tender_invoices(payment_id);
CREATE INDEX IF NOT EXISTS idx_tender_invoices_status ON public.tender_invoices(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_payment_id ON public.wallet_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_payment_id ON public.payment_receipts(payment_id);

-- Create triggers for updated_at
CREATE TRIGGER update_tender_invoices_updated_at
  BEFORE UPDATE ON public.tender_invoices
  FOR EACH ROW EXECUTE FUNCTION update_tender_updated_at();

-- Function to generate invoice
CREATE OR REPLACE FUNCTION generate_tender_invoice(p_payment_id UUID)
RETURNS UUID AS $$
DECLARE
  payment_record RECORD;
  invoice_id UUID;
  invoice_number TEXT;
  tax_amount NUMERIC(10,2);
  subtotal_fcfa BIGINT;
BEGIN
  -- Get payment details
  SELECT * INTO payment_record 
  FROM public.tender_payments 
  WHERE id = p_payment_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;
  
  -- Generate invoice number
  invoice_number := 'INV-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Calculate tax (19.25% VAT for Cameroon)
  subtotal_fcfa := ROUND(payment_record.amount_fcfa / 1.1925);
  tax_amount := payment_record.amount_fcfa - subtotal_fcfa;
  
  -- Create invoice
  INSERT INTO public.tender_invoices (
    payment_id,
    invoice_number,
    amount_fcfa,
    amount_usd,
    currency,
    tax_amount,
    subtotal_fcfa,
    due_date,
    status
  ) VALUES (
    p_payment_id,
    invoice_number,
    payment_record.amount_fcfa,
    payment_record.amount_usd,
    payment_record.currency,
    tax_amount,
    subtotal_fcfa,
    NOW() + INTERVAL '30 days',
    'pending'
  ) RETURNING id INTO invoice_id;
  
  RETURN invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process wallet payment
CREATE OR REPLACE FUNCTION process_wallet_payment(
  p_user_id UUID,
  p_payment_id UUID,
  p_amount_fcfa BIGINT,
  p_description TEXT DEFAULT 'Tender payment'
)
RETURNS JSONB AS $$
DECLARE
  current_balance BIGINT := 0;
  transaction_id UUID;
  reference_num TEXT;
BEGIN
  -- Get current wallet balance (mock implementation)
  -- In real implementation, this would query actual wallet service
  current_balance := 50000; -- Mock balance of 50,000 XAF
  
  -- Check if sufficient balance
  IF current_balance < p_amount_fcfa THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient wallet balance',
      'current_balance', current_balance,
      'required_amount', p_amount_fcfa
    );
  END IF;
  
  -- Generate reference number
  reference_num := 'CW_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
  
  -- Create wallet transaction
  INSERT INTO public.wallet_transactions (
    user_id,
    payment_id,
    transaction_type,
    amount_fcfa,
    balance_before,
    balance_after,
    reference_number,
    description,
    status
  ) VALUES (
    p_user_id,
    p_payment_id,
    'debit',
    p_amount_fcfa,
    current_balance,
    current_balance - p_amount_fcfa,
    reference_num,
    p_description,
    'completed'
  ) RETURNING id INTO transaction_id;
  
  -- Update payment status
  UPDATE public.tender_payments 
  SET 
    payment_status = 'paid',
    paid_at = NOW(),
    payment_method = 'camerWallet',
    transaction_reference = reference_num
  WHERE id = p_payment_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'reference_number', reference_num,
    'new_balance', current_balance - p_amount_fcfa
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;