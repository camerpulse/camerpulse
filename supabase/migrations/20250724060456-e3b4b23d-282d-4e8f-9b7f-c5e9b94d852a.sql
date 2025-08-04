-- Phase 4: Advanced Real-time Messaging Features

-- Typing indicators table
CREATE TABLE IF NOT EXISTS public.conversation_typing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- User presence tracking
CREATE TABLE IF NOT EXISTS public.user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  device_info JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Message read status
CREATE TABLE IF NOT EXISTS public.message_read_status_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Message threads
CREATE TABLE IF NOT EXISTS public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  thread_title TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Thread messages
CREATE TABLE IF NOT EXISTS public.thread_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(thread_id, message_id)
);

-- File attachments
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  upload_status TEXT NOT NULL DEFAULT 'uploading' CHECK (upload_status IN ('uploading', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Message polls
CREATE TABLE IF NOT EXISTS public.message_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  allow_multiple BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Poll votes
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.message_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  option_index INTEGER NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id, option_index)
);

-- AI smart replies
CREATE TABLE IF NOT EXISTS public.smart_reply_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  context_message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  suggestions JSONB NOT NULL DEFAULT '[]',
  confidence_scores JSONB NOT NULL DEFAULT '[]',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Message translations
CREATE TABLE IF NOT EXISTS public.message_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  from_language TEXT NOT NULL,
  to_language TEXT NOT NULL,
  translated_content TEXT NOT NULL,
  confidence_score NUMERIC(3,2) DEFAULT 0.95,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, to_language)
);

-- Content moderation
CREATE TABLE IF NOT EXISTS public.message_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  moderation_type TEXT NOT NULL CHECK (moderation_type IN ('spam', 'inappropriate', 'toxic', 'safe')),
  confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  flagged_content JSONB DEFAULT '{}',
  action_taken TEXT CHECK (action_taken IN ('none', 'warned', 'hidden', 'deleted')),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Conversation analytics
CREATE TABLE IF NOT EXISTS public.conversation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_messages INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  peak_activity_hour INTEGER,
  avg_response_time_minutes NUMERIC(10,2),
  sentiment_score NUMERIC(3,2),
  metadata JSONB DEFAULT '{}',
  UNIQUE(conversation_id, date)
);

-- Custom emojis/stickers
CREATE TABLE IF NOT EXISTS public.custom_emojis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  emoji_url TEXT NOT NULL,
  created_by UUID NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.conversation_typing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_reply_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_emojis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for typing indicators
CREATE POLICY "Users can view typing in their conversations"
ON public.conversation_typing FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = conversation_typing.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own typing status"
ON public.conversation_typing FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policies for user presence
CREATE POLICY "Users can view all presence data"
ON public.user_presence FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own presence"
ON public.user_presence FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policies for enhanced read status
CREATE POLICY "Users can view read status in their conversations"
ON public.message_read_status_enhanced FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own read status"
ON public.message_read_status_enhanced FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policies for message threads
CREATE POLICY "Users can view threads in their conversations"
ON public.message_threads FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = message_threads.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create threads in their conversations"
ON public.message_threads FOR INSERT
WITH CHECK (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = message_threads.conversation_id 
    AND user_id = auth.uid()
  )
);

-- RLS Policies for thread messages
CREATE POLICY "Users can view thread messages in their conversations"
ON public.thread_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.message_threads mt
    JOIN public.conversation_participants cp ON mt.conversation_id = cp.conversation_id
    WHERE mt.id = thread_id AND cp.user_id = auth.uid()
  )
);

-- RLS Policies for attachments
CREATE POLICY "Users can view attachments in their conversations"
ON public.message_attachments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_id AND cp.user_id = auth.uid()
  )
);

-- RLS Policies for polls
CREATE POLICY "Users can view polls in their conversations"
ON public.message_polls FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create polls in their conversations"
ON public.message_polls FOR INSERT
WITH CHECK (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_id AND cp.user_id = auth.uid()
  )
);

-- RLS Policies for poll votes
CREATE POLICY "Users can view votes in accessible polls"
ON public.poll_votes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.message_polls mp
    JOIN public.messages m ON mp.message_id = m.id
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE mp.id = poll_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own votes"
ON public.poll_votes FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policies for smart replies
CREATE POLICY "Users can view their own smart replies"
ON public.smart_reply_suggestions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can create smart replies"
ON public.smart_reply_suggestions FOR INSERT
WITH CHECK (true);

-- RLS Policies for translations
CREATE POLICY "Users can view translations in their conversations"
ON public.message_translations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own translations"
ON public.message_translations FOR INSERT
WITH CHECK (user_id = auth.uid());

-- RLS Policies for moderation
CREATE POLICY "Admins can view all moderation data"
ON public.message_moderation FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for analytics
CREATE POLICY "Conversation participants can view analytics"
ON public.conversation_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = conversation_analytics.conversation_id 
    AND user_id = auth.uid()
  )
);

