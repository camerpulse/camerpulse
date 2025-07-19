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
  song_url := 'https://camerplay.com/music/track/' || NEW.id;
  
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

-- Create music tracks table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'music_tracks') THEN
    CREATE TABLE public.music_tracks (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      release_id UUID NOT NULL,
      title TEXT NOT NULL,
      duration_seconds INTEGER,
      track_number INTEGER,
      file_url TEXT,
      streaming_url TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      play_count INTEGER NOT NULL DEFAULT 0,
      download_count INTEGER NOT NULL DEFAULT 0,
      lyrics TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      track_id TEXT
    );

    -- Enable RLS on music tracks
    ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

    -- RLS policies for music tracks
    CREATE POLICY "Anyone can view published tracks" ON public.music_tracks
      FOR SELECT USING (status = 'published');

    CREATE POLICY "Artists can manage their own tracks" ON public.music_tracks
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.music_releases mr
          WHERE mr.id = music_tracks.release_id 
          AND mr.artist_id = auth.uid()
        )
      );

    CREATE POLICY "Admins can manage all tracks" ON public.music_tracks
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_roles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Create music releases table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'music_releases') THEN
    CREATE TABLE public.music_releases (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      artist_id UUID NOT NULL,
      title TEXT NOT NULL,
      release_type TEXT NOT NULL DEFAULT 'single',
      release_date DATE,
      cover_art_url TEXT,
      description TEXT,
      genre TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      total_plays INTEGER NOT NULL DEFAULT 0,
      total_downloads INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );

    -- Enable RLS on music releases
    ALTER TABLE public.music_releases ENABLE ROW LEVEL SECURITY;

    -- RLS policies for music releases
    CREATE POLICY "Anyone can view published releases" ON public.music_releases
      FOR SELECT USING (status = 'published');

    CREATE POLICY "Artists can manage their own releases" ON public.music_releases
      FOR ALL USING (auth.uid() = artist_id);

    CREATE POLICY "Admins can manage all releases" ON public.music_releases
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_roles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Create trigger for song published emails (when track status changes to published)
DROP TRIGGER IF EXISTS send_song_published_trigger ON public.music_tracks;
CREATE TRIGGER send_song_published_trigger
  AFTER UPDATE OF status ON public.music_tracks
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'published')
  EXECUTE FUNCTION public.send_song_published_email();

-- Also trigger on new published tracks
DROP TRIGGER IF EXISTS send_song_published_insert_trigger ON public.music_tracks;
CREATE TRIGGER send_song_published_insert_trigger
  AFTER INSERT ON public.music_tracks
  FOR EACH ROW
  WHEN (NEW.status = 'published')
  EXECUTE FUNCTION public.send_song_published_email();