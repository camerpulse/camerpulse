-- =====================================
-- CRITICAL SECURITY FIXES
-- =====================================

-- Phase 1: Fix RLS Policy Gaps
-- =====================================

-- Add RLS policies for tables with RLS enabled but no policies

-- messenger_media_files RLS policies
CREATE POLICY "Users can view media files they have access to" 
ON public.messenger_media_files 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = messenger_media_files.message_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create media files for their messages" 
ON public.messenger_media_files 
FOR INSERT 
WITH CHECK (
  uploaded_by = auth.uid()
);

-- conversation_typing RLS policies
CREATE POLICY "Users can view typing indicators for their conversations" 
ON public.conversation_typing 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_typing.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own typing indicators" 
ON public.conversation_typing 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- user_presence RLS policies  
CREATE POLICY "Users can view presence of users in their conversations" 
ON public.user_presence 
FOR SELECT 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp1
    JOIN public.conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = auth.uid() 
    AND cp2.user_id = user_presence.user_id
  )
);

CREATE POLICY "Users can manage their own presence" 
ON public.user_presence 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- message_read_status_enhanced RLS policies
CREATE POLICY "Users can view read status for their conversations" 
ON public.message_read_status_enhanced 
FOR SELECT 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_read_status_enhanced.message_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own read status" 
ON public.message_read_status_enhanced 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- message_threads RLS policies
CREATE POLICY "Users can view threads in their conversations" 
ON public.message_threads 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = message_threads.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create threads in their conversations" 
ON public.message_threads 
FOR INSERT 
WITH CHECK (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = message_threads.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

-- message_polls RLS policies
CREATE POLICY "Users can view polls in their conversations" 
ON public.message_polls 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_polls.message_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create polls in their conversations" 
ON public.message_polls 
FOR INSERT 
WITH CHECK (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_polls.message_id 
    AND cp.user_id = auth.uid()
  )
);

-- poll_votes RLS policies
CREATE POLICY "Users can view poll votes in their conversations" 
ON public.poll_votes 
FOR SELECT 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.message_polls mp
    JOIN public.messages m ON mp.message_id = m.id
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE mp.id = poll_votes.poll_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can vote on polls in their conversations" 
ON public.poll_votes 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.message_polls mp
    JOIN public.messages m ON mp.message_id = m.id
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE mp.id = poll_votes.poll_id 
    AND cp.user_id = auth.uid()
  )
);

-- message_translations RLS policies
CREATE POLICY "Users can view translations in their conversations" 
ON public.message_translations 
FOR SELECT 
USING (
  requested_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_translations.message_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can request translations for accessible messages" 
ON public.message_translations 
FOR INSERT 
WITH CHECK (
  requested_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_translations.message_id 
    AND cp.user_id = auth.uid()
  )
);

-- smart_reply_suggestions RLS policies
CREATE POLICY "Users can view smart replies for their conversations" 
ON public.smart_reply_suggestions 
FOR SELECT 
USING (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = smart_reply_suggestions.message_id 
    AND cp.user_id = auth.uid()
  )
);

-- Phase 2: Fix Security Definer Functions with Search Path
-- =====================================

-- Update all functions to include SET search_path = ''
-- This fixes the Function Search Path Mutable warnings

-- Update update_message_search_index function
CREATE OR REPLACE FUNCTION public.update_message_search_index()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

