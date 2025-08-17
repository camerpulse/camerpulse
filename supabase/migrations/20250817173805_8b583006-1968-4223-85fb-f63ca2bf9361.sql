-- Fix critical RLS policy gaps for core tables
-- Add missing RLS policies for tables that have RLS enabled but no policies

-- Politicians table policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'politicians' AND policyname = 'Politicians are publicly viewable') THEN
    CREATE POLICY "Politicians are publicly viewable" 
    ON public.politicians FOR SELECT 
    USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'politicians' AND policyname = 'Admins can manage politicians') THEN
    CREATE POLICY "Admins can manage politicians" 
    ON public.politicians FOR ALL 
    USING (EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    ));
  END IF;
END $$;

-- Villages table policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'villages' AND policyname = 'Villages are publicly viewable') THEN
    CREATE POLICY "Villages are publicly viewable"
    ON public.villages FOR SELECT
    USING (true);
  END IF;
END $$;

-- Messages table policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can view messages in their conversations') THEN
    CREATE POLICY "Users can view messages in their conversations"
    ON public.messages FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id 
      AND cp.user_id = auth.uid()
    ));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can send messages to their conversations') THEN
    CREATE POLICY "Users can send messages to their conversations"
    ON public.messages FOR INSERT
    WITH CHECK (
      sender_id = auth.uid() AND
      EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = messages.conversation_id 
        AND cp.user_id = auth.uid()
      )
    );
  END IF;
END $$;