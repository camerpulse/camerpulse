-- Create moderator roles enum (if not exists)
DO $$ BEGIN
    CREATE TYPE moderator_role AS ENUM ('admin', 'senior_moderator', 'regional_moderator', 'village_moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create institution type enum for moderation (if not exists)
DO $$ BEGIN
    CREATE TYPE institution_type AS ENUM ('school', 'hospital', 'pharmacy', 'village');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create moderator assignments table
CREATE TABLE IF NOT EXISTS public.moderator_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role moderator_role NOT NULL,
  regions TEXT[] DEFAULT ARRAY[]::TEXT[],
  institution_types institution_type[] DEFAULT ARRAY[]::institution_type[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create institution submissions table
CREATE TABLE IF NOT EXISTS public.institution_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_type institution_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location JSONB,
  contact_info JSONB,
  submitted_by UUID,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  verification_checklist JSONB DEFAULT '{"official_document": false, "community_validation": false, "field_visit_verified": false, "license_registration": false}'::JSONB,
  moderator_notes TEXT,
  assigned_moderator UUID,
  flagged_reasons TEXT[],
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create moderation actions table
CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moderator_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT,
  details JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create claim requests table
CREATE TABLE IF NOT EXISTS public.claim_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  institution_type institution_type NOT NULL,
  claimant_user_id UUID NOT NULL,
  evidence_documents TEXT[],
  claim_reason TEXT,
  status verification_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create moderation notifications table
CREATE TABLE IF NOT EXISTS public.moderation_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moderator_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  related_type TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.moderator_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for moderator assignments
CREATE POLICY "Admins can manage all moderator assignments" 
ON public.moderator_assignments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Moderators can view their own assignments" 
ON public.moderator_assignments 
FOR SELECT 
USING (user_id = auth.uid());

-- Basic policies for institution submissions
CREATE POLICY "Users can create submissions" 
ON public.institution_submissions 
FOR INSERT 
WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Users can view their own submissions" 
ON public.institution_submissions 
FOR SELECT 
USING (submitted_by = auth.uid());

CREATE POLICY "Admins can manage all submissions" 
ON public.institution_submissions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Basic policies for moderation actions
CREATE POLICY "Moderators can create actions" 
ON public.moderation_actions 
FOR INSERT 
WITH CHECK (moderator_id = auth.uid());

CREATE POLICY "Moderators can view their actions" 
ON public.moderation_actions 
FOR SELECT 
USING (moderator_id = auth.uid());

CREATE POLICY "Admins can view all actions" 
ON public.moderation_actions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Basic policies for claim requests
CREATE POLICY "Users can create claim requests" 
ON public.claim_requests 
FOR INSERT 
WITH CHECK (claimant_user_id = auth.uid());

CREATE POLICY "Users can view their own claims" 
ON public.claim_requests 
FOR SELECT 
USING (claimant_user_id = auth.uid());

CREATE POLICY "Admins can manage all claims" 
ON public.claim_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Basic policies for moderation notifications
CREATE POLICY "Moderators can view their notifications" 
ON public.moderation_notifications 
FOR ALL 
USING (moderator_id = auth.uid());