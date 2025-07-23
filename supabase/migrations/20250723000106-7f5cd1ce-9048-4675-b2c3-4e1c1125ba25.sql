-- Create storage bucket for tender documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tender-documents', 'tender-documents', true);

-- Create RLS policies for tender documents bucket
CREATE POLICY "Anyone can view tender documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'tender-documents');

CREATE POLICY "Authenticated users can upload tender documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'tender-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own tender documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'tender-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own tender documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'tender-documents' AND auth.role() = 'authenticated');