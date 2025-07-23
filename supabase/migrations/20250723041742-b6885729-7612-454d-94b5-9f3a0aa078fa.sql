-- Add some sample wallet transactions to demonstrate wallet functionality
INSERT INTO public.wallet_transactions (user_id, transaction_type, amount, description, reference_id) VALUES 
-- Replace with actual user ID - this is just a sample structure
('00000000-0000-0000-0000-000000000000', 'credit', 25000, 'Initial wallet setup bonus', NULL),
('00000000-0000-0000-0000-000000000000', 'credit', 50000, 'Wallet top-up via MTN Mobile Money', NULL),
('00000000-0000-0000-0000-000000000000', 'debit', 15000, 'Tender payment for infrastructure project', NULL);

-- Update payment plans with proper pricing
UPDATE public.tender_payment_plans 
SET 
  price_fcfa = CASE 
    WHEN plan_name = 'Basic Participation' THEN 25000
    WHEN plan_name = 'Premium Bid' THEN 75000  
    WHEN plan_name = 'Enterprise Partnership' THEN 200000
  END,
  price_usd = CASE 
    WHEN plan_name = 'Basic Participation' THEN 42
    WHEN plan_name = 'Premium Bid' THEN 125
    WHEN plan_name = 'Enterprise Partnership' THEN 333
  END
WHERE plan_name IN ('Basic Participation', 'Premium Bid', 'Enterprise Partnership');