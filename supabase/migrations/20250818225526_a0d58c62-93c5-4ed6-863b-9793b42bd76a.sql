-- Remove legacy permissive INSERT policy that allowed self-assigning 'user' role
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_roles' 
      AND policyname = 'Authenticated users can insert their own role'
  ) THEN
    DROP POLICY "Authenticated users can insert their own role" ON public.user_roles;
  END IF;
END $$;