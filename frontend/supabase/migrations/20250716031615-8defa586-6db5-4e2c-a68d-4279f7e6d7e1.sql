-- Create enum for company types
CREATE TYPE public.company_type AS ENUM ('sole_proprietor', 'limited_company', 'public_company');

-- Create enum for company status
CREATE TYPE public.company_status AS ENUM ('pending', 'approved', 'suspended', 'rejected');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_type company_type NOT NULL,
  sector TEXT NOT NULL,
  description TEXT,
  physical_address TEXT NOT NULL,
  region TEXT NOT NULL,
  division TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  website_url TEXT,
  social_media_links JSONB DEFAULT '{}',
  employee_count_range TEXT NOT NULL,
  past_management TEXT,
  tax_identification_number TEXT NOT NULL UNIQUE,
  estimated_net_worth BIGINT,
  logo_url TEXT,
  cover_photo_url TEXT,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  status company_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  payment_amount INTEGER,
  payment_date TIMESTAMPTZ,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create company ratings table
CREATE TABLE public.company_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_moderated BOOLEAN DEFAULT false,
  moderated_by UUID,
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- Create company jobs table
CREATE TABLE public.company_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  job_description TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_range TEXT,
  requirements TEXT,
  application_link TEXT,
  application_email TEXT,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create company updates table
CREATE TABLE public.company_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  update_type TEXT DEFAULT 'general',
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create company payments table
CREATE TABLE public.company_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  payment_method TEXT DEFAULT 'stripe',
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'XAF',
  company_type company_type NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status payment_status DEFAULT 'pending',
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create company creation requests table
CREATE TABLE public.company_creation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_name TEXT NOT NULL,
  founder_email TEXT NOT NULL,
  founder_phone TEXT NOT NULL,
  company_type company_type NOT NULL,
  preferred_location TEXT NOT NULL,
  business_plan_url TEXT,
  id_card_url TEXT,
  additional_documents JSONB DEFAULT '[]',
  legal_terms_accepted BOOLEAN NOT NULL DEFAULT false,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  processed_by UUID,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_creation_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Companies are viewable by everyone" ON public.companies
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can create their own company" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company" ON public.companies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all companies" ON public.companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for company ratings
CREATE POLICY "Ratings are viewable by everyone" ON public.company_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can create ratings for approved companies" ON public.company_ratings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM companies WHERE id = company_id AND status = 'approved')
  );

CREATE POLICY "Users can update their own ratings" ON public.company_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ratings" ON public.company_ratings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for company jobs
CREATE POLICY "Jobs are viewable by everyone for approved companies" ON public.company_jobs
  FOR SELECT USING (
    is_active = true AND 
    EXISTS (SELECT 1 FROM companies WHERE id = company_id AND status = 'approved')
  );

CREATE POLICY "Company owners can manage their jobs" ON public.company_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE id = company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all jobs" ON public.company_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for company updates
CREATE POLICY "Updates are viewable by everyone for approved companies" ON public.company_updates
  FOR SELECT USING (
    is_published = true AND 
    EXISTS (SELECT 1 FROM companies WHERE id = company_id AND status = 'approved')
  );

CREATE POLICY "Company owners can manage their updates" ON public.company_updates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE id = company_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for company payments
CREATE POLICY "Users can view their own payments" ON public.company_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments" ON public.company_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.company_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for company creation requests
CREATE POLICY "Admins can manage creation requests" ON public.company_creation_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can create requests" ON public.company_creation_requests
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_companies_status ON public.companies(status);
CREATE INDEX idx_companies_region ON public.companies(region);
CREATE INDEX idx_companies_sector ON public.companies(sector);
CREATE INDEX idx_companies_rating ON public.companies(average_rating DESC);
CREATE INDEX idx_companies_views ON public.companies(profile_views DESC);
CREATE INDEX idx_company_jobs_active ON public.company_jobs(is_active, created_at DESC);
CREATE INDEX idx_company_updates_published ON public.company_updates(is_published, created_at DESC);

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_ratings_updated_at BEFORE UPDATE ON public.company_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_jobs_updated_at BEFORE UPDATE ON public.company_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_updates_updated_at BEFORE UPDATE ON public.company_updates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update company ratings
CREATE OR REPLACE FUNCTION update_company_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.companies 
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM public.company_ratings 
      WHERE company_id = COALESCE(NEW.company_id, OLD.company_id)
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM public.company_ratings 
      WHERE company_id = COALESCE(NEW.company_id, OLD.company_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.company_id, OLD.company_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.company_ratings
  FOR EACH ROW EXECUTE FUNCTION update_company_ratings();