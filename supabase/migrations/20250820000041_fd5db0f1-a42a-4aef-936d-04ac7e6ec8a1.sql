-- Secure tables with RLS disabled in public schema
-- 1) Enable RLS and add admin-only policies on non-backup operational tables
ALTER TABLE IF EXISTS public.cleanup_scan_reports ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'cleanup_scan_reports' AND policyname = 'Admins can manage cleanup_scan_reports'
  ) THEN
    CREATE POLICY "Admins can manage cleanup_scan_reports"
      ON public.cleanup_scan_reports
      FOR ALL
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

ALTER TABLE IF EXISTS public.cleanup_scan_runs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'cleanup_scan_runs' AND policyname = 'Admins can manage cleanup_scan_runs'
  ) THEN
    CREATE POLICY "Admins can manage cleanup_scan_runs"
      ON public.cleanup_scan_runs
      FOR ALL
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

ALTER TABLE IF EXISTS public.user_migration_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_migration_log' AND policyname = 'Admins can manage user_migration_log'
  ) THEN
    CREATE POLICY "Admins can manage user_migration_log"
      ON public.user_migration_log
      FOR ALL
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- 2) Batch-enable RLS for all backup tables and add admin-only policies
DO $$
DECLARE 
  r RECORD;
  policy_name TEXT;
BEGIN
  FOR r IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name LIKE 'cleanup_backup__%'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.table_name);
    
    policy_name := format('Admins can manage %s', r.table_name);
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = r.table_name AND policyname = policy_name
    ) THEN
      EXECUTE format('CREATE POLICY "%s" ON public.%I FOR ALL USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''));',
        policy_name, r.table_name);
    END IF;
  END LOOP;
END $$;