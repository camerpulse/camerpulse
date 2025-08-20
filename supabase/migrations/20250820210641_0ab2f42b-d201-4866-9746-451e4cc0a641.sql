-- Create petition engagement tables for comments, updates, and reactions

-- Petition Comments Table
CREATE TABLE public.petition_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    petition_id UUID NOT NULL REFERENCES public.petitions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    comment_text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    is_flagged BOOLEAN DEFAULT false,
    flagged_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Petition Updates Table (for petition creators to post progress updates)
CREATE TABLE public.petition_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    petition_id UUID NOT NULL REFERENCES public.petitions(id) ON DELETE CASCADE,
    created_by UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Petition Reactions Table
CREATE TABLE public.petition_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    petition_id UUID NOT NULL REFERENCES public.petitions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('support', 'heart', 'fire', 'clap', 'thinking')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(petition_id, user_id, reaction_type)
);

-- Create indexes for performance
CREATE INDEX idx_petition_comments_petition_id ON public.petition_comments(petition_id);
CREATE INDEX idx_petition_comments_user_id ON public.petition_comments(user_id);
CREATE INDEX idx_petition_comments_created_at ON public.petition_comments(created_at DESC);

CREATE INDEX idx_petition_updates_petition_id ON public.petition_updates(petition_id);
CREATE INDEX idx_petition_updates_created_by ON public.petition_updates(created_by);
CREATE INDEX idx_petition_updates_created_at ON public.petition_updates(created_at DESC);

CREATE INDEX idx_petition_reactions_petition_id ON public.petition_reactions(petition_id);
CREATE INDEX idx_petition_reactions_user_id ON public.petition_reactions(user_id);
CREATE INDEX idx_petition_reactions_type ON public.petition_reactions(reaction_type);

-- Add updated_at triggers
CREATE TRIGGER update_petition_comments_updated_at
    BEFORE UPDATE ON public.petition_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_petition_updates_updated_at
    BEFORE UPDATE ON public.petition_updates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.petition_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for petition_comments
CREATE POLICY "Comments are viewable by everyone" 
ON public.petition_comments FOR SELECT 
USING (is_approved = true AND is_flagged = false);

CREATE POLICY "Users can create their own comments" 
ON public.petition_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.petition_comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.petition_comments FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Moderators can manage all comments" 
ON public.petition_comments FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- RLS Policies for petition_updates
CREATE POLICY "Updates are viewable by everyone" 
ON public.petition_updates FOR SELECT 
USING (is_published = true);

CREATE POLICY "Petition creators can manage their petition updates" 
ON public.petition_updates FOR ALL 
USING (
    auth.uid() = created_by OR 
    EXISTS (
        SELECT 1 FROM public.petitions p 
        WHERE p.id = petition_updates.petition_id 
        AND p.created_by = auth.uid()
    )
);

CREATE POLICY "Admins can manage all updates" 
ON public.petition_updates FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for petition_reactions  
CREATE POLICY "Reactions are viewable by everyone" 
ON public.petition_reactions FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own reactions" 
ON public.petition_reactions FOR ALL 
USING (auth.uid() = user_id);

-- Enable Realtime for engagement features
ALTER PUBLICATION supabase_realtime ADD TABLE public.petition_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.petition_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.petition_reactions;