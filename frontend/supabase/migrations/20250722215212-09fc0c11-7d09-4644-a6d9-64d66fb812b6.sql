-- Create tenders table
CREATE TABLE public.tenders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  tender_type TEXT NOT NULL CHECK (tender_type IN (
    'public', 'private', 'ngo_donor', 'international', 
    'service_contract', 'construction', 'supply_order', 'ict_software'
  )),
  category TEXT NOT NULL,
  region TEXT NOT NULL,
  published_by_company_id UUID,
  published_by_user_id UUID NOT NULL,
  budget_min BIGINT,
  budget_max BIGINT,
  currency TEXT NOT NULL DEFAULT 'FCFA',
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  bid_opening_date TIMESTAMP WITH TIME ZONE,
  eligibility_criteria TEXT,
  instructions TEXT,
  evaluation_criteria TEXT,
  documents JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'cancelled', 'awarded')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0,
  bids_count INTEGER NOT NULL DEFAULT 0,
  awarded_to_company_id UUID,
  awarded_at TIMESTAMP WITH TIME ZONE,
  award_amount BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tender bids table
CREATE TABLE public.tender_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  technical_proposal TEXT,
  financial_proposal JSONB NOT NULL,
  bid_amount BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'FCFA',
  documents JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn')),
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tender_id, company_id)
);

-- Create tender saved table (for bookmarking)
CREATE TABLE public.tender_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tender_id, user_id)
);

-- Create tender analytics table
CREATE TABLE public.tender_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value BIGINT NOT NULL DEFAULT 0,
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tender_id, metric_type, date_recorded)
);

-- Create tender notifications table
CREATE TABLE public.tender_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tender_id UUID REFERENCES public.tenders(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenders
CREATE POLICY "Tenders are viewable by everyone" 
ON public.tenders FOR SELECT USING (true);

CREATE POLICY "Users can create tenders" 
ON public.tenders FOR INSERT 
WITH CHECK (auth.uid() = published_by_user_id);

CREATE POLICY "Users can update their own tenders" 
ON public.tenders FOR UPDATE 
USING (auth.uid() = published_by_user_id);

CREATE POLICY "Admins can manage all tenders" 
ON public.tenders FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for tender bids
CREATE POLICY "Users can view bids for their tenders" 
ON public.tender_bids FOR SELECT 
USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.tenders WHERE id = tender_id AND published_by_user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can create their own bids" 
ON public.tender_bids FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bids" 
ON public.tender_bids FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for bookmarks
CREATE POLICY "Users can manage their own bookmarks" 
ON public.tender_bookmarks FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for analytics
CREATE POLICY "Tender owners can view analytics" 
ON public.tender_analytics FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.tenders WHERE id = tender_id AND published_by_user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.tender_notifications FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_tenders_status ON public.tenders(status);
CREATE INDEX idx_tenders_type ON public.tenders(tender_type);
CREATE INDEX idx_tenders_category ON public.tenders(category);
CREATE INDEX idx_tenders_region ON public.tenders(region);
CREATE INDEX idx_tenders_deadline ON public.tenders(deadline);
CREATE INDEX idx_tenders_created_at ON public.tenders(created_at DESC);
CREATE INDEX idx_tender_bids_tender_id ON public.tender_bids(tender_id);
CREATE INDEX idx_tender_bids_company_id ON public.tender_bids(company_id);
CREATE INDEX idx_tender_bookmarks_user_id ON public.tender_bookmarks(user_id);

-- Create update trigger for tenders
CREATE OR REPLACE FUNCTION public.update_tender_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenders_updated_at
  BEFORE UPDATE ON public.tenders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tender_updated_at();

-- Create update trigger for tender bids
CREATE TRIGGER update_tender_bids_updated_at
  BEFORE UPDATE ON public.tender_bids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tender_updated_at();

-- Function to update tender stats
CREATE OR REPLACE FUNCTION public.update_tender_stats()
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

CREATE TRIGGER update_tender_bid_stats
  AFTER INSERT OR DELETE ON public.tender_bids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tender_stats();