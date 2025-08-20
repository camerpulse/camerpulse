-- Phase 1 Fix: Handle existing null created_by values first
-- Update any null created_by values with a placeholder UUID (or first user if exists)
DO $$ 
DECLARE
  default_user_id uuid;
BEGIN
  -- Try to get the first user from auth.users as default
  SELECT id INTO default_user_id FROM auth.users LIMIT 1;
  
  -- If no users exist, use a placeholder UUID
  IF default_user_id IS NULL THEN
    default_user_id := '00000000-0000-0000-0000-000000000000'::uuid;
  END IF;
  
  -- Update any existing null created_by values
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='petitions' AND column_name='created_by') THEN
    UPDATE public.petitions SET created_by = default_user_id WHERE created_by IS NULL;
  END IF;
END $$;

-- Now safely add NOT NULL constraint if column exists but isn't constrained
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='petitions' AND column_name='created_by' AND is_nullable='YES'
  ) THEN
    ALTER TABLE public.petitions ALTER COLUMN created_by SET NOT NULL;
  END IF;
END $$;

-- Add created_by column if it doesn't exist (with default)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='petitions' AND column_name='created_by'
  ) THEN
    -- Get first user or use placeholder
    DECLARE
      default_user_id uuid;
    BEGIN
      SELECT id INTO default_user_id FROM auth.users LIMIT 1;
      IF default_user_id IS NULL THEN
        default_user_id := '00000000-0000-0000-0000-000000000000'::uuid;
      END IF;
      
      EXECUTE format('ALTER TABLE public.petitions ADD COLUMN created_by uuid NOT NULL DEFAULT %L', default_user_id);
    END;
  END IF;
END $$;

-- Add other missing columns safely
DO $$ BEGIN 
  -- current_signatures
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='petitions' AND column_name='current_signatures'
  ) THEN
    ALTER TABLE public.petitions ADD COLUMN current_signatures integer NOT NULL DEFAULT 0;
  END IF;

  -- status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='petitions' AND column_name='status'
  ) THEN
    ALTER TABLE public.petitions ADD COLUMN status text NOT NULL DEFAULT 'active';
  END IF;

  -- deadline
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='petitions' AND column_name='deadline'
  ) THEN
    ALTER TABLE public.petitions ADD COLUMN deadline timestamptz;
  END IF;

  -- slug
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='petitions' AND column_name='slug'
  ) THEN
    ALTER TABLE public.petitions ADD COLUMN slug text;
  END IF;
END $$;

-- Create petition signatures table if not exists
CREATE TABLE IF NOT EXISTS public.petition_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id uuid NOT NULL,
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  email text,
  comment text,
  is_anonymous boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add constraints and indexes
DO $$ BEGIN
  -- FK for petition_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema='public' AND table_name='petition_signatures' 
    AND constraint_name='petition_signatures_petition_id_fkey'
  ) THEN
    ALTER TABLE public.petition_signatures 
    ADD CONSTRAINT petition_signatures_petition_id_fkey 
    FOREIGN KEY (petition_id) REFERENCES public.petitions(id) ON DELETE CASCADE;
  END IF;

  -- Unique signature per user per petition
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_signature_user'
  ) THEN
    ALTER TABLE public.petition_signatures 
    ADD CONSTRAINT uq_signature_user UNIQUE (petition_id, user_id);
  END IF;

  -- Unique slug for petitions
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'petitions_slug_unique'
  ) THEN
    ALTER TABLE public.petitions ADD CONSTRAINT petitions_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_petition_signatures_petition_id ON public.petition_signatures(petition_id);
CREATE INDEX IF NOT EXISTS idx_petition_signatures_user_id ON public.petition_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_petitions_status_created_at ON public.petitions(status, created_at DESC);

-- Update current_signatures based on existing data
UPDATE public.petitions 
SET current_signatures = (
  SELECT COUNT(*) 
  FROM public.petition_signatures 
  WHERE petition_signatures.petition_id = petitions.id
)
WHERE current_signatures IS NULL OR current_signatures = 0;