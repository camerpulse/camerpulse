-- Enhance politician_promises table with missing fields
ALTER TABLE public.politician_promises 
ADD COLUMN IF NOT EXISTS expected_delivery_date DATE,
ADD COLUMN IF NOT EXISTS regions_targeted TEXT[],
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'flagged', 'disputed')),
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS topic_category TEXT,
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'speech' CHECK (source_type IN ('speech', 'manifesto', 'media', 'document', 'interview')),
ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS public_interest_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS broken_promise_alert_sent BOOLEAN DEFAULT FALSE;

-- Create party_promises table for political party promises
CREATE TABLE IF NOT EXISTS public.party_promises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES public.political_parties(id) ON DELETE CASCADE,
  promise_text TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('fulfilled', 'unfulfilled', 'in_progress', 'no_effort')),
  date_made DATE,
  date_updated DATE DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  regions_targeted TEXT[],
  evidence_url TEXT,
  description TEXT,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'flagged', 'disputed')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  topic_category TEXT,
  source_type TEXT DEFAULT 'manifesto' CHECK (source_type IN ('speech', 'manifesto', 'media', 'document', 'interview')),
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  public_interest_score INTEGER DEFAULT 0,
  broken_promise_alert_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create promise_sentiment_correlations table to link promises with emotional reactions
CREATE TABLE IF NOT EXISTS public.promise_sentiment_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promise_id UUID,
  promise_type TEXT NOT NULL CHECK (promise_type IN ('politician', 'party')),
  correlation_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sentiment_shift_intensity NUMERIC,
  dominant_emotion TEXT,
  affected_regions TEXT[],
  baseline_sentiment NUMERIC,
  post_event_sentiment NUMERIC,
  correlation_strength NUMERIC DEFAULT 0,
  confidence_score NUMERIC DEFAULT 0,
  related_sentiment_log_ids UUID[],
  analysis_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create promise_public_votes table for citizen voting on promise fulfillment
CREATE TABLE IF NOT EXISTS public.promise_public_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promise_id UUID NOT NULL,
  promise_type TEXT NOT NULL CHECK (promise_type IN ('politician', 'party')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_status TEXT NOT NULL CHECK (vote_status IN ('fulfilled', 'unfulfilled', 'in_progress', 'no_effort')),
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  evidence_provided TEXT,
  vote_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(promise_id, promise_type, user_id)
);

-- Create promise_alerts table for tracking alerts about broken promises
CREATE TABLE IF NOT EXISTS public.promise_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promise_id UUID NOT NULL,
  promise_type TEXT NOT NULL CHECK (promise_type IN ('politician', 'party')),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('overdue', 'sentiment_spike', 'mass_anger', 'verification_needed')),
  alert_severity TEXT DEFAULT 'medium' CHECK (alert_severity IN ('low', 'medium', 'high', 'critical')),
  alert_message TEXT NOT NULL,
  affected_regions TEXT[],
  sentiment_data JSONB,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  auto_generated BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.party_promises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promise_sentiment_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promise_public_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promise_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for party_promises
CREATE POLICY "Party promises are publicly readable" ON public.party_promises FOR SELECT USING (true);
CREATE POLICY "Admins can manage party promises" ON public.party_promises FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

-- RLS Policies for promise_sentiment_correlations
CREATE POLICY "Promise correlations are publicly readable" ON public.promise_sentiment_correlations FOR SELECT USING (true);
CREATE POLICY "Admins can manage promise correlations" ON public.promise_sentiment_correlations FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

-- RLS Policies for promise_public_votes
CREATE POLICY "Users can view public vote summaries" ON public.promise_public_votes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own votes" ON public.promise_public_votes FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for promise_alerts
CREATE POLICY "Promise alerts are publicly readable" ON public.promise_alerts FOR SELECT USING (true);
CREATE POLICY "Admins can manage promise alerts" ON public.promise_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

-- Add updated_at triggers
CREATE TRIGGER update_party_promises_updated_at
  BEFORE UPDATE ON public.party_promises
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promise_public_votes_updated_at
  BEFORE UPDATE ON public.promise_public_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_party_promises_party_id ON public.party_promises(party_id);
CREATE INDEX IF NOT EXISTS idx_party_promises_status ON public.party_promises(status);
CREATE INDEX IF NOT EXISTS idx_party_promises_verification_status ON public.party_promises(verification_status);
CREATE INDEX IF NOT EXISTS idx_party_promises_topic_category ON public.party_promises(topic_category);
CREATE INDEX IF NOT EXISTS idx_party_promises_expected_delivery ON public.party_promises(expected_delivery_date);

CREATE INDEX IF NOT EXISTS idx_promise_sentiment_promise ON public.promise_sentiment_correlations(promise_id, promise_type);
CREATE INDEX IF NOT EXISTS idx_promise_sentiment_date ON public.promise_sentiment_correlations(correlation_date);

CREATE INDEX IF NOT EXISTS idx_promise_votes_promise ON public.promise_public_votes(promise_id, promise_type);
CREATE INDEX IF NOT EXISTS idx_promise_votes_user ON public.promise_public_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_promise_alerts_promise ON public.promise_alerts(promise_id, promise_type);
CREATE INDEX IF NOT EXISTS idx_promise_alerts_type ON public.promise_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_promise_alerts_acknowledged ON public.promise_alerts(acknowledged);