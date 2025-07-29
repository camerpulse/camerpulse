-- Create enum types for legislation tracker
CREATE TYPE law_type AS ENUM (
  'bill',
  'amendment',
  'reform',
  'ordinance',
  'act',
  'resolution'
);

CREATE TYPE law_status AS ENUM (
  'draft',
  'in_committee',
  'first_reading',
  'second_reading',
  'third_reading',
  'voted',
  'passed',
  'rejected',
  'paused',
  'withdrawn',
  'archived'
);

CREATE TYPE vote_position AS ENUM (
  'yes',
  'no',
  'abstain',
  'absent'
);

CREATE TYPE mp_vote_type AS ENUM (
  'official',
  'committee',
  'preliminary'
);

-- Main legislation registry table
CREATE TABLE public.legislation_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_title TEXT NOT NULL,
  bill_number TEXT UNIQUE,
  law_type law_type NOT NULL,
  originator_type TEXT, -- 'ministry', 'mp', 'party', 'executive'
  originator_name TEXT,
  originator_id UUID, -- Reference to MP, ministry, or party
  affected_sectors TEXT[],
  full_text_url TEXT,
  legislative_summary TEXT,
  status law_status DEFAULT 'draft',
  date_introduced DATE,
  date_last_updated DATE DEFAULT CURRENT_DATE,
  tags TEXT[],
  related_laws UUID[],
  impact_assessment TEXT,
  estimated_cost_fcfa BIGINT,
  implementation_timeline TEXT,
  citizen_upvotes INTEGER DEFAULT 0,
  citizen_downvotes INTEGER DEFAULT 0,
  citizen_impact_score NUMERIC DEFAULT 0.0,
  total_comments INTEGER DEFAULT 0,
  total_petitions INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  transparency_score NUMERIC DEFAULT 0.0,
  corruption_risk_level TEXT DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- MP voting records table
CREATE TABLE public.mp_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  legislation_id UUID NOT NULL REFERENCES public.legislation_registry(id) ON DELETE CASCADE,
  mp_id UUID NOT NULL, -- Reference to politicians table
  mp_name TEXT NOT NULL,
  constituency TEXT,
  political_party TEXT,
  vote_position vote_position NOT NULL,
  vote_type mp_vote_type DEFAULT 'official',
  vote_date TIMESTAMP WITH TIME ZONE NOT NULL,
  vote_round INTEGER DEFAULT 1, -- For multiple voting rounds
  vote_notes TEXT,
  was_present BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Citizen engagement with legislation
CREATE TABLE public.citizen_bill_engagement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  legislation_id UUID NOT NULL REFERENCES public.legislation_registry(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  engagement_type TEXT NOT NULL, -- 'vote', 'comment', 'petition', 'follow', 'share'
  vote_position vote_position, -- Only for vote type
  comment_text TEXT,
  petition_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(legislation_id, user_id, engagement_type)
);

