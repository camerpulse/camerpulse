-- Create enhanced chat system with full functionality (fixed)

-- Create storage policies for chat files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-files', 
  'chat-files', 
  false, 
  52428800, -- 50MB limit
  ARRAY['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat files
CREATE POLICY "Users can view files from their conversations" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-files' AND 
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    JOIN public.chat_media cm ON cm.conversation_id = cp.conversation_id
    WHERE cp.user_id = auth.uid() 
    AND storage.filename(name) = cm.file_name
  )
);

CREATE POLICY "Users can upload files to their conversations" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-files' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update files they uploaded" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'chat-files' AND 
  auth.uid()::text = owner
);

CREATE POLICY "Users can delete files they uploaded" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat-files' AND 
  auth.uid()::text = owner
);

-- Create function to handle message encryption keys
CREATE OR REPLACE FUNCTION public.get_or_create_conversation_key(p_conversation_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key TEXT;
BEGIN
  -- Try to get existing key
  SELECT encryption_key INTO v_key
  FROM public.chat_encryption_keys
  WHERE conversation_id = p_conversation_id;
  
  -- If no key exists, create one
  IF v_key IS NULL THEN
    v_key := encode(gen_random_bytes(32), 'base64');
    
    INSERT INTO public.chat_encryption_keys (conversation_id, encryption_key, created_by)
    VALUES (p_conversation_id, v_key, auth.uid())
    ON CONFLICT (conversation_id) DO NOTHING;
  END IF;
  
  RETURN v_key;
END;
$$;

-- Create function to send message with full features
CREATE OR REPLACE FUNCTION public.send_enhanced_message(
  p_conversation_id UUID,
  p_content TEXT,
  p_message_type TEXT DEFAULT 'text',
  p_file_url TEXT DEFAULT NULL,
  p_file_name TEXT DEFAULT NULL,
  p_file_size BIGINT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_id UUID;
  v_media_id UUID;
BEGIN
  -- Insert the message
  INSERT INTO public.chat_messages (
    conversation_id,
    sender_id,
    content,
    message_type,
    is_encrypted
  ) VALUES (
    p_conversation_id,
    auth.uid(),
    p_content,
    p_message_type,
    true
  ) RETURNING id INTO v_message_id;
  
  -- If file attachment, store media info
  IF p_file_url IS NOT NULL THEN
    INSERT INTO public.chat_media (
      message_id,
      conversation_id,
      user_id,
      file_name,
      file_path,
      file_size,
      media_type,
      storage_bucket
    ) VALUES (
      v_message_id,
      p_conversation_id,
      auth.uid(),
      p_file_name,
      p_file_url,
      p_file_size,
      p_message_type,
      'chat-files'
    ) RETURNING id INTO v_media_id;
  END IF;
  
  -- Update conversation last message
  UPDATE public.chat_conversations
  SET 
    last_message_at = now(),
    updated_at = now()
  WHERE id = p_conversation_id;
  
  RETURN v_message_id;
END;
$$;

-- Create function to get conversation with participants
CREATE OR REPLACE FUNCTION public.get_conversation_with_participants(p_conversation_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  is_group BOOLEAN,
  created_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  participants JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.is_group,
    c.created_at,
    c.last_message_at,
    jsonb_agg(
      jsonb_build_object(
        'user_id', cp.user_id,
        'role', cp.role,
        'display_name', COALESCE(p.display_name, p.username, 'Unknown'),
        'avatar_url', p.avatar_url
      )
    ) as participants
  FROM public.chat_conversations c
  JOIN public.conversation_participants cp ON c.id = cp.conversation_id
  LEFT JOIN public.profiles p ON cp.user_id = p.user_id
  WHERE c.id = p_conversation_id
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp2 
      WHERE cp2.conversation_id = c.id AND cp2.user_id = auth.uid()
    )
  GROUP BY c.id, c.title, c.is_group, c.created_at, c.last_message_at;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation_key(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_enhanced_message(UUID, TEXT, TEXT, TEXT, TEXT, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_conversation_with_participants(UUID) TO authenticated;