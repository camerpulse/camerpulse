-- Create comprehensive bidding system tables (fixed)
CREATE TABLE IF NOT EXISTS public.tender_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL,
  bidder_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_registration_number TEXT,
  bid_amount BIGINT NOT NULL, -- Amount in FCFA cents
  bid_currency TEXT NOT NULL DEFAULT 'FCFA',
  proposal_summary TEXT NOT NULL,
  proposal_document_url TEXT,
  technical_score INTEGER DEFAULT 0 CHECK (technical_score >= 0 AND technical_score <= 100),
  financial_score INTEGER DEFAULT 0 CHECK (financial_score >= 0 AND financial_score <= 100),
  overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  bid_status TEXT NOT NULL DEFAULT 'submitted',
  is_compliant BOOLEAN DEFAULT NULL, -- NULL = not reviewed, true/false = compliance status
  compliance_notes TEXT,
  submission_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  bid_metadata JSONB DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT false, -- For anonymous bidding tenders
  bid_rank INTEGER, -- Real-time ranking
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add check constraint after table creation
ALTER TABLE public.tender_bids ADD CONSTRAINT tender_bids_status_check 
CHECK (bid_status IN ('draft', 'submitted', 'under_review', 'shortlisted', 'rejected', 'accepted', 'withdrawn'));

-- Create bid tracking/activity table for real-time updates
CREATE TABLE IF NOT EXISTS public.bid_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL,
  bid_id UUID REFERENCES public.tender_bids(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'bid_submitted', 'bid_updated', 'bid_withdrawn', 'rank_changed', 'review_started', 'status_changed'
  activity_title TEXT NOT NULL,
  activity_description TEXT,
  old_value JSONB,
  new_value JSONB,
  triggered_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true, -- Whether this activity is visible to all bidders
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Create bid notifications table
CREATE TABLE IF NOT EXISTS public.bid_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL,
  bid_id UUID REFERENCES public.tender_bids(id) ON DELETE CASCADE,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'bid_received', 'rank_changed', 'status_update', 'deadline_reminder'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  sent_via_email BOOLEAN DEFAULT false,
  sent_via_sms BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Create bid evaluation criteria table
CREATE TABLE IF NOT EXISTS public.bid_evaluation_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL,
  criteria_name TEXT NOT NULL,
  criteria_description TEXT,
  weight_percentage INTEGER NOT NULL CHECK (weight_percentage > 0 AND weight_percentage <= 100),
  criteria_type TEXT NOT NULL DEFAULT 'technical',
  is_mandatory BOOLEAN DEFAULT false,
  evaluation_method TEXT DEFAULT 'points', -- 'points', 'pass_fail', 'ranking'
  max_score INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add check constraint for criteria type
ALTER TABLE public.bid_evaluation_criteria ADD CONSTRAINT criteria_type_check 
CHECK (criteria_type IN ('technical', 'financial', 'experience', 'compliance'));

-- Create bid evaluations table
CREATE TABLE IF NOT EXISTS public.bid_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bid_id UUID REFERENCES public.tender_bids(id) ON DELETE CASCADE,
  criteria_id UUID REFERENCES public.bid_evaluation_criteria(id) ON DELETE CASCADE,
  evaluator_user_id UUID REFERENCES auth.users(id),
  score INTEGER NOT NULL CHECK (score >= 0),
  comments TEXT,
  evaluation_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_final BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bid_id, criteria_id, evaluator_user_id)
);

-- Enable RLS
ALTER TABLE public.tender_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS policies for tender_bids
CREATE POLICY "Anyone can view submitted bids (for transparency)" 
ON public.tender_bids 
FOR SELECT 
USING (bid_status IN ('submitted', 'under_review', 'shortlisted', 'accepted', 'rejected'));

CREATE POLICY "Bidders can manage their own bids" 
ON public.tender_bids 
FOR ALL 
USING (auth.uid() = bidder_user_id);

