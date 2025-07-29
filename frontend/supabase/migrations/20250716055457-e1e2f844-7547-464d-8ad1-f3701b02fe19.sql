-- Create poll suggestions table for CamerPulse Intelligence
CREATE TABLE IF NOT EXISTS public.poll_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL CHECK (array_length(options, 1) >= 2),
  suggested_by TEXT DEFAULT 'camerpulse_ai',
  source_event TEXT,
  trending_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  confidence_score NUMERIC(3,2) DEFAULT 0.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'published')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  published_poll_id UUID REFERENCES public.polls(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.poll_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for poll suggestions
CREATE POLICY "Admins can manage all poll suggestions" ON public.poll_suggestions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert suggestions" ON public.poll_suggestions
  FOR INSERT WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_poll_suggestions_status ON public.poll_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_poll_suggestions_priority ON public.poll_suggestions(priority_level);
CREATE INDEX IF NOT EXISTS idx_poll_suggestions_created_at ON public.poll_suggestions(created_at);
CREATE INDEX IF NOT EXISTS idx_poll_suggestions_trending_topics ON public.poll_suggestions USING GIN(trending_topics);

-- Create function to approve and publish poll suggestion
CREATE OR REPLACE FUNCTION public.approve_and_publish_poll_suggestion(
  p_suggestion_id UUID,
  p_admin_id UUID,
  p_publish_immediately BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  suggestion_record RECORD;
  new_poll_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = p_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Get suggestion details
  SELECT * INTO suggestion_record 
  FROM public.poll_suggestions 
  WHERE id = p_suggestion_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Poll suggestion not found or already processed';
  END IF;
  
  -- Create the poll
  INSERT INTO public.polls (
    title,
    description, 
    options,
    creator_id,
    tags,
    poll_type,
    visibility
  ) VALUES (
    suggestion_record.title,
    suggestion_record.description,
    suggestion_record.options,
    p_admin_id::text,
    suggestion_record.trending_topics,
    'basic',
    'public'
  ) RETURNING id INTO new_poll_id;
  
  -- Update suggestion status
  UPDATE public.poll_suggestions
  SET 
    status = CASE WHEN p_publish_immediately THEN 'published' ELSE 'approved' END,
    reviewed_by = p_admin_id,
    reviewed_at = now(),
    published_at = CASE WHEN p_publish_immediately THEN now() ELSE NULL END,
    published_poll_id = new_poll_id,
    updated_at = now()
  WHERE id = p_suggestion_id;
  
  RETURN new_poll_id;
END;
$$;

-- Create function to reject poll suggestion
CREATE OR REPLACE FUNCTION public.reject_poll_suggestion(
  p_suggestion_id UUID,
  p_admin_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = p_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Update suggestion status
  UPDATE public.poll_suggestions
  SET 
    status = 'rejected',
    reviewed_by = p_admin_id,
    reviewed_at = now(),
    metadata = metadata || jsonb_build_object('rejection_reason', p_reason),
    updated_at = now()
  WHERE id = p_suggestion_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$;