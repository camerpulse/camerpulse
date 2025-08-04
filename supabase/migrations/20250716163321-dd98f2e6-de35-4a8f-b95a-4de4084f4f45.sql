-- Create user poll onboarding tracking table
CREATE TABLE public.user_poll_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  polls_created_count INTEGER NOT NULL DEFAULT 0,
  first_poll_created_at TIMESTAMP WITH TIME ZONE,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  onboarding_steps_completed JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RLS policies
ALTER TABLE public.user_poll_onboarding ENABLE ROW LEVEL SECURITY;

-- Users can only view and manage their own onboarding data
CREATE POLICY "Users can manage their own onboarding data"
ON public.user_poll_onboarding
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all onboarding data
CREATE POLICY "Admins can view all onboarding data"
ON public.user_poll_onboarding
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_user_poll_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_poll_onboarding_updated_at
  BEFORE UPDATE ON public.user_poll_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_poll_onboarding_updated_at();

-- Create function to track poll creation and update onboarding
CREATE OR REPLACE FUNCTION public.track_user_poll_creation(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Insert or update onboarding record
  INSERT INTO public.user_poll_onboarding (user_id, polls_created_count, first_poll_created_at)
  VALUES (p_user_id, 1, now())
  ON CONFLICT (user_id) DO UPDATE SET
    polls_created_count = user_poll_onboarding.polls_created_count + 1,
    first_poll_created_at = COALESCE(user_poll_onboarding.first_poll_created_at, now()),
    updated_at = now();
    
  -- Mark onboarding as completed after 2 polls
  UPDATE public.user_poll_onboarding 
  SET 
    onboarding_completed = true,
    onboarding_completed_at = COALESCE(onboarding_completed_at, now())
  WHERE user_id = p_user_id AND polls_created_count >= 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;