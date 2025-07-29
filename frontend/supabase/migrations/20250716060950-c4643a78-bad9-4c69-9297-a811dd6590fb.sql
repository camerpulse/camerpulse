-- Create poll comments table
CREATE TABLE public.poll_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_edited BOOLEAN DEFAULT false,
    is_moderated BOOLEAN DEFAULT false,
    moderated_by UUID REFERENCES auth.users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderation_reason TEXT,
    likes_count INTEGER DEFAULT 0
);

-- Create poll comment likes table
CREATE TABLE public.poll_comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.poll_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(comment_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_poll_comments_poll_id ON public.poll_comments(poll_id);
CREATE INDEX idx_poll_comments_created_at ON public.poll_comments(created_at DESC);
CREATE INDEX idx_poll_comments_likes_count ON public.poll_comments(likes_count DESC);
CREATE INDEX idx_poll_comment_likes_comment_id ON public.poll_comment_likes(comment_id);
CREATE INDEX idx_poll_comment_likes_user_id ON public.poll_comment_likes(user_id);

-- Enable RLS
ALTER TABLE public.poll_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for poll_comments
CREATE POLICY "Anyone can view non-moderated comments" ON public.poll_comments
    FOR SELECT USING (NOT is_moderated);

CREATE POLICY "Authenticated users can create comments" ON public.poll_comments
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.poll_comments
    FOR UPDATE TO authenticated 
    USING (auth.uid() = user_id AND NOT is_moderated)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.poll_comments
    FOR DELETE TO authenticated 
    USING (auth.uid() = user_id AND NOT is_moderated);

CREATE POLICY "Admins can manage all comments" ON public.poll_comments
    FOR ALL TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- RLS policies for poll_comment_likes
CREATE POLICY "Anyone can view comment likes" ON public.poll_comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their likes" ON public.poll_comment_likes
    FOR ALL TO authenticated 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Trigger to update likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.poll_comments 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.poll_comments 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER poll_comment_likes_trigger
    AFTER INSERT OR DELETE ON public.poll_comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- Trigger to update updated_at on comments
CREATE OR REPLACE FUNCTION update_poll_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    NEW.is_edited = true;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_poll_comments_updated_at
    BEFORE UPDATE ON public.poll_comments
    FOR EACH ROW EXECUTE FUNCTION update_poll_comment_updated_at();