-- Create petition engine integration tables
CREATE TABLE IF NOT EXISTS public.petition_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL,
  petition_id TEXT NOT NULL,
  petition_title TEXT NOT NULL,
  petition_description TEXT,
  petition_status TEXT NOT NULL DEFAULT 'active',
  petition_votes INTEGER NOT NULL DEFAULT 0,
  petition_url TEXT,
  connection_type TEXT NOT NULL DEFAULT 'related', -- 'related', 'complaint', 'support'
  auto_created BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  petition_deadline TIMESTAMP WITH TIME ZONE,
  last_synced_at TIMESTAMP WITH TIME ZONE
);

-- Create petition alerts table
CREATE TABLE IF NOT EXISTS public.petition_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_connection_id UUID REFERENCES public.petition_connections(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'vote_milestone', 'status_change', 'deadline_approaching'
  alert_title TEXT NOT NULL,
  alert_message TEXT NOT NULL,
  votes_threshold INTEGER,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.petition_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for petition connections
CREATE POLICY "Anyone can view petition connections" 
ON public.petition_connections 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create petition connections" 
ON public.petition_connections 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own petition connections" 
ON public.petition_connections 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all petition connections" 
ON public.petition_connections 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS policies for petition alerts
CREATE POLICY "Users can view alerts for their connections" 
ON public.petition_alerts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.petition_connections 
    WHERE id = petition_alerts.petition_connection_id 
    AND created_by = auth.uid()
  )
);

CREATE POLICY "System can manage petition alerts" 
ON public.petition_alerts 
FOR ALL 
USING (true);

-- Create indexes
CREATE INDEX idx_petition_connections_tender_id ON public.petition_connections(tender_id);
CREATE INDEX idx_petition_connections_petition_id ON public.petition_connections(petition_id);
CREATE INDEX idx_petition_connections_status ON public.petition_connections(petition_status);
CREATE INDEX idx_petition_alerts_connection_id ON public.petition_alerts(petition_connection_id);

-- Create function to update petition connection timestamps
CREATE OR REPLACE FUNCTION public.update_petition_connection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_petition_connections_updated_at
BEFORE UPDATE ON public.petition_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_petition_connection_updated_at();

-- Create function to sync petition data
CREATE OR REPLACE FUNCTION public.sync_petition_data(p_petition_id TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{"status": "initiated", "petition_id": ""}';
BEGIN
  -- This function would be called by the edge function to sync petition data
  result := result || jsonb_build_object(
    'petition_id', p_petition_id,
    'sync_timestamp', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for petition connections
ALTER TABLE public.petition_connections REPLICA IDENTITY FULL;
ALTER TABLE public.petition_alerts REPLICA IDENTITY FULL;