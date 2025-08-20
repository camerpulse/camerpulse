-- Create bookmarks table step by step to avoid deadlocks
CREATE TABLE IF NOT EXISTS public.pulse_post_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_pulse_post_bookmarks UNIQUE (post_id, user_id)
);

ALTER TABLE public.pulse_post_bookmarks ENABLE ROW LEVEL SECURITY;

-- Add policies for bookmarks
CREATE POLICY "Bookmarks are publicly readable" ON public.pulse_post_bookmarks
FOR SELECT USING (true);

CREATE POLICY "Users can create their own bookmarks" ON public.pulse_post_bookmarks
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own bookmarks" ON public.pulse_post_bookmarks
FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pulse_post_bookmarks_post ON public.pulse_post_bookmarks (post_id);
CREATE INDEX IF NOT EXISTS idx_pulse_post_bookmarks_user ON public.pulse_post_bookmarks (user_id);