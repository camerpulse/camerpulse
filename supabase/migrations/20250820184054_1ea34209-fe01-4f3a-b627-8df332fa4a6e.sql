-- Create social interaction tables and secure RLS policies for Camerpulse
-- IMPORTANT: Avoid reserved schemas and use triggers for updated_at

-- 1) Bookmarks
CREATE TABLE IF NOT EXISTS public.pulse_post_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_pulse_post_bookmarks UNIQUE (post_id, user_id)
);

ALTER TABLE public.pulse_post_bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies for bookmarks
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'pulse_post_bookmarks' AND policyname = 'Bookmarks are publicly readable'
  ) THEN
    CREATE POLICY "Bookmarks are publicly readable"
    ON public.pulse_post_bookmarks
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'pulse_post_bookmarks' AND policyname = 'Users can create their own bookmarks'
  ) THEN
    CREATE POLICY "Users can create their own bookmarks"
    ON public.pulse_post_bookmarks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'pulse_post_bookmarks' AND policyname = 'Users can remove their own bookmarks'
  ) THEN
    CREATE POLICY "Users can remove their own bookmarks"
    ON public.pulse_post_bookmarks
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pulse_post_bookmarks_post ON public.pulse_post_bookmarks (post_id);
CREATE INDEX IF NOT EXISTS idx_pulse_post_bookmarks_user ON public.pulse_post_bookmarks (user_id);

-- 2) Follows
CREATE TABLE IF NOT EXISTS public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_follows UNIQUE (follower_id, following_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_follows' AND policyname = 'Follows are publicly readable'
  ) THEN
    CREATE POLICY "Follows are publicly readable"
    ON public.user_follows
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_follows' AND policyname = 'Users can follow others'
  ) THEN
    CREATE POLICY "Users can follow others"
    ON public.user_follows
    FOR INSERT
    WITH CHECK (auth.uid() = follower_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_follows' AND policyname = 'Users can unfollow themselves'
  ) THEN
    CREATE POLICY "Users can unfollow themselves"
    ON public.user_follows
    FOR DELETE
    USING (auth.uid() = follower_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows (following_id);

-- 3) Reposts (Pulse)
CREATE TABLE IF NOT EXISTS public.pulse_post_reposts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_pulse_post_reposts UNIQUE (original_post_id, user_id)
);

ALTER TABLE public.pulse_post_reposts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'pulse_post_reposts' AND policyname = 'Reposts are publicly readable'
  ) THEN
    CREATE POLICY "Reposts are publicly readable"
    ON public.pulse_post_reposts
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'pulse_post_reposts' AND policyname = 'Users can create their own reposts'
  ) THEN
    CREATE POLICY "Users can create their own reposts"
    ON public.pulse_post_reposts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'pulse_post_reposts' AND policyname = 'Users can delete their own reposts'
  ) THEN
    CREATE POLICY "Users can delete their own reposts"
    ON public.pulse_post_reposts
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pulse_post_reposts_post ON public.pulse_post_reposts (original_post_id);
CREATE INDEX IF NOT EXISTS idx_pulse_post_reposts_user ON public.pulse_post_reposts (user_id);

-- 4) Comments
CREATE TABLE IF NOT EXISTS public.pulse_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  parent_id uuid NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_pulse_post_comments_parent FOREIGN KEY (parent_id)
    REFERENCES public.pulse_post_comments(id) ON DELETE CASCADE
);

ALTER TABLE public.pulse_post_comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'pulse_post_comments' AND policyname = 'Comments are publicly readable'
  ) THEN
    CREATE POLICY "Comments are publicly readable"
    ON public.pulse_post_comments
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'pulse_post_comments' AND policyname = 'Users can create their own comments'
  ) THEN
    CREATE POLICY "Users can create their own comments"
    ON public.pulse_post_comments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'pulse_post_comments' AND policyname = 'Users can update their own comments'
  ) THEN
    CREATE POLICY "Users can update their own comments"
    ON public.pulse_post_comments
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'pulse_post_comments' AND policyname = 'Users or admins can delete comments'
  ) THEN
    CREATE POLICY "Users or admins can delete comments"
    ON public.pulse_post_comments
    FOR DELETE
    USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));
  END IF;
END $$;

-- Trigger to maintain updated_at on comments
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_pulse_post_comments_updated_at'
  ) THEN
    CREATE TRIGGER trg_pulse_post_comments_updated_at
    BEFORE UPDATE ON public.pulse_post_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pulse_post_comments_post ON public.pulse_post_comments (post_id);
CREATE INDEX IF NOT EXISTS idx_pulse_post_comments_user ON public.pulse_post_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_pulse_post_comments_parent ON public.pulse_post_comments (parent_id);

-- 5) Post reports
CREATE TABLE IF NOT EXISTS public.post_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  reporter_id uuid NOT NULL,
  reason text NOT NULL,
  description text NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'post_reports' AND policyname = 'Users can submit their own post reports'
  ) THEN
    CREATE POLICY "Users can submit their own post reports"
    ON public.post_reports
    FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'post_reports' AND policyname = 'Reporters and staff can view post reports'
  ) THEN
    CREATE POLICY "Reporters and staff can view post reports"
    ON public.post_reports
    FOR SELECT
    USING (reporter_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'post_reports' AND policyname = 'Only staff can update or delete post reports'
  ) THEN
    CREATE POLICY "Only staff can update or delete post reports"
    ON public.post_reports
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_post_reports_updated_at'
  ) THEN
    CREATE TRIGGER trg_post_reports_updated_at
    BEFORE UPDATE ON public.post_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_post_reports_post ON public.post_reports (post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_reporter ON public.post_reports (reporter_id);
