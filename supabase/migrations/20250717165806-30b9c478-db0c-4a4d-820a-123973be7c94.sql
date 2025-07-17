-- Create enums for event-related types
CREATE TYPE public.event_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed');
CREATE TYPE public.ticket_type AS ENUM ('regular', 'vip', 'vvip', 'livestream', 'student', 'early_bird');
CREATE TYPE public.payment_method AS ENUM ('mobile_money', 'card', 'paypal', 'crypto');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.check_in_status AS ENUM ('pending', 'checked_in', 'no_show');

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  venue_coordinates JSONB, -- {lat, lng}
  flyer_url TEXT,
  organizer_id UUID NOT NULL,
  organizer_type TEXT NOT NULL DEFAULT 'artist', -- 'artist', 'admin', 'external'
  performing_artists UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Livestream settings
  has_livestream BOOLEAN DEFAULT false,
  livestream_type TEXT, -- 'youtube', 'twitch', 'rtmp', 'native'
  livestream_url TEXT,
  livestream_password TEXT,
  
  -- Event settings
  max_attendees INTEGER,
  ticket_sale_deadline TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN DEFAULT false,
  category TEXT NOT NULL DEFAULT 'concert',
  genre TEXT,
  language TEXT DEFAULT 'en',
  age_restriction INTEGER, -- minimum age
  
  -- Admin settings
  status event_status DEFAULT 'draft',
  admin_notes TEXT,
  platform_commission_percentage DECIMAL(5,2) DEFAULT 10.00,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID
);

-- Create ticket_types table (for different ticket categories per event)
CREATE TABLE public.event_ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Regular', 'VIP', 'VVIP'
  type ticket_type NOT NULL DEFAULT 'regular',
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'XAF',
  max_quantity INTEGER NOT NULL,
  sold_quantity INTEGER DEFAULT 0,
  includes_livestream BOOLEAN DEFAULT false,
  includes_meet_greet BOOLEAN DEFAULT false,
  includes_vip_area BOOLEAN DEFAULT false,
  perks JSONB DEFAULT '[]'::jsonb, -- array of strings
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ticket_purchases table
CREATE TABLE public.ticket_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_type_id UUID NOT NULL REFERENCES public.event_ticket_types(id),
  event_id UUID NOT NULL REFERENCES public.events(id),
  buyer_id UUID, -- nullable for guest purchases
  buyer_email TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT,
  
  -- Purchase details
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  payment_reference TEXT, -- external payment ID
  
  -- QR Code data
  qr_code_data TEXT UNIQUE NOT NULL, -- encrypted unique identifier
  qr_code_url TEXT, -- URL to QR code image
  
  -- Ticket metadata
  ticket_number TEXT UNIQUE NOT NULL,
  is_transferable BOOLEAN DEFAULT true,
  is_refundable BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create check_ins table
CREATE TABLE public.event_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_purchase_id UUID NOT NULL REFERENCES public.ticket_purchases(id),
  event_id UUID NOT NULL REFERENCES public.events(id),
  checked_in_by UUID, -- organizer/staff who scanned
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  check_in_location TEXT,
  check_in_device TEXT, -- device info
  status check_in_status DEFAULT 'checked_in',
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event_earnings table
CREATE TABLE public.event_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id),
  organizer_id UUID NOT NULL,
  
  total_sales DECIMAL(12,2) NOT NULL DEFAULT 0,
  platform_commission DECIMAL(12,2) NOT NULL DEFAULT 0,
  organizer_earnings DECIMAL(12,2) NOT NULL DEFAULT 0,
  tickets_sold INTEGER DEFAULT 0,
  
  payout_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'held'
  payout_date TIMESTAMP WITH TIME ZONE,
  payout_reference TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event_analytics table
CREATE TABLE public.event_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id),
  analytics_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  tickets_sold_today INTEGER DEFAULT 0,
  revenue_today DECIMAL(10,2) DEFAULT 0,
  check_ins_today INTEGER DEFAULT 0,
  livestream_viewers INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(event_id, analytics_date)
);

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Events are viewable by everyone" ON public.events
  FOR SELECT USING (status = 'approved' OR organizer_id = auth.uid());

CREATE POLICY "Verified users can create events" ON public.events
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      EXISTS (SELECT 1 FROM artist_memberships WHERE user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "Organizers can update their events" ON public.events
  FOR UPDATE USING (organizer_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS Policies for ticket types
CREATE POLICY "Ticket types are viewable by everyone" ON public.event_ticket_types
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND status = 'approved')
  );

