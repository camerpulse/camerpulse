-- Create sentiment analysis and media monitoring system
CREATE TABLE IF NOT EXISTS public.sentiment_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_source TEXT NOT NULL, -- social_media, news, polls, comments
  content_id UUID,
  content_text TEXT NOT NULL,
  sentiment_score NUMERIC NOT NULL DEFAULT 0, -- -1 to 1 scale
  sentiment_label TEXT NOT NULL, -- positive, negative, neutral
  confidence_score NUMERIC NOT NULL DEFAULT 0, -- 0 to 1
  emotion_scores JSONB DEFAULT '{}', -- joy, anger, fear, sadness, etc
  keywords JSONB DEFAULT '[]',
  topics JSONB DEFAULT '[]',
  region TEXT,
  language TEXT DEFAULT 'en',
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create media content analysis table
CREATE TABLE IF NOT EXISTS public.media_content_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID,
  content_url TEXT NOT NULL,
  title TEXT,
  content_text TEXT,
  bias_score INTEGER DEFAULT 0, -- 0-100, higher = more biased
  trust_score INTEGER DEFAULT 50, -- 0-100, higher = more trustworthy
  sentiment_score NUMERIC DEFAULT 0,
  ai_confidence NUMERIC DEFAULT 0,
  fact_check_status TEXT DEFAULT 'pending',
  misinformation_flags JSONB DEFAULT '[]',
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create media sources table if not exists
CREATE TABLE IF NOT EXISTS public.media_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  source_type TEXT NOT NULL, -- newspaper, tv, radio, online, social
  website_url TEXT,
  description TEXT,
  founded_year INTEGER,
  headquarters TEXT,
  ownership_type TEXT NOT NULL, -- government, private, public, nonprofit
  bias_score INTEGER DEFAULT 50,
  trust_score INTEGER DEFAULT 50,
  fact_check_score INTEGER DEFAULT 50,
  transparency_score INTEGER DEFAULT 50,
  reliability_score INTEGER DEFAULT 50,
  last_monitored_at TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trending topics and discussions
CREATE TABLE IF NOT EXISTS public.sentiment_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_name TEXT NOT NULL,
  trend_period TEXT NOT NULL DEFAULT '24h', -- 1h, 24h, 7d, 30d
  positive_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,
  neutral_count INTEGER DEFAULT 0,
  total_mentions INTEGER DEFAULT 0,
  average_sentiment NUMERIC DEFAULT 0,
  peak_sentiment_time TIMESTAMP WITH TIME ZONE,
  geographic_data JSONB DEFAULT '{}',
  demographic_data JSONB DEFAULT '{}',
  trend_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  trend_end TIMESTAMP WITH TIME ZONE DEFAULT now() + INTERVAL '24 hours',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sentiment_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_content_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_trends ENABLE ROW LEVEL SECURITY;

-- Create policies with IF NOT EXISTS pattern
DO $$ 
BEGIN 
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

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sentiment_trends' AND policyname = 'Sentiment trends are publicly viewable') THEN
    CREATE POLICY "Sentiment trends are publicly viewable" ON public.sentiment_trends FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sentiment_trends' AND policyname = 'Admins can manage sentiment trends') THEN
    CREATE POLICY "Admins can manage sentiment trends" ON public.sentiment_trends FOR ALL USING (
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_source ON public.sentiment_analysis(content_source);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_sentiment ON public.sentiment_analysis(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_region ON public.sentiment_analysis(region);
CREATE INDEX IF NOT EXISTS idx_media_sources_trust_score ON public.media_sources(trust_score DESC);
CREATE INDEX IF NOT EXISTS idx_sentiment_trends_topic ON public.sentiment_trends(topic_name);
CREATE INDEX IF NOT EXISTS idx_sentiment_trends_period ON public.sentiment_trends(trend_period, trend_start);

-- Insert sample media sources
INSERT INTO public.media_sources (name, slug, source_type, website_url, description, founded_year, headquarters, ownership_type, bias_score, trust_score, fact_check_score, transparency_score, reliability_score, is_verified)
VALUES 
  ('Cameroon Tribune', 'cameroon-tribune', 'newspaper', 'https://www.cameroon-tribune.cm', 'Official government newspaper', 1979, 'Yaoundé', 'government', 65, 72, 68, 45, 70, true),
  ('Journal du Cameroun', 'journal-du-cameroun', 'online', 'https://www.journalducameroun.com', 'Independent news portal', 2010, 'Douala', 'private', 45, 85, 88, 82, 86, true),
  ('CRTV', 'crtv', 'tv', 'https://www.crtv.cm', 'Cameroon Radio Television', 1987, 'Yaoundé', 'government', 70, 65, 62, 40, 68, true),
  ('Business in Cameroon', 'business-in-cameroon', 'online', 'https://www.businessincameroon.com', 'Business and economic news', 2012, 'Douala', 'private', 35, 90, 92, 88, 91, true),
  ('Equinoxe TV', 'equinoxe-tv', 'tv', 'https://www.equinoxetv.com', 'Private television station', 2001, 'Douala', 'private', 50, 78, 75, 70, 76, true),
  ('The Guardian Post', 'guardian-post', 'newspaper', 'https://www.theguardianpost.com', 'Weekly English-language newspaper', 1993, 'Bamenda', 'private', 40, 82, 85, 78, 83, true)
ON CONFLICT (slug) DO NOTHING;

-- Generate slug function for media sources
CREATE OR REPLACE FUNCTION generate_media_source_slug(source_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(trim(regexp_replace(source_name, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM media_sources WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate slugs for media sources
CREATE OR REPLACE FUNCTION set_media_source_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_media_source_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'media_source_slug_trigger') THEN
    CREATE TRIGGER media_source_slug_trigger
      BEFORE INSERT OR UPDATE ON public.media_sources
      FOR EACH ROW
      EXECUTE FUNCTION set_media_source_slug();
  END IF;
END $$;

-- Update timestamps
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_media_sources_updated_at') THEN
    CREATE TRIGGER update_media_sources_updated_at
      BEFORE UPDATE ON public.media_sources
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;