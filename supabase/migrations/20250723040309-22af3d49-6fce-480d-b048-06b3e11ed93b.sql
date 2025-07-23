-- Phase 2: Payment Integration & Wallet - Essential tables (Simple)

-- Create tender invoices table
CREATE TABLE IF NOT EXISTS public.tender_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.tender_payments(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount_fcfa BIGINT NOT NULL,
  amount_usd NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'XAF',
  tax_amount NUMERIC(10,2) DEFAULT 0,
  tax_percentage NUMERIC(5,2) DEFAULT 19.25,
  subtotal_fcfa BIGINT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now(),
  due_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  billing_address JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create wallet transactions table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  related_payment_id UUID REFERENCES public.tender_payments(id),
  transaction_type TEXT NOT NULL,
  amount_fcfa BIGINT NOT NULL,
  amount_usd NUMERIC(10,2),
  currency TEXT DEFAULT 'XAF',
  balance_before BIGINT,
  balance_after BIGINT,
  reference_number TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'completed',
  gateway_response JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tender_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tender_invoices
CREATE POLICY "Users can view their own invoices" ON public.tender_invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tender_payments tp 
      WHERE tp.id = tender_invoices.payment_id AND tp.user_id = auth.uid()
    )
  );

-- RLS Policies for wallet_transactions  
CREATE POLICY "Users can view their own transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tender_invoices_payment_id ON public.tender_invoices(payment_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);