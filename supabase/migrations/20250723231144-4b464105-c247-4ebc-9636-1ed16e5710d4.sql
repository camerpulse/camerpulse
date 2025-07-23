-- Create tender ratings and credibility system

-- Create tender ratings table for completed tenders
CREATE TABLE public.tender_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL,
  user_id UUID NOT NULL,
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  budget_fidelity_rating INTEGER CHECK (budget_fidelity_rating BETWEEN 1 AND 5),
  timeliness_rating INTEGER CHECK (timeliness_rating BETWEEN 1 AND 5),
  transparency_rating INTEGER CHECK (transparency_rating BETWEEN 1 AND 5),
  overall_rating NUMERIC(2,1) GENERATED ALWAYS AS (
    (quality_rating + budget_fidelity_rating + timeliness_rating + transparency_rating) / 4.0
  ) STORED,
  comment TEXT,
  fraud_flag BOOLEAN DEFAULT false,
  fraud_evidence TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tender_id, user_id)
);

-- Create issuer credibility scores table
CREATE TABLE public.issuer_credibility_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issuer_id UUID NOT NULL,
  issuer_type TEXT NOT NULL CHECK (issuer_type IN ('business', 'government_agency')),
  issuer_name TEXT NOT NULL,
  tenders_posted INTEGER DEFAULT 0,
  tenders_awarded INTEGER DEFAULT 0,
  delivery_success_rate NUMERIC(3,2) DEFAULT 0.0,
  fraud_flags_count INTEGER DEFAULT 0,
  complaints_count INTEGER DEFAULT 0,
  average_rating NUMERIC(2,1) DEFAULT 0.0,
  credibility_score INTEGER DEFAULT 0,
  credibility_level TEXT DEFAULT 'moderate' CHECK (credibility_level IN ('high', 'moderate', 'low')),
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(issuer_id, issuer_type)
);

-- Create bidder credibility scores table  
CREATE TABLE public.bidder_credibility_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bidder_id UUID NOT NULL,
  bidder_name TEXT NOT NULL,
  bids_submitted INTEGER DEFAULT 0,
  bids_won INTEGER DEFAULT 0,
  win_ratio NUMERIC(3,2) DEFAULT 0.0,
  delivery_success_rate NUMERIC(3,2) DEFAULT 0.0,
  complaints_count INTEGER DEFAULT 0,
  average_rating NUMERIC(2,1) DEFAULT 0.0,
  credibility_score INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  civic_participation_score INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bidder_id)
);

-- Create tender credibility aggregates table
CREATE TABLE public.tender_credibility_aggregates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL UNIQUE,
  total_ratings INTEGER DEFAULT 0,
  average_quality NUMERIC(2,1) DEFAULT 0.0,
  average_budget_fidelity NUMERIC(2,1) DEFAULT 0.0,
  average_timeliness NUMERIC(2,1) DEFAULT 0.0,
  average_transparency NUMERIC(2,1) DEFAULT 0.0,
  overall_average NUMERIC(2,1) DEFAULT 0.0,
  fraud_flags_count INTEGER DEFAULT 0,
  credibility_status TEXT DEFAULT 'pending' CHECK (credibility_status IN ('excellent', 'good', 'average', 'poor', 'flagged')),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flagged entities table
CREATE TABLE public.flagged_tender_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('issuer', 'bidder', 'tender')),
  entity_name TEXT NOT NULL,
  flag_reason TEXT NOT NULL,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('fraud', 'corruption', 'poor_performance', 'bias', 'other')),
  evidence TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
  flagged_by UUID NOT NULL,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_tender_ratings_tender_id ON public.tender_ratings(tender_id);
CREATE INDEX idx_tender_ratings_user_id ON public.tender_ratings(user_id);
CREATE INDEX idx_tender_ratings_overall ON public.tender_ratings(overall_rating);

CREATE INDEX idx_issuer_credibility_issuer_id ON public.issuer_credibility_scores(issuer_id);
CREATE INDEX idx_issuer_credibility_score ON public.issuer_credibility_scores(credibility_score);
CREATE INDEX idx_issuer_credibility_level ON public.issuer_credibility_scores(credibility_level);

CREATE INDEX idx_bidder_credibility_bidder_id ON public.bidder_credibility_scores(bidder_id);
CREATE INDEX idx_bidder_credibility_score ON public.bidder_credibility_scores(credibility_score);

CREATE INDEX idx_flagged_entities_type ON public.flagged_tender_entities(entity_type);
CREATE INDEX idx_flagged_entities_status ON public.flagged_tender_entities(status);
CREATE INDEX idx_flagged_entities_severity ON public.flagged_tender_entities(severity);

-- Enable RLS
ALTER TABLE public.tender_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issuer_credibility_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bidder_credibility_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_credibility_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flagged_tender_entities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tender_ratings
CREATE POLICY "Anyone can view tender ratings" 
ON public.tender_ratings FOR SELECT USING (true);

