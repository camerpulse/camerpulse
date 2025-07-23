-- Phase 3: Tender Management & Bidding System Database Schema (Fixed)

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

-- Create storage bucket for tender documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('tender-documents', 'tender-documents', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for bid documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('bid-documents', 'bid-documents', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.tender_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tender_categories
CREATE POLICY "Public can view active categories" ON public.tender_categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.tender_categories
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

-- RLS Policies for tenders
CREATE POLICY "Public can view published tenders" ON public.tenders
FOR SELECT USING (status = 'published');

CREATE POLICY "Users can create tenders" ON public.tenders
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can manage their own tenders" ON public.tenders
FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Admins can view all tenders" ON public.tenders
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

-- RLS Policies for tender_documents
CREATE POLICY "Public can view public tender documents" ON public.tender_documents
FOR SELECT USING (
  is_public = true AND 
  EXISTS (SELECT 1 FROM tenders WHERE id = tender_documents.tender_id AND status = 'published')
);

CREATE POLICY "Users can upload tender documents" ON public.tender_documents
FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Tender creators can manage their documents" ON public.tender_documents
FOR ALL USING (
  EXISTS (SELECT 1 FROM tenders WHERE id = tender_documents.tender_id AND created_by = auth.uid())
);

-- RLS Policies for bid_documents
CREATE POLICY "Bidders can manage their own bid documents" ON public.bid_documents
FOR ALL USING (
  EXISTS (SELECT 1 FROM tender_bids WHERE id = bid_documents.bid_id AND bidder_id = auth.uid())
);

CREATE POLICY "Tender creators can view bid documents" ON public.bid_documents
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tender_bids tb
    JOIN tenders t ON t.id = tb.tender_id
    WHERE tb.id = bid_documents.bid_id AND t.created_by = auth.uid()
  )
);

-- RLS Policies for tender_evaluations
CREATE POLICY "Evaluators can manage their evaluations" ON public.tender_evaluations
FOR ALL USING (evaluator_id = auth.uid());

CREATE POLICY "Tender creators can view evaluations" ON public.tender_evaluations
FOR SELECT USING (
  EXISTS (SELECT 1 FROM tenders WHERE id = tender_evaluations.tender_id AND created_by = auth.uid())
);

-- Storage policies for tender-documents bucket
CREATE POLICY "Public can view tender documents" ON storage.objects
FOR SELECT USING (bucket_id = 'tender-documents');

CREATE POLICY "Authenticated users can upload tender documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'tender-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their tender documents" ON storage.objects
FOR UPDATE USING (bucket_id = 'tender-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for bid-documents bucket (private)
CREATE POLICY "Bidders can manage their bid documents" ON storage.objects
FOR ALL USING (bucket_id = 'bid-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenders_status ON public.tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_category ON public.tenders(category_id);
CREATE INDEX IF NOT EXISTS idx_tenders_deadline ON public.tenders(submission_deadline);
CREATE INDEX IF NOT EXISTS idx_tenders_created_by ON public.tenders(created_by);
CREATE INDEX IF NOT EXISTS idx_tenders_region ON public.tenders(region);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_tender_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenders_updated_at
BEFORE UPDATE ON public.tenders
FOR EACH ROW EXECUTE FUNCTION update_tender_updated_at();

CREATE TRIGGER update_tender_evaluations_updated_at
BEFORE UPDATE ON public.tender_evaluations
FOR EACH ROW EXECUTE FUNCTION update_tender_updated_at();

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