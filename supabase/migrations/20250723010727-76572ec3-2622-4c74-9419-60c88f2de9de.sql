-- Create audit logs table for tender actions
CREATE TABLE IF NOT EXISTS public.tender_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  action_by TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tender statistics table
CREATE TABLE IF NOT EXISTS public.tender_statistics (
  date DATE NOT NULL PRIMARY KEY,
  total_closed INTEGER NOT NULL DEFAULT 0,
  automatic_closures INTEGER NOT NULL DEFAULT 0,
  manual_closures INTEGER NOT NULL DEFAULT 0,
  last_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.tender_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit logs
CREATE POLICY "Users can view audit logs for their tenders" 
ON public.tender_audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tenders 
    WHERE tenders.id = tender_audit_logs.tender_id 
    AND tenders.published_by_user_id = auth.uid()
  )
);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for statistics (public read)
CREATE POLICY "Anyone can view tender statistics" 
ON public.tender_statistics 
FOR SELECT 
USING (true);

-- Create function to update statistics timestamps
CREATE OR REPLACE FUNCTION public.update_tender_statistics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for statistics table
CREATE TRIGGER update_tender_statistics_updated_at
BEFORE UPDATE ON public.tender_statistics
FOR EACH ROW
EXECUTE FUNCTION public.update_tender_statistics_updated_at();

-- Create storage bucket for tender documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tender-documents', 'tender-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for tender documents
CREATE POLICY "Anyone can view tender documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'tender-documents');

CREATE POLICY "Authenticated users can upload tender documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'tender-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own tender documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'tender-documents' AND auth.uid() IS NOT NULL);

-- Set up daily cron job to automatically close expired tenders
SELECT cron.schedule(
  'close-expired-tenders',
  '0 0 * * *', -- Run daily at midnight
  $$
  SELECT
    net.http_post(
        url:='https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/tender-closure',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODE3ODAsImV4cCI6MjA2Nzg1Nzc4MH0.4GKFhQTxlEzj6oTcfnAZQpPxPHW0nqGDEfBe-gVGoNE"}'::jsonb,
        body:='{"manual": false}'::jsonb
    ) as request_id;
  $$
);