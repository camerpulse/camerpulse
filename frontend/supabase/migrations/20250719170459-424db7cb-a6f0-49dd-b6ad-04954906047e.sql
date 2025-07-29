-- Create function to send ticket confirmation email
CREATE OR REPLACE FUNCTION public.send_ticket_confirmation_email()
RETURNS TRIGGER AS $$
DECLARE
  event_record RECORD;
  formatted_datetime TEXT;
BEGIN
  -- Get event details
  SELECT 
    title, 
    location, 
    start_date_time
  INTO event_record
  FROM public.events 
  WHERE id = NEW.event_id;
  
  -- Format the datetime
  formatted_datetime := to_char(event_record.start_date_time, 'Day, Month DD, YYYY at HH:MI AM');
  
  -- Call the edge function to send email
  PERFORM net.http_post(
    url := 'https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/send-ticket-confirmation-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODE3ODAsImV4cCI6MjA2Nzg1Nzc4MH0.4GKFhQTxlEzj6oTcfnAZQpPxPHW0nqGDEfBe-gVGoNE"}'::jsonb,
    body := jsonb_build_object(
      'full_name', NEW.full_name,
      'email', NEW.email,
      'event_name', event_record.title,
      'event_location', event_record.location,
      'event_datetime', formatted_datetime,
      'ticket_type', NEW.ticket_type,
      'qr_code_link', CASE 
        WHEN NEW.qr_code_data IS NOT NULL 
        THEN 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' || NEW.qr_code_data
        ELSE NULL 
      END
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for ticket confirmation emails
DROP TRIGGER IF EXISTS send_ticket_confirmation_trigger ON public.ticket_purchases;
CREATE TRIGGER send_ticket_confirmation_trigger
  AFTER INSERT ON public.ticket_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.send_ticket_confirmation_email();