-- Social Features Tables
CREATE TABLE public.track_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  timestamp_seconds NUMERIC,
  parent_comment_id UUID REFERENCES public.track_comments(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.track_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(track_id, user_id)
);

CREATE TABLE public.track_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Playlist Management Tables
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_collaborative BOOLEAN NOT NULL DEFAULT false,
  total_tracks INTEGER NOT NULL DEFAULT 0,
  total_duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL,
  position INTEGER NOT NULL,
  added_by_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, track_id)
);

-- Analytics Tables
CREATE TABLE public.artist_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL,
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value BIGINT NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(artist_id, metric_type, period_start)
);

CREATE TABLE public.track_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL,
  date DATE NOT NULL,
  plays_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  unique_listeners INTEGER NOT NULL DEFAULT 0,
  skip_rate NUMERIC(5,4) DEFAULT 0,
  completion_rate NUMERIC(5,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(track_id, date)
);

-- Fan Engagement Tables
CREATE TABLE public.fan_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  member_count INTEGER NOT NULL DEFAULT 0,
  membership_fee_fcfa BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.fan_club_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_club_id UUID NOT NULL REFERENCES public.fan_clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  membership_tier TEXT NOT NULL DEFAULT 'basic',
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(fan_club_id, user_id)
);

CREATE TABLE public.exclusive_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL,
  fan_club_id UUID REFERENCES public.fan_clubs(id),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL,
  content_url TEXT NOT NULL,
  thumbnail_url TEXT,
  required_tier TEXT DEFAULT 'basic',
  is_active BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.track_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_club_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exclusive_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Social Features
CREATE POLICY "Comments are viewable by everyone" ON public.track_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.track_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their comments" ON public.track_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their comments" ON public.track_comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Likes are viewable by everyone" ON public.track_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their likes" ON public.track_likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Shares are viewable by everyone" ON public.track_shares FOR SELECT USING (true);
CREATE POLICY "Users can create shares" ON public.track_shares FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Playlists
CREATE POLICY "Public playlists are viewable by everyone" ON public.playlists FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage their playlists" ON public.playlists FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Playlist tracks viewable based on playlist access" ON public.playlist_tracks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND (is_public = true OR user_id = auth.uid()))
);
CREATE POLICY "Users can manage tracks in their playlists" ON public.playlist_tracks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid())
);

-- RLS Policies for Analytics
CREATE POLICY "Artists can view their analytics" ON public.artist_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public track analytics" ON public.track_analytics FOR SELECT USING (true);

-- RLS Policies for Fan Engagement
CREATE POLICY "Active fan clubs are viewable by everyone" ON public.fan_clubs FOR SELECT USING (is_active = true);
CREATE POLICY "Artists can manage their fan clubs" ON public.fan_clubs FOR ALL USING (auth.uid() IN (
  SELECT user_id FROM public.artist_memberships WHERE artist_id = fan_clubs.artist_id
));

CREATE POLICY "Users can view their memberships" ON public.fan_club_memberships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their memberships" ON public.fan_club_memberships FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Members can view exclusive content" ON public.exclusive_content FOR SELECT USING (
  is_active = true AND (
    fan_club_id IS NULL OR 
    EXISTS (SELECT 1 FROM public.fan_club_memberships WHERE fan_club_id = exclusive_content.fan_club_id AND user_id = auth.uid() AND is_active = true)
  )
);

-- Functions for updating counts
CREATE OR REPLACE FUNCTION update_playlist_stats() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.playlists SET 
      total_tracks = total_tracks + 1,
      updated_at = now()
    WHERE id = NEW.playlist_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.playlists SET 
      total_tracks = total_tracks - 1,
      updated_at = now()
    WHERE id = OLD.playlist_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_playlist_stats_trigger
  AFTER INSERT OR DELETE ON public.playlist_tracks
  FOR EACH ROW EXECUTE FUNCTION update_playlist_stats();

CREATE OR REPLACE FUNCTION update_fan_club_member_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.fan_clubs SET 
      member_count = member_count + 1,
      updated_at = now()
    WHERE id = NEW.fan_club_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.fan_clubs SET 
      member_count = member_count - 1,
      updated_at = now()
    WHERE id = OLD.fan_club_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;