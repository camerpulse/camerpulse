-- Minimal, safe security migration

-- Helper: is_admin using existing has_role
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(p_user_id, 'admin'::public.app_role);
$$;

-- Rate limit log table (idempotent)
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action_type text not null,
  ip_address inet,
  created_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

-- Enable RLS for rate_limit_log
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view rate limit logs
DO $$ BEGIN
  PERFORM set_config('lock_timeout','1s', true);
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rate_limit_log' AND policyname='Admins can view rate limit logs'
  ) THEN
    CREATE POLICY "Admins can view rate limit logs" ON public.rate_limit_log
    FOR SELECT USING (public.is_admin(auth.uid()));
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping policy creation for rate_limit_log due to lock or other issue: %', SQLERRM;
END $$;