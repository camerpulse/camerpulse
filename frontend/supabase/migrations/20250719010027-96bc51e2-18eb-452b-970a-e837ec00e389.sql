-- Create storage bucket for moderator documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'moderator-documents', 
  'moderator-documents', 
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
);

-- Storage policies for moderator documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'moderator-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'moderator-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all moderator documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'moderator-documents'
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Appeals system tables
CREATE TABLE public.moderation_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.moderation_queue(id) ON DELETE CASCADE,
  appellant_id UUID NOT NULL,
  appeal_reason TEXT NOT NULL,
  appeal_details TEXT,
  appeal_status TEXT NOT NULL DEFAULT 'pending' CHECK (appeal_status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.civic_moderators(id),
  review_notes TEXT,
  evidence_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Real-time notifications for moderators
CREATE TABLE public.moderator_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id UUID NOT NULL REFERENCES public.civic_moderators(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('new_assignment', 'appeal_filed', 'badge_awarded', 'status_change', 'system_alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Moderator guidelines system
CREATE TABLE public.moderator_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  required_reading BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Training progress tracking
CREATE TABLE public.moderator_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id UUID NOT NULL REFERENCES public.civic_moderators(id) ON DELETE CASCADE,
  guideline_id UUID NOT NULL REFERENCES public.moderator_guidelines(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  quiz_score INTEGER,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(moderator_id, guideline_id)
);

-- Analytics and reporting
CREATE TABLE public.moderation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id UUID REFERENCES public.civic_moderators(id),
  metric_type TEXT NOT NULL CHECK (metric_type IN ('decisions_made', 'appeals_won', 'appeals_lost', 'response_time', 'accuracy_score')),
  metric_value NUMERIC NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable realtime for key tables
ALTER TABLE public.moderator_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.moderation_queue REPLICA IDENTITY FULL;
ALTER TABLE public.moderation_appeals REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.moderator_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.moderation_queue;  
ALTER PUBLICATION supabase_realtime ADD TABLE public.moderation_appeals;