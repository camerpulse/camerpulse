-- Create company profiles table and user role management improvements

-- Company profiles table for tender platform
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_registration_number TEXT,
  company_type TEXT NOT NULL DEFAULT 'private',
  industry_sector TEXT,
  company_size TEXT DEFAULT 'small',
  website_url TEXT,
  phone_number TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  region TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Cameroon',
  business_description TEXT,
  tax_id TEXT,
  registration_documents JSONB DEFAULT '[]'::jsonb,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verification_documents JSONB DEFAULT '[]'::jsonb,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  annual_revenue_fcfa BIGINT,
  employee_count INTEGER,
  founding_year INTEGER,
  certifications JSONB DEFAULT '[]'::jsonb,
  bank_details JSONB DEFAULT '{}'::jsonb,
  contact_person_name TEXT,
  contact_person_position TEXT,
  contact_person_email TEXT,
  contact_person_phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  can_bid BOOLEAN NOT NULL DEFAULT false,
  can_issue_tenders BOOLEAN NOT NULL DEFAULT false,
  company_logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- RLS policies for companies
CREATE POLICY "Users can view verified companies" 
ON public.companies 
FOR SELECT 
USING (verification_status = 'verified' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own company profile" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company profile" 
ON public.companies 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all companies" 
ON public.companies 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create email verification tokens table
CREATE TABLE public.email_verification_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  token_type TEXT NOT NULL DEFAULT 'email_verification',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on email verification tokens
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for email verification tokens
CREATE POLICY "Users can view their own tokens" 
ON public.email_verification_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create tokens" 
ON public.email_verification_tokens 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update tokens" 
ON public.email_verification_tokens 
FOR UPDATE 
USING (true);

-- Add new user types to app_role enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
    CREATE TYPE user_role_type AS ENUM ('bidder', 'issuer', 'admin', 'moderator', 'user');
  END IF;
END $$;

-- Create user profile extensions table
CREATE TABLE public.user_profile_extensions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  phone_number TEXT,
  date_of_birth DATE,
  gender TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  region TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Cameroon',
  occupation TEXT,
  organization TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  facebook_url TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  preferred_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'Africa/Douala',
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
  privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "contact_visibility": "limited"}'::jsonb,
  account_verification_level INTEGER DEFAULT 0,
  id_document_type TEXT,
  id_document_number TEXT,
  id_document_url TEXT,
  id_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user profile extensions
ALTER TABLE public.user_profile_extensions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user profile extensions
CREATE POLICY "Users can view their own profile extensions" 
ON public.user_profile_extensions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile extensions" 
ON public.user_profile_extensions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile extensions" 
ON public.user_profile_extensions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profile extensions" 
ON public.user_profile_extensions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Function to automatically create profile extensions
CREATE OR REPLACE FUNCTION public.create_profile_extensions()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profile_extensions (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile extensions when profile is created
CREATE TRIGGER create_profile_extensions_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_extensions();

-- Create indexes for better performance
CREATE INDEX idx_companies_user_id ON public.companies(user_id);
CREATE INDEX idx_companies_verification_status ON public.companies(verification_status);
CREATE INDEX idx_companies_region ON public.companies(region);
CREATE INDEX idx_companies_industry_sector ON public.companies(industry_sector);
CREATE INDEX idx_email_verification_tokens_user_id ON public.email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_token ON public.email_verification_tokens(token);
CREATE INDEX idx_user_profile_extensions_user_id ON public.user_profile_extensions(user_id);

-- Update trigger for companies table
CREATE OR REPLACE FUNCTION public.update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_companies_updated_at();

-- Update trigger for user profile extensions table
CREATE OR REPLACE FUNCTION public.update_user_profile_extensions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profile_extensions_updated_at
  BEFORE UPDATE ON public.user_profile_extensions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_profile_extensions_updated_at();