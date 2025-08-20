-- Create admin dashboard tables and enhance existing ones for Phase 4

-- Add moderation capabilities to existing comments and updates tables
ALTER TABLE petition_comments ADD COLUMN flagged_reason TEXT;
ALTER TABLE petition_comments ADD COLUMN moderated_by UUID REFERENCES auth.users(id);
ALTER TABLE petition_comments ADD COLUMN moderated_at TIMESTAMPTZ;

ALTER TABLE petition_updates ADD COLUMN moderated_by UUID REFERENCES auth.users(id);
ALTER TABLE petition_updates ADD COLUMN moderated_at TIMESTAMPTZ;

-- Create petition analytics table
CREATE TABLE petition_analytics (
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

-- Create petition workflow states table
CREATE TABLE petition_workflow_states (
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

-- Create moderation queue table
CREATE TABLE petition_moderation_queue (
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

-- Create admin activity log
CREATE TABLE admin_activity_log (
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

-- Create petition reports table for user reporting
CREATE TABLE petition_reports (
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

-- Create indexes for performance
CREATE INDEX idx_petition_analytics_petition_date ON petition_analytics(petition_id, date_tracked);
CREATE INDEX idx_petition_analytics_date ON petition_analytics(date_tracked);
CREATE INDEX idx_petition_workflow_stage ON petition_workflow_states(workflow_stage);
CREATE INDEX idx_petition_workflow_assigned ON petition_workflow_states(assigned_moderator);
CREATE INDEX idx_moderation_queue_status ON petition_moderation_queue(review_status);
CREATE INDEX idx_moderation_queue_assigned ON petition_moderation_queue(assigned_to);
CREATE INDEX idx_admin_activity_timestamp ON admin_activity_log(timestamp);
CREATE INDEX idx_petition_reports_status ON petition_reports(status);

-- Add triggers for updated_at columns
CREATE TRIGGER update_petition_analytics_updated_at 
    BEFORE UPDATE ON petition_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_petition_workflow_states_updated_at 
    BEFORE UPDATE ON petition_workflow_states 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_petition_moderation_queue_updated_at 
    BEFORE UPDATE ON petition_moderation_queue 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_petition_reports_updated_at 
    BEFORE UPDATE ON petition_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE petition_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE petition_workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE petition_moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE petition_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for petition_analytics
CREATE POLICY "Admins can manage petition analytics" ON petition_analytics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Petition creators can view their analytics" ON petition_analytics
  FOR SELECT USING (
    petition_id IN (
      SELECT id FROM petitions WHERE created_by = auth.uid()
    )
  );

-- RLS Policies for petition_workflow_states
CREATE POLICY "Admins can manage workflow states" ON petition_workflow_states
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Moderators can view assigned workflows" ON petition_workflow_states
  FOR SELECT USING (
    assigned_moderator = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- RLS Policies for petition_moderation_queue
CREATE POLICY "Admins can manage moderation queue" ON petition_moderation_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Moderators can manage assigned items" ON petition_moderation_queue
  FOR ALL USING (
    assigned_to = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- RLS Policies for admin_activity_log
CREATE POLICY "Admins can view activity logs" ON admin_activity_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create their own activity logs" ON admin_activity_log
  FOR INSERT WITH CHECK (admin_user_id = auth.uid());

-- RLS Policies for petition_reports
CREATE POLICY "Users can create reports" ON petition_reports
  FOR INSERT WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Users can view their own reports" ON petition_reports
  FOR SELECT USING (reported_by = auth.uid());

CREATE POLICY "Admins can manage all reports" ON petition_reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE petition_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE petition_workflow_states;
ALTER PUBLICATION supabase_realtime ADD TABLE petition_moderation_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE petition_reports;