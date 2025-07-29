-- Add message reactions support
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, reaction_emoji)
);

-- Enable RLS for message reactions
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for message reactions
CREATE POLICY "Users can view reactions in their conversations"
ON public.message_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversations c ON m.conversation_id = c.id
    WHERE m.id = message_reactions.message_id
    AND c.id IN (
      SELECT public.get_user_conversation_ids(auth.uid())
    )
  )
);

CREATE POLICY "Users can add reactions to messages in their conversations"
ON public.message_reactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversations c ON m.conversation_id = c.id
    WHERE m.id = message_reactions.message_id
    AND c.id IN (
      SELECT public.get_user_conversation_ids(auth.uid())
    )
  )
);

CREATE POLICY "Users can remove their own reactions"
ON public.message_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Add message editing support
ALTER TABLE public.messages
ADD COLUMN edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Create table for typing indicators
CREATE TABLE public.conversation_typing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_typing BOOLEAN NOT NULL DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS for typing indicators
ALTER TABLE public.conversation_typing ENABLE ROW LEVEL SECURITY;

-- Create policies for typing indicators
CREATE POLICY "Users can view typing status in their conversations"
ON public.conversation_typing
FOR SELECT
USING (
  conversation_id IN (
    SELECT public.get_user_conversation_ids(auth.uid())
  )
);

CREATE POLICY "Users can manage their own typing status"
ON public.conversation_typing
FOR ALL
USING (auth.uid() = user_id);

-- Create function to clean up old typing indicators
CREATE OR REPLACE FUNCTION public.cleanup_old_typing_indicators()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.conversation_typing
  WHERE last_activity < now() - INTERVAL '30 seconds';
END;
$$;