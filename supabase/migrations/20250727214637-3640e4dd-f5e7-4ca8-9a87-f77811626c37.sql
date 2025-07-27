-- Create missing chat_media table and other required tables

-- Create chat_media table for file attachments
CREATE TABLE IF NOT EXISTS public.chat_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  media_type TEXT NOT NULL DEFAULT 'file',
  mime_type TEXT,
  storage_bucket TEXT NOT NULL DEFAULT 'chat-files',
  download_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on chat_media
ALTER TABLE public.chat_media ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_media
CREATE POLICY "Users can view media from their conversations" ON public.chat_media
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = chat_media.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload media to their conversations" ON public.chat_media
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = chat_media.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own media" ON public.chat_media
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media" ON public.chat_media
FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger for chat_media
CREATE TRIGGER update_chat_media_updated_at
  BEFORE UPDATE ON public.chat_media
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat_media
ALTER TABLE public.chat_media REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_media;