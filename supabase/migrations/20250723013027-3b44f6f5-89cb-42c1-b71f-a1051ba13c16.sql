-- Create document verification table with correct column references
CREATE TABLE IF NOT EXISTS public.tender_document_verification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  tender_id UUID NOT NULL,
  verified_by UUID REFERENCES auth.users(id),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT
);

-- Enable RLS
ALTER TABLE public.tender_document_verification ENABLE ROW LEVEL SECURITY;

-- RLS policies for document verification (using correct column name)
DROP POLICY IF EXISTS "Users can view document verification for their tenders" ON public.tender_document_verification;
CREATE POLICY "Users can view document verification for their tenders" 
ON public.tender_document_verification 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tenders 
    WHERE id = tender_document_verification.tender_id 
    AND published_by_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can manage all document verifications" ON public.tender_document_verification;
CREATE POLICY "Admins can manage all document verifications" 
ON public.tender_document_verification 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "System can create document verification records" ON public.tender_document_verification;
CREATE POLICY "System can create document verification records" 
ON public.tender_document_verification 
FOR INSERT 
WITH CHECK (true);