CREATE POLICY "Users can create their own ratings" 
ON public.tender_ratings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.tender_ratings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" 
ON public.tender_ratings FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for credibility scores (read-only for users)
CREATE POLICY "Anyone can view issuer credibility scores" 
ON public.issuer_credibility_scores FOR SELECT USING (true);

CREATE POLICY "Anyone can view bidder credibility scores" 
ON public.bidder_credibility_scores FOR SELECT USING (true);

CREATE POLICY "Anyone can view tender aggregates" 
ON public.tender_credibility_aggregates FOR SELECT USING (true);

-- RLS Policies for flagged entities
CREATE POLICY "Anyone can view flagged entities" 
ON public.flagged_tender_entities FOR SELECT USING (true);

CREATE POLICY "Users can flag entities" 
ON public.flagged_tender_entities FOR INSERT 
WITH CHECK (auth.uid() = flagged_by);

CREATE POLICY "Admins can manage flagged entities" 
ON public.flagged_tender_entities FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Function to calculate issuer credibility score
CREATE OR REPLACE FUNCTION calculate_issuer_credibility_score(p_issuer_id UUID, p_issuer_type TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenders_posted INTEGER := 0;
  v_tenders_awarded INTEGER := 0;
  v_fraud_flags INTEGER := 0;
  v_complaints INTEGER := 0;
  v_avg_rating NUMERIC := 0;
  v_score INTEGER := 50; -- Base score
  v_level TEXT := 'moderate';
BEGIN
  -- Get basic stats
  SELECT COUNT(*) INTO v_tenders_posted
  FROM public.tenders 
  WHERE issuer_id = p_issuer_id;
  
  SELECT COUNT(*) INTO v_tenders_awarded
  FROM public.tenders 
  WHERE issuer_id = p_issuer_id AND status = 'awarded';
  
  SELECT COUNT(*) INTO v_fraud_flags
  FROM public.flagged_tender_entities 
  WHERE entity_id = p_issuer_id AND entity_type = 'issuer' AND status = 'active';
  
  SELECT COALESCE(AVG(overall_rating), 0) INTO v_avg_rating
  FROM public.tender_ratings tr
  JOIN public.tenders t ON tr.tender_id = t.id
  WHERE t.issuer_id = p_issuer_id;
  
  -- Calculate score (0-100)
  v_score := 50 + (v_avg_rating * 10) + (v_tenders_awarded * 2) - (v_fraud_flags * 20) - (v_complaints * 5);
  v_score := GREATEST(0, LEAST(100, v_score));
  
  -- Determine level
  IF v_score >= 95 THEN v_level := 'high';
  ELSIF v_score >= 70 THEN v_level := 'moderate';
  ELSE v_level := 'low';
  END IF;
  
  -- Upsert credibility score
  INSERT INTO public.issuer_credibility_scores (
    issuer_id, issuer_type, issuer_name, tenders_posted, tenders_awarded,
    fraud_flags_count, complaints_count, average_rating, credibility_score, credibility_level
  )
  SELECT 
    p_issuer_id, p_issuer_type, 
    COALESCE((SELECT issuer_name FROM public.tenders WHERE issuer_id = p_issuer_id LIMIT 1), 'Unknown'),
    v_tenders_posted, v_tenders_awarded, v_fraud_flags, v_complaints, v_avg_rating, v_score, v_level
  ON CONFLICT (issuer_id, issuer_type) DO UPDATE SET
    tenders_posted = EXCLUDED.tenders_posted,
    tenders_awarded = EXCLUDED.tenders_awarded,
    fraud_flags_count = EXCLUDED.fraud_flags_count,
    complaints_count = EXCLUDED.complaints_count,
    average_rating = EXCLUDED.average_rating,
    credibility_score = EXCLUDED.credibility_score,
    credibility_level = EXCLUDED.credibility_level,
    last_calculated_at = now(),
    updated_at = now();
END;
$$;

-- Function to calculate bidder credibility score
CREATE OR REPLACE FUNCTION calculate_bidder_credibility_score(p_bidder_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bids_submitted INTEGER := 0;
  v_bids_won INTEGER := 0;
  v_win_ratio NUMERIC := 0;
  v_complaints INTEGER := 0;
  v_avg_rating NUMERIC := 0;
  v_score INTEGER := 50;
  v_badges JSONB := '[]'::jsonb;
BEGIN
  -- Get basic stats
  SELECT COUNT(*) INTO v_bids_submitted
  FROM public.tender_bids 
  WHERE bidder_id = p_bidder_id;
  
  SELECT COUNT(*) INTO v_bids_won
  FROM public.tender_bids tb
  JOIN public.tenders t ON tb.tender_id = t.id
  WHERE tb.bidder_id = p_bidder_id AND t.status = 'awarded' AND tb.is_winning_bid = true;
  
  v_win_ratio := CASE WHEN v_bids_submitted > 0 THEN v_bids_won::NUMERIC / v_bids_submitted ELSE 0 END;
  
  SELECT COUNT(*) INTO v_complaints
  FROM public.flagged_tender_entities 
  WHERE entity_id = p_bidder_id AND entity_type = 'bidder' AND status = 'active';
  
  -- Calculate score
  v_score := 50 + (v_win_ratio * 30) + (v_bids_won * 5) - (v_complaints * 15);
  v_score := GREATEST(0, LEAST(100, v_score));
  
  -- Assign badges based on performance
  IF v_score >= 90 AND v_bids_won >= 5 THEN
    v_badges := jsonb_build_array('Gold Vendor');
  ELSIF v_score >= 80 AND v_bids_won >= 3 THEN
    v_badges := jsonb_build_array('Verified Technical Partner');
  ELSIF v_score >= 70 THEN
    v_badges := jsonb_build_array('High Trust Score');
  END IF;
  
  -- Upsert credibility score
  INSERT INTO public.bidder_credibility_scores (
    bidder_id, bidder_name, bids_submitted, bids_won, win_ratio,
    complaints_count, average_rating, credibility_score, badges
  )
  SELECT 
    p_bidder_id,
    COALESCE((SELECT company_name FROM public.tender_bids WHERE bidder_id = p_bidder_id LIMIT 1), 'Unknown'),
    v_bids_submitted, v_bids_won, v_win_ratio, v_complaints, v_avg_rating, v_score, v_badges
  ON CONFLICT (bidder_id) DO UPDATE SET
    bids_submitted = EXCLUDED.bids_submitted,
    bids_won = EXCLUDED.bids_won,
    win_ratio = EXCLUDED.win_ratio,
    complaints_count = EXCLUDED.complaints_count,
    average_rating = EXCLUDED.average_rating,
    credibility_score = EXCLUDED.credibility_score,
    badges = EXCLUDED.badges,
    last_calculated_at = now(),
    updated_at = now();
END;
$$;

-- Function to update tender aggregates when ratings change
CREATE OR REPLACE FUNCTION update_tender_credibility_aggregates()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_tender_id UUID := COALESCE(NEW.tender_id, OLD.tender_id);
  v_total_ratings INTEGER;
  v_avg_quality NUMERIC;
  v_avg_budget NUMERIC;
  v_avg_timeliness NUMERIC;
  v_avg_transparency NUMERIC;
  v_overall_avg NUMERIC;
  v_fraud_flags INTEGER;
  v_status TEXT := 'average';
BEGIN
  -- Calculate aggregates
  SELECT 
    COUNT(*),
    COALESCE(AVG(quality_rating), 0),
    COALESCE(AVG(budget_fidelity_rating), 0),
    COALESCE(AVG(timeliness_rating), 0),
    COALESCE(AVG(transparency_rating), 0),
    COALESCE(AVG(overall_rating), 0),
    COUNT(*) FILTER (WHERE fraud_flag = true)
  INTO v_total_ratings, v_avg_quality, v_avg_budget, v_avg_timeliness, v_avg_transparency, v_overall_avg, v_fraud_flags
  FROM public.tender_ratings
  WHERE tender_id = v_tender_id;
  
  -- Determine status
  IF v_fraud_flags > 0 THEN v_status := 'flagged';
  ELSIF v_overall_avg >= 4.5 THEN v_status := 'excellent';
  ELSIF v_overall_avg >= 3.5 THEN v_status := 'good';
  ELSIF v_overall_avg >= 2.5 THEN v_status := 'average';
  ELSE v_status := 'poor';
  END IF;
  
  -- Upsert aggregate
  INSERT INTO public.tender_credibility_aggregates (
    tender_id, total_ratings, average_quality, average_budget_fidelity,
    average_timeliness, average_transparency, overall_average,
    fraud_flags_count, credibility_status
  )
  VALUES (
    v_tender_id, v_total_ratings, v_avg_quality, v_avg_budget,
    v_avg_timeliness, v_avg_transparency, v_overall_avg,
    v_fraud_flags, v_status
  )
  ON CONFLICT (tender_id) DO UPDATE SET
    total_ratings = EXCLUDED.total_ratings,
    average_quality = EXCLUDED.average_quality,
    average_budget_fidelity = EXCLUDED.average_budget_fidelity,
    average_timeliness = EXCLUDED.average_timeliness,
    average_transparency = EXCLUDED.average_transparency,
    overall_average = EXCLUDED.overall_average,
    fraud_flags_count = EXCLUDED.fraud_flags_count,
    credibility_status = EXCLUDED.credibility_status,
    last_updated_at = now();
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers
CREATE TRIGGER update_tender_ratings_updated_at
BEFORE UPDATE ON public.tender_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_issuer_credibility_updated_at
BEFORE UPDATE ON public.issuer_credibility_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bidder_credibility_updated_at
BEFORE UPDATE ON public.bidder_credibility_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flagged_entities_updated_at
BEFORE UPDATE ON public.flagged_tender_entities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tender_rating_aggregates_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.tender_ratings
FOR EACH ROW
EXECUTE FUNCTION update_tender_credibility_aggregates();