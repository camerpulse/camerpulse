-- Extend existing app_role enum to include moderator roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'village_moderator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'subdivision_moderator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'regional_moderator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'national_civic_lead';

-- Create civic moderator status enum
CREATE TYPE public.moderator_status AS ENUM ('pending', 'approved', 'rejected', 'suspended', 'inactive');

-- Create moderator application status enum
CREATE TYPE public.application_status AS ENUM ('submitted', 'under_review', 'interview_scheduled', 'approved', 'rejected');

-- Create submission status enum
CREATE TYPE public.submission_status AS ENUM ('pending', 'approved', 'rejected', 'needs_clarification');

-- Create badge type enum
CREATE TYPE public.badge_type AS ENUM ('civic_historian', 'village_builder', 'conflict_resolver', 'regional_pioneer', 'diaspora_link', 'voice_of_people', 'civic_hero');

-- Moderator applications table
CREATE TABLE public.moderator_applications (
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
CREATE TABLE public.civic_moderators (
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
CREATE TABLE public.moderator_badges (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    moderator_id UUID NOT NULL REFERENCES public.civic_moderators(id) ON DELETE CASCADE,
    badge_type public.badge_type NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    description TEXT,
    evidence_data JSONB DEFAULT '{}'::jsonb,
    UNIQUE(moderator_id, badge_type)
);

-- Moderation queue table
CREATE TABLE public.moderation_queue (
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
CREATE TABLE public.moderator_activities (
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

-- Moderator collaboration chats table
CREATE TABLE public.moderator_chats (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    region TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES public.civic_moderators(id),
    participants UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    chat_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Moderator chat messages table
CREATE TABLE public.moderator_chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID NOT NULL REFERENCES public.moderator_chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.civic_moderators(id),
    message_text TEXT NOT NULL,
    attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
    message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'document', 'media'
    replied_to UUID REFERENCES public.moderator_chat_messages(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_moderator_applications_user_id ON public.moderator_applications(user_id);
CREATE INDEX idx_moderator_applications_status ON public.moderator_applications(application_status);
CREATE INDEX idx_civic_moderators_user_id ON public.civic_moderators(user_id);
CREATE INDEX idx_civic_moderators_role ON public.civic_moderators(moderator_role);
CREATE INDEX idx_civic_moderators_regions ON public.civic_moderators USING GIN(coverage_regions);
CREATE INDEX idx_moderation_queue_status ON public.moderation_queue(status);
CREATE INDEX idx_moderation_queue_assigned_to ON public.moderation_queue(assigned_to);
CREATE INDEX idx_moderation_queue_region ON public.moderation_queue(region);
CREATE INDEX idx_moderator_activities_moderator_id ON public.moderator_activities(moderator_id);
CREATE INDEX idx_moderator_activities_type ON public.moderator_activities(activity_type);

-- Enable RLS on all tables
ALTER TABLE public.moderator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for moderator_applications
CREATE POLICY "Users can create their own applications" 
ON public.moderator_applications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own applications" 
ON public.moderator_applications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their pending applications" 
ON public.moderator_applications FOR UPDATE 
USING (auth.uid() = user_id AND application_status = 'submitted');

CREATE POLICY "Admins can manage all applications" 
ON public.moderator_applications FOR ALL 
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for civic_moderators
CREATE POLICY "Moderators can view their own profile" 
ON public.civic_moderators FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view active moderators" 
ON public.civic_moderators FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Admins can manage all moderators" 
ON public.civic_moderators FOR ALL 
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for moderator_badges
CREATE POLICY "Public can view badges" 
ON public.moderator_badges FOR SELECT 
USING (true);

CREATE POLICY "System can award badges" 
ON public.moderator_badges FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage badges" 
ON public.moderator_badges FOR ALL 
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for moderation_queue
CREATE POLICY "Users can create submissions" 
ON public.moderation_queue FOR INSERT 
WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Submitters can view their submissions" 
ON public.moderation_queue FOR SELECT 
USING (auth.uid() = submitted_by);

CREATE POLICY "Moderators can view assigned queue" 
ON public.moderation_queue FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.civic_moderators 
    WHERE user_id = auth.uid() AND id = assigned_to
));

CREATE POLICY "Moderators can update assigned submissions" 
ON public.moderation_queue FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.civic_moderators 
    WHERE user_id = auth.uid() AND id = assigned_to
));

CREATE POLICY "Admins can manage all queue items" 
ON public.moderation_queue FOR ALL 
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for moderator_activities
CREATE POLICY "Moderators can view their activities" 
ON public.moderator_activities FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.civic_moderators 
    WHERE user_id = auth.uid() AND id = moderator_id
));

