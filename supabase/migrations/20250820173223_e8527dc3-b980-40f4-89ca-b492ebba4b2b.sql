-- Create pulse_post_comments table for comment functionality
CREATE TABLE public.pulse_post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES pulse_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES pulse_post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pulse_post_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Comments are publicly viewable" 
ON public.pulse_post_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create comments" 
ON public.pulse_post_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.pulse_post_comments 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.pulse_post_comments 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments" 
ON public.pulse_post_comments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create indexes for performance
CREATE INDEX idx_pulse_post_comments_post_id ON public.pulse_post_comments(post_id);
CREATE INDEX idx_pulse_post_comments_user_id ON public.pulse_post_comments(user_id);
CREATE INDEX idx_pulse_post_comments_parent_id ON public.pulse_post_comments(parent_comment_id);
CREATE INDEX idx_pulse_post_comments_created_at ON public.pulse_post_comments(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_pulse_post_comments_updated_at
  BEFORE UPDATE ON public.pulse_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();