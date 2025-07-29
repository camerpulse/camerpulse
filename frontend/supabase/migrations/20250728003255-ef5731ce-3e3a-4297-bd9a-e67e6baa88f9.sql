-- Phase 2: Shipment Creation & Tracking System

-- Create shipments table
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE,
  shipping_company_id UUID NOT NULL REFERENCES public.shipping_companies(id) ON DELETE CASCADE,
  sender_info JSONB NOT NULL DEFAULT '{}',
  receiver_info JSONB NOT NULL DEFAULT '{}',
  package_details JSONB NOT NULL DEFAULT '{}',
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  shipping_type TEXT NOT NULL CHECK (shipping_type IN ('standard', 'express', 'overnight', 'international')),
  service_level TEXT NOT NULL CHECK (service_level IN ('economy', 'standard', 'premium', 'priority')),
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  shipping_cost DECIMAL(10,2),
  insurance_amount DECIMAL(10,2) DEFAULT 0,
  declared_value DECIMAL(10,2) DEFAULT 0,
  weight_kg DECIMAL(8,2),
  dimensions JSONB DEFAULT '{}', -- {length, width, height}
  status shipment_status NOT NULL DEFAULT 'pending',
  special_instructions TEXT,
  requires_signature BOOLEAN DEFAULT false,
  is_fragile BOOLEAN DEFAULT false,
  is_hazardous BOOLEAN DEFAULT false,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shipment status history table
CREATE TABLE public.shipment_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status shipment_status NOT NULL,
  location TEXT,
  description TEXT,
  updated_by UUID,
  updated_by_role TEXT DEFAULT 'system',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shipment tracking events table
CREATE TABLE public.shipment_tracking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('pickup', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'customs', 'returned')),
  event_description TEXT NOT NULL,
  location TEXT,
  facility_name TEXT,
  coordinates POINT,
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_public BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

-- Create shipping rates table
CREATE TABLE public.shipping_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipping_company_id UUID NOT NULL REFERENCES public.shipping_companies(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  origin_zone TEXT NOT NULL,
  destination_zone TEXT NOT NULL,
  weight_min_kg DECIMAL(8,2) NOT NULL DEFAULT 0,
  weight_max_kg DECIMAL(8,2),
  base_rate DECIMAL(10,2) NOT NULL,
  per_kg_rate DECIMAL(10,2) DEFAULT 0,
  fuel_surcharge_percent DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer notifications table
CREATE TABLE public.shipment_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  recipient_email TEXT,
  recipient_phone TEXT,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('shipment_created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'delay')),
  message_content TEXT NOT NULL,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'sms', 'push', 'webhook')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shipping zones table
CREATE TABLE public.shipping_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipping_company_id UUID NOT NULL REFERENCES public.shipping_companies(id) ON DELETE CASCADE,
  zone_name TEXT NOT NULL,
  zone_code TEXT NOT NULL,
  regions TEXT[] NOT NULL,
  cities TEXT[] DEFAULT '{}',
  postal_codes TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shipping_company_id, zone_code)
);

-- Add indexes for better performance
CREATE INDEX idx_shipments_tracking_number ON public.shipments(tracking_number);
CREATE INDEX idx_shipments_company_id ON public.shipments(shipping_company_id);
CREATE INDEX idx_shipments_status ON public.shipments(status);
CREATE INDEX idx_shipments_created_at ON public.shipments(created_at);
CREATE INDEX idx_shipment_status_history_shipment_id ON public.shipment_status_history(shipment_id);
CREATE INDEX idx_shipment_tracking_events_shipment_id ON public.shipment_tracking_events(shipment_id);
CREATE INDEX idx_shipment_tracking_events_timestamp ON public.shipment_tracking_events(event_timestamp);
CREATE INDEX idx_shipping_rates_company_zones ON public.shipping_rates(shipping_company_id, origin_zone, destination_zone);
CREATE INDEX idx_shipment_notifications_shipment_id ON public.shipment_notifications(shipment_id);

-- Add RLS policies
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

-- Shipments policies
CREATE POLICY "Shipping companies can manage their shipments" 
ON public.shipments FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.shipping_company_staff 
  WHERE user_id = auth.uid() AND company_id = shipping_company_id AND is_active = true
));

CREATE POLICY "Public can view shipment tracking info" 
ON public.shipments FOR SELECT
USING (true);

-- Shipment status history policies
CREATE POLICY "Shipping companies can manage shipment status history" 
ON public.shipment_status_history FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.shipping_company_staff scs
  JOIN public.shipments s ON s.shipping_company_id = scs.company_id
  WHERE scs.user_id = auth.uid() AND s.id = shipment_status_history.shipment_id AND scs.is_active = true
));

CREATE POLICY "Public can view shipment status history" 
ON public.shipment_status_history FOR SELECT
USING (true);

-- Tracking events policies
CREATE POLICY "Shipping companies can manage tracking events" 
ON public.shipment_tracking_events FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.shipping_company_staff scs
  JOIN public.shipments s ON s.shipping_company_id = scs.company_id
  WHERE scs.user_id = auth.uid() AND s.id = shipment_tracking_events.shipment_id AND scs.is_active = true
));

CREATE POLICY "Public can view public tracking events" 
ON public.shipment_tracking_events FOR SELECT
USING (is_public = true);

-- Shipping rates policies
CREATE POLICY "Shipping companies can manage their rates" 
ON public.shipping_rates FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.shipping_company_staff 
  WHERE user_id = auth.uid() AND company_id = shipping_company_id AND is_active = true
));

CREATE POLICY "Public can view active shipping rates" 
ON public.shipping_rates FOR SELECT
USING (is_active = true);

-- Notifications policies
CREATE POLICY "Shipping companies can manage notifications for their shipments" 
ON public.shipment_notifications FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.shipping_company_staff scs
  JOIN public.shipments s ON s.shipping_company_id = scs.company_id
  WHERE scs.user_id = auth.uid() AND s.id = shipment_notifications.shipment_id AND scs.is_active = true
));

-- Shipping zones policies
CREATE POLICY "Shipping companies can manage their zones" 
ON public.shipping_zones FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.shipping_company_staff 
  WHERE user_id = auth.uid() AND company_id = shipping_company_id AND is_active = true
));

CREATE POLICY "Public can view active shipping zones" 
ON public.shipping_zones FOR SELECT
USING (is_active = true);

-- Add triggers for updated_at
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shipping_updated_at();

CREATE TRIGGER update_shipping_rates_updated_at
  BEFORE UPDATE ON public.shipping_rates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shipping_updated_at();

CREATE TRIGGER update_shipping_zones_updated_at
  BEFORE UPDATE ON public.shipping_zones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shipping_updated_at();

-- Function to generate tracking numbers
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    new_number := 'TRK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    
    IF NOT EXISTS (SELECT 1 FROM public.shipments WHERE tracking_number = new_number) THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Unable to generate unique tracking number';
    END IF;
  END LOOP;
  
  RETURN new_number;
END;
$$;

-- Trigger to set tracking number
CREATE OR REPLACE FUNCTION public.set_tracking_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
    NEW.tracking_number := public.generate_tracking_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_shipment_tracking_number
  BEFORE INSERT ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tracking_number();

-- Function to add status history when shipment status changes
CREATE OR REPLACE FUNCTION public.update_shipment_status_history()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.shipment_status_history (
      shipment_id, 
      status, 
      description,
      updated_by
    ) VALUES (
      NEW.id, 
      NEW.status, 
      'Status updated to ' || NEW.status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER shipment_status_change_trigger
  AFTER UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shipment_status_history();