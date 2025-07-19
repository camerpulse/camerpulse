-- Create function to send approval email when artist application is approved
CREATE OR REPLACE FUNCTION public.send_artist_approval_email()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  artist_profile_url TEXT;
BEGIN
  -- Get user email from auth.users
  SELECT au.email
  INTO user_email
  FROM auth.users au
  WHERE au.id = NEW.user_id;
  
  -- Generate artist profile link
  artist_profile_url := 'https://camerplay.com/artists/' || NEW.stage_name;
  
  -- Only send email if we have valid email and application is newly approved
  IF user_email IS NOT NULL AND user_email != '' AND NEW.application_status = 'approved' THEN
    -- Call the edge function to send approval email
    PERFORM
      net.http_post(
        url := 'https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/send-artist-approval-email',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4MTc4MCwiZXhwIjoyMDY3ODU3NzgwfQ.LMa9Y06Y7lJUdnRWlT6d6lYhq2WkJKyUEUj5m3rOGUY"}'::jsonb,
        body := json_build_object(
          'stage_name', NEW.stage_name,
          'email', user_email,
          'artist_profile_link', artist_profile_url
        )::text
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to send approval email when application status changes to approved
DROP TRIGGER IF EXISTS artist_approval_email_trigger ON public.artist_applications;
CREATE TRIGGER artist_approval_email_trigger
  AFTER UPDATE OF application_status ON public.artist_applications
  FOR EACH ROW
  WHEN (OLD.application_status IS DISTINCT FROM NEW.application_status AND NEW.application_status = 'approved')
  EXECUTE FUNCTION public.send_artist_approval_email();