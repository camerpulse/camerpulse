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