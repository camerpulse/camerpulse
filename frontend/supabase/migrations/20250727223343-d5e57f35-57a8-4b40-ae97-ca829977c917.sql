-- Enable realtime for marketplace tables
ALTER TABLE marketplace_products REPLICA IDENTITY FULL;
ALTER TABLE marketplace_vendors REPLICA IDENTITY FULL;
ALTER TABLE marketplace_orders REPLICA IDENTITY FULL;

-- Add realtime tables to publication
ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_products;
ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_vendors;
ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_orders;

-- Create vendor presence tracking table
CREATE TABLE vendor_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES marketplace_vendors(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'away')),
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    device_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(vendor_id)
);

-- Create real-time notifications table
CREATE TABLE realtime_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory alerts table
CREATE TABLE inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES marketplace_vendors(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'restock', 'price_change')),
    threshold_value INTEGER,
    current_value INTEGER,
    message TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies
ALTER TABLE vendor_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;

-- Vendor presence policies
CREATE POLICY "Vendors can manage their own presence" ON vendor_presence
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public can view vendor presence" ON vendor_presence
    FOR SELECT USING (true);

-- Notification policies
CREATE POLICY "Users can view their own notifications" ON realtime_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON realtime_notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can mark their notifications as read" ON realtime_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Inventory alert policies
CREATE POLICY "Vendors can view alerts for their products" ON inventory_alerts
    FOR SELECT USING (
        vendor_id IN (SELECT id FROM marketplace_vendors WHERE user_id = auth.uid())
    );

CREATE POLICY "System can manage inventory alerts" ON inventory_alerts
    FOR ALL WITH CHECK (true);

-- Enable realtime for new tables
ALTER TABLE vendor_presence REPLICA IDENTITY FULL;
ALTER TABLE realtime_notifications REPLICA IDENTITY FULL;
ALTER TABLE inventory_alerts REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE vendor_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE realtime_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_alerts;