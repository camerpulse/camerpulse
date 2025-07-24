-- Create profile_activities table
CREATE TABLE public.profile_activities (
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
CREATE INDEX idx_profile_activities_profile_id ON public.profile_activities(profile_id);
CREATE INDEX idx_profile_activities_created_at ON public.profile_activities(created_at DESC);

-- Enable RLS
ALTER TABLE public.profile_activities ENABLE ROW LEVEL SECURITY;

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

-- Function to add profile activity
CREATE OR REPLACE FUNCTION add_profile_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_activity_title TEXT,
  p_activity_description TEXT DEFAULT NULL,
  p_activity_data JSONB DEFAULT '{}',
  p_is_public BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id UUID;
  v_activity_id UUID;
BEGIN
  -- Get profile ID
  SELECT id INTO v_profile_id 
  FROM profiles 
  WHERE user_id = p_user_id;
  
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found for user %', p_user_id;
  END IF;
  
  -- Insert activity
  INSERT INTO profile_activities (
    profile_id, activity_type, activity_title, 
    activity_description, activity_data, is_public
  ) VALUES (
    v_profile_id, p_activity_type, p_activity_title,
    p_activity_description, p_activity_data, p_is_public
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;