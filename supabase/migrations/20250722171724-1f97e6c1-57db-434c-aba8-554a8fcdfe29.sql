-- Extended Senator System Enhancements

-- First, add new fields to senators table for the extended system
ALTER TABLE public.senators 
ADD COLUMN IF NOT EXISTS is_claimable boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_claimed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS claim_fee_paid boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS claim_payment_reference text,
ADD COLUMN IF NOT EXISTS claim_documents_url text[],
ADD COLUMN IF NOT EXISTS claim_status text DEFAULT 'unclaimed',
ADD COLUMN IF NOT EXISTS verification_notes text,
ADD COLUMN IF NOT EXISTS last_scraped_at timestamptz,
ADD COLUMN IF NOT EXISTS scrape_source text DEFAULT 'senat.cm',
ADD COLUMN IF NOT EXISTS trust_score numeric(3,1) DEFAULT 50.0,
ADD COLUMN IF NOT EXISTS misconduct_reports_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_completeness_score numeric(3,1) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS last_activity_at timestamptz,
ADD COLUMN IF NOT EXISTS follower_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS engagement_score numeric(3,1) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS response_rate numeric(3,1) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS senate_id text,
ADD COLUMN IF NOT EXISTS term_start_date date,
ADD COLUMN IF NOT EXISTS term_end_date date,
ADD COLUMN IF NOT EXISTS timeline_events jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS media_mentions_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS can_receive_messages boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS message_response_time_hours integer,
ADD COLUMN IF NOT EXISTS auto_imported boolean DEFAULT false;

-- Add constraints for claim status
ALTER TABLE public.senators 
ADD CONSTRAINT IF NOT EXISTS chk_senator_claim_status 
CHECK (claim_status IN ('unclaimed', 'pending', 'approved', 'rejected'));

-- Create senator claims table
CREATE TABLE IF NOT EXISTS public.senator_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senator_id uuid NOT NULL REFERENCES public.senators(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claim_type text NOT NULL DEFAULT 'ownership',
  claim_reason text,
  evidence_files text[],
  claim_fee_amount numeric NOT NULL DEFAULT 500000,
  payment_method text,
  payment_reference text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  admin_notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create senator following table
CREATE TABLE IF NOT EXISTS public.senator_following (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senator_id uuid NOT NULL REFERENCES public.senators(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_enabled boolean DEFAULT true,
  followed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(senator_id, user_id)
);

-- Create senator reports table (for misconduct reporting)
CREATE TABLE IF NOT EXISTS public.senator_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senator_id uuid NOT NULL REFERENCES public.senators(id) ON DELETE CASCADE,
  reporter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type text NOT NULL,
  report_category text NOT NULL,
  description text NOT NULL,
  evidence_files text[],
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'resolved', 'dismissed')),
  admin_notes text,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create enhanced senator ratings table (extending existing)
-- First check if we need to add new columns to senator_ratings
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE public.senator_ratings 
    ADD COLUMN IF NOT EXISTS legislative_performance_rating integer,
    ADD COLUMN IF NOT EXISTS civic_engagement_rating integer,
    ADD COLUMN IF NOT EXISTS integrity_rating integer,
    ADD COLUMN IF NOT EXISTS constituency_development_rating integer,
    ADD COLUMN IF NOT EXISTS verified_rating boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS rating_weight numeric(2,1) DEFAULT 1.0,
    ADD COLUMN IF NOT EXISTS reviewer_type text DEFAULT 'citizen',
    ADD COLUMN IF NOT EXISTS impact_score numeric(3,1) DEFAULT 0.0;
  EXCEPTION
    WHEN duplicate_column THEN
      NULL; -- Column already exists, ignore
  END;
END $$;

-- Create senator messages table
CREATE TABLE IF NOT EXISTS public.senator_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senator_id uuid NOT NULL REFERENCES public.senators(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message_content text NOT NULL,
  message_type text DEFAULT 'inquiry' CHECK (message_type IN ('inquiry', 'complaint', 'suggestion', 'support', 'media')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'read', 'replied', 'forwarded', 'archived')),
  response_content text,
  responded_at timestamptz,
  responded_by uuid REFERENCES auth.users(id),
  attachments text[],
  is_public boolean DEFAULT false,
  requires_pro_membership boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create senator dashboard analytics table
CREATE TABLE IF NOT EXISTS public.senator_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senator_id uuid NOT NULL REFERENCES public.senators(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  metric_value numeric NOT NULL,
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(senator_id, metric_type, metric_date)
);

-- Create senator sync logs table
CREATE TABLE IF NOT EXISTS public.senator_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type text NOT NULL DEFAULT 'auto_import',
  source_url text,
  total_senators_found integer,
  new_senators_added integer,
  existing_senators_updated integer,
  errors_encountered integer,
  sync_status text DEFAULT 'completed' CHECK (sync_status IN ('started', 'completed', 'failed', 'partial')),
  error_details jsonb,
  sync_metadata jsonb DEFAULT '{}',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  initiated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on all new tables
ALTER TABLE public.senator_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senator_following ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senator_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senator_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senator_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senator_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for senator_claims
CREATE POLICY "Users can view their own claims" ON public.senator_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create claims" ON public.senator_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all claims" ON public.senator_claims
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- RLS Policies for senator_following  
CREATE POLICY "Users can manage their own follows" ON public.senator_following
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view follow counts" ON public.senator_following
  FOR SELECT USING (true);

-- RLS Policies for senator_reports
CREATE POLICY "Users can view their own reports" ON public.senator_reports
  FOR SELECT USING (auth.uid() = reporter_user_id);

