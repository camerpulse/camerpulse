-- Phase 3: Advanced Messaging Features

-- Create message forwarding table
CREATE TABLE IF NOT EXISTS public.message_forwards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  forwarded_message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  forwarded_by UUID NOT NULL,
  forwarded_to_conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  forward_context TEXT -- Optional message when forwarding
);

-- Create message search index table for better search performance
CREATE TABLE IF NOT EXISTS public.message_search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  search_vector TSVECTOR,
  content_preview TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message edit history table
CREATE TABLE IF NOT EXISTS public.message_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  original_content TEXT NOT NULL,
  edited_content TEXT NOT NULL,
  edited_by UUID NOT NULL,
  edited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  edit_reason TEXT
);

-- Create enhanced message reactions table if not exists
CREATE TABLE IF NOT EXISTS public.message_reactions_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL, -- 'emoji', 'custom', 'sticker'
  reaction_value TEXT NOT NULL, -- emoji unicode, sticker id, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, reaction_value)
);

-- Enable RLS on all new tables
ALTER TABLE public.message_forwards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions_enhanced ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message forwards
CREATE POLICY "Users can view forwards in their conversations"
ON public.message_forwards FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = forwarded_to_conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create forwards in their conversations"
ON public.message_forwards FOR INSERT
WITH CHECK (
  forwarded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = forwarded_to_conversation_id 
    AND user_id = auth.uid()
  )
);

-- RLS Policies for search index
CREATE POLICY "Users can search their conversations"
ON public.message_search_index FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = message_search_index.conversation_id 
    AND user_id = auth.uid()
  )
);

-- RLS Policies for edit history
CREATE POLICY "Users can view edit history in their conversations"
ON public.message_edit_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create edit history for their messages"
ON public.message_edit_history FOR INSERT
WITH CHECK (
  edited_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.messages 
    WHERE id = message_id AND sender_id = auth.uid()
  )
);

-- RLS Policies for enhanced reactions
CREATE POLICY "Users can view reactions in their conversations"
ON public.message_reactions_enhanced FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own reactions"
ON public.message_reactions_enhanced FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_forwards_original ON public.message_forwards(original_message_id);
CREATE INDEX IF NOT EXISTS idx_message_forwards_forwarded ON public.message_forwards(forwarded_message_id);
CREATE INDEX IF NOT EXISTS idx_message_forwards_conversation ON public.message_forwards(forwarded_to_conversation_id);

CREATE INDEX IF NOT EXISTS idx_message_search_conversation ON public.message_search_index(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_search_vector ON public.message_search_index USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_message_search_created ON public.message_search_index(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_message_edit_history_message ON public.message_edit_history(message_id);
CREATE INDEX IF NOT EXISTS idx_message_edit_history_edited_at ON public.message_edit_history(edited_at DESC);

CREATE INDEX IF NOT EXISTS idx_message_reactions_enhanced_message ON public.message_reactions_enhanced(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_enhanced_user ON public.message_reactions_enhanced(user_id);

-- Function to update search index when messages are created/updated
CREATE OR REPLACE FUNCTION public.update_message_search_index()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.message_search_index (
    message_id, conversation_id, sender_id, search_vector, content_preview
  ) VALUES (
    NEW.id, 
    NEW.conversation_id, 
    NEW.sender_id,
    to_tsvector('english', COALESCE(NEW.content, '')),
    LEFT(COALESCE(NEW.content, ''), 100)
  )
  ON CONFLICT (message_id) DO UPDATE SET
    search_vector = to_tsvector('english', COALESCE(NEW.content, '')),
    content_preview = LEFT(COALESCE(NEW.content, ''), 100);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search messages
CREATE OR REPLACE FUNCTION public.search_messages(
  p_user_id UUID,
  p_search_query TEXT,
  p_conversation_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  message_id UUID,
  conversation_id UUID,
  sender_id UUID,
  content_preview TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    msi.message_id,
    msi.conversation_id,
    msi.sender_id,
    msi.content_preview,
    msi.created_at,
    ts_rank(msi.search_vector, plainto_tsquery('english', p_search_query)) as rank
  FROM public.message_search_index msi
  JOIN public.conversation_participants cp ON msi.conversation_id = cp.conversation_id
  WHERE cp.user_id = p_user_id
    AND msi.search_vector @@ plainto_tsquery('english', p_search_query)
    AND (p_conversation_id IS NULL OR msi.conversation_id = p_conversation_id)
  ORDER BY rank DESC, msi.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to forward messages
CREATE OR REPLACE FUNCTION public.forward_message(
  p_original_message_id UUID,
  p_target_conversation_id UUID,
  p_forward_context TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_original_message RECORD;
  v_new_message_id UUID;
  v_forward_id UUID;
BEGIN
  -- Get original message details
  SELECT * INTO v_original_message 
  FROM public.messages 
  WHERE id = p_original_message_id;
  
  -- Create forwarded message
  INSERT INTO public.messages (
    conversation_id, sender_id, content, message_type, metadata
  ) VALUES (
    p_target_conversation_id,
    auth.uid(),
    CASE 
      WHEN p_forward_context IS NOT NULL 
      THEN p_forward_context || E'\n\n--- Forwarded Message ---\n' || v_original_message.content
      ELSE '--- Forwarded Message ---\n' || v_original_message.content
    END,
    'forwarded',
    jsonb_build_object(
      'original_message_id', p_original_message_id,
      'original_sender_id', v_original_message.sender_id,
      'forwarded_at', now()
    )
  ) RETURNING id INTO v_new_message_id;
  
  -- Record the forward relationship
  INSERT INTO public.message_forwards (
    original_message_id, forwarded_message_id, forwarded_by, 
    forwarded_to_conversation_id, forward_context
  ) VALUES (
    p_original_message_id, v_new_message_id, auth.uid(),
    p_target_conversation_id, p_forward_context
  ) RETURNING id INTO v_forward_id;
  
  -- Update conversation last message
  UPDATE public.conversations 
  SET last_message_at = now(), updated_at = now()
  WHERE id = p_target_conversation_id;
  
  RETURN v_new_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to maintain search index
DROP TRIGGER IF EXISTS trigger_update_message_search_index ON public.messages;
CREATE TRIGGER trigger_update_message_search_index
  AFTER INSERT OR UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_message_search_index();