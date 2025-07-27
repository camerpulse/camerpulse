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