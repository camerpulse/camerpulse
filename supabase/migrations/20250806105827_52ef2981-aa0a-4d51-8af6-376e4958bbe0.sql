-- Collaborative Civic Data Management System
-- Create comprehensive schema for user-generated civic content with moderation

-- Entity types enum for standardized entity classification
CREATE TYPE public.civic_entity_type AS ENUM (
  'politician',
  'mp', 
  'senator',
  'chief_fon',
  'political_party',
  'ministry',
  'local_council',
  'company',
  'school',
  'hospital',
  'pharmacy',
  'village',
  'institution'
);

-- Suggestion status enum
CREATE TYPE public.suggestion_status AS ENUM (
  'pending',
  'under_review',
  'approved',
  'rejected',
  'needs_revision'
);

-- Suggestion type enum
CREATE TYPE public.suggestion_type AS ENUM (
  'new_entity',
  'edit_existing',
  'data_correction',
  'additional_info'
);

-- Priority levels for admin processing
CREATE TYPE public.suggestion_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Main suggestions table - stores all user submissions
CREATE TABLE public.civic_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type civic_entity_type NOT NULL,
  entity_id UUID NULL, -- For edit suggestions, references existing entity
  suggestion_type suggestion_type NOT NULL,
  status suggestion_status NOT NULL DEFAULT 'pending',
  priority suggestion_priority NOT NULL DEFAULT 'medium',
  
  -- Core submission data
  title TEXT NOT NULL,
  description TEXT,
  suggested_data JSONB NOT NULL DEFAULT '{}', -- Flexible storage for entity-specific data
  evidence_urls TEXT[], -- Supporting documents/links
  change_summary TEXT, -- For edit suggestions, summary of changes
  
  -- Moderation data
  assigned_moderator_id UUID REFERENCES auth.users(id),
  moderator_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  
  -- Tracking
  submission_ip INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Metadata
  source_type TEXT DEFAULT 'user_submission',
  confidence_score NUMERIC(3,2) DEFAULT 0.5,
  verification_required BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_entity_reference CHECK (
    (suggestion_type = 'new_entity' AND entity_id IS NULL) OR
    (suggestion_type != 'new_entity' AND entity_id IS NOT NULL)
  )
);

-- Entity reviews and ratings table
CREATE TABLE public.civic_entity_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type civic_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Rating categories (1-5 scale)
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  transparency_rating INTEGER CHECK (transparency_rating >= 1 AND transparency_rating <= 5),
  responsiveness_rating INTEGER CHECK (responsiveness_rating >= 1 AND responsiveness_rating <= 5),
  service_quality_rating INTEGER CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
  accessibility_rating INTEGER CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
  
  -- Review content
  review_title TEXT,
  review_content TEXT,
  helpful_count INTEGER DEFAULT 0,
  
  -- Moderation
  is_flagged BOOLEAN DEFAULT false,
  flagged_reason TEXT,
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate reviews from same user for same entity
  UNIQUE(user_id, entity_type, entity_id)
);

-- Suggestion comments and feedback table
CREATE TABLE public.suggestion_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES public.civic_suggestions(id) ON DELETE CASCADE,
  commenter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  is_moderator_comment BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false, -- Whether visible to submitter
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User contribution tracking and reputation
CREATE TABLE public.user_civic_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Contribution stats
  total_suggestions INTEGER DEFAULT 0,
  approved_suggestions INTEGER DEFAULT 0,
  rejected_suggestions INTEGER DEFAULT 0,
  pending_suggestions INTEGER DEFAULT 0,
  
  -- Reputation metrics
  reputation_score INTEGER DEFAULT 0,
  accuracy_rate NUMERIC(5,2) DEFAULT 0.00,
  contribution_level TEXT DEFAULT 'bronze', -- bronze, silver, gold, platinum
  
  -- Badges and achievements
  badges JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '{}',
  
  -- Rate limiting
  last_suggestion_at TIMESTAMP WITH TIME ZONE,
  suggestions_today INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Moderation assignment and workflow tracking
CREATE TABLE public.moderation_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES public.civic_suggestions(id) ON DELETE CASCADE,
  moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'assigned',
  priority suggestion_priority NOT NULL DEFAULT 'medium',
  
  -- Workflow tracking
  started_review_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_effort_hours NUMERIC(4,2),
  actual_effort_hours NUMERIC(4,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(suggestion_id) -- One assignment per suggestion
);

-- Abuse reports for reviews and suggestions
CREATE TABLE public.civic_content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_content_type TEXT NOT NULL, -- 'suggestion', 'review', 'comment'
  reported_content_id UUID NOT NULL,
  report_reason TEXT NOT NULL,
  report_details TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Suggestion activity log for audit trail
CREATE TABLE public.suggestion_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES public.civic_suggestions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL, -- 'created', 'updated', 'reviewed', 'approved', 'rejected'
  action_details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_civic_suggestions_status ON public.civic_suggestions(status);
CREATE INDEX idx_civic_suggestions_entity_type ON public.civic_suggestions(entity_type);
CREATE INDEX idx_civic_suggestions_submitter ON public.civic_suggestions(submitter_id);
CREATE INDEX idx_civic_suggestions_created ON public.civic_suggestions(created_at DESC);
CREATE INDEX idx_civic_suggestions_priority ON public.civic_suggestions(priority);