CREATE POLICY "Users can create reports" ON public.senator_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Admins can manage all reports" ON public.senator_reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- RLS Policies for senator_messages
CREATE POLICY "Users can view their own messages" ON public.senator_messages
  FOR SELECT USING (auth.uid() = sender_user_id);

CREATE POLICY "Users can send messages" ON public.senator_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY "Claimed senators can view their messages" ON public.senator_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM senators 
      WHERE senators.id = senator_messages.senator_id 
      AND senators.claimed_by = auth.uid()
      AND senators.claim_status = 'approved'
    )
  );

CREATE POLICY "Claimed senators can respond to messages" ON public.senator_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM senators 
      WHERE senators.id = senator_messages.senator_id 
      AND senators.claimed_by = auth.uid()
      AND senators.claim_status = 'approved'
    )
  );

CREATE POLICY "Admins can manage all messages" ON public.senator_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- RLS Policies for senator_analytics
CREATE POLICY "Claimed senators can view their analytics" ON public.senator_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM senators 
      WHERE senators.id = senator_analytics.senator_id 
      AND senators.claimed_by = auth.uid()
      AND senators.claim_status = 'approved'
    )
  );

CREATE POLICY "Admins can manage all analytics" ON public.senator_analytics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- RLS Policies for senator_sync_logs
CREATE POLICY "Admins can manage sync logs" ON public.senator_sync_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_senator_claims_senator_id ON public.senator_claims(senator_id);
CREATE INDEX IF NOT EXISTS idx_senator_claims_user_id ON public.senator_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_senator_claims_status ON public.senator_claims(status);

CREATE INDEX IF NOT EXISTS idx_senator_following_senator_id ON public.senator_following(senator_id);
CREATE INDEX IF NOT EXISTS idx_senator_following_user_id ON public.senator_following(user_id);

CREATE INDEX IF NOT EXISTS idx_senator_reports_senator_id ON public.senator_reports(senator_id);
CREATE INDEX IF NOT EXISTS idx_senator_reports_status ON public.senator_reports(status);

CREATE INDEX IF NOT EXISTS idx_senator_messages_senator_id ON public.senator_messages(senator_id);
CREATE INDEX IF NOT EXISTS idx_senator_messages_sender_id ON public.senator_messages(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_senator_messages_status ON public.senator_messages(status);

CREATE INDEX IF NOT EXISTS idx_senator_analytics_senator_id ON public.senator_analytics(senator_id);
CREATE INDEX IF NOT EXISTS idx_senator_analytics_date ON public.senator_analytics(metric_date);

CREATE INDEX IF NOT EXISTS idx_senators_claimed_by ON public.senators(claimed_by);
CREATE INDEX IF NOT EXISTS idx_senators_claim_status ON public.senators(claim_status);
CREATE INDEX IF NOT EXISTS idx_senators_trust_score ON public.senators(trust_score);

-- Add updated_at triggers
CREATE TRIGGER update_senator_claims_updated_at
  BEFORE UPDATE ON public.senator_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_senator_reports_updated_at
  BEFORE UPDATE ON public.senator_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_senator_messages_updated_at
  BEFORE UPDATE ON public.senator_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Functions for calculating scores and metrics
CREATE OR REPLACE FUNCTION public.calculate_senator_trust_score(p_senator_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trust_score numeric := 50.0;
  avg_rating numeric;
  misconduct_count integer;
  verification_bonus numeric := 0;
  engagement_factor numeric := 1.0;
BEGIN
  -- Get average rating
  SELECT AVG(overall_rating) INTO avg_rating
  FROM senator_ratings 
  WHERE senator_id = p_senator_id;
  
  -- Get misconduct reports count
  SELECT COUNT(*) INTO misconduct_count
  FROM senator_reports 
  WHERE senator_id = p_senator_id AND status != 'dismissed';
  
  -- Base calculation
  trust_score := COALESCE(avg_rating * 20, 50);
  
  -- Verification bonus
  SELECT CASE WHEN is_verified THEN 10 ELSE 0 END INTO verification_bonus
  FROM senators WHERE id = p_senator_id;
  
  -- Apply factors
  trust_score := trust_score + verification_bonus - (misconduct_count * 5);
  
  -- Ensure bounds
  trust_score := GREATEST(0, LEAST(100, trust_score));
  
  -- Update senator record
  UPDATE senators 
  SET trust_score = trust_score 
  WHERE id = p_senator_id;
  
  RETURN trust_score;
END;
$$;

-- Function to update follower count
CREATE OR REPLACE FUNCTION public.update_senator_follower_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE senators 
    SET follower_count = follower_count + 1 
    WHERE id = NEW.senator_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE senators 
    SET follower_count = follower_count - 1 
    WHERE id = OLD.senator_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for follower count updates
CREATE TRIGGER senator_follower_count_trigger
  AFTER INSERT OR DELETE ON public.senator_following
  FOR EACH ROW EXECUTE FUNCTION public.update_senator_follower_count();

-- Function to update misconduct reports count
CREATE OR REPLACE FUNCTION public.update_senator_misconduct_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE senators 
    SET misconduct_reports_count = misconduct_reports_count + 1 
    WHERE id = NEW.senator_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE senators 
    SET misconduct_reports_count = misconduct_reports_count - 1 
    WHERE id = OLD.senator_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for misconduct count updates
CREATE TRIGGER senator_misconduct_count_trigger
  AFTER INSERT OR DELETE ON public.senator_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_senator_misconduct_count();