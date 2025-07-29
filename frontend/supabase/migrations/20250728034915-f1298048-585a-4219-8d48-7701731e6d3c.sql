-- Fix RLS policies for shipping tables

-- 1. Add RLS policies for shipments table
CREATE POLICY "Public can view shipments by tracking number" 
ON public.shipments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage shipments" 
ON public.shipments 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- 2. Add RLS policies for shipment_status_history table
CREATE POLICY "Public can view shipment status history" 
ON public.shipment_status_history 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage status history" 
ON public.shipment_status_history 
FOR ALL 
USING (true);

-- 3. Add RLS policies for shipment_tracking_events table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shipment_tracking_events' AND table_schema = 'public') THEN
        EXECUTE 'CREATE POLICY "Public can view tracking events" ON public.shipment_tracking_events FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "System can manage tracking events" ON public.shipment_tracking_events FOR ALL USING (true)';
    END IF;
END $$;