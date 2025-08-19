-- Retry: apply safe, idempotent security helpers and RLS policies (excluding shipments)

-- Helper function: is_admin via existing has_role
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(p_user_id, 'admin'::public.app_role);
$$;

-- Hospitals
ALTER TABLE IF EXISTS public.hospitals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='hospitals' AND policyname='Hospital staff can update their hospital'
  ) THEN
    CREATE POLICY "Hospital staff can update their hospital" ON public.hospitals
    FOR UPDATE USING (
      claimed_by = auth.uid() OR submitted_by = auth.uid() OR public.is_admin(auth.uid())
    );
  END IF;
END $$;

-- Nokash transactions
ALTER TABLE IF EXISTS public.nokash_transactions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='nokash_transactions' AND policyname='Users can view their own transactions'
  ) THEN
    CREATE POLICY "Users can view their own transactions" ON public.nokash_transactions
    FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='nokash_transactions' AND policyname='Admins can manage all transactions'
  ) THEN
    CREATE POLICY "Admins can manage all transactions" ON public.nokash_transactions
    FOR ALL USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Shipping companies
ALTER TABLE IF EXISTS public.shipping_companies ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shipping_companies' AND policyname='Shipping companies are publicly viewable'
  ) THEN
    CREATE POLICY "Shipping companies are publicly viewable" ON public.shipping_companies
    FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shipping_companies' AND policyname='Admins can manage shipping companies'
  ) THEN
    CREATE POLICY "Admins can manage shipping companies" ON public.shipping_companies
    FOR ALL USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Traditional leaders
ALTER TABLE IF EXISTS public.traditional_leaders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='traditional_leaders' AND policyname='Traditional leaders are publicly viewable'
  ) THEN
    CREATE POLICY "Traditional leaders are publicly viewable" ON public.traditional_leaders
    FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='traditional_leaders' AND policyname='Admins can manage traditional leaders'
  ) THEN
    CREATE POLICY "Admins can manage traditional leaders" ON public.traditional_leaders
    FOR ALL USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Artist memberships
ALTER TABLE IF EXISTS public.artist_memberships ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='artist_memberships' AND policyname='Artist memberships are publicly viewable'
  ) THEN
    CREATE POLICY "Artist memberships are publicly viewable" ON public.artist_memberships
    FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='artist_memberships' AND policyname='Users can apply for artist membership'
  ) THEN
    CREATE POLICY "Users can apply for artist membership" ON public.artist_memberships
    FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='artist_memberships' AND policyname='Users can update their own membership'
  ) THEN
    CREATE POLICY "Users can update their own membership" ON public.artist_memberships
    FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

-- Music releases
ALTER TABLE IF EXISTS public.music_releases ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='music_releases' AND policyname='Music releases are publicly viewable'
  ) THEN
    CREATE POLICY "Music releases are publicly viewable" ON public.music_releases
    FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='music_releases' AND policyname='Artists can manage their releases'
  ) THEN
    CREATE POLICY "Artists can manage their releases" ON public.music_releases
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.artist_memberships am 
        WHERE am.id = music_releases.artist_id AND am.user_id = auth.uid()
      ) OR public.is_admin(auth.uid())
    );
  END IF;
END $$;

-- Music tracks
ALTER TABLE IF EXISTS public.music_tracks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='music_tracks' AND policyname='Music tracks are publicly viewable'
  ) THEN
    CREATE POLICY "Music tracks are publicly viewable" ON public.music_tracks
    FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='music_tracks' AND policyname='Artists can manage their tracks'
  ) THEN
    CREATE POLICY "Artists can manage their tracks" ON public.music_tracks
    FOR ALL USING (
      EXISTS (
        SELECT 1 
        FROM public.music_releases mr
        JOIN public.artist_memberships am ON mr.artist_id = am.id
        WHERE mr.id = music_tracks.release_id AND am.user_id = auth.uid()
      ) OR public.is_admin(auth.uid())
    );
  END IF;
END $$;

-- Rate limiting primitives
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action_type text not null,
  ip_address inet,
  created_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rate_limit_log' AND policyname='Admins can view rate limit logs'
  ) THEN
    CREATE POLICY "Admins can view rate limit logs" ON public.rate_limit_log
    FOR SELECT USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Sanitization helper
CREATE OR REPLACE FUNCTION public.validate_and_sanitize_input(
  p_input TEXT,
  p_max_length INTEGER DEFAULT 1000,
  p_allow_html BOOLEAN DEFAULT false
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sanitized_input TEXT;
BEGIN
  IF p_input IS NULL THEN RETURN NULL; END IF;
  IF LENGTH(p_input) > p_max_length THEN
    RAISE EXCEPTION 'Input too long. Maximum % characters allowed.', p_max_length;
  END IF;
  sanitized_input := TRIM(p_input);
  IF NOT p_allow_html THEN
    sanitized_input := regexp_replace(sanitized_input, '<script[^>]*>.*?</script>', '', 'gi');
    sanitized_input := regexp_replace(sanitized_input, 'javascript:', '', 'gi');
    sanitized_input := regexp_replace(sanitized_input, 'on\w+\s*=', '', 'gi');
  END IF;
  RETURN sanitized_input;
END;
$$;