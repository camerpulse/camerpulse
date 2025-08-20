-- Phase 4 setup (idempotent): moderation, analytics, workflows

-- 1) Safe column additions on existing tables
ALTER TABLE petition_comments ADD COLUMN IF NOT EXISTS flagged_reason TEXT;
ALTER TABLE petition_comments ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id);
ALTER TABLE petition_comments ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

ALTER TABLE petition_updates ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id);
ALTER TABLE petition_updates ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

-- 2) Core tables (create if not exists)
CREATE TABLE IF NOT EXISTS petition_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id UUID NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  date_tracked DATE NOT NULL DEFAULT CURRENT_DATE,
  views_count INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  signatures_added INTEGER DEFAULT 0,
  comments_added INTEGER DEFAULT 0,
  reactions_added INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.00,
  engagement_score DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(petition_id, date_tracked)
);

CREATE TABLE IF NOT EXISTS petition_workflow_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id UUID NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  workflow_stage TEXT NOT NULL DEFAULT 'draft',
  assigned_moderator UUID REFERENCES auth.users(id),
  priority_level INTEGER DEFAULT 3,
  review_notes TEXT,
  review_deadline TIMESTAMPTZ,
  auto_approval_eligible BOOLEAN DEFAULT false,
  escalation_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS petition_moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id UUID NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  queue_type TEXT NOT NULL DEFAULT 'review',
  assigned_to UUID REFERENCES auth.users(id),
  priority INTEGER DEFAULT 3,
  flags_count INTEGER DEFAULT 0,
  auto_flagged BOOLEAN DEFAULT false,
  flag_reasons TEXT[],
  review_status TEXT DEFAULT 'pending',
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  escalated BOOLEAN DEFAULT false,
  escalated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  action_details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS petition_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id UUID NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id),
  report_reason TEXT NOT NULL,
  report_details TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3) Indexes (if not exist)
CREATE INDEX IF NOT EXISTS idx_petition_analytics_petition_date ON petition_analytics(petition_id, date_tracked);
CREATE INDEX IF NOT EXISTS idx_petition_analytics_date ON petition_analytics(date_tracked);
CREATE INDEX IF NOT EXISTS idx_petition_workflow_stage ON petition_workflow_states(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_petition_workflow_assigned ON petition_workflow_states(assigned_moderator);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON petition_moderation_queue(review_status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_assigned ON petition_moderation_queue(assigned_to);
CREATE INDEX IF NOT EXISTS idx_admin_activity_timestamp ON admin_activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_petition_reports_status ON petition_reports(status);

-- 4) Triggers (create if not exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_petition_analytics_updated_at'
  ) THEN
    CREATE TRIGGER update_petition_analytics_updated_at
      BEFORE UPDATE ON petition_analytics
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_petition_workflow_states_updated_at'
  ) THEN
    CREATE TRIGGER update_petition_workflow_states_updated_at
      BEFORE UPDATE ON petition_workflow_states
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_petition_moderation_queue_updated_at'
  ) THEN
    CREATE TRIGGER update_petition_moderation_queue_updated_at
      BEFORE UPDATE ON petition_moderation_queue
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_petition_reports_updated_at'
  ) THEN
    CREATE TRIGGER update_petition_reports_updated_at
      BEFORE UPDATE ON petition_reports
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 5) Enable RLS (idempotent)
ALTER TABLE petition_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE petition_workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE petition_moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE petition_reports ENABLE ROW LEVEL SECURITY;

-- 6) Policies (create if not exists via DO blocks)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='petition_analytics' AND policyname='Admins can manage petition analytics'
  ) THEN
    CREATE POLICY "Admins can manage petition analytics" ON petition_analytics
      FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='petition_analytics' AND policyname='Petition creators can view their analytics'
  ) THEN
    CREATE POLICY "Petition creators can view their analytics" ON petition_analytics
      FOR SELECT USING (
        petition_id IN (
          SELECT id FROM petitions WHERE created_by = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='petition_workflow_states' AND policyname='Admins can manage workflow states'
  ) THEN
    CREATE POLICY "Admins can manage workflow states" ON petition_workflow_states
      FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='petition_workflow_states' AND policyname='Moderators can view assigned workflows'
  ) THEN
    CREATE POLICY "Moderators can view assigned workflows" ON petition_workflow_states
      FOR SELECT USING (
        assigned_moderator = auth.uid() OR
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='petition_moderation_queue' AND policyname='Admins can manage moderation queue'
  ) THEN
    CREATE POLICY "Admins can manage moderation queue" ON petition_moderation_queue
      FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='petition_moderation_queue' AND policyname='Moderators can manage assigned items'
  ) THEN
    CREATE POLICY "Moderators can manage assigned items" ON petition_moderation_queue
      FOR ALL USING (
        assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_activity_log' AND policyname='Admins can view activity logs'
  ) THEN
    CREATE POLICY "Admins can view activity logs" ON admin_activity_log
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_activity_log' AND policyname='Users can create their own activity logs'
  ) THEN
    CREATE POLICY "Users can create their own activity logs" ON admin_activity_log
      FOR INSERT WITH CHECK (admin_user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='petition_reports' AND policyname='Users can create reports'
  ) THEN
    CREATE POLICY "Users can create reports" ON petition_reports
      FOR INSERT WITH CHECK (reported_by = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='petition_reports' AND policyname='Users can view their own reports'
  ) THEN
    CREATE POLICY "Users can view their own reports" ON petition_reports
      FOR SELECT USING (reported_by = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='petition_reports' AND policyname='Admins can manage all reports'
  ) THEN
    CREATE POLICY "Admins can manage all reports" ON petition_reports
      FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

-- 7) Realtime publication (catch duplicates)
DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE petition_analytics;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE petition_workflow_states;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE petition_moderation_queue;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE admin_activity_log;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE petition_reports;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;