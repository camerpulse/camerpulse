-- Security batch: Add RLS policies for tables with RLS enabled but no policies

-- payment_disputes
ALTER TABLE IF EXISTS public.payment_disputes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payment_disputes'
  ) THEN
    CREATE POLICY "Users can view their disputes" ON public.payment_disputes
    FOR SELECT USING (
      public.is_admin(auth.uid()) OR customer_id = auth.uid() OR vendor_id = auth.uid()
    );
    CREATE POLICY "Customers or vendors can create disputes" ON public.payment_disputes
    FOR INSERT WITH CHECK (
      customer_id = auth.uid() OR vendor_id = auth.uid()
    );
    CREATE POLICY "Admins can manage disputes" ON public.payment_disputes
    FOR ALL USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- api_performance_logs (admin-only visibility)
ALTER TABLE IF EXISTS public.api_performance_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='api_performance_logs'
  ) THEN
    CREATE POLICY "Admins can view API performance logs" ON public.api_performance_logs
    FOR SELECT USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- moderation_assignments
ALTER TABLE IF EXISTS public.moderation_assignments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='moderation_assignments'
  ) THEN
    CREATE POLICY "Moderators can view their assignments" ON public.moderation_assignments
    FOR SELECT USING (public.is_admin(auth.uid()) OR moderator_id = auth.uid());
    CREATE POLICY "Admins manage moderation assignments" ON public.moderation_assignments
    FOR ALL USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- civic_content_reports
ALTER TABLE IF EXISTS public.civic_content_reports ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='civic_content_reports'
  ) THEN
    CREATE POLICY "Reporters can view their reports" ON public.civic_content_reports
    FOR SELECT USING (public.is_admin(auth.uid()) OR reporter_id = auth.uid());
    CREATE POLICY "Users can create content reports" ON public.civic_content_reports
    FOR INSERT WITH CHECK (reporter_id = auth.uid());
    CREATE POLICY "Admins manage content reports" ON public.civic_content_reports
    FOR ALL USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- suggestion_activity_log
ALTER TABLE IF EXISTS public.suggestion_activity_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='suggestion_activity_log'
  ) THEN
    CREATE POLICY "Users can view their suggestion activity" ON public.suggestion_activity_log
    FOR SELECT USING (public.is_admin(auth.uid()) OR user_id = auth.uid());
    CREATE POLICY "Users can log their suggestion activity" ON public.suggestion_activity_log
    FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- vendor_ratings_summary (public viewable aggregate)
ALTER TABLE IF EXISTS public.vendor_ratings_summary ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vendor_ratings_summary'
  ) THEN
    CREATE POLICY "Vendor ratings are publicly viewable" ON public.vendor_ratings_summary
    FOR SELECT USING (true);
    CREATE POLICY "Admins can manage vendor ratings summary" ON public.vendor_ratings_summary
    FOR ALL USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- poll_view_log (admin-only visibility)
ALTER TABLE IF EXISTS public.poll_view_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='poll_view_log'
  ) THEN
    CREATE POLICY "Admins can view poll view logs" ON public.poll_view_log
    FOR SELECT USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- company_tenants (admin-only)
ALTER TABLE IF EXISTS public.company_tenants ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='company_tenants'
  ) THEN
    CREATE POLICY "Admins can view company tenants" ON public.company_tenants
    FOR SELECT USING (public.is_admin(auth.uid()));
    CREATE POLICY "Admins can manage company tenants" ON public.company_tenants
    FOR ALL USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- fleet_vehicles (admin-only)
ALTER TABLE IF EXISTS public.fleet_vehicles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fleet_vehicles'
  ) THEN
    CREATE POLICY "Admins can view fleet vehicles" ON public.fleet_vehicles
    FOR SELECT USING (public.is_admin(auth.uid()));
    CREATE POLICY "Admins can manage fleet vehicles" ON public.fleet_vehicles
    FOR ALL USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- vehicle_tracking (admin-only)
ALTER TABLE IF EXISTS public.vehicle_tracking ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_tracking'
  ) THEN
    CREATE POLICY "Admins can view vehicle tracking" ON public.vehicle_tracking
    FOR SELECT USING (public.is_admin(auth.uid()));
  END IF;
END $$;