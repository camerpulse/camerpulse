-- Create shipping company ratings table (since shipping_companies already exists)
CREATE TABLE IF NOT EXISTS public.shipping_company_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
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
ALTER TABLE public.shipping_company_ratings ENABLE ROW LEVEL SECURITY;

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
CREATE INDEX IF NOT EXISTS idx_shipping_company_ratings_company_id ON public.shipping_company_ratings(company_id);
CREATE INDEX IF NOT EXISTS idx_shipping_company_ratings_user_id ON public.shipping_company_ratings(user_id);

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
CREATE TRIGGER update_shipping_company_ratings_updated_at
  BEFORE UPDATE ON public.shipping_company_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();