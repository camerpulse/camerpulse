-- Create function to send correction email when artist application needs changes
CREATE OR REPLACE FUNCTION public.send_artist_correction_email()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_full_name TEXT;
  edit_url TEXT;
  rejection_reasons_text TEXT;
BEGIN
  -- Get user email and name from auth.users and profiles
  SELECT 
    COALESCE(au.email, ''),
    COALESCE(p.display_name, au.raw_user_meta_data->>'full_name', NEW.real_name, '')
  INTO user_email, user_full_name
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id
  WHERE au.id = NEW.user_id;
  
  -- Generate edit link
  edit_url := 'https://camerplay.com/camerplay/submit-artist?edit=' || NEW.id;
  
  -- Format rejection reasons from admin_notes or rejection_reason
  rejection_reasons_text := COALESCE(NEW.rejection_reason, NEW.admin_notes, 'Please review and update your submission details.');
  
  -- Only send email if we have valid email and application needs changes
  IF user_email IS NOT NULL AND user_email != '' AND NEW.application_status = 'needs_changes' THEN
    -- Call the edge function to send correction email
    PERFORM
      net.http_post(
        url := 'https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/send-artist-correction-email',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4MTc4MCwiZXhwIjoyMDY3ODU3NzgwfQ.LMa9Y06Y7lJUdnRWlT6d6lYhq2WkJKyUEUj5m3rOGUY"}'::jsonb,
        body := json_build_object(
          'full_name', user_full_name,
          'stage_name', NEW.stage_name,
          'email', user_email,
          'edit_link', edit_url,
          'rejection_reasons', rejection_reasons_text
        )::text
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to send correction email when application status changes to needs_changes
DROP TRIGGER IF EXISTS artist_correction_email_trigger ON public.artist_applications;
CREATE TRIGGER artist_correction_email_trigger
  AFTER UPDATE OF application_status ON public.artist_applications
  FOR EACH ROW
  WHEN (OLD.application_status IS DISTINCT FROM NEW.application_status AND NEW.application_status = 'needs_changes')
  EXECUTE FUNCTION public.send_artist_correction_email();