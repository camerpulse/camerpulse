-- Add SET search_path to remaining SECURITY DEFINER functions (batch 3)
-- create_notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_notification_type notification_type,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}'::jsonb,
  p_related_shipment_id uuid DEFAULT NULL::uuid,
  p_related_order_id uuid DEFAULT NULL::uuid,
  p_priority text DEFAULT 'medium'::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_notification_id UUID;
  v_preferences RECORD;
  v_channels notification_channel[] := ARRAY[]::notification_channel[];
BEGIN
  SELECT * INTO v_preferences
  FROM notification_preferences 
  WHERE user_id = p_user_id AND notification_type = p_notification_type;
  
  IF NOT FOUND THEN
    v_channels := ARRAY['in_app', 'email'];
  ELSE
    IF v_preferences.in_app_enabled THEN
      v_channels := array_append(v_channels, 'in_app');
    END IF;
    IF v_preferences.email_enabled THEN
      v_channels := array_append(v_channels, 'email');
    END IF;
    IF v_preferences.sms_enabled THEN
      v_channels := array_append(v_channels, 'sms');
    END IF;
    IF v_preferences.push_enabled THEN
      v_channels := array_append(v_channels, 'push');
    END IF;
  END IF;
  
  INSERT INTO notifications (
    user_id,
    notification_type,
    title,
    message,
    data,
    channels,
    related_shipment_id,
    related_order_id,
    priority
  ) VALUES (
    p_user_id,
    p_notification_type,
    p_title,
    p_message,
    p_data,
    v_channels,
    p_related_shipment_id,
    p_related_order_id,
    p_priority
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$function$;