-- Create only the suggestion system tables (since civic_entity_type already exists)
-- Skip the enum creation and proceed with the main tables

-- Check if suggestion_status enum exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'suggestion_status') THEN
        CREATE TYPE public.suggestion_status AS ENUM (
            'pending',
            'under_review', 
            'approved',
            'rejected',
            'needs_revision'
        );
    END IF;
END $$;

-- Check if suggestion_type enum exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'suggestion_type') THEN
        CREATE TYPE public.suggestion_type AS ENUM (
            'new_entity',
            'edit_existing',
            'data_correction',
            'additional_info'
        );
    END IF;
END $$;

-- Check if suggestion_priority enum exists, if not create it  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'suggestion_priority') THEN
        CREATE TYPE public.suggestion_priority AS ENUM (
            'low',
            'medium',
            'high',
            'urgent'
        );
    END IF;
END $$;

-- Main suggestions table - stores all user submissions
CREATE TABLE IF NOT EXISTS public.civic_suggestions (
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
CREATE TABLE IF NOT EXISTS public.civic_entity_reviews (
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
CREATE TABLE IF NOT EXISTS public.suggestion_comments (
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
CREATE TABLE IF NOT EXISTS public.user_civic_reputation (
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
CREATE TABLE IF NOT EXISTS public.moderation_assignments (
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
CREATE TABLE IF NOT EXISTS public.civic_content_reports (
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
CREATE TABLE IF NOT EXISTS public.suggestion_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES public.civic_suggestions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL, -- 'created', 'updated', 'reviewed', 'approved', 'rejected'
  action_details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_civic_suggestions_status ON public.civic_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_civic_suggestions_entity_type ON public.civic_suggestions(entity_type);
CREATE INDEX IF NOT EXISTS idx_civic_suggestions_submitter ON public.civic_suggestions(submitter_id);
CREATE INDEX IF NOT EXISTS idx_civic_suggestions_created ON public.civic_suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_civic_suggestions_priority ON public.civic_suggestions(priority);

CREATE INDEX IF NOT EXISTS idx_civic_reviews_entity ON public.civic_entity_reviews(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_civic_reviews_user ON public.civic_entity_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_civic_reviews_rating ON public.civic_entity_reviews(overall_rating);

CREATE INDEX IF NOT EXISTS idx_moderation_assignments_moderator ON public.moderation_assignments(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_assignments_status ON public.moderation_assignments(status);
CREATE INDEX IF NOT EXISTS idx_moderation_assignments_priority ON public.moderation_assignments(priority);

-- Enable RLS
ALTER TABLE public.civic_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_entity_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestion_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_civic_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestion_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for civic_suggestions
DROP POLICY IF EXISTS "Users can view their own suggestions" ON public.civic_suggestions;
CREATE POLICY "Users can view their own suggestions" ON public.civic_suggestions
  FOR SELECT USING (submitter_id = auth.uid());

DROP POLICY IF EXISTS "Users can create suggestions" ON public.civic_suggestions;
CREATE POLICY "Users can create suggestions" ON public.civic_suggestions
  FOR INSERT WITH CHECK (submitter_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their pending suggestions" ON public.civic_suggestions;
CREATE POLICY "Users can update their pending suggestions" ON public.civic_suggestions
  FOR UPDATE USING (submitter_id = auth.uid() AND status = 'pending');

DROP POLICY IF EXISTS "Moderators can view all suggestions" ON public.civic_suggestions;
CREATE POLICY "Moderators can view all suggestions" ON public.civic_suggestions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

DROP POLICY IF EXISTS "Approved suggestions are publicly viewable" ON public.civic_suggestions;
CREATE POLICY "Approved suggestions are publicly viewable" ON public.civic_suggestions
  FOR SELECT USING (status = 'approved');

-- RLS Policies for civic_entity_reviews
DROP POLICY IF EXISTS "Users can manage their own reviews" ON public.civic_entity_reviews;
CREATE POLICY "Users can manage their own reviews" ON public.civic_entity_reviews
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Reviews are publicly viewable" ON public.civic_entity_reviews;
CREATE POLICY "Reviews are publicly viewable" ON public.civic_entity_reviews
  FOR SELECT USING (NOT is_flagged);

DROP POLICY IF EXISTS "Moderators can manage all reviews" ON public.civic_entity_reviews;
CREATE POLICY "Moderators can manage all reviews" ON public.civic_entity_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Other RLS policies
DROP POLICY IF EXISTS "Users can view comments on their suggestions" ON public.suggestion_comments;
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

DROP POLICY IF EXISTS "Moderators can create comments" ON public.suggestion_comments;
CREATE POLICY "Moderators can create comments" ON public.suggestion_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Reputation policies
DROP POLICY IF EXISTS "Users can view their own reputation" ON public.user_civic_reputation;
CREATE POLICY "Users can view their own reputation" ON public.user_civic_reputation
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Public reputation stats are viewable" ON public.user_civic_reputation;
CREATE POLICY "Public reputation stats are viewable" ON public.user_civic_reputation
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can manage reputation" ON public.user_civic_reputation;
CREATE POLICY "System can manage reputation" ON public.user_civic_reputation
  FOR ALL USING (true);

-- Create database functions for the civic suggestion system
CREATE OR REPLACE FUNCTION public.update_civic_suggestion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
DROP TRIGGER IF EXISTS update_civic_suggestions_updated_at ON public.civic_suggestions;
CREATE TRIGGER update_civic_suggestions_updated_at
  BEFORE UPDATE ON public.civic_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_civic_suggestion_updated_at();

DROP TRIGGER IF EXISTS update_civic_entity_reviews_updated_at ON public.civic_entity_reviews;
CREATE TRIGGER update_civic_entity_reviews_updated_at
  BEFORE UPDATE ON public.civic_entity_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update reputation when suggestion status changes
CREATE OR REPLACE FUNCTION public.update_civic_reputation_on_status_change()
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

DROP TRIGGER IF EXISTS update_reputation_on_suggestion_change ON public.civic_suggestions;
CREATE TRIGGER update_reputation_on_suggestion_change
  AFTER UPDATE ON public.civic_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_civic_reputation_on_status_change();