CREATE POLICY "Event organizers can manage ticket types" ON public.event_ticket_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND organizer_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for ticket purchases
CREATE POLICY "Users can view their own tickets" ON public.ticket_purchases
  FOR SELECT USING (buyer_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') OR
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND organizer_id = auth.uid()));

CREATE POLICY "Anyone can purchase tickets" ON public.ticket_purchases
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own tickets" ON public.ticket_purchases
  FOR UPDATE USING (buyer_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS Policies for check-ins
CREATE POLICY "Event organizers can manage check-ins" ON public.event_check_ins
  FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND organizer_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for earnings
CREATE POLICY "Organizers can view their earnings" ON public.event_earnings
  FOR SELECT USING (organizer_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS Policies for analytics
CREATE POLICY "Event organizers can view analytics" ON public.event_analytics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND organizer_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create functions for generating ticket numbers and QR codes
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  number_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate ticket number: TKT-YYYY-XXXXXXXX
    new_number := 'TKT-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    
    -- Check if number already exists
    SELECT EXISTS(SELECT 1 FROM ticket_purchases WHERE ticket_number = new_number) INTO number_exists;
    
    IF NOT number_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_qr_data()
RETURNS TEXT AS $$
DECLARE
  qr_data TEXT;
  data_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate QR data: 32 character random string
    qr_data := encode(gen_random_bytes(16), 'hex');
    
    -- Check if data already exists
    SELECT EXISTS(SELECT 1 FROM ticket_purchases WHERE qr_code_data = qr_data) INTO data_exists;
    
    IF NOT data_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN qr_data;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate ticket number and QR code
CREATE OR REPLACE FUNCTION set_ticket_defaults()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  
  IF NEW.qr_code_data IS NULL THEN
    NEW.qr_code_data := generate_qr_data();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_defaults_trigger
  BEFORE INSERT ON public.ticket_purchases
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_defaults();

-- Create function to update earnings when tickets are sold
CREATE OR REPLACE FUNCTION update_event_earnings()
RETURNS TRIGGER AS $$
DECLARE
  commission_rate DECIMAL(5,2);
  commission_amount DECIMAL(12,2);
  organizer_amount DECIMAL(12,2);
BEGIN
  -- Get commission rate from event
  SELECT platform_commission_percentage INTO commission_rate
  FROM events WHERE id = NEW.event_id;
  
  -- Calculate amounts
  commission_amount := NEW.total_amount * (commission_rate / 100);
  organizer_amount := NEW.total_amount - commission_amount;
  
  -- Update or insert earnings record
  INSERT INTO event_earnings (event_id, organizer_id, total_sales, platform_commission, organizer_earnings, tickets_sold)
  SELECT NEW.event_id, e.organizer_id, NEW.total_amount, commission_amount, organizer_amount, NEW.quantity
  FROM events e WHERE e.id = NEW.event_id
  ON CONFLICT (event_id) DO UPDATE SET
    total_sales = event_earnings.total_sales + NEW.total_amount,
    platform_commission = event_earnings.platform_commission + commission_amount,
    organizer_earnings = event_earnings.organizer_earnings + organizer_amount,
    tickets_sold = event_earnings.tickets_sold + NEW.quantity,
    updated_at = now();
  
  -- Update sold quantity in ticket types
  UPDATE event_ticket_types 
  SET sold_quantity = sold_quantity + NEW.quantity
  WHERE id = NEW.ticket_type_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_earnings_on_purchase
  AFTER INSERT ON public.ticket_purchases
  FOR EACH ROW
  WHEN (NEW.payment_status = 'completed')
  EXECUTE FUNCTION update_event_earnings();

-- Create indexes for performance
CREATE INDEX idx_events_status_date ON public.events(status, event_date);
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_events_featured ON public.events(is_featured, event_date) WHERE is_featured = true;
CREATE INDEX idx_ticket_purchases_buyer ON public.ticket_purchases(buyer_id);
CREATE INDEX idx_ticket_purchases_event ON public.ticket_purchases(event_id);
CREATE INDEX idx_ticket_purchases_qr ON public.ticket_purchases(qr_code_data);
CREATE INDEX idx_check_ins_event ON public.event_check_ins(event_id);
CREATE INDEX idx_check_ins_ticket ON public.event_check_ins(ticket_purchase_id);

-- Insert some default configuration
INSERT INTO public.camerplay_config (config_key, config_value) VALUES
('events_enabled', 'true'),
('default_commission_rate', '10.0'),
('max_tickets_per_purchase', '10'),
('ticket_transfer_enabled', 'true'),
('livestream_enabled', 'true'),
('require_event_approval', 'true')
ON CONFLICT (config_key) DO UPDATE SET 
  config_value = EXCLUDED.config_value,
  updated_at = now();