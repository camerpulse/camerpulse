-- Create artist followers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.artist_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fan_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(fan_user_id, artist_user_id)
);

-- Enable RLS on artist followers
ALTER TABLE public.artist_followers ENABLE ROW LEVEL SECURITY;

-- RLS policies for artist followers
CREATE POLICY "Users can view their own follows" ON public.artist_followers
  FOR SELECT USING (auth.uid() = fan_user_id);

CREATE POLICY "Users can manage their own follows" ON public.artist_followers
  FOR ALL USING (auth.uid() = fan_user_id);

CREATE POLICY "Artists can view their followers" ON public.artist_followers
  FOR SELECT USING (auth.uid() = artist_user_id);

-- Create function to notify fans when artist content is updated
CREATE OR REPLACE FUNCTION public.notify_artist_fans(
  p_artist_user_id UUID,
  p_update_type TEXT DEFAULT 'profile',
  p_new_song_title TEXT DEFAULT NULL,
  p_event_name TEXT DEFAULT NULL,
  p_award_name TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  fan_record RECORD;
  artist_info RECORD;
  notifications_sent INTEGER := 0;
BEGIN
  -- Get artist information
  SELECT 
    COALESCE(am.stage_name, p.display_name, au.raw_user_meta_data->>'full_name', 'Unknown Artist') as artist_name,
    'https://camerplay.com/artists/' || am.stage_name as profile_link
  INTO artist_info
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id
  LEFT JOIN artist_memberships am ON am.user_id = au.id
  WHERE au.id = p_artist_user_id;
  
  -- If no artist found, exit
  IF artist_info.artist_name IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Send notifications to all fans following this artist
  FOR fan_record IN
    SELECT 
      af.fan_user_id,
      COALESCE(fp.display_name, fau.raw_user_meta_data->>'full_name', 'Fan') as fan_name,
      fau.email as fan_email
    FROM public.artist_followers af
    JOIN auth.users fau ON fau.id = af.fan_user_id
    LEFT JOIN profiles fp ON fp.user_id = af.fan_user_id
    WHERE af.artist_user_id = p_artist_user_id
    AND af.notifications_enabled = true
    AND fau.email IS NOT NULL
  LOOP
    -- Call the edge function to send fan notification
    PERFORM
      net.http_post(
        url := 'https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/send-fan-notification-email',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4MTc4MCwiZXhwIjoyMDY3ODU3NzgwfQ.LMa9Y06Y7lJUdnRWlT6d6lYhq2WkJKyUEUj5m3rOGUY"}'::jsonb,
        body := json_build_object(
          'fan_name', fan_record.fan_name,
          'fan_email', fan_record.fan_email,
          'artist_name', artist_info.artist_name,
          'artist_profile_link', artist_info.profile_link,
          'new_song_title', p_new_song_title,
          'event_name', p_event_name,
          'award_name', p_award_name
        )::text
      );
    
    notifications_sent := notifications_sent + 1;
  END LOOP;
  
  RETURN notifications_sent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger functions for different content types

-- Function for new music tracks
CREATE OR REPLACE FUNCTION public.notify_fans_new_music()
RETURNS TRIGGER AS $$
DECLARE
  artist_user_id UUID;
BEGIN
  -- Get artist user_id from the track
  SELECT r.artist_id INTO artist_user_id
  FROM public.music_releases r
  WHERE r.id = NEW.release_id;
  
  IF artist_user_id IS NOT NULL THEN
    PERFORM public.notify_artist_fans(
      artist_user_id,
      'music',
      NEW.title,
      NULL,
      NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for new events
CREATE OR REPLACE FUNCTION public.notify_fans_new_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Assuming events have an artist_id or user_id field
  IF NEW.artist_id IS NOT NULL OR NEW.user_id IS NOT NULL THEN
    PERFORM public.notify_artist_fans(
      COALESCE(NEW.artist_id, NEW.user_id),
      'event',
      NULL,
      NEW.title,
      NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for music tracks (if music_tracks table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'music_tracks') THEN
    DROP TRIGGER IF EXISTS fan_notification_new_music_trigger ON public.music_tracks;
    CREATE TRIGGER fan_notification_new_music_trigger
      AFTER INSERT ON public.music_tracks
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_fans_new_music();
  END IF;
END $$;

-- Create triggers for events (if events table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    DROP TRIGGER IF EXISTS fan_notification_new_event_trigger ON public.events;
    CREATE TRIGGER fan_notification_new_event_trigger
      AFTER INSERT ON public.events
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_fans_new_event();
  END IF;
END $$;