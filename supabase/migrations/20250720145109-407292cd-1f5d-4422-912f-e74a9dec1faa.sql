-- Create storage bucket for audit documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('audit-documents', 'audit-documents', false);

-- Storage policies for audit documents
CREATE POLICY "Authenticated users can upload audit documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audit-documents' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view documents for approved audits"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'audit-documents' AND
  EXISTS (
    SELECT 1 FROM public.audit_documents ad
    JOIN public.audit_registry ar ON ad.audit_id = ar.id
    WHERE ad.file_path = storage.objects.name
    AND ar.status = 'approved'
  )
);

CREATE POLICY "Admins can manage all audit documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'audit-documents' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);