CREATE POLICY "System can log activities" 
ON public.moderator_activities FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all activities" 
ON public.moderator_activities FOR ALL 
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for moderator_chats
CREATE POLICY "Moderators can view their chats" 
ON public.moderator_chats FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.civic_moderators 
    WHERE user_id = auth.uid() AND id = ANY(participants)
));

CREATE POLICY "Moderators can create chats" 
ON public.moderator_chats FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.civic_moderators 
    WHERE user_id = auth.uid() AND id = created_by
));

-- RLS Policies for moderator_chat_messages
CREATE POLICY "Chat participants can view messages" 
ON public.moderator_chat_messages FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.moderator_chats mc
    JOIN public.civic_moderators cm ON cm.id = ANY(mc.participants)
    WHERE mc.id = chat_id AND cm.user_id = auth.uid()
));

CREATE POLICY "Chat participants can send messages" 
ON public.moderator_chat_messages FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.moderator_chats mc
    JOIN public.civic_moderators cm ON cm.id = ANY(mc.participants)
    WHERE mc.id = chat_id AND cm.user_id = auth.uid() AND cm.id = sender_id
));

-- Create trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_moderator_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_moderator_applications_updated_at
    BEFORE UPDATE ON public.moderator_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_moderator_updated_at();

CREATE TRIGGER update_civic_moderators_updated_at
    BEFORE UPDATE ON public.civic_moderators
    FOR EACH ROW
    EXECUTE FUNCTION public.update_moderator_updated_at();

CREATE TRIGGER update_moderation_queue_updated_at
    BEFORE UPDATE ON public.moderation_queue
    FOR EACH ROW
    EXECUTE FUNCTION public.update_moderator_updated_at();

CREATE TRIGGER update_moderator_chats_updated_at
    BEFORE UPDATE ON public.moderator_chats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_moderator_updated_at();

-- Create helper functions
CREATE OR REPLACE FUNCTION public.award_moderator_badge(
    p_moderator_id UUID,
    p_badge_type badge_type,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    badge_id UUID;
BEGIN
    INSERT INTO public.moderator_badges (
        moderator_id, badge_type, description
    ) VALUES (
        p_moderator_id, p_badge_type, p_description
    ) 
    ON CONFLICT (moderator_id, badge_type) DO NOTHING
    RETURNING id INTO badge_id;
    
    RETURN badge_id;
END;
$$;

-- Function to get moderator statistics
CREATE OR REPLACE FUNCTION public.get_moderator_stats(p_moderator_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB := '{}';
    badge_count INTEGER;
    activity_count INTEGER;
    pending_queue INTEGER;
BEGIN
    -- Get badge count
    SELECT COUNT(*) INTO badge_count
    FROM public.moderator_badges
    WHERE moderator_id = p_moderator_id;
    
    -- Get activity count (last 30 days)
    SELECT COUNT(*) INTO activity_count
    FROM public.moderator_activities
    WHERE moderator_id = p_moderator_id
    AND created_at >= now() - INTERVAL '30 days';
    
    -- Get pending queue count
    SELECT COUNT(*) INTO pending_queue
    FROM public.moderation_queue mq
    JOIN public.civic_moderators cm ON cm.id = mq.assigned_to
    WHERE cm.id = p_moderator_id
    AND mq.status = 'pending';
    
    result := jsonb_build_object(
        'badge_count', badge_count,
        'activity_count', activity_count,
        'pending_queue', pending_queue,
        'last_updated', now()
    );
    
    RETURN result;
END;
$$;