-- Enable full database integration for senator email notifications
-- Create senator_email_preferences table if it doesn't exist

CREATE TABLE IF NOT EXISTS public.senator_email_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  senator_claim_notifications BOOLEAN DEFAULT true,
  senator_report_notifications BOOLEAN DEFAULT true,
  senator_message_notifications BOOLEAN DEFAULT true,
  general_notifications BOOLEAN DEFAULT true,
  email_frequency TEXT DEFAULT 'immediate', -- immediate, daily, weekly
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.senator_email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for senator_email_preferences
CREATE POLICY "Users can manage their own email preferences" 
ON public.senator_email_preferences 
FOR ALL 
USING (user_id = auth.uid());

-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_senator_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_senator_email_preferences_updated_at ON public.senator_email_preferences;
CREATE TRIGGER update_senator_email_preferences_updated_at
BEFORE UPDATE ON public.senator_email_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_senator_email_updated_at();