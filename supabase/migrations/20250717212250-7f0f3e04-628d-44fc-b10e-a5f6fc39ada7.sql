-- Music Distribution System Tables

-- Music Releases (Albums/Singles)
CREATE TABLE public.music_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES public.artist_memberships(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    release_type TEXT NOT NULL CHECK (release_type IN ('album', 'single', 'ep')),
    cover_art_url TEXT,
    release_date TIMESTAMPTZ NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    price_fcfa INTEGER,
    allow_streaming BOOLEAN NOT NULL DEFAULT true,
    allow_downloads BOOLEAN NOT NULL DEFAULT true,
    genre TEXT[] NOT NULL DEFAULT '{}',
    total_streams INTEGER NOT NULL DEFAULT 0,
    total_downloads INTEGER NOT NULL DEFAULT 0,
    total_revenue_fcfa BIGINT NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Music Tracks
CREATE TABLE public.music_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID NOT NULL REFERENCES public.music_releases(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES public.artist_memberships(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    track_number INTEGER,
    audio_url TEXT NOT NULL,
    waveform_url TEXT,
    allow_preview BOOLEAN NOT NULL DEFAULT true,
    preview_start_seconds INTEGER DEFAULT 0,
    preview_duration_seconds INTEGER DEFAULT 30,
    price_fcfa INTEGER,
    is_explicit BOOLEAN NOT NULL DEFAULT false,
    lyrics TEXT,
    play_count INTEGER NOT NULL DEFAULT 0,
    download_count INTEGER NOT NULL DEFAULT 0,
    fingerprint_hash TEXT UNIQUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Music Purchases
CREATE TABLE public.music_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    track_id UUID REFERENCES public.music_tracks(id) ON DELETE SET NULL,
    release_id UUID REFERENCES public.music_releases(id) ON DELETE SET NULL,
    purchase_type TEXT NOT NULL CHECK (purchase_type IN ('track', 'release', 'download')),
    amount_paid_fcfa INTEGER NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id TEXT UNIQUE,
    payment_method TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fan Profiles and Wallets
CREATE TABLE public.fan_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    total_streams INTEGER NOT NULL DEFAULT 0,
    total_purchases INTEGER NOT NULL DEFAULT 0,
    favorite_genres TEXT[] DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    wallet_balance_fcfa INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fan Wallet Transactions
CREATE TABLE public.fan_wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fan_id UUID NOT NULL REFERENCES public.fan_profiles(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'purchase', 'refund', 'bonus')),
    amount_fcfa INTEGER NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
    reference_id TEXT UNIQUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Artist Fan Interactions
CREATE TABLE public.artist_fan_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fan_id UUID NOT NULL REFERENCES public.fan_profiles(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES public.artist_memberships(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('follow', 'tip', 'comment', 'share', 'playlist_add')),
    track_id UUID REFERENCES public.music_tracks(id) ON DELETE SET NULL,
    release_id UUID REFERENCES public.music_releases(id) ON DELETE SET NULL,
    amount_fcfa INTEGER,
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Playlists
CREATE TABLE public.fan_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fan_id UUID NOT NULL REFERENCES public.fan_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    total_duration_seconds INTEGER NOT NULL DEFAULT 0,
    tracks_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Playlist Tracks
CREATE TABLE public.playlist_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID NOT NULL REFERENCES public.fan_playlists(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES public.music_tracks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(playlist_id, track_id)
);

-- Track Play History
CREATE TABLE public.track_play_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID NOT NULL REFERENCES public.music_tracks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    played_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    play_duration_seconds INTEGER,
    device_info JSONB DEFAULT '{}',
    ip_address INET
);

-- Enable Row Level Security
ALTER TABLE public.music_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_fan_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_play_history ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Music Releases Policies
CREATE POLICY "Public can view published releases" ON public.music_releases
    FOR SELECT USING (is_published = true);

CREATE POLICY "Artists can manage their releases" ON public.music_releases
    FOR ALL USING (artist_id IN (
        SELECT id FROM public.artist_memberships WHERE user_id = auth.uid()
    ));

-- Music Tracks Policies
CREATE POLICY "Public can view tracks of published releases" ON public.music_tracks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.music_releases
            WHERE id = release_id AND is_published = true
        )
    );

CREATE POLICY "Artists can manage their tracks" ON public.music_tracks
    FOR ALL USING (artist_id IN (
        SELECT id FROM public.artist_memberships WHERE user_id = auth.uid()
    ));

-- Music Purchases Policies
CREATE POLICY "Users can view their own purchases" ON public.music_purchases
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create purchases" ON public.music_purchases
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Fan Profiles Policies
CREATE POLICY "Users can view fan profiles" ON public.fan_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own fan profile" ON public.fan_profiles
    FOR ALL USING (id = auth.uid());

-- Fan Wallet Transactions Policies
CREATE POLICY "Users can view their own transactions" ON public.fan_wallet_transactions
    FOR SELECT USING (fan_id = auth.uid());

-- Artist Fan Interactions Policies
CREATE POLICY "Public can view interactions" ON public.artist_fan_interactions
    FOR SELECT USING (true);

CREATE POLICY "Users can create interactions" ON public.artist_fan_interactions
    FOR INSERT WITH CHECK (fan_id = auth.uid());

-- Fan Playlists Policies
CREATE POLICY "Public can view public playlists" ON public.fan_playlists
    FOR SELECT USING (is_public = true OR fan_id = auth.uid());

CREATE POLICY "Users can manage their playlists" ON public.fan_playlists
    FOR ALL USING (fan_id = auth.uid());

-- Playlist Tracks Policies
CREATE POLICY "Public can view public playlist tracks" ON public.playlist_tracks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.fan_playlists
            WHERE id = playlist_id AND (is_public = true OR fan_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage their playlist tracks" ON public.playlist_tracks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.fan_playlists
            WHERE id = playlist_id AND fan_id = auth.uid()
        )
    );

-- Track Play History Policies
CREATE POLICY "Users can view their play history" ON public.track_play_history
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create play history" ON public.track_play_history
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create functions for various operations

-- Function to update release stats
CREATE OR REPLACE FUNCTION update_release_stats() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.play_duration_seconds >= 30 THEN
    UPDATE public.music_tracks 
    SET play_count = play_count + 1,
        updated_at = now()
    WHERE id = NEW.track_id;
    
    UPDATE public.music_releases 
    SET total_streams = total_streams + 1,
        updated_at = now()
    WHERE id = (SELECT release_id FROM public.music_tracks WHERE id = NEW.track_id);
    
    -- Update fan profile stats
    IF NEW.user_id IS NOT NULL THEN
      UPDATE public.fan_profiles
      SET total_streams = total_streams + 1,
          updated_at = now()
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for play history
CREATE TRIGGER update_stats_on_play
    AFTER INSERT ON public.track_play_history
    FOR EACH ROW
    EXECUTE FUNCTION update_release_stats();