-- Add RLS policies for critical user data tables (batch 2)

-- Villages table policies
ALTER TABLE IF EXISTS public.villages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='villages' AND policyname='Villages are publicly viewable'
  ) THEN
    CREATE POLICY "Villages are publicly viewable" ON public.villages
    FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='villages' AND policyname='Users can create villages'
  ) THEN
    CREATE POLICY "Users can create villages" ON public.villages
    FOR INSERT WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='villages' AND policyname='Admins can manage villages'
  ) THEN
    CREATE POLICY "Admins can manage villages" ON public.villages
    FOR ALL USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Politicians table policies
ALTER TABLE IF EXISTS public.politicians ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='politicians' AND policyname='Politicians are publicly viewable'
  ) THEN
    CREATE POLICY "Politicians are publicly viewable" ON public.politicians
    FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='politicians' AND policyname='Admins can manage politicians'
  ) THEN
    CREATE POLICY "Admins can manage politicians" ON public.politicians
    FOR ALL USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Polls table policies
ALTER TABLE IF EXISTS public.polls ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='polls' AND policyname='Active polls are publicly viewable'
  ) THEN
    CREATE POLICY "Active polls are publicly viewable" ON public.polls
    FOR SELECT USING (status = 'active' OR created_by = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='polls' AND policyname='Users can create polls'
  ) THEN
    CREATE POLICY "Users can create polls" ON public.polls
    FOR INSERT WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='polls' AND policyname='Poll creators can update their polls'
  ) THEN
    CREATE POLICY "Poll creators can update their polls" ON public.polls
    FOR UPDATE USING (created_by = auth.uid());
  END IF;
END $$;

-- Poll votes table policies
ALTER TABLE IF EXISTS public.poll_votes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='poll_votes' AND policyname='Users can view poll vote counts'
  ) THEN
    CREATE POLICY "Users can view poll vote counts" ON public.poll_votes
    FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='poll_votes' AND policyname='Users can cast votes'
  ) THEN
    CREATE POLICY "Users can cast votes" ON public.poll_votes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Messages table policies (secure chat)
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='Users can view messages in their conversations'
  ) THEN
    CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.conversation_participants cp 
        WHERE cp.conversation_id = messages.conversation_id 
        AND cp.user_id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='Users can send messages to their conversations'
  ) THEN
    CREATE POLICY "Users can send messages to their conversations" ON public.messages
    FOR INSERT WITH CHECK (
      sender_id = auth.uid() AND
      EXISTS (
        SELECT 1 FROM public.conversation_participants cp 
        WHERE cp.conversation_id = messages.conversation_id 
        AND cp.user_id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='Users can update their own messages'
  ) THEN
    CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());
  END IF;
END $$;