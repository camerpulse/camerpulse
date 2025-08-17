-- Create billionaire tracking system
CREATE TABLE IF NOT EXISTS public.billionaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  slug TEXT UNIQUE,
  net_worth_usd BIGINT NOT NULL DEFAULT 0,
  net_worth_fcfa BIGINT NOT NULL DEFAULT 0,
  primary_industry TEXT NOT NULL,
  company_name TEXT,
  wealth_source TEXT,
  age INTEGER,
  citizenship TEXT DEFAULT 'Cameroon',
  residence_location TEXT,
  profile_image_url TEXT,
  bio TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_source TEXT DEFAULT 'manual',
  verification_status TEXT DEFAULT 'unverified',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create billionaire wealth history for tracking changes
CREATE TABLE IF NOT EXISTS public.billionaire_wealth_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billionaire_id UUID NOT NULL REFERENCES public.billionaires(id) ON DELETE CASCADE,
  net_worth_usd BIGINT NOT NULL,
  net_worth_fcfa BIGINT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_source TEXT DEFAULT 'manual',
  notes TEXT
);

-- Create artist ecosystem tables
CREATE TABLE IF NOT EXISTS public.artist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  real_name TEXT,
  slug TEXT UNIQUE,
  genre TEXT[],
  bio TEXT,
  profile_image_url TEXT,
  banner_image_url TEXT,
  country TEXT DEFAULT 'Cameroon',
  city TEXT,
  social_links JSONB DEFAULT '{}',
  verification_status TEXT DEFAULT 'unverified',
  is_featured BOOLEAN DEFAULT false,
  total_streams BIGINT DEFAULT 0,
  total_downloads BIGINT DEFAULT 0,
  monthly_listeners INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create music releases table
CREATE TABLE IF NOT EXISTS public.music_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  release_type TEXT NOT NULL DEFAULT 'single', -- single, ep, album
  cover_art_url TEXT,
  release_date DATE NOT NULL,
  description TEXT,
  total_tracks INTEGER DEFAULT 1,
  genre TEXT[],
  language TEXT DEFAULT 'en',
  is_explicit BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft', -- draft, published, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create music tracks table
CREATE TABLE IF NOT EXISTS public.music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES public.music_releases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT,
  track_number INTEGER NOT NULL DEFAULT 1,
  duration_seconds INTEGER,
  audio_file_url TEXT,
  lyrics TEXT,
  featured_artists TEXT[],
  producer TEXT,
  songwriter TEXT,
  is_explicit BOOLEAN DEFAULT false,
  play_count BIGINT DEFAULT 0,
  download_count BIGINT DEFAULT 0,
  price_usd NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.billionaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billionaire_wealth_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for billionaires
CREATE POLICY "Billionaires are publicly viewable" ON public.billionaires FOR SELECT USING (true);
CREATE POLICY "Admins can manage billionaires" ON public.billionaires FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for wealth history
CREATE POLICY "Wealth history is publicly viewable" ON public.billionaire_wealth_history FOR SELECT USING (true);
CREATE POLICY "Admins can manage wealth history" ON public.billionaire_wealth_history FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for artist profiles
CREATE POLICY "Artist profiles are publicly viewable" ON public.artist_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage their own artist profile" ON public.artist_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all artist profiles" ON public.artist_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for music releases
CREATE POLICY "Published releases are publicly viewable" ON public.music_releases FOR SELECT USING (
  status = 'published' OR EXISTS (
    SELECT 1 FROM artist_profiles WHERE id = music_releases.artist_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Artists can manage their own releases" ON public.music_releases FOR ALL USING (
  EXISTS (SELECT 1 FROM artist_profiles WHERE id = music_releases.artist_id AND user_id = auth.uid())
);

-- RLS Policies for music tracks
CREATE POLICY "Tracks from published releases are viewable" ON public.music_tracks FOR SELECT USING (
  EXISTS (SELECT 1 FROM music_releases WHERE id = music_tracks.release_id AND status = 'published')
  OR EXISTS (
    SELECT 1 FROM music_releases mr 
    JOIN artist_profiles ap ON mr.artist_id = ap.id 
    WHERE mr.id = music_tracks.release_id AND ap.user_id = auth.uid()
  )
);
CREATE POLICY "Artists can manage their own tracks" ON public.music_tracks FOR ALL USING (
  EXISTS (
    SELECT 1 FROM music_releases mr 
    JOIN artist_profiles ap ON mr.artist_id = ap.id 
    WHERE mr.id = music_tracks.release_id AND ap.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_billionaires_net_worth ON public.billionaires(net_worth_usd DESC);
CREATE INDEX IF NOT EXISTS idx_billionaires_industry ON public.billionaires(primary_industry);
CREATE INDEX IF NOT EXISTS idx_billionaires_slug ON public.billionaires(slug);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_user_id ON public.artist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_slug ON public.artist_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_music_releases_artist_id ON public.music_releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_music_tracks_release_id ON public.music_tracks(release_id);

-- Generate slug functions
CREATE OR REPLACE FUNCTION generate_billionaire_slug(name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(trim(regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM billionaires WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate slugs
CREATE OR REPLACE FUNCTION set_billionaire_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_billionaire_slug(NEW.full_name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER billionaire_slug_trigger
  BEFORE INSERT OR UPDATE ON public.billionaires
  FOR EACH ROW
  EXECUTE FUNCTION set_billionaire_slug();

-- Update timestamps
CREATE TRIGGER update_billionaires_updated_at
  BEFORE UPDATE ON public.billionaires
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_profiles_updated_at
  BEFORE UPDATE ON public.artist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_music_releases_updated_at
  BEFORE UPDATE ON public.music_releases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_music_tracks_updated_at
  BEFORE UPDATE ON public.music_tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();