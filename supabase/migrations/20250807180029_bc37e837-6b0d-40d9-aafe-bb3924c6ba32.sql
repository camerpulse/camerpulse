-- Phase 2: RLS Policies for Core User Tables

-- Profiles table policies
CREATE POLICY "Profiles are publicly viewable" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Conversations and messaging policies
CREATE POLICY "Users can view conversations they participate in" 
ON public.chat_conversations 
FOR SELECT 
USING (id IN (
  SELECT conversation_id FROM conversation_participants 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create conversations" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update conversations they created or are admins of" 
ON public.chat_conversations 
FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  id IN (
    SELECT conversation_id FROM conversation_participants 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages 
FOR SELECT 
USING (conversation_id IN (
  SELECT conversation_id FROM conversation_participants 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create messages in their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND 
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = sender_id);

-- Conversation participants policies
CREATE POLICY "Users can view participants in their conversations" 
ON public.conversation_participants 
FOR SELECT 
USING (
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Conversation admins can manage participants" 
ON public.conversation_participants 
FOR ALL 
USING (
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Profile posts policies
CREATE POLICY "Posts are publicly viewable" 
ON public.profile_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own posts" 
ON public.profile_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.profile_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.profile_posts 
FOR DELETE 
USING (auth.uid() = user_id);