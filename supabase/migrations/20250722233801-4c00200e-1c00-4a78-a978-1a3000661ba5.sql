-- Create tenders table
CREATE TABLE IF NOT EXISTS public.tenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  category TEXT NOT NULL,
  region TEXT NOT NULL,
  tender_type TEXT NOT NULL,
  budget_min BIGINT NOT NULL DEFAULT 0,
  budget_max BIGINT NOT NULL DEFAULT 0,
  submission_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  publication_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'open',
  published_by TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  document_attachments JSONB DEFAULT '[]'::jsonb,
  evaluation_criteria JSONB DEFAULT '[]'::jsonb,
  bidding_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  views_count INTEGER DEFAULT 0,
  bids_count INTEGER DEFAULT 0
);

-- Create tender_bids table
CREATE TABLE IF NOT EXISTS public.tender_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  bidder_user_id UUID NOT NULL REFERENCES auth.users(id),
  company_name TEXT NOT NULL,
  bid_amount BIGINT NOT NULL,
  proposal_text TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  contact_email TEXT,
  contact_phone TEXT,
  experience_years INTEGER,
  previous_projects JSONB DEFAULT '[]'::jsonb,
  compliance_certificates JSONB DEFAULT '[]'::jsonb
);

-- Create tender_comments table
CREATE TABLE IF NOT EXISTS public.tender_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  comment_text TEXT NOT NULL,
  is_question BOOLEAN DEFAULT false,
  parent_comment_id UUID REFERENCES public.tender_comments(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tender_updates table for timeline
CREATE TABLE IF NOT EXISTS public.tender_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_public BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenders
CREATE POLICY "Tenders are viewable by everyone" 
ON public.tenders FOR SELECT USING (true);

CREATE POLICY "Users can create tenders" 
ON public.tenders FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tenders" 
ON public.tenders FOR UPDATE 
USING (auth.uid() = created_by);

-- RLS Policies for tender_bids
CREATE POLICY "Bidders can view their own bids" 
ON public.tender_bids FOR SELECT 
USING (auth.uid() = bidder_user_id);

CREATE POLICY "Tender creators can view bids on their tenders" 
ON public.tender_bids FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.tenders 
  WHERE tenders.id = tender_bids.tender_id 
  AND tenders.created_by = auth.uid()
));

CREATE POLICY "Users can create bids" 
ON public.tender_bids FOR INSERT 
WITH CHECK (auth.uid() = bidder_user_id);

CREATE POLICY "Bidders can update their own bids" 
ON public.tender_bids FOR UPDATE 
USING (auth.uid() = bidder_user_id);

-- RLS Policies for tender_comments
CREATE POLICY "Comments are viewable by everyone" 
ON public.tender_comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" 
ON public.tender_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.tender_comments FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for tender_updates
CREATE POLICY "Public updates are viewable by everyone" 
ON public.tender_updates FOR SELECT 
USING (is_public = true);

CREATE POLICY "Tender creators can view all updates for their tenders" 
ON public.tender_updates FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.tenders 
  WHERE tenders.id = tender_updates.tender_id 
  AND tenders.created_by = auth.uid()
));

CREATE POLICY "Authenticated users can create updates" 
ON public.tender_updates FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenders_status ON public.tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_category ON public.tenders(category);
CREATE INDEX IF NOT EXISTS idx_tenders_region ON public.tenders(region);
CREATE INDEX IF NOT EXISTS idx_tenders_deadline ON public.tenders(submission_deadline);
CREATE INDEX IF NOT EXISTS idx_tender_bids_tender_id ON public.tender_bids(tender_id);
CREATE INDEX IF NOT EXISTS idx_tender_bids_bidder ON public.tender_bids(bidder_user_id);
CREATE INDEX IF NOT EXISTS idx_tender_comments_tender_id ON public.tender_comments(tender_id);

-- Create function to update tender stats
CREATE OR REPLACE FUNCTION update_tender_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tenders 
    SET bids_count = bids_count + 1 
    WHERE id = NEW.tender_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tenders 
    SET bids_count = bids_count - 1 
    WHERE id = OLD.tender_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update tender stats
CREATE TRIGGER update_tender_bids_count
AFTER INSERT OR DELETE ON public.tender_bids
FOR EACH ROW EXECUTE FUNCTION update_tender_stats();