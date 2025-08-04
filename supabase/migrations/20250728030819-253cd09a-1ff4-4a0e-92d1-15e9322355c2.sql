-- Create delivery company applications and profiles system

-- Create delivery company applications table
CREATE TABLE public.delivery_company_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  business_registration_number TEXT,
  contact_person_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  business_address TEXT NOT NULL,
  service_regions JSONB DEFAULT '[]'::jsonb,
  vehicle_types JSONB DEFAULT '[]'::jsonb, -- trucks, motorcycles, bicycles, etc.
  company_size TEXT, -- small, medium, large
  years_in_business INTEGER,
  insurance_details JSONB DEFAULT '{}'::jsonb,
  licenses_certifications JSONB DEFAULT '[]'::jsonb,
  service_capabilities JSONB DEFAULT '[]'::jsonb, -- same_day, next_day, express, etc.
  pricing_model TEXT, -- per_km, flat_rate, negotiable
  website_url TEXT,
  social_media_links JSONB DEFAULT '{}'::jsonb,
  business_documents JSONB DEFAULT '[]'::jsonb, -- URLs to uploaded documents
  logo_url TEXT,
  application_status TEXT DEFAULT 'pending' CHECK (application_status IN ('pending', 'under_review', 'approved', 'rejected', 'needs_changes')),
  admin_notes TEXT,
  rejection_reason TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create approved delivery company profiles table
CREATE TABLE public.delivery_company_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.delivery_company_applications(id),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_code TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  contact_person_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  business_address TEXT NOT NULL,
  service_regions JSONB DEFAULT '[]'::jsonb,
  vehicle_types JSONB DEFAULT '[]'::jsonb,
  company_size TEXT,
  years_in_business INTEGER,
  service_capabilities JSONB DEFAULT '[]'::jsonb,
  pricing_model TEXT,
  website_url TEXT,
  social_media_links JSONB DEFAULT '{}'::jsonb,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  average_rating NUMERIC(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  partnership_status TEXT DEFAULT 'registered' CHECK (partnership_status IN ('registered', 'partner', 'preferred', 'suspended')),
  partner_since TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  profile_completion_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery company service areas table
CREATE TABLE public.delivery_company_service_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.delivery_company_profiles(id) ON DELETE CASCADE,
  region_name TEXT NOT NULL,
  coverage_type TEXT DEFAULT 'full' CHECK (coverage_type IN ('full', 'partial', 'on_demand')),
  delivery_fee_structure JSONB DEFAULT '{}'::jsonb,
  estimated_delivery_time TEXT, -- "1-2 days", "same day", etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery company reviews table
CREATE TABLE public.delivery_company_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.delivery_company_profiles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id),
  reviewer_type TEXT DEFAULT 'customer' CHECK (reviewer_type IN ('customer', 'vendor', 'partner')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title TEXT,
  review_content TEXT,
  service_type TEXT, -- delivery, customer_service, reliability, etc.
  order_reference TEXT,
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery company partnership requests table
CREATE TABLE public.delivery_partnership_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.delivery_company_profiles(id) ON DELETE CASCADE,
  requesting_party_id UUID REFERENCES auth.users(id),
  request_type TEXT DEFAULT 'partnership' CHECK (request_type IN ('partnership', 'service_inquiry', 'quote_request')),
  message TEXT NOT NULL,
  contact_preferences JSONB DEFAULT '{}'::jsonb,
  service_requirements JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'in_discussion')),
  response_message TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_company_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_company_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_company_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partnership_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for delivery_company_applications
CREATE POLICY "Users can create their own delivery company applications"
ON public.delivery_company_applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own delivery company applications"
ON public.delivery_company_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending applications"
ON public.delivery_company_applications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND application_status IN ('pending', 'needs_changes'));

CREATE POLICY "Admins can manage all delivery company applications"
ON public.delivery_company_applications
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS Policies for delivery_company_profiles
CREATE POLICY "Public can view active delivery company profiles"
ON public.delivery_company_profiles
FOR SELECT
USING (is_active = true);

CREATE POLICY "Company owners can manage their profiles"
ON public.delivery_company_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all delivery company profiles"
ON public.delivery_company_profiles
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS Policies for delivery_company_service_areas
CREATE POLICY "Public can view service areas"
ON public.delivery_company_service_areas
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM delivery_company_profiles 
  WHERE id = company_id AND is_active = true
));

CREATE POLICY "Company owners can manage their service areas"
ON public.delivery_company_service_areas
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM delivery_company_profiles 
  WHERE id = company_id AND user_id = auth.uid()
));

-- RLS Policies for delivery_company_reviews
CREATE POLICY "Public can view reviews"
ON public.delivery_company_reviews
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON public.delivery_company_reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can update their own reviews"
ON public.delivery_company_reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = reviewer_id);

-- RLS Policies for delivery_partnership_requests
CREATE POLICY "Users can create partnership requests"
ON public.delivery_partnership_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requesting_party_id);

CREATE POLICY "Requesters can view their own requests"
ON public.delivery_partnership_requests
FOR SELECT
TO authenticated
USING (auth.uid() = requesting_party_id);

CREATE POLICY "Company owners can view requests for their company"
ON public.delivery_partnership_requests
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM delivery_company_profiles 
  WHERE id = company_id AND user_id = auth.uid()
));

