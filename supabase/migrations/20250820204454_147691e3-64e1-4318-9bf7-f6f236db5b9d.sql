-- Phase 1: Critical Database Security & RLS for Petitions
-- 1) Create tables if they don't exist

-- Petitions table
CREATE TABLE IF NOT EXISTS public.petitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  goal_signatures integer NOT NULL DEFAULT 100,
  current_signatures integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  deadline timestamptz,
  created_by uuid NOT NULL,
  slug text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure useful columns exist (idempotent guards for legacy schemas)
DO $$ BEGIN 
  -- created_by
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='petitions' AND column_name='created_by'
  ) THEN
    ALTER TABLE public.petitions ADD COLUMN created_by uuid NOT NULL;
  END IF;

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

-- Petition signatures table
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

-- Add FK for petition_id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema='public' AND table_name='petition_signatures' AND constraint_name='petition_signatures_petition_id_fkey'
  ) THEN
    ALTER TABLE public.petition_signatures 
    ADD CONSTRAINT petition_signatures_petition_id_fkey 
    FOREIGN KEY (petition_id) REFERENCES public.petitions(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Unique signature per user per petition
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_signature_user'
  ) THEN
    ALTER TABLE public.petition_signatures 
    ADD CONSTRAINT uq_signature_user UNIQUE (petition_id, user_id);
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_petition_signatures_petition_id ON public.petition_signatures(petition_id);
CREATE INDEX IF NOT EXISTS idx_petition_signatures_user_id ON public.petition_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_petitions_status_created_at ON public.petitions(status, created_at DESC);

-- Unique slug for petitions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'petitions_slug_unique'
  ) THEN
    ALTER TABLE public.petitions ADD CONSTRAINT petitions_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- 2) Validation triggers (use triggers instead of CHECKs for time-based rules)
CREATE OR REPLACE FUNCTION public.validate_petition_deadline()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.deadline IS NOT NULL AND NEW.deadline < now() THEN
    RAISE EXCEPTION 'deadline cannot be in the past';
  END IF;
  IF NEW.goal_signatures IS NOT NULL AND NEW.goal_signatures < 1 THEN
    RAISE EXCEPTION 'goal_signatures must be >= 1';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_petition_deadline_biub ON public.petitions;
CREATE TRIGGER validate_petition_deadline_biub
BEFORE INSERT OR UPDATE ON public.petitions
FOR EACH ROW EXECUTE FUNCTION public.validate_petition_deadline();

-- Updated_at trigger for petitions (uses existing update_updated_at_column function)
DROP TRIGGER IF EXISTS update_petitions_updated_at ON public.petitions;
CREATE TRIGGER update_petitions_updated_at
BEFORE UPDATE ON public.petitions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Automatic signature count maintenance
CREATE OR REPLACE FUNCTION public.update_petition_signature_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.petitions 
      SET current_signatures = COALESCE(current_signatures, 0) + 1,
          updated_at = now()
    WHERE id = NEW.petition_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.petitions 
      SET current_signatures = GREATEST(0, COALESCE(current_signatures, 0) - 1),
          updated_at = now()
    WHERE id = OLD.petition_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.petition_id IS DISTINCT FROM OLD.petition_id THEN
      UPDATE public.petitions 
        SET current_signatures = GREATEST(0, COALESCE(current_signatures, 0) - 1),
            updated_at = now()
      WHERE id = OLD.petition_id;
      UPDATE public.petitions 
        SET current_signatures = COALESCE(current_signatures, 0) + 1,
            updated_at = now()
      WHERE id = NEW.petition_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS petition_signatures_counts_aiud ON public.petition_signatures;
CREATE TRIGGER petition_signatures_counts_aiud
AFTER INSERT OR UPDATE OR DELETE ON public.petition_signatures
FOR EACH ROW EXECUTE FUNCTION public.update_petition_signature_counts();

-- 4) RLS: Enable and secure policies
ALTER TABLE public.petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_signatures ENABLE ROW LEVEL SECURITY;

-- Drop potentially conflicting existing policies (idempotent)
DO $$ BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='petitions' AND policyname='Public can view active petitions';
  IF FOUND THEN EXECUTE 'DROP POLICY "Public can view active petitions" ON public.petitions'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='petitions' AND policyname='Users can create petitions';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can create petitions" ON public.petitions'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='petitions' AND policyname='Owners or admins can update petitions';
  IF FOUND THEN EXECUTE 'DROP POLICY "Owners or admins can update petitions" ON public.petitions'; END IF;

  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='petition_signatures' AND policyname='Users can sign petitions';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can sign petitions" ON public.petition_signatures'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='petition_signatures' AND policyname='Signers can view their own signatures';
  IF FOUND THEN EXECUTE 'DROP POLICY "Signers can view their own signatures" ON public.petition_signatures'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='petition_signatures' AND policyname='Creators and admins can view petition signatures';
  IF FOUND THEN EXECUTE 'DROP POLICY "Creators and admins can view petition signatures" ON public.petition_signatures'; END IF;
END $$;

-- Petitions policies
CREATE POLICY "Public can view active petitions"
ON public.petitions
FOR SELECT
USING (
  status IN ('active','approved','open')
  OR created_by = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can create petitions"
ON public.petitions
FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners or admins can update petitions"
ON public.petitions
FOR UPDATE
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Petition signatures policies
CREATE POLICY "Users can sign petitions"
ON public.petition_signatures
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Signers can view their own signatures"
ON public.petition_signatures
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Creators and admins can view petition signatures"
ON public.petition_signatures
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.petitions p
    WHERE p.id = petition_signatures.petition_id
      AND (p.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);
