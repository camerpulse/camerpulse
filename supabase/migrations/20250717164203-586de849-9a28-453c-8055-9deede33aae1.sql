-- Create enum types for music system
CREATE TYPE public.track_type AS ENUM ('single', 'ep', 'album');
CREATE TYPE public.release_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected', 'published');
CREATE TYPE public.audio_format AS ENUM ('mp3', 'wav', 'flac');
CREATE TYPE public.pricing_type AS ENUM ('free', 'paid', 'streaming_only');
CREATE TYPE public.royalty_status AS ENUM ('pending', 'processed', 'paid');

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
  track_id TEXT UNIQUE NOT NULL, -- ISRC-like unique identifier
  title TEXT NOT NULL,
  track_number INTEGER DEFAULT 1,
  duration_seconds INTEGER,
  audio_file_url TEXT NOT NULL,
  audio_format audio_format NOT NULL,
  file_size_bytes BIGINT,
  file_hash TEXT, -- For copyright protection
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
  purchase_type TEXT NOT NULL, -- 'download', 'tip', 'album'
  amount_paid DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  purchased_at TIMESTAMPTZ DEFAULT now()
);

-- Royalty splits and payments
CREATE TABLE public.royalty_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES public.music_tracks(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL, -- 'artist', 'producer', 'featured_artist', 'platform'
  recipient_name TEXT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL, -- e.g., 70.00 for 70%
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Royalty payments log
CREATE TABLE public.royalty_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES public.artist_memberships(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.music_tracks(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_period_start DATE NOT NULL,
  payment_period_end DATE NOT NULL,
  status royalty_status DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
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
('allowed_audio_formats', '["mp3", "wav", "flac"]'),
('default_royalty_splits', '{"artist": 70, "platform": 30}');

-- Enable RLS on all tables
ALTER TABLE public.music_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camerplay_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for music_releases
CREATE POLICY "Artists can manage their own releases" ON public.music_releases
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.artist_memberships 
    WHERE id = music_releases.artist_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Public can view published releases" ON public.music_releases
FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all releases" ON public.music_releases
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for music_tracks
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

CREATE POLICY "Admins can manage all tracks" ON public.music_tracks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for track_plays
CREATE POLICY "Anyone can insert play records" ON public.track_plays
FOR INSERT WITH CHECK (true);

CREATE POLICY "Artists can view plays for their tracks" ON public.track_plays
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.music_tracks mt
    JOIN public.music_releases mr ON mt.release_id = mr.id
    JOIN public.artist_memberships am ON mr.artist_id = am.id
    WHERE mt.id = track_plays.track_id AND am.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all plays" ON public.track_plays
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for track_purchases
CREATE POLICY "Users can view their own purchases" ON public.track_purchases
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create purchases" ON public.track_purchases
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Artists can view purchases for their tracks" ON public.track_purchases
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.music_tracks mt
    JOIN public.music_releases mr ON mt.release_id = mr.id
    JOIN public.artist_memberships am ON mr.artist_id = am.id
    WHERE mt.id = track_purchases.track_id AND am.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all purchases" ON public.track_purchases
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for royalty_splits and payments
CREATE POLICY "Artists can view their royalty data" ON public.royalty_splits
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.music_tracks mt
    JOIN public.music_releases mr ON mt.release_id = mr.id
    JOIN public.artist_memberships am ON mr.artist_id = am.id
    WHERE mt.id = royalty_splits.track_id AND am.user_id = auth.uid()
  )
);

CREATE POLICY "Artists can view their payments" ON public.royalty_payments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.artist_memberships 
    WHERE id = royalty_payments.artist_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage royalties" ON public.royalty_splits
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage payments" ON public.royalty_payments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for config
CREATE POLICY "Admins can manage config" ON public.camerplay_config
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Public can view config" ON public.camerplay_config
FOR SELECT USING (true);

-- Create storage bucket for music files
INSERT INTO storage.buckets (id, name, public) VALUES ('music-files', 'music-files', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('album-covers', 'album-covers', true);

-- Storage policies for music files (private)
CREATE POLICY "Artists can upload their music files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'music-files' AND
  EXISTS (
    SELECT 1 FROM public.artist_memberships 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Artists can view their music files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'music-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for album covers (public)
CREATE POLICY "Artists can upload album covers" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'album-covers' AND
  EXISTS (
    SELECT 1 FROM public.artist_memberships 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Album covers are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'album-covers');

-- Create indexes for performance
CREATE INDEX idx_music_releases_artist_id ON public.music_releases(artist_id);
CREATE INDEX idx_music_releases_status ON public.music_releases(status);
CREATE INDEX idx_music_tracks_release_id ON public.music_tracks(release_id);
CREATE INDEX idx_music_tracks_track_id ON public.music_tracks(track_id);
CREATE INDEX idx_track_plays_track_id ON public.track_plays(track_id);
CREATE INDEX idx_track_plays_played_at ON public.track_plays(played_at);
CREATE INDEX idx_track_purchases_track_id ON public.track_purchases(track_id);
CREATE INDEX idx_track_purchases_user_id ON public.track_purchases(user_id);

-- Create function to generate unique track IDs
CREATE OR REPLACE FUNCTION public.generate_track_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate ID in format: CP-YYYY-XXXXXXXX (CamerPlay)
    new_id := 'CP-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM public.music_tracks WHERE track_id = new_id) INTO id_exists;
    
    IF NOT id_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update play counts
CREATE OR REPLACE FUNCTION public.update_play_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update track play count
  UPDATE public.music_tracks 
  SET play_count = play_count + 1
  WHERE id = NEW.track_id;
  
  -- Update release total plays
  UPDATE public.music_releases 
  SET total_plays = total_plays + 1
  WHERE id = (SELECT release_id FROM public.music_tracks WHERE id = NEW.track_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for play count updates
CREATE TRIGGER update_play_counts_trigger
  AFTER INSERT ON public.track_plays
  FOR EACH ROW
  EXECUTE FUNCTION public.update_play_counts();

-- Create function to update download counts
CREATE OR REPLACE FUNCTION public.update_download_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.purchase_type = 'download' THEN
    -- Update track download count
    UPDATE public.music_tracks 
    SET download_count = download_count + 1
    WHERE id = NEW.track_id;
    
    -- Update release total downloads
    UPDATE public.music_releases 
    SET total_downloads = total_downloads + 1
    WHERE id = (SELECT release_id FROM public.music_tracks WHERE id = NEW.track_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for download count updates
CREATE TRIGGER update_download_counts_trigger
  AFTER INSERT ON public.track_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_download_counts();