CREATE INDEX idx_civic_reviews_entity ON public.civic_entity_reviews(entity_type, entity_id);
CREATE INDEX idx_civic_reviews_user ON public.civic_entity_reviews(user_id);
CREATE INDEX idx_civic_reviews_rating ON public.civic_entity_reviews(overall_rating);

CREATE INDEX idx_moderation_assignments_moderator ON public.moderation_assignments(moderator_id);
CREATE INDEX idx_moderation_assignments_status ON public.moderation_assignments(status);
CREATE INDEX idx_moderation_assignments_priority ON public.moderation_assignments(priority);

-- RLS Policies
ALTER TABLE public.civic_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_entity_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestion_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_civic_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestion_activity_log ENABLE ROW LEVEL SECURITY;

-- Suggestions policies
CREATE POLICY "Users can view their own suggestions" ON public.civic_suggestions
  FOR SELECT USING (submitter_id = auth.uid());

CREATE POLICY "Users can create suggestions" ON public.civic_suggestions
  FOR INSERT WITH CHECK (submitter_id = auth.uid());

CREATE POLICY "Users can update their pending suggestions" ON public.civic_suggestions
  FOR UPDATE USING (submitter_id = auth.uid() AND status = 'pending');

CREATE POLICY "Moderators can view all suggestions" ON public.civic_suggestions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Approved suggestions are publicly viewable" ON public.civic_suggestions
  FOR SELECT USING (status = 'approved');

-- Reviews policies
CREATE POLICY "Users can manage their own reviews" ON public.civic_entity_reviews
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Reviews are publicly viewable" ON public.civic_entity_reviews
  FOR SELECT USING (NOT is_flagged);

CREATE POLICY "Moderators can manage all reviews" ON public.civic_entity_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Comments policies
CREATE POLICY "Users can view comments on their suggestions" ON public.suggestion_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.civic_suggestions cs 
      WHERE cs.id = suggestion_id 
      AND cs.submitter_id = auth.uid()
    ) OR
    commenter_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Moderators can create comments" ON public.suggestion_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Reputation policies
CREATE POLICY "Users can view their own reputation" ON public.user_civic_reputation
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Public reputation stats are viewable" ON public.user_civic_reputation
  FOR SELECT USING (true);

CREATE POLICY "System can manage reputation" ON public.user_civic_reputation
  FOR ALL USING (true);

-- Moderation assignment policies
CREATE POLICY "Moderators can view their assignments" ON public.moderation_assignments
  FOR SELECT USING (
    moderator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage assignments" ON public.moderation_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Reports policies
CREATE POLICY "Users can create reports" ON public.civic_content_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view their own reports" ON public.civic_content_reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Moderators can manage all reports" ON public.civic_content_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Activity log policies
CREATE POLICY "Activity log is viewable by suggestion owners and moderators" ON public.suggestion_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.civic_suggestions cs 
      WHERE cs.id = suggestion_id 
      AND cs.submitter_id = auth.uid()
    ) OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "System can create activity log entries" ON public.suggestion_activity_log
  FOR INSERT WITH CHECK (true);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_civic_suggestions_updated_at
  BEFORE UPDATE ON public.civic_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_civic_entity_reviews_updated_at
  BEFORE UPDATE ON public.civic_entity_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suggestion_comments_updated_at
  BEFORE UPDATE ON public.suggestion_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_civic_reputation_updated_at
  BEFORE UPDATE ON public.user_civic_reputation
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create user reputation entry
CREATE OR REPLACE FUNCTION public.create_default_civic_reputation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_civic_reputation (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_civic_reputation_on_user_creation
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_civic_reputation();

-- Function to update reputation stats when suggestions are approved/rejected
CREATE OR REPLACE FUNCTION public.update_user_reputation_on_suggestion_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Update the user's reputation stats
    UPDATE public.user_civic_reputation 
    SET 
      total_suggestions = (
        SELECT COUNT(*) FROM public.civic_suggestions 
        WHERE submitter_id = NEW.submitter_id
      ),
      approved_suggestions = (
        SELECT COUNT(*) FROM public.civic_suggestions 
        WHERE submitter_id = NEW.submitter_id AND status = 'approved'
      ),
      rejected_suggestions = (
        SELECT COUNT(*) FROM public.civic_suggestions 
        WHERE submitter_id = NEW.submitter_id AND status = 'rejected'
      ),
      pending_suggestions = (
        SELECT COUNT(*) FROM public.civic_suggestions 
        WHERE submitter_id = NEW.submitter_id AND status IN ('pending', 'under_review')
      ),
      updated_at = now()
    WHERE user_id = NEW.submitter_id;
    
    -- Calculate accuracy rate
    UPDATE public.user_civic_reputation 
    SET accuracy_rate = CASE 
      WHEN total_suggestions > 0 THEN 
        ROUND((approved_suggestions::NUMERIC / total_suggestions::NUMERIC) * 100, 2)
      ELSE 0 
    END
    WHERE user_id = NEW.submitter_id;
    
    -- Log the activity
    INSERT INTO public.suggestion_activity_log (
      suggestion_id, user_id, action_type, action_details
    ) VALUES (
      NEW.id, 
      NEW.reviewed_by, 
      'status_changed',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'moderator_notes', NEW.moderator_notes
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_reputation_on_suggestion_change
  AFTER UPDATE ON public.civic_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_reputation_on_suggestion_status_change();