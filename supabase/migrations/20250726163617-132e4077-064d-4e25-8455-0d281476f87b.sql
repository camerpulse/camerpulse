-- Create pulse_post_likes table for handling likes on posts
CREATE TABLE public.pulse_post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.pulse_post_likes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all likes" 
ON public.pulse_post_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own likes" 
ON public.pulse_post_likes 
FOR ALL 
USING (auth.uid() = user_id);

-- Create function to get posts with like status
CREATE OR REPLACE FUNCTION public.get_posts_with_like_status(p_user_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  content text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  likes_count bigint,
  is_liked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.id,
    pp.user_id,
    pp.content,
    pp.created_at,
    pp.updated_at,
    COALESCE(like_counts.likes_count, 0) as likes_count,
    CASE WHEN p_user_id IS NOT NULL AND user_likes.user_id IS NOT NULL THEN true ELSE false END as is_liked
  FROM public.profile_posts pp
  LEFT JOIN (
    SELECT post_id, COUNT(*) as likes_count
    FROM public.pulse_post_likes
    GROUP BY post_id
  ) like_counts ON pp.id = like_counts.post_id
  LEFT JOIN public.pulse_post_likes user_likes ON pp.id = user_likes.post_id AND user_likes.user_id = p_user_id
  ORDER BY pp.created_at DESC;
END;
$$;