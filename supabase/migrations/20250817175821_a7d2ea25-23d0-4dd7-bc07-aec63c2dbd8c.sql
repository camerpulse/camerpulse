-- SAFE CONSOLIDATED MIGRATION: Billionaire, Artist Ecosystem, Sentiment & Media Trust
-- This migration creates missing tables and adds any missing columns, policies, and triggers safely.

-- 1) BILLIONAIRE TRACKER TABLES ---------------------------------------------
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

-- Ensure columns exist (idempotent)
ALTER TABLE public.billionaires
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS net_worth_usd BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_worth_fcfa BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS primary_industry TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS wealth_source TEXT,
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS citizenship TEXT DEFAULT 'Cameroon',
  ADD COLUMN IF NOT EXISTS residence_location TEXT,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE TABLE IF NOT EXISTS public.billionaire_wealth_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billionaire_id UUID NOT NULL REFERENCES public.billionaires(id) ON DELETE CASCADE,
  net_worth_usd BIGINT NOT NULL,
  net_worth_fcfa BIGINT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  data_source TEXT DEFAULT 'manual',
  notes TEXT
);

ALTER TABLE public.billionaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billionaire_wealth_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billionaires' AND policyname = 'Billionaires are publicly viewable') THEN
    CREATE POLICY "Billionaires are publicly viewable" ON public.billionaires FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billionaires' AND policyname = 'Admins can manage billionaires') THEN
    CREATE POLICY "Admins can manage billionaires" ON public.billionaires FOR ALL USING (
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billionaire_wealth_history' AND policyname = 'Wealth history is publicly viewable') THEN
    CREATE POLICY "Wealth history is publicly viewable" ON public.billionaire_wealth_history FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billionaire_wealth_history' AND policyname = 'Admins can manage wealth history') THEN
    CREATE POLICY "Admins can manage wealth history" ON public.billionaire_wealth_history FOR ALL USING (
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- Slug function & trigger (idempotent)
CREATE OR REPLACE FUNCTION public.generate_billionaire_slug(name TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE base_slug TEXT; final_slug TEXT; counter INTEGER := 0; BEGIN
  base_slug := lower(trim(regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.billionaires WHERE slug = final_slug) LOOP
    counter := counter + 1; final_slug := base_slug || '-' || counter;
  END LOOP; RETURN final_slug; END; $$;

CREATE OR REPLACE FUNCTION public.set_billionaire_slug()
RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN NEW.slug := public.generate_billionaire_slug(NEW.full_name); END IF;
  RETURN NEW; END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'billionaire_slug_trigger') THEN
    CREATE TRIGGER billionaire_slug_trigger BEFORE INSERT OR UPDATE ON public.billionaires
    FOR EACH ROW EXECUTE FUNCTION public.set_billionaire_slug();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_billionaires_updated_at') THEN
    CREATE TRIGGER update_billionaires_updated_at BEFORE UPDATE ON public.billionaires
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_billionaires_net_worth ON public.billionaires(net_worth_usd DESC);
CREATE INDEX IF NOT EXISTS idx_billionaires_industry ON public.billionaires(primary_industry);
CREATE INDEX IF NOT EXISTS idx_billionaires_slug ON public.billionaires(slug);


-- 2) ARTIST ECOSYSTEM TABLES -------------------------------------------------
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Ensure columns exist
ALTER TABLE public.artist_profiles
  ADD COLUMN IF NOT EXISTS stage_name TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS genre TEXT[],
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS banner_image_url TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Cameroon',
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_streams BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_downloads BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_listeners INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE TABLE IF NOT EXISTS public.music_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  release_type TEXT NOT NULL DEFAULT 'single',
  cover_art_url TEXT,
  release_date DATE NOT NULL,
  description TEXT,
  total_tracks INTEGER DEFAULT 1,
  genre TEXT[],
  language TEXT DEFAULT 'en',
  is_explicit BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.music_releases
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS release_type TEXT DEFAULT 'single',
  ADD COLUMN IF NOT EXISTS cover_art_url TEXT,
  ADD COLUMN IF NOT EXISTS release_date DATE,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS total_tracks INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS genre TEXT[],
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS is_explicit BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'artist_profiles' AND policyname = 'Artist profiles are publicly viewable') THEN
    CREATE POLICY "Artist profiles are publicly viewable" ON public.artist_profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'artist_profiles' AND policyname = 'Users can manage their own artist profile') THEN
    CREATE POLICY "Users can manage their own artist profile" ON public.artist_profiles FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'artist_profiles' AND policyname = 'Admins can manage all artist profiles') THEN
    CREATE POLICY "Admins can manage all artist profiles" ON public.artist_profiles FOR ALL USING (
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'music_releases' AND policyname = 'Published releases are publicly viewable') THEN
    CREATE POLICY "Published releases are publicly viewable" ON public.music_releases FOR SELECT USING (
      status = 'published' OR EXISTS (
        SELECT 1 FROM public.artist_profiles ap WHERE ap.id = music_releases.artist_id AND ap.user_id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'music_releases' AND policyname = 'Artists can manage their own releases') THEN
    CREATE POLICY "Artists can manage their own releases" ON public.music_releases FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.artist_profiles ap WHERE ap.id = music_releases.artist_id AND ap.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'music_tracks' AND policyname = 'Tracks from published releases are viewable') THEN
    CREATE POLICY "Tracks from published releases are viewable" ON public.music_tracks FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.music_releases mr WHERE mr.id = music_tracks.release_id AND mr.status = 'published')
      OR EXISTS (
        SELECT 1 FROM public.music_releases mr JOIN public.artist_profiles ap ON mr.artist_id = ap.id 
        WHERE mr.id = music_tracks.release_id AND ap.user_id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'music_tracks' AND policyname = 'Artists can manage their own tracks') THEN
    CREATE POLICY "Artists can manage their own tracks" ON public.music_tracks FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.music_releases mr JOIN public.artist_profiles ap ON mr.artist_id = ap.id 
        WHERE mr.id = music_tracks.release_id AND ap.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_artist_profiles_updated_at') THEN
    CREATE TRIGGER update_artist_profiles_updated_at BEFORE UPDATE ON public.artist_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_music_releases_updated_at') THEN
    CREATE TRIGGER update_music_releases_updated_at BEFORE UPDATE ON public.music_releases
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_music_tracks_updated_at') THEN
    CREATE TRIGGER update_music_tracks_updated_at BEFORE UPDATE ON public.music_tracks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_artist_profiles_user_id ON public.artist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_slug ON public.artist_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_music_releases_artist_id ON public.music_releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_music_tracks_release_id ON public.music_tracks(release_id);