-- RLS Policies for custom emojis
CREATE POLICY "Users can view public emojis"
ON public.custom_emojis FOR SELECT
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create emojis"
ON public.custom_emojis FOR INSERT
WITH CHECK (created_by = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_typing_conversation ON public.conversation_typing(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_typing_activity ON public.conversation_typing(last_activity);

CREATE INDEX IF NOT EXISTS idx_user_presence_status ON public.user_presence(status);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON public.user_presence(last_seen);

CREATE INDEX IF NOT EXISTS idx_message_read_status_enhanced_message ON public.message_read_status_enhanced(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_enhanced_user ON public.message_read_status_enhanced(user_id);

CREATE INDEX IF NOT EXISTS idx_message_threads_parent ON public.message_threads(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_conversation ON public.message_threads(conversation_id);

CREATE INDEX IF NOT EXISTS idx_thread_messages_thread ON public.thread_messages(thread_id);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON public.message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_type ON public.message_attachments(file_type);

CREATE INDEX IF NOT EXISTS idx_message_polls_message ON public.message_polls(message_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user ON public.poll_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_smart_replies_conversation ON public.smart_reply_suggestions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_smart_replies_user ON public.smart_reply_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_replies_expires ON public.smart_reply_suggestions(expires_at);

CREATE INDEX IF NOT EXISTS idx_message_translations_message ON public.message_translations(message_id);
CREATE INDEX IF NOT EXISTS idx_message_translations_user ON public.message_translations(user_id);

CREATE INDEX IF NOT EXISTS idx_message_moderation_message ON public.message_moderation(message_id);
CREATE INDEX IF NOT EXISTS idx_message_moderation_type ON public.message_moderation(moderation_type);

CREATE INDEX IF NOT EXISTS idx_conversation_analytics_conversation ON public.conversation_analytics(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_analytics_date ON public.conversation_analytics(date);

CREATE INDEX IF NOT EXISTS idx_custom_emojis_name ON public.custom_emojis(name);
CREATE INDEX IF NOT EXISTS idx_custom_emojis_public ON public.custom_emojis(is_public);

-- Functions for real-time features
CREATE OR REPLACE FUNCTION public.update_user_presence(
  p_status TEXT,
  p_device_info JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_presence (user_id, status, device_info)
  VALUES (auth.uid(), p_status, p_device_info)
  ON CONFLICT (user_id) DO UPDATE SET
    status = EXCLUDED.status,
    device_info = EXCLUDED.device_info,
    last_seen = now(),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set typing indicator
CREATE OR REPLACE FUNCTION public.set_typing_indicator(
  p_conversation_id UUID,
  p_is_typing BOOLEAN DEFAULT true
)
RETURNS VOID AS $$
BEGIN
  IF p_is_typing THEN
    INSERT INTO public.conversation_typing (conversation_id, user_id)
    VALUES (p_conversation_id, auth.uid())
    ON CONFLICT (conversation_id, user_id) DO UPDATE SET
      last_activity = now();
  ELSE
    DELETE FROM public.conversation_typing 
    WHERE conversation_id = p_conversation_id AND user_id = auth.uid();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark message as read
CREATE OR REPLACE FUNCTION public.mark_message_read(
  p_message_id UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.message_read_status_enhanced (message_id, user_id)
  VALUES (p_message_id, auth.uid())
  ON CONFLICT (message_id, user_id) DO UPDATE SET
    read_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a thread
CREATE OR REPLACE FUNCTION public.create_message_thread(
  p_parent_message_id UUID,
  p_thread_title TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_thread_id UUID;
BEGIN
  -- Get conversation ID from parent message
  SELECT conversation_id INTO v_conversation_id 
  FROM public.messages 
  WHERE id = p_parent_message_id;
  
  -- Create thread
  INSERT INTO public.message_threads (
    parent_message_id, conversation_id, thread_title, created_by
  ) VALUES (
    p_parent_message_id, v_conversation_id, p_thread_title, auth.uid()
  ) RETURNING id INTO v_thread_id;
  
  RETURN v_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired typing indicators
CREATE OR REPLACE FUNCTION public.cleanup_expired_typing()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.conversation_typing
  WHERE last_activity < now() - INTERVAL '30 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired smart replies
CREATE OR REPLACE FUNCTION public.cleanup_expired_smart_replies()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.smart_reply_suggestions
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for critical tables
ALTER TABLE public.conversation_typing REPLICA IDENTITY FULL;
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
ALTER TABLE public.message_read_status_enhanced REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
DO $$
BEGIN
  -- Check if publication exists, create if not
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  
  -- Add tables to publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_typing;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.message_read_status_enhanced;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION 
  WHEN OTHERS THEN 
    -- Tables might already be in publication
    NULL;
END $$;