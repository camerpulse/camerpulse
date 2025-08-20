-- Create pulse_post_bookmarks table
CREATE TABLE public.pulse_post_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES pulse_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.pulse_post_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies for bookmarks
CREATE POLICY "Users can manage their own bookmarks" 
ON public.pulse_post_bookmarks 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create user_follows table
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Create policies for follows
CREATE POLICY "Users can manage their own follows" 
ON public.user_follows 
FOR ALL 
USING (auth.uid() = follower_id)
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Follow relationships are publicly viewable" 
ON public.user_follows 
FOR SELECT 
USING (true);

-- Create pulse_post_reposts table  
CREATE TABLE public.pulse_post_reposts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_post_id UUID NOT NULL REFERENCES pulse_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, original_post_id)
);

-- Enable RLS
ALTER TABLE public.pulse_post_reposts ENABLE ROW LEVEL SECURITY;

-- Create policies for reposts
CREATE POLICY "Users can manage their own reposts" 
ON public.pulse_post_reposts 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reposts are publicly viewable" 
ON public.pulse_post_reposts 
FOR SELECT 
USING (true);

-- Create post_reports table
CREATE TABLE public.post_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES pulse_posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reporter_id, post_id)
);

-- Enable RLS
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for reports
CREATE POLICY "Users can create their own reports" 
ON public.post_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" 
ON public.post_reports 
FOR SELECT 
USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage all reports" 
ON public.post_reports 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create indexes for better performance
CREATE INDEX idx_pulse_post_bookmarks_user_id ON public.pulse_post_bookmarks(user_id);
CREATE INDEX idx_pulse_post_bookmarks_post_id ON public.pulse_post_bookmarks(post_id);
CREATE INDEX idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON public.user_follows(following_id);
CREATE INDEX idx_pulse_post_reposts_user_id ON public.pulse_post_reposts(user_id);
CREATE INDEX idx_pulse_post_reposts_original_post_id ON public.pulse_post_reposts(original_post_id);
CREATE INDEX idx_post_reports_post_id ON public.post_reports(post_id);
CREATE INDEX idx_post_reports_status ON public.post_reports(status);

-- Add trigger for updated_at on post_reports
CREATE TRIGGER update_post_reports_updated_at
  BEFORE UPDATE ON public.post_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();