-- 3) SENTIMENT & MEDIA TRUST TABLES ------------------------------------------
CREATE TABLE IF NOT EXISTS public.sentiment_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_source TEXT NOT NULL,
  content_id UUID,
  content_text TEXT NOT NULL,
  sentiment_score NUMERIC NOT NULL DEFAULT 0,
  sentiment_label TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL DEFAULT 0,
  emotion_scores JSONB DEFAULT '{}',
  keywords JSONB DEFAULT '[]',
  topics JSONB DEFAULT '[]',
  region TEXT,
  language TEXT DEFAULT 'en',
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.media_content_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID,
  content_url TEXT NOT NULL,
  title TEXT,
  content_text TEXT,
  bias_score INTEGER DEFAULT 0,
  trust_score INTEGER DEFAULT 50,
  sentiment_score NUMERIC DEFAULT 0,
  ai_confidence NUMERIC DEFAULT 0,
  fact_check_status TEXT DEFAULT 'pending',
  misinformation_flags JSONB DEFAULT '[]',
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MEDIA SOURCES: If table already exists, ensure all required columns exist
CREATE TABLE IF NOT EXISTS public.media_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.media_sources
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS founded_year INTEGER,
  ADD COLUMN IF NOT EXISTS headquarters TEXT,
  ADD COLUMN IF NOT EXISTS ownership_type TEXT,
  ADD COLUMN IF NOT EXISTS bias_score INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS fact_check_score INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS transparency_score INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS reliability_score INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS last_monitored_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Constraints/uniques
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'media_sources_slug_key'
  ) THEN
    -- try to create a unique index if not already constrained
    BEGIN
      ALTER TABLE public.media_sources ADD CONSTRAINT media_sources_slug_key UNIQUE (slug);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

ALTER TABLE public.sentiment_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_content_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_sources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sentiment_analysis' AND policyname = 'Sentiment analysis is publicly viewable') THEN
    CREATE POLICY "Sentiment analysis is publicly viewable" ON public.sentiment_analysis FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sentiment_analysis' AND policyname = 'Admins can manage sentiment analysis') THEN
    CREATE POLICY "Admins can manage sentiment analysis" ON public.sentiment_analysis FOR ALL USING (
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media_content_analysis' AND policyname = 'Media analysis is publicly viewable') THEN
    CREATE POLICY "Media analysis is publicly viewable" ON public.media_content_analysis FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media_content_analysis' AND policyname = 'Admins can manage media analysis') THEN
    CREATE POLICY "Admins can manage media analysis" ON public.media_content_analysis FOR ALL USING (
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media_sources' AND policyname = 'Media sources are publicly viewable') THEN
    CREATE POLICY "Media sources are publicly viewable" ON public.media_sources FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media_sources' AND policyname = 'Admins can manage media sources') THEN
    CREATE POLICY "Admins can manage media sources" ON public.media_sources FOR ALL USING (
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- Slug generator & triggers for media_sources
CREATE OR REPLACE FUNCTION public.generate_media_source_slug(source_name TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE base_slug TEXT; final_slug TEXT; counter INTEGER := 0; BEGIN
  base_slug := lower(trim(regexp_replace(source_name, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.media_sources WHERE slug = final_slug) LOOP
    counter := counter + 1; final_slug := base_slug || '-' || counter;
  END LOOP; RETURN final_slug; END; $$;

CREATE OR REPLACE FUNCTION public.set_media_source_slug()
RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN NEW.slug := public.generate_media_source_slug(NEW.name); END IF;
  RETURN NEW; END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'media_source_slug_trigger') THEN
    CREATE TRIGGER media_source_slug_trigger BEFORE INSERT OR UPDATE ON public.media_sources
    FOR EACH ROW EXECUTE FUNCTION public.set_media_source_slug();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_media_sources_updated_at') THEN
    CREATE TRIGGER update_media_sources_updated_at BEFORE UPDATE ON public.media_sources
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_media_sources_trust_score ON public.media_sources(trust_score DESC);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_source ON public.sentiment_analysis(content_source);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_sentiment ON public.sentiment_analysis(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_region ON public.sentiment_analysis(region);
