-- Create enum types for music system (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE public.release_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected', 'published');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.audio_format AS ENUM ('mp3', 'wav', 'flac');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.pricing_type AS ENUM ('free', 'paid', 'streaming_only');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.royalty_status AS ENUM ('pending', 'processed', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Music albums/releases table
CREATE TABLE public.music_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES public.artist_memberships(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  release_type track_type NOT NULL,
  genre TEXT NOT NULL,
  language TEXT DEFAULT 'English',
  cover_art_url TEXT,
  release_date DATE DEFAULT CURRENT_DATE,
  mood_tags TEXT[],
  status release_status DEFAULT 'draft',
  pricing_type pricing_type DEFAULT 'free',
  price_per_track DECIMAL(10,2) DEFAULT 0,
  album_price DECIMAL(10,2) DEFAULT 0,
  streaming_enabled BOOLEAN DEFAULT true,
  external_links JSONB DEFAULT '{}',
  total_tracks INTEGER DEFAULT 1,
  total_plays BIGINT DEFAULT 0,
  total_downloads BIGINT DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  featured_by_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Individual tracks table
CREATE TABLE public.music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES public.music_releases(id) ON DELETE CASCADE,
  track_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  track_number INTEGER DEFAULT 1,
  duration_seconds INTEGER,
  audio_file_url TEXT NOT NULL,
  audio_format audio_format NOT NULL,
  file_size_bytes BIGINT,
  file_hash TEXT,
  lyrics TEXT,
  featured_artists TEXT[],
  producers TEXT[],
  play_count BIGINT DEFAULT 0,
  download_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Track plays analytics
CREATE TABLE public.track_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES public.music_tracks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  country TEXT,
  region TEXT,
  device_type TEXT,
  played_at TIMESTAMPTZ DEFAULT now(),
  duration_played_seconds INTEGER DEFAULT 0
);

-- Track purchases/downloads
CREATE TABLE public.track_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES public.music_tracks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  purchase_type TEXT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  purchased_at TIMESTAMPTZ DEFAULT now()
);

-- Music system configuration
CREATE TABLE public.camerplay_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default configuration
INSERT INTO public.camerplay_config (config_key, config_value) VALUES
('platform_royalty_percentage', '30'),
('streaming_enabled_globally', 'true'),
('upload_approval_required', 'true'),
('max_file_size_mb', '50'),
('allowed_audio_formats', '["mp3", "wav", "flac"]');

-- Create storage buckets for music files and album covers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('music-files', 'music-files', false), ('album-covers', 'album-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE public.music_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camerplay_config ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for music_releases
CREATE POLICY "Artists can manage their own releases" ON public.music_releases
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.artist_memberships 
    WHERE id = music_releases.artist_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Public can view published releases" ON public.music_releases
FOR SELECT USING (status = 'published');

-- Basic RLS policies for music_tracks
CREATE POLICY "Artists can manage their own tracks" ON public.music_tracks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.music_releases mr
    JOIN public.artist_memberships am ON mr.artist_id = am.id
    WHERE mr.id = music_tracks.release_id AND am.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view tracks from published releases" ON public.music_tracks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.music_releases 
    WHERE id = music_tracks.release_id AND status = 'published'
  )
);

-- Basic RLS policies for track_plays
CREATE POLICY "Anyone can insert play records" ON public.track_plays
FOR INSERT WITH CHECK (true);

-- Basic RLS policies for track_purchases
CREATE POLICY "Users can create purchases" ON public.track_purchases
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Basic RLS policies for config
CREATE POLICY "Public can view config" ON public.camerplay_config
FOR SELECT USING (true);

-- Create function to generate unique track IDs
CREATE OR REPLACE FUNCTION public.generate_track_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    new_id := 'CP-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    SELECT EXISTS(SELECT 1 FROM public.music_tracks WHERE track_id = new_id) INTO id_exists;
    IF NOT id_exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;