CREATE POLICY "Tender issuers can view bids for their tenders" 
ON public.tender_bids 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tenders 
    WHERE id = tender_bids.tender_id 
    AND published_by_user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all bids" 
ON public.tender_bids 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS policies for bid_activities
CREATE POLICY "Public activities are viewable by everyone" 
ON public.bid_activities 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can view activities for their bids" 
ON public.bid_activities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tender_bids 
    WHERE id = bid_activities.bid_id 
    AND bidder_user_id = auth.uid()
  )
);

CREATE POLICY "System can create bid activities" 
ON public.bid_activities 
FOR INSERT 
WITH CHECK (true);

-- RLS policies for bid_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.bid_notifications 
FOR ALL 
USING (auth.uid() = recipient_user_id);

-- RLS policies for evaluation criteria and evaluations
CREATE POLICY "Anyone can view evaluation criteria" 
ON public.bid_evaluation_criteria 
FOR SELECT 
USING (true);

CREATE POLICY "Tender issuers can manage criteria for their tenders" 
ON public.bid_evaluation_criteria 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.tenders 
    WHERE id = bid_evaluation_criteria.tender_id 
    AND published_by_user_id = auth.uid()
  )
);

CREATE POLICY "Evaluators can view and manage their evaluations" 
ON public.bid_evaluations 
FOR ALL 
USING (auth.uid() = evaluator_user_id);

-- Create indexes for performance
CREATE INDEX idx_tender_bids_tender_id ON public.tender_bids(tender_id);
CREATE INDEX idx_tender_bids_bidder ON public.tender_bids(bidder_user_id);
CREATE INDEX idx_tender_bids_status ON public.tender_bids(bid_status);
CREATE INDEX idx_tender_bids_rank ON public.tender_bids(bid_rank);
CREATE INDEX idx_bid_activities_tender_id ON public.bid_activities(tender_id);
CREATE INDEX idx_bid_activities_bid_id ON public.bid_activities(bid_id);
CREATE INDEX idx_bid_activities_created_at ON public.bid_activities(created_at);
CREATE INDEX idx_bid_notifications_recipient ON public.bid_notifications(recipient_user_id);
CREATE INDEX idx_bid_notifications_tender ON public.bid_notifications(tender_id);

-- Function to calculate bid rankings
CREATE OR REPLACE FUNCTION public.calculate_bid_rankings(p_tender_id UUID)
RETURNS void AS $$
DECLARE
  bid_record RECORD;
  rank_counter INTEGER := 1;
BEGIN
  -- Update rankings based on overall score (highest first)
  FOR bid_record IN
    SELECT id FROM public.tender_bids
    WHERE tender_id = p_tender_id
    AND bid_status IN ('submitted', 'under_review', 'shortlisted')
    ORDER BY overall_score DESC, bid_amount ASC, submitted_at ASC
  LOOP
    UPDATE public.tender_bids
    SET bid_rank = rank_counter
    WHERE id = bid_record.id;
    
    rank_counter := rank_counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create bid activity
CREATE OR REPLACE FUNCTION public.create_bid_activity(
  p_tender_id UUID,
  p_bid_id UUID,
  p_activity_type TEXT,
  p_activity_title TEXT,
  p_activity_description TEXT DEFAULT NULL,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL,
  p_triggered_by UUID DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.bid_activities (
    tender_id, bid_id, activity_type, activity_title, activity_description,
    old_value, new_value, triggered_by, is_public
  ) VALUES (
    p_tender_id, p_bid_id, p_activity_type, p_activity_title, p_activity_description,
    p_old_value, p_new_value, p_triggered_by, p_is_public
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for bid tracking
ALTER TABLE public.tender_bids REPLICA IDENTITY FULL;
ALTER TABLE public.bid_activities REPLICA IDENTITY FULL;
ALTER TABLE public.bid_notifications REPLICA IDENTITY FULL;