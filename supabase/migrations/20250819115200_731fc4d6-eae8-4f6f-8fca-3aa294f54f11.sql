-- Secure contract_payments with strict RLS (admin-only)
ALTER TABLE public.contract_payments ENABLE ROW LEVEL SECURITY;

-- Remove any existing overly-permissive policies if present (safe no-op if none)
DROP POLICY IF EXISTS "Public can read contract payments" ON public.contract_payments;
DROP POLICY IF EXISTS "Users can manage their own contract payments" ON public.contract_payments;

-- Admin-only management policy
CREATE POLICY "Admins can manage contract payments"
ON public.contract_payments
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
