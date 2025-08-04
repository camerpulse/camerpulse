-- Phase 1: Create security audit logs table and fix critical RLS policies (corrected)

-- Create security_audit_logs table
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL DEFAULT 'general',
  severity TEXT NOT NULL DEFAULT 'low',
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security_audit_logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for security_audit_logs
CREATE POLICY "Admins can view all audit logs" ON public.security_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

CREATE POLICY "System can insert audit logs" ON public.security_audit_logs
  FOR INSERT WITH CHECK (true);

-- Fix missing RLS policies for poll_bot_patterns
ALTER TABLE public.poll_bot_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bot patterns" ON public.poll_bot_patterns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- Fix missing RLS policies for poll_captcha_verifications  
ALTER TABLE public.poll_captcha_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their captcha by session" ON public.poll_captcha_verifications
  FOR ALL USING (session_id = current_setting('request.session_id', true));

CREATE POLICY "Admins can view all captcha verifications" ON public.poll_captcha_verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- Fix missing RLS policies for poll_rate_limits
ALTER TABLE public.poll_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rate limits by identifier" ON public.poll_rate_limits
  FOR SELECT USING (true);

CREATE POLICY "System can manage rate limits" ON public.poll_rate_limits
  FOR ALL USING (true);

-- Add missing RLS policies for chat_attachments
CREATE POLICY "Users can view attachments in their conversations" ON public.chat_attachments
  FOR SELECT USING (
    message_id IN (
      SELECT m.id FROM public.messages m
      JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create attachments for their messages" ON public.chat_attachments
  FOR INSERT WITH CHECK (
    message_id IN (
      SELECT m.id FROM public.messages m
      WHERE m.sender_id = auth.uid()
    )
  );