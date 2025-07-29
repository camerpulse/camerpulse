-- Enable realtime for marketplace tables
ALTER TABLE marketplace_products REPLICA IDENTITY FULL;
ALTER TABLE marketplace_vendors REPLICA IDENTITY FULL;
ALTER TABLE marketplace_orders REPLICA IDENTITY FULL;
ALTER TABLE product_views REPLICA IDENTITY FULL;
ALTER TABLE recommendation_events REPLICA IDENTITY FULL;

-- Add realtime tables to publication
ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_products;
ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_vendors;
ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE product_views;
ALTER PUBLICATION supabase_realtime ADD TABLE recommendation_events;

-- Create vendor presence tracking table
CREATE TABLE IF NOT EXISTS vendor_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'away')),
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    device_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(vendor_id)
);

-- Create real-time notifications table
CREATE TABLE IF NOT EXISTS realtime_notifications (
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
CREATE TABLE IF NOT EXISTS inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    vendor_id UUID NOT NULL,
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
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM marketplace_vendors mv 
            WHERE mv.id = vendor_presence.vendor_id 
            AND mv.user_id = auth.uid()
        )
    );

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
        EXISTS (
            SELECT 1 FROM marketplace_vendors mv 
            WHERE mv.id = inventory_alerts.vendor_id 
            AND mv.user_id = auth.uid()
        )
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

-- Create functions for real-time updates
CREATE OR REPLACE FUNCTION update_vendor_presence(
    p_vendor_id UUID,
    p_status TEXT,
    p_device_info JSONB DEFAULT '{}'
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO vendor_presence (vendor_id, user_id, status, device_info)
    VALUES (p_vendor_id, auth.uid(), p_status, p_device_info)
    ON CONFLICT (vendor_id) 
    DO UPDATE SET 
        status = EXCLUDED.status,
        device_info = EXCLUDED.device_info,
        last_seen = now(),
        updated_at = now();
END;
$$;

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_realtime_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT '{}',
    p_priority TEXT DEFAULT 'medium',
    p_action_url TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO realtime_notifications (
        user_id, notification_type, title, message, data, priority, action_url
    ) VALUES (
        p_user_id, p_type, p_title, p_message, p_data, p_priority, p_action_url
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Function to check inventory and create alerts
CREATE OR REPLACE FUNCTION check_inventory_levels()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    product_record RECORD;
BEGIN
    FOR product_record IN 
        SELECT id, vendor_id, title, stock_quantity
        FROM marketplace_products 
        WHERE stock_quantity <= 5 AND stock_quantity > 0
    LOOP
        INSERT INTO inventory_alerts (
            product_id, vendor_id, alert_type, current_value, message
        ) VALUES (
            product_record.id,
            product_record.vendor_id,
            'low_stock',
            product_record.stock_quantity,
            'Product "' || product_record.title || '" has low stock: ' || product_record.stock_quantity || ' remaining'
        ) ON CONFLICT DO NOTHING;
        
        -- Create notification for vendor
        PERFORM create_realtime_notification(
            (SELECT user_id FROM marketplace_vendors WHERE id = product_record.vendor_id),
            'inventory_alert',
            'Low Stock Alert',
            'Product "' || product_record.title || '" has low stock',
            jsonb_build_object('product_id', product_record.id, 'stock', product_record.stock_quantity),
            'high'
        );
    END LOOP;
    
    -- Check for out of stock
    FOR product_record IN 
        SELECT id, vendor_id, title, stock_quantity
        FROM marketplace_products 
        WHERE stock_quantity = 0
    LOOP
        INSERT INTO inventory_alerts (
            product_id, vendor_id, alert_type, current_value, message
        ) VALUES (
            product_record.id,
            product_record.vendor_id,
            'out_of_stock',
            0,
            'Product "' || product_record.title || '" is out of stock'
        ) ON CONFLICT DO NOTHING;
        
        -- Create notification for vendor
        PERFORM create_realtime_notification(
            (SELECT user_id FROM marketplace_vendors WHERE id = product_record.vendor_id),
            'inventory_alert',
            'Out of Stock Alert',
            'Product "' || product_record.title || '" is out of stock',
            jsonb_build_object('product_id', product_record.id),
            'urgent'
        );
    END LOOP;
END;
$$;

-- Trigger to update vendor presence timestamp
CREATE OR REPLACE FUNCTION update_vendor_presence_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    NEW.last_seen = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER vendor_presence_update_trigger
    BEFORE UPDATE ON vendor_presence
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_presence_timestamp();