-- Create donations system tables and policies

-- Donation causes table
CREATE TABLE IF NOT EXISTS public.donation_causes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(12,2),
  current_amount DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Donations table
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  cause_id UUID REFERENCES public.donation_causes(id),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'FCFA',
  payment_method TEXT NOT NULL,
  phone_number TEXT,
  donor_name TEXT,
  donor_email TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  nokash_order_id TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donation_causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Policies for donation_causes
CREATE POLICY "Anyone can view active donation causes"
ON public.donation_causes FOR SELECT
USING (status = 'active');

CREATE POLICY "Admins can manage donation causes"
ON public.donation_causes FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('admin', 'super_admin')
));

-- Policies for donations
CREATE POLICY "Users can view their own donations"
ON public.donations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create donations"
ON public.donations FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all donations"
ON public.donations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('admin', 'super_admin')
));

CREATE POLICY "Admins can update donations"
ON public.donations FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('admin', 'super_admin')
));

-- Function to update donation cause amounts
CREATE OR REPLACE FUNCTION update_cause_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.donation_causes
    SET current_amount = current_amount + NEW.amount,
        updated_at = now()
    WHERE id = NEW.cause_id;
  ELSIF OLD.status = 'completed' AND NEW.status != 'completed' THEN
    UPDATE public.donation_causes
    SET current_amount = GREATEST(current_amount - NEW.amount, 0),
        updated_at = now()
    WHERE id = NEW.cause_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating cause amounts
CREATE TRIGGER update_donation_cause_amount
  AFTER UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_cause_amount();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_donation_causes_updated_at
  BEFORE UPDATE ON public.donation_causes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default donation causes
INSERT INTO public.donation_causes (name, description, target_amount) VALUES
('Education Development', 'Support educational initiatives and infrastructure across Cameroon', 5000000),
('Healthcare Support', 'Improve healthcare access and medical facilities in underserved communities', 3000000),
('Infrastructure Projects', 'Fund roads, bridges, and essential infrastructure development', 8000000),
('Youth Empowerment', 'Programs for skill development and job creation for young people', 2000000),
('Environmental Conservation', 'Protect forests and promote sustainable environmental practices', 1500000),
('Women Empowerment', 'Support women entrepreneurship and gender equality initiatives', 1800000);