CREATE POLICY "Company owners can respond to requests"
ON public.delivery_partnership_requests
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM delivery_company_profiles 
  WHERE id = company_id AND user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_delivery_applications_user_id ON public.delivery_company_applications(user_id);
CREATE INDEX idx_delivery_applications_status ON public.delivery_company_applications(application_status);
CREATE INDEX idx_delivery_profiles_user_id ON public.delivery_company_profiles(user_id);
CREATE INDEX idx_delivery_profiles_active ON public.delivery_company_profiles(is_active);
CREATE INDEX idx_delivery_profiles_partnership_status ON public.delivery_company_profiles(partnership_status);
CREATE INDEX idx_delivery_service_areas_company_id ON public.delivery_company_service_areas(company_id);
CREATE INDEX idx_delivery_reviews_company_id ON public.delivery_company_reviews(company_id);
CREATE INDEX idx_partnership_requests_company_id ON public.delivery_partnership_requests(company_id);

-- Create function to generate company code
CREATE OR REPLACE FUNCTION public.generate_delivery_company_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    new_code := 'DC-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    
    IF NOT EXISTS (SELECT 1 FROM public.delivery_company_profiles WHERE company_code = new_code) THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Unable to generate unique delivery company code';
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Create function to set company code when creating profile
CREATE OR REPLACE FUNCTION public.set_delivery_company_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.company_code IS NULL OR NEW.company_code = '' THEN
    NEW.company_code := public.generate_delivery_company_code();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for company code generation
CREATE TRIGGER set_delivery_company_code_trigger
BEFORE INSERT ON public.delivery_company_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_delivery_company_code();

-- Create function to update delivery company profile from approved application
CREATE OR REPLACE FUNCTION public.create_delivery_profile_from_application()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only create profile when application is approved
  IF NEW.application_status = 'approved' AND OLD.application_status != 'approved' THEN
    INSERT INTO public.delivery_company_profiles (
      application_id, user_id, company_name, contact_person_name, 
      contact_email, contact_phone, business_address, service_regions,
      vehicle_types, company_size, years_in_business, service_capabilities,
      pricing_model, website_url, social_media_links, logo_url,
      is_verified, partner_since
    ) VALUES (
      NEW.id, NEW.user_id, NEW.company_name, NEW.contact_person_name,
      NEW.contact_email, NEW.contact_phone, NEW.business_address, NEW.service_regions,
      NEW.vehicle_types, NEW.company_size, NEW.years_in_business, NEW.service_capabilities,
      NEW.pricing_model, NEW.website_url, NEW.social_media_links, NEW.logo_url,
      true, now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create profile when application approved
CREATE TRIGGER create_delivery_profile_trigger
AFTER UPDATE ON public.delivery_company_applications
FOR EACH ROW
EXECUTE FUNCTION public.create_delivery_profile_from_application();

-- Create function to update profile completion score
CREATE OR REPLACE FUNCTION public.calculate_delivery_profile_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Basic info (40 points)
  IF NEW.company_name IS NOT NULL AND LENGTH(NEW.company_name) > 0 THEN score := score + 10; END IF;
  IF NEW.contact_email IS NOT NULL AND LENGTH(NEW.contact_email) > 0 THEN score := score + 10; END IF;
  IF NEW.contact_phone IS NOT NULL AND LENGTH(NEW.contact_phone) > 0 THEN score := score + 10; END IF;
  IF NEW.business_address IS NOT NULL AND LENGTH(NEW.business_address) > 0 THEN score := score + 10; END IF;
  
  -- Service details (30 points)
  IF jsonb_array_length(NEW.service_regions) > 0 THEN score := score + 10; END IF;
  IF jsonb_array_length(NEW.vehicle_types) > 0 THEN score := score + 10; END IF;
  IF jsonb_array_length(NEW.service_capabilities) > 0 THEN score := score + 10; END IF;
  
  -- Additional info (30 points)
  IF NEW.logo_url IS NOT NULL AND LENGTH(NEW.logo_url) > 0 THEN score := score + 10; END IF;
  IF NEW.website_url IS NOT NULL AND LENGTH(NEW.website_url) > 0 THEN score := score + 5; END IF;
  IF NEW.years_in_business IS NOT NULL AND NEW.years_in_business > 0 THEN score := score + 5; END IF;
  IF NEW.pricing_model IS NOT NULL AND LENGTH(NEW.pricing_model) > 0 THEN score := score + 5; END IF;
  IF jsonb_object_keys(NEW.social_media_links) IS NOT NULL THEN score := score + 5; END IF;
  
  NEW.profile_completion_score := score;
  RETURN NEW;
END;
$$;

-- Create trigger for profile completion calculation
CREATE TRIGGER calculate_delivery_profile_completion_trigger
BEFORE INSERT OR UPDATE ON public.delivery_company_profiles
FOR EACH ROW
EXECUTE FUNCTION public.calculate_delivery_profile_completion();

-- Add updated_at triggers
CREATE TRIGGER update_delivery_applications_updated_at
BEFORE UPDATE ON public.delivery_company_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_profiles_updated_at
BEFORE UPDATE ON public.delivery_company_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_service_areas_updated_at
BEFORE UPDATE ON public.delivery_company_service_areas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_reviews_updated_at
BEFORE UPDATE ON public.delivery_company_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partnership_requests_updated_at
BEFORE UPDATE ON public.delivery_partnership_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();