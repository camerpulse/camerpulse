-- Fix infinite recursion in conversation_participants RLS policy

-- First, create a security definer function to get user's conversation IDs
CREATE OR REPLACE FUNCTION public.get_user_conversation_ids(user_uuid UUID)
RETURNS TABLE(conversation_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT cp.conversation_id
  FROM conversation_participants cp
  WHERE cp.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;

-- Create a new policy using the security definer function
CREATE POLICY "Users can view participants of their conversations" 
ON public.conversation_participants
FOR SELECT 
USING (
  conversation_id IN (
    SELECT public.get_user_conversation_ids(auth.uid())
  )
);

-- Also fix the participants insertion policy to prevent recursion
DROP POLICY IF EXISTS "Users can add participants to conversations they admin" ON public.conversation_participants;

CREATE POLICY "Users can add participants to conversations they admin" 
ON public.conversation_participants
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id 
    AND (
      c.created_by = auth.uid() OR
      conversation_id IN (
        SELECT public.get_user_conversation_ids(auth.uid())
      )
    )
  )
);