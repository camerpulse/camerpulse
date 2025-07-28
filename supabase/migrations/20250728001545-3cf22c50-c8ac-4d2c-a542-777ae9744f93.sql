-- Create shipping company registration and management tables

-- Create enum for company types (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE shipping_company_type AS ENUM ('bike', 'bus', 'van', 'plane', 'mixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for delivery scope (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE delivery_scope AS ENUM ('local', 'national', 'international');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for subscription tiers (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('small_agent', 'medium_courier', 'nationwide_express', 'white_label');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new values to existing verification_status enum if they don't exist
DO $$ BEGIN
    ALTER TYPE verification_status ADD VALUE IF NOT EXISTS 'active';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE verification_status ADD VALUE IF NOT EXISTS 'suspended';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Main shipping companies table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.shipping_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_type shipping_company_type NOT NULL,
  tax_number TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Cameroon',
  delivery_scope delivery_scope NOT NULL DEFAULT 'local',
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  
  -- Verification and status (using existing verification_status enum)
  verification_status verification_status NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Subscription and billing
  subscription_tier subscription_tier NOT NULL DEFAULT 'small_agent',
  subscription_active BOOLEAN NOT NULL DEFAULT false,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  registration_fee_paid NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  stripe_customer_id TEXT,
  
  -- Company settings
  terms_conditions TEXT,
  price_list JSONB DEFAULT '[]'::jsonb,
  delivery_timeframes JSONB DEFAULT '{}'::jsonb,
  brand_colors JSONB DEFAULT '{"primary": "#000000", "secondary": "#ffffff"}'::jsonb,
  
  -- Metadata
  total_shipments INTEGER DEFAULT 0,
  completed_shipments INTEGER DEFAULT 0,
  average_rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add constraints only if table was just created
DO $$ BEGIN
    ALTER TABLE public.shipping_companies ADD CONSTRAINT shipping_companies_company_name_key UNIQUE(company_name);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.shipping_companies ADD CONSTRAINT shipping_companies_tax_number_key UNIQUE(tax_number);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Company branches table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.shipping_company_branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.shipping_companies(id) ON DELETE CASCADE,
  branch_name TEXT NOT NULL,
  branch_code TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  manager_name TEXT,
  is_main_branch BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  operating_hours JSONB DEFAULT '{"monday": "08:00-18:00", "tuesday": "08:00-18:00", "wednesday": "08:00-18:00", "thursday": "08:00-18:00", "friday": "08:00-18:00", "saturday": "08:00-13:00", "sunday": "closed"}'::jsonb,
  services_offered JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add branch constraints
DO $$ BEGIN
    ALTER TABLE public.shipping_company_branches ADD CONSTRAINT shipping_company_branches_company_id_branch_code_key UNIQUE(company_id, branch_code);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Company documents table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.shipping_company_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.shipping_companies(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'business_license', 'tax_certificate', 'insurance', 'id_card', 'other'
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Company staff/users table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.shipping_company_staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.shipping_companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff', -- 'owner', 'manager', 'staff', 'agent'
  branch_id UUID REFERENCES public.shipping_company_branches(id),
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '[]'::jsonb,
  hired_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add staff constraints
DO $$ BEGIN
    ALTER TABLE public.shipping_company_staff ADD CONSTRAINT shipping_company_staff_company_id_user_id_key UNIQUE(company_id, user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enable Row Level Security
ALTER TABLE public.shipping_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_company_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_company_staff ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shipping_companies
DROP POLICY IF EXISTS "Company owners can manage their company" ON public.shipping_companies;
CREATE POLICY "Company owners can manage their company" 
ON public.shipping_companies 
FOR ALL 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Company staff can view their company" ON public.shipping_companies;
CREATE POLICY "Company staff can view their company" 
ON public.shipping_companies 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.shipping_company_staff 
  WHERE company_id = shipping_companies.id 
  AND user_id = auth.uid() 
  AND is_active = true
));

DROP POLICY IF EXISTS "Admins can manage all companies" ON public.shipping_companies;
CREATE POLICY "Admins can manage all companies" 
ON public.shipping_companies 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

DROP POLICY IF EXISTS "Public can view verified companies" ON public.shipping_companies;
CREATE POLICY "Public can view verified companies" 
ON public.shipping_companies 
FOR SELECT 
USING (verification_status = 'verified' AND subscription_active = true);

-- RLS Policies for shipping_company_branches
DROP POLICY IF EXISTS "Company members can manage branches" ON public.shipping_company_branches;
CREATE POLICY "Company members can manage branches" 
ON public.shipping_company_branches 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.shipping_companies sc
  LEFT JOIN public.shipping_company_staff scs ON sc.id = scs.company_id
  WHERE sc.id = shipping_company_branches.company_id 
  AND (sc.user_id = auth.uid() OR (scs.user_id = auth.uid() AND scs.is_active = true))
));

DROP POLICY IF EXISTS "Public can view active branches" ON public.shipping_company_branches;
CREATE POLICY "Public can view active branches" 
ON public.shipping_company_branches 
FOR SELECT 
USING (is_active = true AND EXISTS (
  SELECT 1 FROM public.shipping_companies 
  WHERE id = shipping_company_branches.company_id 
  AND verification_status = 'verified' 
  AND subscription_active = true
));

-- RLS Policies for shipping_company_documents
DROP POLICY IF EXISTS "Company owners can manage documents" ON public.shipping_company_documents;
CREATE POLICY "Company owners can manage documents" 
ON public.shipping_company_documents 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.shipping_companies 
  WHERE id = shipping_company_documents.company_id 
  AND user_id = auth.uid()
));

DROP POLICY IF EXISTS "Admins can view all documents" ON public.shipping_company_documents;
CREATE POLICY "Admins can view all documents" 
ON public.shipping_company_documents 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for shipping_company_staff
DROP POLICY IF EXISTS "Company owners can manage staff" ON public.shipping_company_staff;
CREATE POLICY "Company owners can manage staff" 
ON public.shipping_company_staff 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.shipping_companies 
  WHERE id = shipping_company_staff.company_id 
  AND user_id = auth.uid()
));

DROP POLICY IF EXISTS "Staff can view their own record" ON public.shipping_company_staff;
CREATE POLICY "Staff can view their own record" 
ON public.shipping_company_staff 
FOR SELECT 
USING (user_id = auth.uid());

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_shipping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_shipping_companies_updated_at ON public.shipping_companies;
CREATE TRIGGER update_shipping_companies_updated_at
  BEFORE UPDATE ON public.shipping_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shipping_updated_at();

DROP TRIGGER IF EXISTS update_shipping_company_branches_updated_at ON public.shipping_company_branches;
CREATE TRIGGER update_shipping_company_branches_updated_at
  BEFORE UPDATE ON public.shipping_company_branches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shipping_updated_at();

DROP TRIGGER IF EXISTS update_shipping_company_documents_updated_at ON public.shipping_company_documents;
CREATE TRIGGER update_shipping_company_documents_updated_at
  BEFORE UPDATE ON public.shipping_company_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shipping_updated_at();

DROP TRIGGER IF EXISTS update_shipping_company_staff_updated_at ON public.shipping_company_staff;
CREATE TRIGGER update_shipping_company_staff_updated_at
  BEFORE UPDATE ON public.shipping_company_staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shipping_updated_at();

-- Function to generate company code
CREATE OR REPLACE FUNCTION public.generate_company_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    new_code := 'SHIP-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    
    IF NOT EXISTS (SELECT 1 FROM public.shipping_companies WHERE id::text = new_code) THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Unable to generate unique company code';
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;