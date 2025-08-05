-- First, let's update NULL user_id values in politicians table
-- We'll assign them to a system admin user or remove invalid entries

-- Update NULL user_id values to the first admin user, or create a placeholder
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Try to find an existing admin user
    SELECT user_id INTO admin_user_id 
    FROM public.user_roles 
    WHERE role = 'admin'::app_role 
    LIMIT 1;
    
    -- If no admin found, we'll delete the orphaned politicians records
    IF admin_user_id IS NULL THEN
        DELETE FROM public.politicians WHERE user_id IS NULL;
    ELSE
        -- Update NULL user_id to first admin user
        UPDATE public.politicians 
        SET user_id = admin_user_id 
        WHERE user_id IS NULL;
    END IF;
END $$;

-- Now we can safely make user_id NOT NULL
ALTER TABLE public.politicians 
ALTER COLUMN user_id SET NOT NULL;

-- Add RLS policies for politicians
CREATE POLICY "Politicians are publicly readable"
ON public.politicians
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage politicians"
ON public.politicians
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can update politicians"
ON public.politicians
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);