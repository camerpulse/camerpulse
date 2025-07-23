-- Create tender comments and bidder interaction tables
CREATE TABLE public.tender_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL,
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'general', -- 'general', 'question', 'clarification'
  parent_comment_id UUID DEFAULT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_verified_bidder BOOLEAN NOT NULL DEFAULT false,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  flagged_count INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (parent_comment_id) REFERENCES public.tender_comments(id)
);

CREATE TABLE public.tender_comment_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.tender_comments(id),
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

CREATE TABLE public.tender_qa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL,
  question_user_id UUID NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT,
  answered_by UUID,
  answered_at TIMESTAMP WITH TIME ZONE,
  is_official_answer BOOLEAN NOT NULL DEFAULT false,
  question_category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_tender_comments_tender_id ON public.tender_comments(tender_id);
CREATE INDEX idx_tender_comments_user_id ON public.tender_comments(user_id);
CREATE INDEX idx_tender_comments_parent ON public.tender_comments(parent_comment_id);
CREATE INDEX idx_tender_comment_votes_comment ON public.tender_comment_votes(comment_id);
CREATE INDEX idx_tender_qa_tender_id ON public.tender_qa(tender_id);

-- Enable RLS
ALTER TABLE public.tender_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_qa ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tender_comments
CREATE POLICY "Anyone can view public comments" 
ON public.tender_comments 
FOR SELECT 
USING (is_public = true AND is_hidden = false);

CREATE POLICY "Users can create their own comments" 
ON public.tender_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.tender_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments" 
ON public.tender_comments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for tender_comment_votes
CREATE POLICY "Users can manage their own votes" 
ON public.tender_comment_votes 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view votes" 
ON public.tender_comment_votes 
FOR SELECT 
USING (true);

-- RLS Policies for tender_qa
CREATE POLICY "Anyone can view Q&A" 
ON public.tender_qa 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create questions" 
ON public.tender_qa 
FOR INSERT 
WITH CHECK (auth.uid() = question_user_id);

CREATE POLICY "Tender moderators and admins can answer" 
ON public.tender_qa 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') OR
  EXISTS (SELECT 1 FROM tender_moderators WHERE user_id = auth.uid())
);

-- Triggers for vote counting
CREATE OR REPLACE FUNCTION update_comment_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'upvote' THEN
      UPDATE tender_comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
    ELSE
      UPDATE tender_comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'upvote' THEN
      UPDATE tender_comments SET upvotes = upvotes - 1 WHERE id = OLD.comment_id;
    ELSE
      UPDATE tender_comments SET downvotes = downvotes - 1 WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tender_comment_votes_trigger
  AFTER INSERT OR DELETE ON tender_comment_votes
  FOR EACH ROW EXECUTE FUNCTION update_comment_vote_counts();

-- Realtime
ALTER TABLE public.tender_comments REPLICA IDENTITY FULL;
ALTER TABLE public.tender_comment_votes REPLICA IDENTITY FULL;
ALTER TABLE public.tender_qa REPLICA IDENTITY FULL;