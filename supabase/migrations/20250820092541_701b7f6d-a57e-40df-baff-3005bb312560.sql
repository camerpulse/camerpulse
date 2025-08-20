-- 1) Ensure pg_net extension exists for functions using net.*
create extension if not exists pg_net with schema net;

-- 2) Fix infinite recursion RLS policies by dropping unsafe ones and recreating safe policies
-- Drop existing policies on company_team_members and government_agency_users safely
DO $$
DECLARE
  pol record;
BEGIN
  IF to_regclass('public.company_team_members') IS NOT NULL THEN
    FOR pol IN 
      SELECT policyname FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'company_team_members'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.company_team_members', pol.policyname);
    END LOOP;

    -- Recreate minimal, non-recursive, safe policies
    -- Users manage their own membership rows
    EXECUTE $$
      CREATE POLICY "Users manage their own membership rows"
      ON public.company_team_members
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id)
    $$;

    -- Admins can manage all memberships
    EXECUTE $$
      CREATE POLICY "Admins manage all memberships"
      ON public.company_team_members
      FOR ALL
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'))
    $$;

    -- Enable RLS explicitly (idempotent)
    EXECUTE 'ALTER TABLE public.company_team_members ENABLE ROW LEVEL SECURITY';
  END IF;

  IF to_regclass('public.government_agency_users') IS NOT NULL THEN
    FOR pol IN 
      SELECT policyname FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'government_agency_users'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.government_agency_users', pol.policyname);
    END LOOP;

    -- Users manage their own agency user rows
    EXECUTE $$
      CREATE POLICY "Users manage their own agency rows"
      ON public.government_agency_users
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id)
    $$;

    -- Admins manage all agency users
    EXECUTE $$
      CREATE POLICY "Admins manage all agency users"
      ON public.government_agency_users
      FOR ALL
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'))
    $$;

    EXECUTE 'ALTER TABLE public.government_agency_users ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- 3) Add SET search_path TO 'public' to SECURITY DEFINER functions missing it
-- Recreate functions with explicit search_path for safety

-- increment_poll_view_count
CREATE OR REPLACE FUNCTION public.increment_poll_view_count(p_poll_id uuid, p_user_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update view count
  UPDATE polls SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_poll_id;
END;
$function$;

-- toggle_poll_bookmark
CREATE OR REPLACE FUNCTION public.toggle_poll_bookmark(p_poll_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  bookmark_exists BOOLEAN;
BEGIN
  -- Check if bookmark exists
  SELECT EXISTS(
    SELECT 1 FROM poll_bookmarks 
    WHERE poll_id = p_poll_id AND user_id = p_user_id::text
  ) INTO bookmark_exists;
  
  IF bookmark_exists THEN
    -- Remove bookmark
    DELETE FROM poll_bookmarks 
    WHERE poll_id = p_poll_id AND user_id = p_user_id::text;
    
    -- Decrement bookmark count
    UPDATE polls SET bookmark_count = GREATEST(0, COALESCE(bookmark_count, 0) - 1) 
    WHERE id = p_poll_id;
    
    RETURN false;
  ELSE
    -- Add bookmark
    INSERT INTO poll_bookmarks (poll_id, user_id) 
    VALUES (p_poll_id, p_user_id::text);
    
    -- Increment bookmark count
    UPDATE polls SET bookmark_count = COALESCE(bookmark_count, 0) + 1 
    WHERE id = p_poll_id;
    
    RETURN true;
  END IF;
END;
$function$;

-- refresh_poll_statistics
CREATE OR REPLACE FUNCTION public.refresh_poll_statistics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY poll_statistics;
END;
$function$;

-- clean_and_generate_usernames
CREATE OR REPLACE FUNCTION public.clean_and_generate_usernames()
RETURNS TABLE(profile_id uuid, old_username text, new_username text, slug_generated boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    migration_id UUID;
    profile_record RECORD;
    clean_username TEXT;
    base_slug TEXT;
    final_username TEXT;
    counter INTEGER;
BEGIN
    -- Log migration start
    INSERT INTO public.user_migration_log (migration_step, status)
    VALUES ('username_cleanup', 'running') RETURNING id INTO migration_id;

    -- Process each profile that needs username cleanup
    FOR profile_record IN 
        SELECT id, username, display_name, email 
        FROM public.profiles 
        WHERE username IS NULL 
           OR username = '' 
           OR username ~ '[^a-zA-Z0-9._-]'  -- Contains invalid characters
           OR length(username) > 50
    LOOP
        -- Generate base slug from available data
        base_slug := CASE 
            WHEN profile_record.username IS NOT NULL AND profile_record.username != '' 
            THEN public.generate_slug(profile_record.username)
            WHEN profile_record.display_name IS NOT NULL 
            THEN public.generate_slug(profile_record.display_name)
            WHEN profile_record.email IS NOT NULL 
            THEN public.generate_slug(split_part(profile_record.email, '@', 1))
            ELSE 'user'
        END;

        -- Ensure uniqueness
        final_username := base_slug;
        counter := 0;
        
        WHILE EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE username = final_username AND id != profile_record.id
        ) LOOP
            counter := counter + 1;
            final_username := base_slug || '_' || counter;
        END LOOP;

        -- Update the profile
        UPDATE public.profiles 
        SET 
            username = final_username,
            updated_at = now()
        WHERE id = profile_record.id;

        -- Return the result
        profile_id := profile_record.id;
        old_username := profile_record.username;
        new_username := final_username;
        slug_generated := TRUE;
        
        RETURN NEXT;
    END LOOP;

    -- Update migration log
    UPDATE public.user_migration_log 
    SET status = 'completed', completed_at = now()
    WHERE id = migration_id;
END;
$function$;

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
  -- Get user preferences for this notification type
  SELECT * INTO v_preferences
  FROM notification_preferences 
  WHERE user_id = p_user_id AND notification_type = p_notification_type;
  
  -- If no preferences exist, use defaults
  IF NOT FOUND THEN
    v_channels := ARRAY['in_app', 'email'];
  ELSE
    -- Build channels array based on preferences
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
  
  -- Create the notification
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
