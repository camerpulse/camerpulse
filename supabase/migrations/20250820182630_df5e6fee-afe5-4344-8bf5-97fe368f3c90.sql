-- Create pulse_post_comments table for post comments
CREATE TABLE IF NOT EXISTS public.pulse_post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  parent_comment_id UUID,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (parent_comment_id) REFERENCES public.pulse_post_comments(id) ON DELETE CASCADE
);

-- Create pulse_post_bookmarks table for bookmarking posts
CREATE TABLE IF NOT EXISTS public.pulse_post_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create pulse_post_reposts table for sharing/reposting
CREATE TABLE IF NOT EXISTS public.pulse_post_reposts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(original_post_id, user_id)
);

-- Create user_follows table for following users
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create post_reports table for reporting posts
CREATE TABLE IF NOT EXISTS public.post_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
);

-- Enable RLS on all tables
ALTER TABLE public.pulse_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_post_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_post_reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pulse_post_comments
CREATE POLICY "Users can view all comments" ON public.pulse_post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create their own comments" ON public.pulse_post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.pulse_post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.pulse_post_comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for pulse_post_bookmarks
CREATE POLICY "Users can view all bookmarks" ON public.pulse_post_bookmarks FOR SELECT USING (true);
CREATE POLICY "Users can manage their own bookmarks" ON public.pulse_post_bookmarks FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for pulse_post_reposts
CREATE POLICY "Users can view all reposts" ON public.pulse_post_reposts FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reposts" ON public.pulse_post_reposts FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_follows
CREATE POLICY "Users can view all follows" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage their own follows" ON public.user_follows FOR ALL USING (auth.uid() = follower_id);

-- RLS Policies for post_reports
CREATE POLICY "Users can view their own reports" ON public.post_reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create reports" ON public.post_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Moderators can view all reports" ON public.post_reports FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pulse_post_comments_post_id ON public.pulse_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_pulse_post_comments_user_id ON public.pulse_post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_pulse_post_comments_parent_id ON public.pulse_post_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_pulse_post_bookmarks_post_id ON public.pulse_post_bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_pulse_post_bookmarks_user_id ON public.pulse_post_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_pulse_post_reposts_post_id ON public.pulse_post_reposts(original_post_id);
CREATE INDEX IF NOT EXISTS idx_pulse_post_reposts_user_id ON public.pulse_post_reposts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);

-- Update function for timestamps
CREATE OR REPLACE FUNCTION public.update_pulse_post_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating timestamps
CREATE TRIGGER update_pulse_post_comments_updated_at
  BEFORE UPDATE ON public.pulse_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pulse_post_comments_updated_at();