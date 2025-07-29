-- Create function to send song published email
CREATE OR REPLACE FUNCTION public.send_song_published_email()
RETURNS TRIGGER AS $$
DECLARE
  artist_record RECORD;
  song_url TEXT;
  release_record RECORD;
BEGIN
  -- Get release information to find the artist
  SELECT * INTO release_record
  FROM public.music_releases 
  WHERE id = NEW.release_id;
  
  -- Get artist information
  SELECT 
    COALESCE(am.stage_name, p.display_name, au.raw_user_meta_data->>'full_name', 'Artist') as artist_name,
    au.email
  INTO artist_record
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id
  LEFT JOIN artist_memberships am ON am.user_id = au.id
  WHERE au.id = release_record.artist_id;
  
  -- Generate song URL
  song_url := 'https://camerplay.com/music/track/' || NEW.track_id;
  
  -- Only send email if we have valid email and artist info
  IF artist_record.email IS NOT NULL AND artist_record.email != '' AND artist_record.artist_name IS NOT NULL THEN
    -- Call the edge function to send song published email
    PERFORM net.http_post(
      url := 'https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/send-song-published-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODE3ODAsImV4cCI6MjA2Nzg1Nzc4MH0.4GKFhQTxlEzj6oTcfnAZQpPxPHW0nqGDEfBe-gVGoNE"}'::jsonb,
      body := jsonb_build_object(
        'artist_name', artist_record.artist_name,
        'email', artist_record.email,
        'song_title', NEW.title,
        'song_page_link', song_url
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add status column to music_tracks if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'music_tracks' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.music_tracks ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
  END IF;
END $$;

-- Create trigger for song published emails on new tracks
DROP TRIGGER IF EXISTS send_song_published_insert_trigger ON public.music_tracks;
CREATE TRIGGER send_song_published_insert_trigger
  AFTER INSERT ON public.music_tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.send_song_published_email();

-- Create trigger for when track status changes to published (if status column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'music_tracks' AND column_name = 'status'
  ) THEN
    DROP TRIGGER IF EXISTS send_song_published_update_trigger ON public.music_tracks;
    EXECUTE 'CREATE TRIGGER send_song_published_update_trigger
      AFTER UPDATE OF status ON public.music_tracks
      FOR EACH ROW
      WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = ''published'')
      EXECUTE FUNCTION public.send_song_published_email();';
  END IF;
END $$;