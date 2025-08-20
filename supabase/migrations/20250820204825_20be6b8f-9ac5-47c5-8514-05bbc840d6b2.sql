-- Phase 1 Completion: Triggers, Functions, and RLS Policies

-- Validation triggers (use triggers instead of CHECKs for time-based rules)
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

-- Updated_at trigger for petitions
DROP TRIGGER IF EXISTS update_petitions_updated_at ON public.petitions;
CREATE TRIGGER update_petitions_updated_at
BEFORE UPDATE ON public.petitions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Automatic signature count maintenance
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

-- Create has_role function if it doesn't exist (needed for RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Enable RLS
ALTER TABLE public.petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_signatures ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent cleanup)
DROP POLICY IF EXISTS "Public can view active petitions" ON public.petitions;
DROP POLICY IF EXISTS "Users can create petitions" ON public.petitions;
DROP POLICY IF EXISTS "Owners or admins can update petitions" ON public.petitions;
DROP POLICY IF EXISTS "Users can sign petitions" ON public.petition_signatures;
DROP POLICY IF EXISTS "Signers can view their own signatures" ON public.petition_signatures;
DROP POLICY IF EXISTS "Creators and admins can view petition signatures" ON public.petition_signatures;

-- Petitions policies
CREATE POLICY "Public can view active petitions"
ON public.petitions
FOR SELECT
USING (
  status IN ('active','approved','open')
  OR created_by = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can create petitions"
ON public.petitions
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Owners or admins can update petitions"
ON public.petitions
FOR UPDATE
USING (
  created_by = auth.uid() 
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Petition signatures policies
CREATE POLICY "Users can sign petitions"
ON public.petition_signatures
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

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
      AND (p.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Enable realtime for petitions (for live signature updates)
ALTER TABLE public.petitions REPLICA IDENTITY FULL;
ALTER TABLE public.petition_signatures REPLICA IDENTITY FULL;

-- Add tables to realtime publication
DO $$ BEGIN
  -- Add petitions to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'petitions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.petitions;
  END IF;

  -- Add petition_signatures to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'petition_signatures'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.petition_signatures;
  END IF;
END $$;