-- Update forward_message function
CREATE OR REPLACE FUNCTION public.forward_message(p_original_message_id uuid, p_target_conversation_id uuid, p_forward_context text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_original_message RECORD;
  v_new_message_id UUID;
  v_forward_id UUID;
BEGIN
  -- Get original message details
  SELECT * INTO v_original_message 
  FROM public.messages 
  WHERE id = p_original_message_id;
  
  -- Verify user has access to original message
  IF NOT EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = v_original_message.conversation_id 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to original message';
  END IF;
  
  -- Verify user has access to target conversation
  IF NOT EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = p_target_conversation_id 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to target conversation';
  END IF;
  
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
$function$;

-- Update search_messages function  
CREATE OR REPLACE FUNCTION public.search_messages(p_user_id uuid, p_search_query text, p_conversation_id uuid DEFAULT NULL::uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
RETURNS TABLE(message_id uuid, conversation_id uuid, sender_id uuid, content_preview text, created_at timestamp with time zone, rank real)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

-- Update update_user_presence function
CREATE OR REPLACE FUNCTION public.update_user_presence(p_status text, p_device_info jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.user_presence (user_id, status, device_info)
  VALUES (auth.uid(), p_status, p_device_info)
  ON CONFLICT (user_id) DO UPDATE SET
    status = EXCLUDED.status,
    device_info = EXCLUDED.device_info,
    last_seen = now(),
    updated_at = now();
END;
$function$;

-- Update mark_message_read function
CREATE OR REPLACE FUNCTION public.mark_message_read(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Verify user has access to the message
  IF NOT EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = p_message_id AND cp.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to message';
  END IF;
  
  INSERT INTO public.message_read_status_enhanced (message_id, user_id)
  VALUES (p_message_id, auth.uid())
  ON CONFLICT (message_id, user_id) DO UPDATE SET
    read_at = now();
END;
$function$;

-- Update create_message_thread function
CREATE OR REPLACE FUNCTION public.create_message_thread(p_parent_message_id uuid, p_thread_title text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_conversation_id UUID;
  v_thread_id UUID;
BEGIN
  -- Get conversation ID from parent message and verify access
  SELECT m.conversation_id INTO v_conversation_id 
  FROM public.messages m
  JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
  WHERE m.id = p_parent_message_id AND cp.user_id = auth.uid();
  
  IF v_conversation_id IS NULL THEN
    RAISE EXCEPTION 'Access denied to parent message';
  END IF;
  
  -- Create thread
  INSERT INTO public.message_threads (
    parent_message_id, conversation_id, thread_title, created_by
  ) VALUES (
    p_parent_message_id, v_conversation_id, p_thread_title, auth.uid()
  ) RETURNING id INTO v_thread_id;
  
  RETURN v_thread_id;
END;
$function$;

-- Update cleanup_expired_media function
CREATE OR REPLACE FUNCTION public.cleanup_expired_media()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  deleted_count INTEGER := 0;
  expired_file RECORD;
BEGIN
  -- Get expired files
  FOR expired_file IN
    SELECT file_path, id
    FROM public.messenger_media_files
    WHERE expires_at < now()
  LOOP
    -- Delete from storage
    PERFORM storage.delete_object('messenger-media', expired_file.file_path);
    
    -- Delete metadata record
    DELETE FROM public.messenger_media_files WHERE id = expired_file.id;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$function$;

-- Phase 3: Add Input Validation and Security Constraints
-- =====================================

-- Add constraint to validate message content length and prevent XSS
ALTER TABLE public.messages 
ADD CONSTRAINT check_message_content_length 
CHECK (length(content) <= 10000);

-- Add constraint to validate conversation titles
ALTER TABLE public.conversations 
ADD CONSTRAINT check_conversation_title_length 
CHECK (length(title) <= 200);

-- Add constraint to validate media file sizes and types
ALTER TABLE public.messenger_media_files 
ADD CONSTRAINT check_file_size 
CHECK (file_size <= 104857600); -- 100MB limit

-- Add constraint to validate file types (allowlist)
ALTER TABLE public.messenger_media_files 
ADD CONSTRAINT check_file_type 
CHECK (file_type IN (
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime',
  'audio/mpeg', 'audio/wav', 'audio/ogg',
  'application/pdf', 'text/plain',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
));

-- Phase 4: Create Security Audit Log Table
-- =====================================

CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  timestamp timestamp with time zone DEFAULT now(),
  severity text DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Enable RLS on audit logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Create audit log function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action_type text,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}',
  p_severity text DEFAULT 'info'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id, action_type, resource_type, resource_id, 
    details, severity, timestamp
  ) VALUES (
    auth.uid(), p_action_type, p_resource_type, p_resource_id,
    p_details, p_severity, now()
  );
END;
$function$;

-- Phase 5: Create Message Content Sanitization Function
-- =====================================

CREATE OR REPLACE FUNCTION public.sanitize_message_content(content text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $function$
BEGIN
  -- Basic XSS prevention - remove script tags and javascript: protocols
  content := regexp_replace(content, '<script[^>]*>.*?</script>', '', 'gi');
  content := regexp_replace(content, 'javascript:', '', 'gi');
  content := regexp_replace(content, 'on\w+\s*=', '', 'gi');
  
  -- Limit length
  IF length(content) > 10000 THEN
    content := left(content, 10000);
  END IF;
  
  RETURN content;
END;
$function$;

-- Add trigger to sanitize message content on insert/update
CREATE OR REPLACE FUNCTION public.sanitize_message_trigger()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.content := public.sanitize_message_content(NEW.content);
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS sanitize_message_content_trigger ON public.messages;
CREATE TRIGGER sanitize_message_content_trigger
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_message_trigger();