-- Bill comments and discussions
CREATE TABLE public.bill_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  legislation_id UUID NOT NULL REFERENCES public.legislation_registry(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  comment_text TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.bill_comments(id),
  is_expert_opinion BOOLEAN DEFAULT false,
  expert_credentials TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Legislative voting sessions
CREATE TABLE public.voting_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  legislation_id UUID NOT NULL REFERENCES public.legislation_registry(id) ON DELETE CASCADE,
  session_name TEXT NOT NULL,
  session_type TEXT NOT NULL, -- 'committee', 'first_reading', 'final_vote'
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_mps_present INTEGER,
  total_mps_expected INTEGER,
  votes_yes INTEGER DEFAULT 0,
  votes_no INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0,
  votes_absent INTEGER DEFAULT 0,
  session_result TEXT, -- 'passed', 'failed', 'deferred'
  session_notes TEXT,
  live_stream_url TEXT,
  transcript_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Legislative timeline tracking
CREATE TABLE public.legislative_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  legislation_id UUID NOT NULL REFERENCES public.legislation_registry(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'introduced', 'committee_assigned', 'voted', 'amended'
  event_title TEXT NOT NULL,
  event_description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actor_type TEXT, -- 'mp', 'ministry', 'committee', 'president'
  actor_name TEXT,
  actor_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bill followers for notifications
CREATE TABLE public.bill_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  legislation_id UUID NOT NULL REFERENCES public.legislation_registry(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_preferences JSONB DEFAULT '{"votes": true, "status_changes": true, "comments": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(legislation_id, user_id)
);

-- MP legislative performance tracking
CREATE TABLE public.mp_legislative_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mp_id UUID NOT NULL,
  mp_name TEXT NOT NULL,
  total_votes_cast INTEGER DEFAULT 0,
  total_votes_yes INTEGER DEFAULT 0,
  total_votes_no INTEGER DEFAULT 0,
  total_abstentions INTEGER DEFAULT 0,
  total_absences INTEGER DEFAULT 0,
  attendance_rate NUMERIC DEFAULT 0.0,
  bills_authored INTEGER DEFAULT 0,
  bills_co_sponsored INTEGER DEFAULT 0,
  citizen_approval_rating NUMERIC DEFAULT 0.0,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(mp_id)
);

-- Legislative alerts and notifications
CREATE TABLE public.legislative_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  legislation_id UUID REFERENCES public.legislation_registry(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'vote_scheduled', 'status_change', 'new_comment'
  alert_title TEXT NOT NULL,
  alert_message TEXT NOT NULL,
  target_audience TEXT NOT NULL, -- 'followers', 'all_citizens', 'specific_regions'
  regions_affected TEXT[],
  send_email BOOLEAN DEFAULT false,
  send_sms BOOLEAN DEFAULT false,
  send_push BOOLEAN DEFAULT true,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  recipients_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legislation_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mp_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_bill_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legislative_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mp_legislative_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legislative_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for legislation_registry
CREATE POLICY "Public can view legislation" 
ON public.legislation_registry FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage legislation" 
ON public.legislation_registry FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for mp_votes
CREATE POLICY "Public can view MP votes" 
ON public.mp_votes FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage MP votes" 
ON public.mp_votes FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for citizen_bill_engagement
CREATE POLICY "Users can manage their own engagement" 
ON public.citizen_bill_engagement FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view engagement stats" 
ON public.citizen_bill_engagement FOR SELECT 
USING (true);

-- RLS Policies for bill_comments
CREATE POLICY "Public can view comments" 
ON public.bill_comments FOR SELECT 
USING (true);

CREATE POLICY "Users can create comments" 
ON public.bill_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.bill_comments FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for voting_sessions
CREATE POLICY "Public can view voting sessions" 
ON public.voting_sessions FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage voting sessions" 
ON public.voting_sessions FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for legislative_timeline
CREATE POLICY "Public can view legislative timeline" 
ON public.legislative_timeline FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage timeline" 
ON public.legislative_timeline FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for bill_followers
CREATE POLICY "Users can manage their own follows" 
ON public.bill_followers FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for mp_legislative_stats
CREATE POLICY "Public can view MP stats" 
ON public.mp_legislative_stats FOR SELECT 
USING (true);

CREATE POLICY "System can update MP stats" 
ON public.mp_legislative_stats FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for legislative_alerts
CREATE POLICY "Admins can manage alerts" 
ON public.legislative_alerts FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_legislation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_legislation_registry_updated_at
  BEFORE UPDATE ON public.legislation_registry
  FOR EACH ROW EXECUTE FUNCTION update_legislation_updated_at();

CREATE TRIGGER update_bill_comments_updated_at
  BEFORE UPDATE ON public.bill_comments
  FOR EACH ROW EXECUTE FUNCTION update_legislation_updated_at();

-- Function to update citizen engagement stats
CREATE OR REPLACE FUNCTION update_citizen_engagement_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update engagement counters on legislation
    IF NEW.engagement_type = 'vote' THEN
      IF NEW.vote_position = 'yes' THEN
        UPDATE public.legislation_registry 
        SET citizen_upvotes = citizen_upvotes + 1 
        WHERE id = NEW.legislation_id;
      ELSIF NEW.vote_position = 'no' THEN
        UPDATE public.legislation_registry 
        SET citizen_downvotes = citizen_downvotes + 1 
        WHERE id = NEW.legislation_id;
      END IF;
    ELSIF NEW.engagement_type = 'follow' THEN
      UPDATE public.legislation_registry 
      SET followers_count = followers_count + 1 
      WHERE id = NEW.legislation_id;
    ELSIF NEW.engagement_type = 'petition' THEN
      UPDATE public.legislation_registry 
      SET total_petitions = total_petitions + 1 
      WHERE id = NEW.legislation_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Reverse the counters
    IF OLD.engagement_type = 'vote' THEN
      IF OLD.vote_position = 'yes' THEN
        UPDATE public.legislation_registry 
        SET citizen_upvotes = GREATEST(0, citizen_upvotes - 1)
        WHERE id = OLD.legislation_id;
      ELSIF OLD.vote_position = 'no' THEN
        UPDATE public.legislation_registry 
        SET citizen_downvotes = GREATEST(0, citizen_downvotes - 1)
        WHERE id = OLD.legislation_id;
      END IF;
    ELSIF OLD.engagement_type = 'follow' THEN
      UPDATE public.legislation_registry 
      SET followers_count = GREATEST(0, followers_count - 1)
      WHERE id = OLD.legislation_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_citizen_engagement_stats_trigger
  AFTER INSERT OR DELETE ON public.citizen_bill_engagement
  FOR EACH ROW EXECUTE FUNCTION update_citizen_engagement_stats();

-- Function to calculate MP legislative performance
CREATE OR REPLACE FUNCTION calculate_mp_legislative_performance(p_mp_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_votes INTEGER := 0;
  v_yes_votes INTEGER := 0;
  v_no_votes INTEGER := 0;
  v_abstentions INTEGER := 0;
  v_absences INTEGER := 0;
  v_attendance_rate NUMERIC := 0;
  v_bills_authored INTEGER := 0;
  v_bills_co_sponsored INTEGER := 0;
BEGIN
  -- Calculate voting statistics
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE vote_position = 'yes'),
    COUNT(*) FILTER (WHERE vote_position = 'no'),
    COUNT(*) FILTER (WHERE vote_position = 'abstain'),
    COUNT(*) FILTER (WHERE vote_position = 'absent' OR was_present = false)
  INTO v_total_votes, v_yes_votes, v_no_votes, v_abstentions, v_absences
  FROM public.mp_votes 
  WHERE mp_id = p_mp_id;

  -- Calculate attendance rate
  IF v_total_votes > 0 THEN
    v_attendance_rate := ((v_total_votes - v_absences)::NUMERIC / v_total_votes) * 100;
  END IF;

  -- Count authored bills (would need originator_id to match mp_id)
  SELECT COUNT(*) INTO v_bills_authored
  FROM public.legislation_registry 
  WHERE originator_id = p_mp_id AND originator_type = 'mp';

  -- Insert or update stats
  INSERT INTO public.mp_legislative_stats (
    mp_id, mp_name, total_votes_cast, total_votes_yes, total_votes_no,
    total_abstentions, total_absences, attendance_rate, 
    bills_authored, bills_co_sponsored, last_calculated_at
  ) 
  SELECT 
    p_mp_id, 
    COALESCE((SELECT name FROM politicians WHERE id = p_mp_id), 'Unknown MP'),
    v_total_votes, v_yes_votes, v_no_votes, v_abstentions, v_absences,
    v_attendance_rate, v_bills_authored, v_bills_co_sponsored, now()
  ON CONFLICT (mp_id) DO UPDATE SET
    total_votes_cast = EXCLUDED.total_votes_cast,
    total_votes_yes = EXCLUDED.total_votes_yes,
    total_votes_no = EXCLUDED.total_votes_no,
    total_abstentions = EXCLUDED.total_abstentions,
    total_absences = EXCLUDED.total_absences,
    attendance_rate = EXCLUDED.attendance_rate,
    bills_authored = EXCLUDED.bills_authored,
    bills_co_sponsored = EXCLUDED.bills_co_sponsored,
    last_calculated_at = EXCLUDED.last_calculated_at,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get legislation statistics
CREATE OR REPLACE FUNCTION get_legislation_statistics()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  total_bills INTEGER;
  active_bills INTEGER;
  passed_bills INTEGER;
  rejected_bills INTEGER;
  total_citizen_votes BIGINT;
  avg_citizen_engagement NUMERIC;
BEGIN
  SELECT COUNT(*) INTO total_bills FROM public.legislation_registry;
  SELECT COUNT(*) INTO active_bills FROM public.legislation_registry WHERE status IN ('draft', 'in_committee', 'first_reading', 'second_reading', 'third_reading');
  SELECT COUNT(*) INTO passed_bills FROM public.legislation_registry WHERE status = 'passed';
  SELECT COUNT(*) INTO rejected_bills FROM public.legislation_registry WHERE status = 'rejected';
  SELECT COALESCE(SUM(citizen_upvotes + citizen_downvotes), 0) INTO total_citizen_votes FROM public.legislation_registry;
  SELECT COALESCE(AVG(citizen_upvotes + citizen_downvotes), 0) INTO avg_citizen_engagement FROM public.legislation_registry;
  
  result := jsonb_build_object(
    'total_bills', total_bills,
    'active_bills', active_bills,
    'passed_bills', passed_bills,
    'rejected_bills', rejected_bills,
    'total_citizen_votes', total_citizen_votes,
    'avg_citizen_engagement', avg_citizen_engagement,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;