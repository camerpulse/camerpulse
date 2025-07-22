-- Create tender_comments table
CREATE TABLE IF NOT EXISTS public.tender_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.tender_comments(id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tender_updates table
CREATE TABLE IF NOT EXISTS public.tender_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tender_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_updates ENABLE ROW LEVEL SECURITY;

-- Create policies for tender_comments
CREATE POLICY "Anyone can view public tender comments" 
ON public.tender_comments 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create comments" 
ON public.tender_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.tender_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.tender_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for tender_updates
CREATE POLICY "Anyone can view public tender updates" 
ON public.tender_updates 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Tender creators can manage updates" 
ON public.tender_updates 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.tenders 
    WHERE tenders.id = tender_updates.tender_id 
    AND tenders.published_by_user_id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tender_comments_tender_id ON public.tender_comments(tender_id);
CREATE INDEX IF NOT EXISTS idx_tender_comments_user_id ON public.tender_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_tender_comments_created_at ON public.tender_comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tender_updates_tender_id ON public.tender_updates(tender_id);
CREATE INDEX IF NOT EXISTS idx_tender_updates_created_at ON public.tender_updates(created_at DESC);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_tender_comments_updated_at
  BEFORE UPDATE ON public.tender_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tender_updates_updated_at
  BEFORE UPDATE ON public.tender_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();