-- Secure tables with RLS disabled in public schema
-- 1) Enable RLS and add admin-only policies on non-backup operational tables
ALTER TABLE IF EXISTS public.cleanup_scan_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Admins can manage cleanup_scan_reports"
  ON public.cleanup_scan_reports
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE IF EXISTS public.cleanup_scan_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Admins can manage cleanup_scan_runs"
  ON public.cleanup_scan_runs
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE IF EXISTS public.user_migration_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Admins can manage user_migration_log"
  ON public.user_migration_log
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2) Batch-enable RLS for all backup tables and add admin-only policies
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name LIKE 'cleanup_backup__%'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.table_name);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "Admins can manage %I" ON public.%I FOR ALL USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''));', r.table_name, r.table_name);
  END LOOP;
END $$;
