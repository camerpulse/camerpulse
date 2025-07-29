-- Create creditor breakdown table
CREATE TABLE public.debt_creditors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creditor_name TEXT NOT NULL,
  creditor_type TEXT NOT NULL CHECK (creditor_type IN ('country', 'multilateral', 'commercial', 'private')),
  country_code TEXT, -- For country creditors (ISO 2-letter code)
  logo_url TEXT,
  amount_borrowed_fcfa BIGINT NOT NULL,
  amount_borrowed_usd BIGINT NOT NULL,
  loan_purpose TEXT,
  loan_purpose_ai_suggested BOOLEAN DEFAULT false,
  date_borrowed DATE NOT NULL,
  loan_status TEXT NOT NULL DEFAULT 'active' CHECK (loan_status IN ('active', 'paid', 'restructured', 'defaulted')),
  interest_rate NUMERIC(5,2),
  maturity_date DATE,
  notes TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.debt_creditors ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view creditor data"
ON public.debt_creditors
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage creditor data"
ON public.debt_creditors
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Update trigger
CREATE TRIGGER update_debt_creditors_updated_at
  BEFORE UPDATE ON public.debt_creditors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_debt_updated_at();

-- Insert sample data
INSERT INTO public.debt_creditors (
  creditor_name, 
  creditor_type, 
  country_code, 
  amount_borrowed_fcfa, 
  amount_borrowed_usd, 
  loan_purpose, 
  date_borrowed, 
  loan_status,
  interest_rate,
  maturity_date,
  verified
) VALUES 
  ('China', 'country', 'CN', 3200000000000, 5333333333, 'Infrastructure development including roads, ports, and telecommunications', '2015-03-15', 'active', 2.5, '2030-03-15', true),
  ('International Monetary Fund', 'multilateral', NULL, 1800000000000, 3000000000, 'Economic stability and balance of payments support', '2020-08-20', 'active', 1.05, '2027-08-20', true),
  ('World Bank', 'multilateral', NULL, 1600000000000, 2666666667, 'Poverty reduction and sustainable development projects', '2018-06-10', 'active', 1.25, '2033-06-10', true),
  ('France', 'country', 'FR', 1200000000000, 2000000000, 'Development aid and budget support', '2019-11-05', 'active', 0.75, '2029-11-05', true),
  ('European Investment Bank', 'multilateral', NULL, 800000000000, 1333333333, 'Energy sector modernization and renewable energy projects', '2021-02-28', 'active', 1.5, '2031-02-28', true),
  ('Standard Chartered Bank', 'commercial', 'GB', 400000000000, 666666667, 'Trade finance and working capital', '2022-09-12', 'active', 4.2, '2025-09-12', true);