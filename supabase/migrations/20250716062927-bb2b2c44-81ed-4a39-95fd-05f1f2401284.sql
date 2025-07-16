-- Add privacy controls to polls table
ALTER TABLE public.polls ADD COLUMN privacy_mode text NOT NULL DEFAULT 'public' CHECK (privacy_mode IN ('public', 'private', 'anonymous'));
ALTER TABLE public.polls ADD COLUMN show_results_after_expiry boolean NOT NULL DEFAULT true;
ALTER TABLE public.polls ADD COLUMN auto_delete_at timestamp with time zone;

-- Create index for privacy mode filtering
CREATE INDEX idx_polls_privacy_mode ON public.polls (privacy_mode);

-- Create index for auto deletion scheduling
CREATE INDEX idx_polls_auto_delete ON public.polls (auto_delete_at) WHERE auto_delete_at IS NOT NULL;

-- Update RLS policies to respect privacy settings
DROP POLICY IF EXISTS "Polls are viewable by everyone" ON public.polls;

-- Public polls are viewable by everyone
CREATE POLICY "Public polls are viewable by everyone" 
ON public.polls 
FOR SELECT 
USING (privacy_mode = 'public');

-- Private polls are only viewable by creator and voters
CREATE POLICY "Private polls are viewable by creator and participants" 
ON public.polls 
FOR SELECT 
USING (
  privacy_mode = 'private' AND (
    creator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.poll_votes 
      WHERE poll_id = polls.id AND user_id = auth.uid()
    )
  )
);

-- Anonymous polls are viewable by everyone but creator info is hidden in app logic
CREATE POLICY "Anonymous polls are viewable by everyone" 
ON public.polls 
FOR SELECT 
USING (privacy_mode = 'anonymous');

-- Add auto-delete function
CREATE OR REPLACE FUNCTION public.cleanup_expired_polls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete polls that have requested auto-deletion and time has passed
  DELETE FROM public.polls 
  WHERE auto_delete_at IS NOT NULL 
    AND auto_delete_at <= now();
END;
$$;