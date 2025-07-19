-- Create function to send award nomination email
CREATE OR REPLACE FUNCTION public.send_award_nomination_email()
RETURNS TRIGGER AS $$
DECLARE
  artist_record RECORD;
  dashboard_url TEXT;
BEGIN
  -- Get artist information from the nomination
  SELECT 
    COALESCE(am.stage_name, p.display_name, au.raw_user_meta_data->>'full_name', 'Artist') as artist_name,
    au.email
  INTO artist_record
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id
  LEFT JOIN artist_memberships am ON am.user_id = au.id
  WHERE au.id = NEW.artist_id;
  
  -- Generate dashboard URL
  dashboard_url := 'https://camerplay.com/awards/dashboard/' || NEW.artist_id;
  
  -- Only send email if we have valid email and artist info
  IF artist_record.email IS NOT NULL AND artist_record.email != '' AND artist_record.artist_name IS NOT NULL THEN
    -- Call the edge function to send nomination email
    PERFORM net.http_post(
      url := 'https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/send-award-nomination-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODE3ODAsImV4cCI6MjA2Nzg1Nzc4MH0.4GKFhQTxlEzj6oTcfnAZQpPxPHW0nqGDEfBe-gVGoNE"}'::jsonb,
      body := jsonb_build_object(
        'artist_name', artist_record.artist_name,
        'email', artist_record.email,
        'award_category', NEW.category,
        'award_dashboard_link', dashboard_url
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create awards table if it doesn't exist (for nominations)
CREATE TABLE IF NOT EXISTS public.award_nominations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL,
  category TEXT NOT NULL,
  award_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  nomination_status TEXT NOT NULL DEFAULT 'nominated',
  votes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  nominated_by UUID,
  nomination_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on award nominations
ALTER TABLE public.award_nominations ENABLE ROW LEVEL SECURITY;

-- RLS policies for award nominations
CREATE POLICY "Anyone can view active nominations" ON public.award_nominations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage all nominations" ON public.award_nominations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Artists can view their own nominations" ON public.award_nominations
  FOR SELECT USING (auth.uid() = artist_id);

-- Create trigger for award nomination emails
DROP TRIGGER IF EXISTS send_award_nomination_trigger ON public.award_nominations;
CREATE TRIGGER send_award_nomination_trigger
  AFTER INSERT ON public.award_nominations
  FOR EACH ROW
  EXECUTE FUNCTION public.send_award_nomination_email();