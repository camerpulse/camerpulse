-- Create function to send welcome email when artist application is submitted
CREATE OR REPLACE FUNCTION public.send_artist_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_full_name TEXT;
BEGIN
  -- Get user email and name from auth.users and profiles
  SELECT 
    COALESCE(au.email, ''),
    COALESCE(p.display_name, au.raw_user_meta_data->>'full_name', NEW.real_name, '')
  INTO user_email, user_full_name
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id
  WHERE au.id = NEW.user_id;
  
  -- Only send email if we have valid email and application is newly submitted
  IF user_email IS NOT NULL AND user_email != '' AND NEW.application_status = 'submitted' THEN
    -- Call the edge function to send welcome email
    PERFORM
      net.http_post(
        url := 'https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/send-artist-welcome-email',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4MTc4MCwiZXhwIjoyMDY3ODU3NzgwfQ.LMa9Y06Y7lJUdnRWlT6d6lYhq2WkJKyUEUj5m3rOGUY"}'::jsonb,
        body := json_build_object(
          'full_name', user_full_name,
          'stage_name', NEW.stage_name,
          'email', user_email,
          'artist_profile_link', CASE 
            WHEN NEW.id IS NOT NULL 
            THEN 'https://camerplay.com/artists/' || NEW.id 
            ELSE NULL 
          END
        )::text
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to send welcome email on new artist applications
DROP TRIGGER IF EXISTS artist_welcome_email_trigger ON public.artist_applications;
CREATE TRIGGER artist_welcome_email_trigger
  AFTER INSERT ON public.artist_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_artist_welcome_email();

-- Also trigger on status updates (when application status changes to submitted)
DROP TRIGGER IF EXISTS artist_welcome_email_update_trigger ON public.artist_applications;
CREATE TRIGGER artist_welcome_email_update_trigger
  AFTER UPDATE OF application_status ON public.artist_applications
  FOR EACH ROW
  WHEN (OLD.application_status IS DISTINCT FROM NEW.application_status AND NEW.application_status = 'submitted')
  EXECUTE FUNCTION public.send_artist_welcome_email();