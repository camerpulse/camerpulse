-- Create debt refresh tracking table
CREATE TABLE IF NOT EXISTS public.debt_refresh_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  refresh_type TEXT NOT NULL CHECK (refresh_type IN ('scheduled', 'manual')),
  triggered_by UUID REFERENCES auth.users(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  sources_scraped TEXT[],
  records_updated INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.debt_refresh_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view refresh logs"
ON public.debt_refresh_logs
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage refresh logs"
ON public.debt_refresh_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Add last_refreshed column to debt_sources table
ALTER TABLE public.debt_sources ADD COLUMN IF NOT EXISTS last_refreshed TIMESTAMP WITH TIME ZONE;

-- Update debt_sources with sample last refresh times
UPDATE public.debt_sources 
SET last_refreshed = now() - INTERVAL '23 hours' 
WHERE name = 'Ministry of Finance';

UPDATE public.debt_sources 
SET last_refreshed = now() - INTERVAL '25 hours' 
WHERE name = 'International Monetary Fund';

-- Create function to schedule debt refresh
CREATE OR REPLACE FUNCTION schedule_debt_refresh()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This will be called by pg_cron
  INSERT INTO public.debt_refresh_logs (
    refresh_type,
    status,
    sources_scraped
  ) VALUES (
    'scheduled',
    'running',
    ARRAY['minfi.gov.cm', 'imf.org', 'beac.int', 'worldbank.org']
  );
END;
$$;