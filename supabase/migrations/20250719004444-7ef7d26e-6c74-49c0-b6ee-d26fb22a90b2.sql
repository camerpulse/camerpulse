-- Create the moderator system tables
-- Moderator applications table
CREATE TABLE IF NOT EXISTS public.moderator_applications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    village_of_origin TEXT NOT NULL,
    region_of_residence TEXT NOT NULL,
    id_document_url TEXT,
    civic_experience TEXT,
    preferred_coverage_area TEXT NOT NULL,
    preferred_role public.app_role NOT NULL,
    civic_oath_accepted BOOLEAN NOT NULL DEFAULT false,
    application_status public.application_status NOT NULL DEFAULT 'submitted',
    admin_notes TEXT,
    interview_scheduled_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Civic moderators table (approved moderators)
CREATE TABLE IF NOT EXISTS public.civic_moderators (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES public.moderator_applications(id),
    moderator_role public.app_role NOT NULL,
    status public.moderator_status NOT NULL DEFAULT 'approved',
    coverage_regions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    assigned_villages UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    total_edits INTEGER NOT NULL DEFAULT 0,
    total_approvals INTEGER NOT NULL DEFAULT 0,
    total_rejections INTEGER NOT NULL DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE,
    suspended_until TIMESTAMP WITH TIME ZONE,
    suspension_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Moderator badges table
CREATE TABLE IF NOT EXISTS public.moderator_badges (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    moderator_id UUID NOT NULL REFERENCES public.civic_moderators(id) ON DELETE CASCADE,
    badge_type public.badge_type NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    description TEXT,
    evidence_data JSONB DEFAULT '{}'::jsonb,
    UNIQUE(moderator_id, badge_type)
);

-- Moderation queue table
CREATE TABLE IF NOT EXISTS public.moderation_queue (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    submitted_by UUID NOT NULL REFERENCES auth.users(id),
    assigned_to UUID REFERENCES public.civic_moderators(id),
    submission_type TEXT NOT NULL, -- 'village_request', 'petition', 'billionaire_suggestion', 'conflict_update', 'infrastructure_report'
    submission_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status public.submission_status NOT NULL DEFAULT 'pending',
    priority_level INTEGER NOT NULL DEFAULT 3, -- 1=high, 5=low
    region TEXT,
    village_id UUID,
    proof_documents TEXT[] DEFAULT ARRAY[]::TEXT[],
    moderator_notes TEXT,
    decision_reason TEXT,
    reviewed_by UUID REFERENCES public.civic_moderators(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Moderator activity log table
CREATE TABLE IF NOT EXISTS public.moderator_activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    moderator_id UUID NOT NULL REFERENCES public.civic_moderators(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'edit_village', 'approve_submission', 'reject_submission', 'resolve_conflict', 'add_project'
    target_type TEXT NOT NULL, -- 'village', 'petition', 'project', 'conflict', 'billionaire'
    target_id UUID,
    description TEXT NOT NULL,
    changes_made JSONB DEFAULT '{}'::jsonb,
    proof_documents TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_moderator_applications_user_id ON public.moderator_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_moderator_applications_status ON public.moderator_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_civic_moderators_user_id ON public.civic_moderators(user_id);
CREATE INDEX IF NOT EXISTS idx_civic_moderators_role ON public.civic_moderators(moderator_role);
CREATE INDEX IF NOT EXISTS idx_civic_moderators_regions ON public.civic_moderators USING GIN(coverage_regions);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON public.moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_assigned_to ON public.moderation_queue(assigned_to);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_region ON public.moderation_queue(region);
CREATE INDEX IF NOT EXISTS idx_moderator_activities_moderator_id ON public.moderator_activities(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderator_activities_type ON public.moderator_activities(activity_type);