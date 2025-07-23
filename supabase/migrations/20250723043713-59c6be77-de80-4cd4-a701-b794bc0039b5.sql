-- Phase 3: Tender Management & Bidding System - Tables Only

-- Create tender categories for classification
CREATE TABLE IF NOT EXISTS public.tender_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_category_id UUID REFERENCES public.tender_categories(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create main tenders table
CREATE TABLE IF NOT EXISTS public.tenders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reference_number TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES public.tender_categories(id),
  organization_name TEXT NOT NULL,
  organization_contact TEXT,
  organization_email TEXT,
  
  -- Financial details
  estimated_value_fcfa BIGINT,
  estimated_value_usd BIGINT,
  currency TEXT NOT NULL DEFAULT 'XAF',
  
  -- Location and scope
  region TEXT,
  location_details TEXT,
  scope_of_work TEXT,
  
  -- Timeline
  submission_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  opening_date TIMESTAMP WITH TIME ZONE,
  project_start_date TIMESTAMP WITH TIME ZONE,
  project_end_date TIMESTAMP WITH TIME ZONE,
  
  -- Status and requirements
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'awarded', 'cancelled')),
  minimum_qualification TEXT,
  required_documents TEXT[],
  
  -- Metadata
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Stats
  view_count INTEGER NOT NULL DEFAULT 0,
  bids_count INTEGER NOT NULL DEFAULT 0,
  
  -- Additional info
  terms_and_conditions TEXT,
  evaluation_criteria TEXT,
  contact_person TEXT,
  contact_phone TEXT
);

-- Create tender documents table
CREATE TABLE IF NOT EXISTS public.tender_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  document_type TEXT NOT NULL DEFAULT 'general' CHECK (document_type IN ('specification', 'drawing', 'terms', 'general', 'amendment')),
  description TEXT,
  uploaded_by UUID NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bid documents table
CREATE TABLE IF NOT EXISTS public.bid_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bid_id UUID NOT NULL REFERENCES public.tender_bids(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  document_type TEXT NOT NULL DEFAULT 'general' CHECK (document_type IN ('technical', 'financial', 'qualification', 'certificate', 'general')),
  description TEXT,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tender evaluations table
CREATE TABLE IF NOT EXISTS public.tender_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES public.tender_bids(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL,
  
  -- Evaluation criteria scores
  technical_score NUMERIC(5,2),
  financial_score NUMERIC(5,2),
  experience_score NUMERIC(5,2),
  compliance_score NUMERIC(5,2),
  total_score NUMERIC(5,2),
  
  -- Evaluation details
  comments TEXT,
  recommendations TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'approved')),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(tender_id, bid_id, evaluator_id)
);

-- Insert default tender categories
INSERT INTO public.tender_categories (name, description) VALUES
('Infrastructure', 'Roads, bridges, buildings, and construction projects'),
('Technology', 'IT services, software development, and digital solutions'),
('Healthcare', 'Medical equipment, pharmaceuticals, and health services'),
('Education', 'Educational materials, training, and institutional services'),
('Transportation', 'Vehicles, logistics, and transport services'),
('Environment', 'Environmental protection, waste management, and sustainability'),
('Security', 'Safety equipment, security services, and surveillance'),
('Energy', 'Power generation, renewable energy, and utilities'),
('Agriculture', 'Agricultural equipment, supplies, and rural development'),
('Consulting', 'Professional services, advisory, and consultancy')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenders_status ON public.tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_category ON public.tenders(category_id);
CREATE INDEX IF NOT EXISTS idx_tenders_deadline ON public.tenders(submission_deadline);
CREATE INDEX IF NOT EXISTS idx_tenders_created_by ON public.tenders(created_by);
CREATE INDEX IF NOT EXISTS idx_tenders_region ON public.tenders(region);