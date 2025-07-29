-- Create conversations table for chat management
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  is_group boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_message_at timestamp with time zone DEFAULT now(),
  icon_url text,
  description text
);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT now(),
  is_admin boolean DEFAULT false,
  is_muted boolean DEFAULT false,
  UNIQUE(conversation_id, user_id)
);

-- Update messages table if needed
DO $$
BEGIN
  -- Add conversation_id to messages table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'messages' AND column_name = 'conversation_id') THEN
    ALTER TABLE public.messages ADD COLUMN conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE;
  END IF;
  
  -- Add message_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'messages' AND column_name = 'message_type') THEN
    ALTER TABLE public.messages ADD COLUMN message_type text DEFAULT 'text';
  END IF;
  
  -- Add media_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'messages' AND column_name = 'media_url') THEN
    ALTER TABLE public.messages ADD COLUMN media_url text;
  END IF;
  
  -- Add reply_to_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'messages' AND column_name = 'reply_to_id') THEN
    ALTER TABLE public.messages ADD COLUMN reply_to_id uuid REFERENCES public.messages(id);
  END IF;
  
  -- Add is_deleted column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'messages' AND column_name = 'is_deleted') THEN
    ALTER TABLE public.messages ADD COLUMN is_deleted boolean DEFAULT false;
  END IF;
END $$;

-- Create message_read_status table for read receipts
CREATE TABLE IF NOT EXISTS public.message_read_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at timestamp with time zone DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Create blocked_users table
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in"
  ON public.conversations FOR SELECT
  USING (
    conversations.id IN (
      SELECT conversation_id FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update conversations they created or are admins of"
  ON public.conversations FOR UPDATE
  USING (
    created_by = auth.uid() OR
    conversations.id IN (
      SELECT conversation_id FROM public.conversation_participants 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- RLS Policies for conversation_participants
CREATE POLICY "Users can view participants of their conversations"
  ON public.conversation_participants FOR SELECT
  USING (
    conversation_id IN (
      SELECT cp2.conversation_id FROM public.conversation_participants cp2
      WHERE cp2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add participants to conversations they admin"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT cp.conversation_id FROM public.conversation_participants cp
      WHERE cp.user_id = auth.uid() AND cp.is_admin = true
    ) OR
    conversation_id IN (
      SELECT c.id FROM public.conversations c
      WHERE c.created_by = auth.uid()
    )
  );

-- RLS Policies for messages (update existing)
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT cp.conversation_id FROM public.conversation_participants cp
      WHERE cp.user_id = auth.uid()
    ) AND is_deleted = false
  );

CREATE POLICY "Users can send messages to their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT cp.conversation_id FROM public.conversation_participants cp
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid());

-- RLS Policies for message_read_status
CREATE POLICY "Users can view read status for their conversations"
  ON public.message_read_status FOR SELECT
  USING (
    message_id IN (
      SELECT m.id FROM public.messages m
      JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON public.message_read_status FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for blocked_users
CREATE POLICY "Users can view their own blocks"
  ON public.blocked_users FOR SELECT
  USING (blocker_id = auth.uid());

CREATE POLICY "Users can block others"
  ON public.blocked_users FOR INSERT
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can unblock others"
  ON public.blocked_users FOR DELETE
  USING (blocker_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversation_participants(conversation_id, user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_read_status ON public.message_read_status(message_id, user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users ON public.blocked_users(blocker_id, blocked_id);

-- Functions for message notifications and updates
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at, updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation last_message_at
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON public.messages;
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();