-- =====================================
-- TARGETED SECURITY FIXES - PHASE 1
-- =====================================

-- First, check and create missing RLS policies only

-- messenger_media_files RLS policies (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'messenger_media_files' 
    AND policyname = 'Users can view media files they have access to'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'messenger_media_files' 
    AND policyname = 'Users can create media files for their messages'
  ) THEN
    CREATE POLICY "Users can create media files for their messages" 
    ON public.messenger_media_files 
    FOR INSERT 
    WITH CHECK (uploaded_by = auth.uid());
  END IF;
END $$;

-- conversation_typing RLS policies (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'conversation_typing' 
    AND policyname = 'Users can view typing indicators for their conversations'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'conversation_typing' 
    AND policyname = 'Users can manage their own typing indicators'
  ) THEN
    CREATE POLICY "Users can manage their own typing indicators" 
    ON public.conversation_typing 
    FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- message_read_status_enhanced RLS policies (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'message_read_status_enhanced' 
    AND policyname = 'Users can view read status for their conversations'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'message_read_status_enhanced' 
    AND policyname = 'Users can manage their own read status'
  ) THEN
    CREATE POLICY "Users can manage their own read status" 
    ON public.message_read_status_enhanced 
    FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- message_threads RLS policies (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'message_threads' 
    AND policyname = 'Users can view threads in their conversations'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'message_threads' 
    AND policyname = 'Users can create threads in their conversations'
  ) THEN
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
  END IF;
END $$;

-- Add constraint to validate message content length (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_message_content_length'
  ) THEN
    ALTER TABLE public.messages 
    ADD CONSTRAINT check_message_content_length 
    CHECK (length(content) <= 10000);
  END IF;
END $$;

-- Add constraint to validate conversation titles (if not exists)  
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_conversation_title_length'
  ) THEN
    ALTER TABLE public.conversations 
    ADD CONSTRAINT check_conversation_title_length 
    CHECK (length(title) <= 200);
  END IF;
END $$;

-- Create Security Audit Log Table (if not exists)
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

-- Enable RLS on audit logs (if not already enabled)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'security_audit_logs' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create audit logs policy (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'security_audit_logs' 
    AND policyname = 'Admins can view audit logs'
  ) THEN
    CREATE POLICY "Admins can view audit logs" 
    ON public.security_audit_logs 
    FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'::app_role
      )
    );
  END IF;
END $$;

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

-- Create Message Content Sanitization Function
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

-- Create sanitization trigger function
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