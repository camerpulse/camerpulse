-- Phase 3: Tender Management - Step 1: Basic Tables

-- Create tender categories first
CREATE TABLE IF NOT EXISTS public.tender_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
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

-- Create main tenders table
CREATE TABLE IF NOT EXISTS public.tenders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reference_number TEXT UNIQUE NOT NULL,
  category_id UUID,
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

-- Add foreign key after table creation
ALTER TABLE public.tenders 
ADD CONSTRAINT fk_tenders_category 
FOREIGN KEY (category_id) REFERENCES public.tender_categories(id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('tender-documents', 'tender-documents', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('bid-documents', 'bid-documents', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tenders_status ON public.tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_category ON public.tenders(category_id);
CREATE INDEX IF NOT EXISTS idx_tenders_deadline ON public.tenders(submission_deadline);
CREATE INDEX IF NOT EXISTS idx_tenders_created_by ON public.tenders(created_by);
CREATE INDEX IF NOT EXISTS idx_tenders_region ON public.tenders(region);