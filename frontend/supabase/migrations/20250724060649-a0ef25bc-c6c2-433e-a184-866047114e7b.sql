-- Phase 4: Additional tables (skipping existing ones)

-- Check and create only missing tables
DO $$
BEGIN
  -- User presence tracking (if not exists)
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_presence' AND schemaname = 'public') THEN
    CREATE TABLE public.user_presence (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
      last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      device_info JSONB DEFAULT '{}',
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view all presence data"
    ON public.user_presence FOR SELECT
    USING (true);
    
    CREATE POLICY "Users can manage their own presence"
    ON public.user_presence FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;

  -- Message read status enhanced (if not exists)
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'message_read_status_enhanced' AND schemaname = 'public') THEN
    CREATE TABLE public.message_read_status_enhanced (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
      user_id UUID NOT NULL,
      read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      delivered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(message_id, user_id)
    );
    ALTER TABLE public.message_read_status_enhanced ENABLE ROW LEVEL SECURITY;
    
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
  END IF;

  -- Message threads (if not exists)
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'message_threads' AND schemaname = 'public') THEN
    CREATE TABLE public.message_threads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      parent_message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
      conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
      thread_title TEXT,
      created_by UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      is_active BOOLEAN NOT NULL DEFAULT true
    );
    ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
    
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
  END IF;

  -- Thread messages (if not exists)
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'thread_messages' AND schemaname = 'public') THEN
    CREATE TABLE public.thread_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
      message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      UNIQUE(thread_id, message_id)
    );
    ALTER TABLE public.thread_messages ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view thread messages in their conversations"
    ON public.thread_messages FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.message_threads mt
        JOIN public.conversation_participants cp ON mt.conversation_id = cp.conversation_id
        WHERE mt.id = thread_id AND cp.user_id = auth.uid()
      )
    );
  END IF;

  -- Message attachments (if not exists)
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'message_attachments' AND schemaname = 'public') THEN
    CREATE TABLE public.message_attachments (
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
    ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view attachments in their conversations"
    ON public.message_attachments FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.messages m
        JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
        WHERE m.id = message_id AND cp.user_id = auth.uid()
      )
    );
  END IF;

  -- Message polls (if not exists)
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'message_polls' AND schemaname = 'public') THEN
    CREATE TABLE public.message_polls (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      options JSONB NOT NULL DEFAULT '[]',
      allow_multiple BOOLEAN NOT NULL DEFAULT false,
      expires_at TIMESTAMP WITH TIME ZONE,
      created_by UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    ALTER TABLE public.message_polls ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view polls in their conversations"
    ON public.message_polls FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.messages m
        JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
        WHERE m.id = message_id AND cp.user_id = auth.uid()
      )
    );
  END IF;

  -- Poll votes (if not exists)
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'poll_votes' AND schemaname = 'public') THEN
    CREATE TABLE public.poll_votes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      poll_id UUID NOT NULL REFERENCES public.message_polls(id) ON DELETE CASCADE,
      user_id UUID NOT NULL,
      option_index INTEGER NOT NULL,
      voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      UNIQUE(poll_id, user_id, option_index)
    );
    ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
    
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
  END IF;

  -- AI smart replies (if not exists)
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'smart_reply_suggestions' AND schemaname = 'public') THEN
    CREATE TABLE public.smart_reply_suggestions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
      user_id UUID NOT NULL,
      context_message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
      suggestions JSONB NOT NULL DEFAULT '[]',
      confidence_scores JSONB NOT NULL DEFAULT '[]',
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    ALTER TABLE public.smart_reply_suggestions ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own smart replies"
    ON public.smart_reply_suggestions FOR SELECT
    USING (user_id = auth.uid());
    
    CREATE POLICY "System can create smart replies"
    ON public.smart_reply_suggestions FOR INSERT
    WITH CHECK (true);
  END IF;

  -- Message translations (if not exists)
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'message_translations' AND schemaname = 'public') THEN
    CREATE TABLE public.message_translations (
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
    ALTER TABLE public.message_translations ENABLE ROW LEVEL SECURITY;
    
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
  END IF;

  -- Message moderation (if not exists)
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'message_moderation' AND schemaname = 'public') THEN
    CREATE TABLE public.message_moderation (
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
    ALTER TABLE public.message_moderation ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Admins can view all moderation data"
    ON public.message_moderation FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    );
  END IF;

  -- Conversation analytics (if not exists)
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'conversation_analytics' AND schemaname = 'public') THEN
    CREATE TABLE public.conversation_analytics (
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
    ALTER TABLE public.conversation_analytics ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Conversation participants can view analytics"
    ON public.conversation_analytics FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.conversation_participants 
        WHERE conversation_id = conversation_analytics.conversation_id 
        AND user_id = auth.uid()
      )
    );
  END IF;

  -- Custom emojis (if not exists)
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'custom_emojis' AND schemaname = 'public') THEN
    CREATE TABLE public.custom_emojis (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      emoji_url TEXT NOT NULL,
      created_by UUID NOT NULL,
      is_public BOOLEAN NOT NULL DEFAULT true,
      usage_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    ALTER TABLE public.custom_emojis ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view public emojis"
    ON public.custom_emojis FOR SELECT
    USING (is_public = true OR created_by = auth.uid());
    
    CREATE POLICY "Users can create emojis"
    ON public.custom_emojis FOR INSERT
    WITH CHECK (created_by = auth.uid());
  END IF;
END $$;

-- Create indexes for new tables
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

-- Add missing functions
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