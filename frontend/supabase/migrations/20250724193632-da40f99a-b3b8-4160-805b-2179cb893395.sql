-- Step 6: Messaging & Communication System

-- Create conversations table
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'project')),
  title text,
  project_id uuid,
  expert_id uuid,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create conversation participants table
CREATE TABLE public.conversation_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  last_read_at timestamp with time zone DEFAULT now(),
  is_muted boolean DEFAULT false,
  UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'proposal', 'contract')),
  attachments jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  reply_to_id uuid REFERENCES public.messages(id),
  is_edited boolean DEFAULT false,
  edited_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create message read status table
CREATE TABLE public.message_read_status (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in" 
ON public.conversations FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.conversation_participants 
  WHERE conversation_id = conversations.id AND user_id = auth.uid()
));

CREATE POLICY "Users can create conversations" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Conversation admins can update" 
ON public.conversations FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.conversation_participants 
  WHERE conversation_id = conversations.id AND user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for conversation_participants
CREATE POLICY "Users can view participants in their conversations" 
ON public.conversation_participants FOR SELECT 
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.conversation_participants cp2 
  WHERE cp2.conversation_id = conversation_participants.conversation_id 
  AND cp2.user_id = auth.uid()
));

CREATE POLICY "Users can join conversations they're added to" 
ON public.conversation_participants FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own participation" 
ON public.conversation_participants FOR UPDATE 
USING (user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.conversation_participants 
  WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Users can send messages to their conversations" 
ON public.messages FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND 
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.messages FOR UPDATE 
USING (auth.uid() = sender_id);

-- RLS Policies for message_read_status
CREATE POLICY "Users can manage their own read status" 
ON public.message_read_status FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX idx_conversation_participants_user ON public.conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conv ON public.conversation_participants(conversation_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_message_read_status_user ON public.message_read_status(user_id);

-- Create updated_at triggers
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create a direct conversation between two users
CREATE OR REPLACE FUNCTION public.create_direct_conversation(
  participant_user_id uuid,
  initial_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  conversation_id uuid;
  message_id uuid;
BEGIN
  -- Check if conversation already exists
  SELECT c.id INTO conversation_id
  FROM public.conversations c
  JOIN public.conversation_participants cp1 ON c.id = cp1.conversation_id
  JOIN public.conversation_participants cp2 ON c.id = cp2.conversation_id
  WHERE c.type = 'direct'
    AND cp1.user_id = auth.uid()
    AND cp2.user_id = participant_user_id
    AND c.is_active = true;
  
  IF conversation_id IS NOT NULL THEN
    RETURN conversation_id;
  END IF;
  
  -- Create new conversation
  INSERT INTO public.conversations (type, created_by)
  VALUES ('direct', auth.uid())
  RETURNING id INTO conversation_id;
  
  -- Add both participants
  INSERT INTO public.conversation_participants (conversation_id, user_id, role)
  VALUES 
    (conversation_id, auth.uid(), 'admin'),
    (conversation_id, participant_user_id, 'member');
  
  -- Send initial message if provided
  IF initial_message IS NOT NULL THEN
    INSERT INTO public.messages (conversation_id, sender_id, content)
    VALUES (conversation_id, auth.uid(), initial_message)
    RETURNING id INTO message_id;
  END IF;
  
  RETURN conversation_id;
END;
$$;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_read(
  p_conversation_id uuid,
  p_up_to_message_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.message_read_status (message_id, user_id)
  SELECT m.id, auth.uid()
  FROM public.messages m
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id != auth.uid()
    AND (p_up_to_message_id IS NULL OR m.created_at <= (
      SELECT created_at FROM public.messages WHERE id = p_up_to_message_id
    ))
    AND NOT EXISTS (
      SELECT 1 FROM public.message_read_status mrs 
      WHERE mrs.message_id = m.id AND mrs.user_id = auth.uid()
    );
  
  -- Update last read timestamp for participant
  UPDATE public.conversation_participants
  SET last_read_at = now()
  WHERE conversation_id = p_conversation_id AND user_id = auth.uid();
END;
$$;