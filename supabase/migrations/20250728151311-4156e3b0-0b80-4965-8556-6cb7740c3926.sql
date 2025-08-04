-- Create shipping companies table
CREATE TABLE public.shipping_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  regions TEXT[] DEFAULT '{}',
  services TEXT[] DEFAULT '{}',
  vehicle_types TEXT[] DEFAULT '{}',
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  headquarters TEXT,
  employee_count TEXT,
  years_in_business INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  partnership_status TEXT DEFAULT 'registered',
  logo_url TEXT,
  established TEXT,
  operating_hours TEXT DEFAULT '9AM-6PM',
  specializations TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create shipping company ratings table
CREATE TABLE public.shipping_company_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.shipping_companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  overall_rating DECIMAL(2,1) NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  reliability_rating DECIMAL(2,1) CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  speed_rating DECIMAL(2,1) CHECK (speed_rating >= 1 AND speed_rating <= 5),
  customer_service_rating DECIMAL(2,1) CHECK (customer_service_rating >= 1 AND customer_service_rating <= 5),
  pricing_rating DECIMAL(2,1) CHECK (pricing_rating >= 1 AND pricing_rating <= 5),
  packaging_rating DECIMAL(2,1) CHECK (packaging_rating >= 1 AND packaging_rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- Enable RLS
ALTER TABLE public.shipping_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_company_ratings ENABLE ROW LEVEL SECURITY;

-- Policies for shipping_companies
CREATE POLICY "Public can view shipping companies" 
ON public.shipping_companies 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create companies" 
ON public.shipping_companies 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Company creators can update their companies" 
ON public.shipping_companies 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Policies for shipping_company_ratings
CREATE POLICY "Public can view company ratings" 
ON public.shipping_company_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own ratings" 
ON public.shipping_company_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.shipping_company_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" 
ON public.shipping_company_ratings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_shipping_companies_partnership_status ON public.shipping_companies(partnership_status);
CREATE INDEX idx_shipping_companies_is_verified ON public.shipping_companies(is_verified);
CREATE INDEX idx_shipping_companies_regions ON public.shipping_companies USING GIN(regions);
CREATE INDEX idx_shipping_company_ratings_company_id ON public.shipping_company_ratings(company_id);
CREATE INDEX idx_shipping_company_ratings_user_id ON public.shipping_company_ratings(user_id);

-- Function to calculate company average ratings
CREATE OR REPLACE FUNCTION calculate_company_ratings(company_uuid UUID)
RETURNS TABLE(
  avg_overall_rating DECIMAL(2,1),
  avg_reliability_rating DECIMAL(2,1),
  avg_speed_rating DECIMAL(2,1),
  avg_customer_service_rating DECIMAL(2,1),
  avg_pricing_rating DECIMAL(2,1),
  avg_packaging_rating DECIMAL(2,1),
  total_reviews BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(overall_rating), 1)::DECIMAL(2,1) as avg_overall_rating,
    ROUND(AVG(reliability_rating), 1)::DECIMAL(2,1) as avg_reliability_rating,
    ROUND(AVG(speed_rating), 1)::DECIMAL(2,1) as avg_speed_rating,
    ROUND(AVG(customer_service_rating), 1)::DECIMAL(2,1) as avg_customer_service_rating,
    ROUND(AVG(pricing_rating), 1)::DECIMAL(2,1) as avg_pricing_rating,
    ROUND(AVG(packaging_rating), 1)::DECIMAL(2,1) as avg_packaging_rating,
    COUNT(*)::BIGINT as total_reviews
  FROM public.shipping_company_ratings 
  WHERE company_id = company_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shipping_companies_updated_at
  BEFORE UPDATE ON public.shipping_companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_company_ratings_updated_at
  BEFORE UPDATE ON public.shipping_company_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();