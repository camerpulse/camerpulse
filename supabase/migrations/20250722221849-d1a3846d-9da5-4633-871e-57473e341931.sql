-- Create storage buckets for tender documents
INSERT INTO storage.buckets (id, name, public) VALUES 
('tender-documents', 'tender-documents', false),
('business-verification', 'business-verification', false),
('company-documents', 'company-documents', false);

-- Create business verification table
CREATE TABLE public.business_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  company_type TEXT NOT NULL CHECK (company_type IN ('sole_proprietorship', 'partnership', 'corporation', 'cooperative', 'ngo')),
  registration_number TEXT NOT NULL,
  tax_identification_number TEXT,
  business_address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  industry_sector TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_review', 'approved', 'rejected', 'needs_clarification')),
  verification_level TEXT NOT NULL DEFAULT 'basic' CHECK (verification_level IN ('basic', 'enhanced', 'premium')),
  documents_submitted JSONB DEFAULT '[]'::jsonb,
  verification_notes TEXT,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document uploads tracking table
CREATE TABLE public.document_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tender_id UUID REFERENCES public.tenders(id) ON DELETE CASCADE,
  business_verification_id UUID REFERENCES public.business_verifications(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  document_category TEXT NOT NULL,
  upload_status TEXT NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'processing', 'completed', 'failed')),
  virus_scan_status TEXT DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin moderation table
CREATE TABLE public.tender_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  moderator_id UUID NOT NULL,
  moderation_action TEXT NOT NULL CHECK (moderation_action IN ('approve', 'reject', 'request_changes', 'flag', 'suspend')),
  moderation_reason TEXT,
  moderation_notes TEXT,
  previous_status TEXT,
  new_status TEXT,
  flagged_content JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bid moderation table
CREATE TABLE public.bid_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID NOT NULL REFERENCES public.tender_bids(id) ON DELETE CASCADE,
  moderator_id UUID NOT NULL,
  moderation_action TEXT NOT NULL CHECK (moderation_action IN ('approve', 'reject', 'flag', 'verify')),
  moderation_reason TEXT,
  moderation_notes TEXT,
  flagged_content JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_moderation ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business verifications
CREATE POLICY "Users can view their own business verifications" 
ON public.business_verifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business verifications" 
ON public.business_verifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending verifications" 
ON public.business_verifications 
FOR UPDATE 
USING (auth.uid() = user_id AND verification_status IN ('pending', 'needs_clarification'));

CREATE POLICY "Admins can manage all business verifications" 
ON public.business_verifications 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS Policies for document uploads
CREATE POLICY "Users can view their own document uploads" 
ON public.document_uploads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own document uploads" 
ON public.document_uploads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all document uploads" 
ON public.document_uploads 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS Policies for moderation tables
CREATE POLICY "Admins can manage tender moderation" 
ON public.tender_moderation 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Admins can manage bid moderation" 
ON public.bid_moderation 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Storage policies for tender documents
CREATE POLICY "Users can upload their own tender documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'tender-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own tender documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'tender-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all tender documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'tender-documents' AND EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Storage policies for business verification documents
CREATE POLICY "Users can upload their business verification documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'business-verification' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their business verification documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'business-verification' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all business verification documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'business-verification' AND EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Storage policies for company documents
CREATE POLICY "Users can manage their company documents" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'company-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all company documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'company-documents' AND EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Add triggers for updated_at
CREATE TRIGGER update_business_verifications_updated_at
BEFORE UPDATE ON public.business_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_tender_updated_at();

CREATE TRIGGER update_document_uploads_updated_at
BEFORE UPDATE ON public.document_uploads
FOR EACH ROW
EXECUTE FUNCTION public.update_tender_updated_at();