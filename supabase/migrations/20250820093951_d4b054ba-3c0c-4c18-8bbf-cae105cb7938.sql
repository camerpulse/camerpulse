-- Add SET search_path to trigger SECURITY DEFINER functions (batch 4)
-- log_transaction_status_change
CREATE OR REPLACE FUNCTION public.log_transaction_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.transaction_status_history (
      transaction_id,
      old_status,
      new_status,
      reason,
      metadata
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      'Status updated via ' || TG_OP,
      jsonb_build_object(
        'updated_at', NEW.updated_at,
        'callback_data', NEW.callback_data
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- create_default_notification_preferences
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.user_notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$function$;