-- Drop existing function first
DROP FUNCTION IF EXISTS add_profile_activity(uuid,text,text,text,jsonb,boolean);

-- Create profile_activities table
CREATE TABLE IF NOT EXISTS public.profile_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_title TEXT NOT NULL,
  activity_description TEXT,
  activity_data JSONB DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_profile_activities_profile_id ON public.profile_activities(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_activities_created_at ON public.profile_activities(created_at DESC);

-- Enable RLS
ALTER TABLE public.profile_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own activities" ON public.profile_activities;
DROP POLICY IF EXISTS "Public activities are viewable by all" ON public.profile_activities;
DROP POLICY IF EXISTS "Users can insert their own activities" ON public.profile_activities;

-- RLS policies
CREATE POLICY "Users can view their own activities"
ON public.profile_activities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = profile_activities.profile_id 
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Public activities are viewable by all"
ON public.profile_activities
FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can insert their own activities"
ON public.profile_activities
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = profile_activities.profile_id 
    AND profiles.user_id = auth.uid()
  )
);