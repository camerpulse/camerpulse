-- Fix critical RLS policy gaps for core user data tables

-- 1. Fix profiles table RLS policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view verified profiles" ON public.profiles
FOR SELECT USING (
  verified = true OR user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

-- 2. Add RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

-- 3. Add RLS policies for messages table
CREATE POLICY "Users can view messages in their conversations" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = messages.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their conversations" ON public.messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = messages.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING (sender_id = auth.uid());

-- 4. Add RLS policies for conversation_participants
CREATE POLICY "Users can view their own participation" ON public.conversation_participants
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Conversation creators can add participants" ON public.conversation_participants
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = conversation_participants.conversation_id 
    AND c.created_by = auth.uid()
  ) OR
  user_id = auth.uid()
);

-- 5. Add RLS policies for villages table
CREATE POLICY "Villages are publicly viewable" ON public.villages
FOR SELECT USING (true);

CREATE POLICY "Admins can manage villages" ON public.villages
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

CREATE POLICY "Users can create villages" ON public.villages
FOR INSERT WITH CHECK (created_by = auth.uid());

-- 6. Add RLS policies for politicians table
CREATE POLICY "Politicians are publicly viewable" ON public.politicians
FOR SELECT USING (true);

CREATE POLICY "Admins can manage politicians" ON public.politicians
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

-- 7. Add RLS policies for polls table
CREATE POLICY "Active polls are publicly viewable" ON public.polls
FOR SELECT USING (status = 'active' OR created_by = auth.uid());

CREATE POLICY "Users can create polls" ON public.polls
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Poll creators can update their polls" ON public.polls
FOR UPDATE USING (created_by = auth.uid());

-- 8. Add RLS policies for poll_votes table
CREATE POLICY "Users can view poll vote counts" ON public.poll_votes
FOR SELECT USING (true);

CREATE POLICY "Users can cast votes" ON public.poll_votes
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 9. Add security function for rate limiting
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_action TEXT,
  p_limit INTEGER,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  action_count INTEGER;
BEGIN
  -- Check how many times this action was performed in the time window
  SELECT COUNT(*) INTO action_count
  FROM profile_activity_log
  WHERE user_id = p_user_id
    AND activity_type = p_action
    AND created_at > now() - (p_window_minutes || ' minutes')::interval;
  
  RETURN action_count < p_limit;
END;
$$;

-- 10. Add comprehensive audit logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_description TEXT,
  p_user_id UUID DEFAULT auth.uid(),
  p_metadata JSONB DEFAULT '{}'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profile_activity_log (
    user_id,
    activity_type,
    activity_title,
    activity_description,
    metadata,
    is_public
  ) VALUES (
    p_user_id,
    'security_event',
    p_event_type,
    p_description,
    p_metadata,
    false
  );
END;
$$;