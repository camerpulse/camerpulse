-- Add SET search_path to remaining SECURITY DEFINER functions (batch 5)
-- update_notification_performance_metrics
CREATE OR REPLACE FUNCTION public.update_notification_performance_metrics(
  p_notification_type text,
  p_template_id uuid,
  p_event_type text,
  p_response_time_seconds integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_date DATE := CURRENT_DATE;
BEGIN
  INSERT INTO public.notification_performance_metrics (
    notification_type, template_id, date_tracked,
    total_sent, total_delivered, total_opened, total_clicked,
    total_dismissed, total_expired, avg_open_time_seconds, avg_click_time_seconds
  ) VALUES (
    p_notification_type, p_template_id, current_date,
    CASE WHEN p_event_type = 'sent' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'delivered' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'opened' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'clicked' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'dismissed' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'expired' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'opened' THEN p_response_time_seconds ELSE 0 END,
    CASE WHEN p_event_type = 'clicked' THEN p_response_time_seconds ELSE 0 END
  )
  ON CONFLICT (notification_type, template_id, date_tracked) DO UPDATE SET
    total_sent = CASE 
      WHEN p_event_type = 'sent' THEN notification_performance_metrics.total_sent + 1
      ELSE notification_performance_metrics.total_sent
    END,
    total_delivered = CASE 
      WHEN p_event_type = 'delivered' THEN notification_performance_metrics.total_delivered + 1
      ELSE notification_performance_metrics.total_delivered
    END,
    total_opened = CASE 
      WHEN p_event_type = 'opened' THEN notification_performance_metrics.total_opened + 1
      ELSE notification_performance_metrics.total_opened
    END,
    total_clicked = CASE 
      WHEN p_event_type = 'clicked' THEN notification_performance_metrics.total_clicked + 1
      ELSE notification_performance_metrics.total_clicked
    END,
    total_dismissed = CASE 
      WHEN p_event_type = 'dismissed' THEN notification_performance_metrics.total_dismissed + 1
      ELSE notification_performance_metrics.total_dismissed
    END,
    total_expired = CASE 
      WHEN p_event_type = 'expired' THEN notification_performance_metrics.total_expired + 1
      ELSE notification_performance_metrics.total_expired
    END,
    avg_open_time_seconds = CASE 
      WHEN p_event_type = 'opened' THEN 
        (notification_performance_metrics.avg_open_time_seconds + p_response_time_seconds) / 2
      ELSE notification_performance_metrics.avg_open_time_seconds
    END,
    avg_click_time_seconds = CASE 
      WHEN p_event_type = 'clicked' THEN 
        (notification_performance_metrics.avg_click_time_seconds + p_response_time_seconds) / 2
      ELSE notification_performance_metrics.avg_click_time_seconds
    END,
    engagement_rate = (
      (notification_performance_metrics.total_opened + notification_performance_metrics.total_clicked) * 100.0 /
      GREATEST(notification_performance_metrics.total_delivered, 1)
    ),
    conversion_rate = (
      notification_performance_metrics.total_clicked * 100.0 /
      GREATEST(notification_performance_metrics.total_opened, 1)
    ),
    updated_at = now();
END;
$function$;

-- update_user_engagement_metrics
CREATE OR REPLACE FUNCTION public.update_user_engagement_metrics(
  p_user_id uuid,
  p_event_type text,
  p_response_time_seconds integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_date DATE := CURRENT_DATE;
BEGIN
  INSERT INTO public.user_engagement_metrics (
    user_id, date_tracked, total_notifications_received,
    notifications_opened, notifications_clicked, notifications_dismissed,
    avg_response_time_seconds
  ) VALUES (
    p_user_id, current_date, 
    CASE WHEN p_event_type = 'sent' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'opened' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'clicked' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'dismissed' THEN 1 ELSE 0 END,
    p_response_time_seconds
  )
  ON CONFLICT (user_id, date_tracked) DO UPDATE SET
    total_notifications_received = CASE 
      WHEN p_event_type = 'sent' THEN user_engagement_metrics.total_notifications_received + 1
      ELSE user_engagement_metrics.total_notifications_received
    END,
    notifications_opened = CASE 
      WHEN p_event_type = 'opened' THEN user_engagement_metrics.notifications_opened + 1
      ELSE user_engagement_metrics.notifications_opened
    END,
    notifications_clicked = CASE 
      WHEN p_event_type = 'clicked' THEN user_engagement_metrics.notifications_clicked + 1
      ELSE user_engagement_metrics.notifications_clicked
    END,
    notifications_dismissed = CASE 
      WHEN p_event_type = 'dismissed' THEN user_engagement_metrics.notifications_dismissed + 1
      ELSE user_engagement_metrics.notifications_dismissed
    END,
    avg_response_time_seconds = (
      (user_engagement_metrics.avg_response_time_seconds + p_response_time_seconds) / 2
    ),
    engagement_score = (
      (user_engagement_metrics.notifications_opened + user_engagement_metrics.notifications_clicked) * 100.0 / 
      GREATEST(user_engagement_metrics.total_notifications_received, 1)
    ),
    updated_at = now();
END;
$function$;