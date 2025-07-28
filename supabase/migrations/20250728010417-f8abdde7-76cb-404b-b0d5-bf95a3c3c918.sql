-- Create notification types enum
CREATE TYPE notification_type AS ENUM (
  'shipment_created',
  'shipment_picked_up',
  'shipment_in_transit',
  'shipment_out_for_delivery',
  'shipment_delivered',
  'shipment_delayed',
  'shipment_exception',
  'payment_received',
  'review_request'
);

-- Create notification channels enum
CREATE TYPE notification_channel AS ENUM (
  'email',
  'sms',
  'push',
  'in_app'
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type notification_type NOT NULL,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  frequency TEXT NOT NULL DEFAULT 'immediate',
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_type)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  channels notification_channel[] NOT NULL DEFAULT ARRAY['in_app'],
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  sent_via_email BOOLEAN NOT NULL DEFAULT false,
  sent_via_sms BOOLEAN NOT NULL DEFAULT false,
  sent_via_push BOOLEAN NOT NULL DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  sms_sent_at TIMESTAMP WITH TIME ZONE,
  push_sent_at TIMESTAMP WITH TIME ZONE,
  related_shipment_id UUID,
  related_order_id UUID,
  priority TEXT NOT NULL DEFAULT 'medium',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification templates table
CREATE TABLE public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  template_name TEXT NOT NULL,
  subject_template TEXT,
  body_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_type, channel, template_name)
);

-- Create notification campaigns table
CREATE TABLE public.notification_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  description TEXT,
  notification_type notification_type NOT NULL,
  target_criteria JSONB NOT NULL DEFAULT '{}',
  template_id UUID REFERENCES notification_templates(id),
  schedule_type TEXT NOT NULL DEFAULT 'immediate',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft',
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification events table for tracking
CREATE TABLE public.notification_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  channel notification_channel NOT NULL,
  event_data JSONB DEFAULT '{}',
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  external_id TEXT,
  error_message TEXT
);

-- Add RLS policies for notification preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notification preferences" 
ON public.notification_preferences 
FOR ALL 
USING (auth.uid() = user_id);

-- Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add RLS policies for notification templates
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are viewable by authenticated users" 
ON public.notification_templates 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage templates" 
ON public.notification_templates 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Add RLS policies for notification campaigns
ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage campaigns" 
ON public.notification_campaigns 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Add RLS policies for notification events
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events for their notifications" 
ON public.notification_events 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM notifications 
  WHERE id = notification_events.notification_id 
  AND user_id = auth.uid()
));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_updated_at();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_updated_at();

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_updated_at();

CREATE TRIGGER update_notification_campaigns_updated_at
  BEFORE UPDATE ON public.notification_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_updated_at();

-- Create function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_notification_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}',
  p_related_shipment_id UUID DEFAULT NULL,
  p_related_order_id UUID DEFAULT NULL,
  p_priority TEXT DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_preferences RECORD;
  v_channels notification_channel[] := ARRAY[]::notification_channel[];
BEGIN
  -- Get user preferences for this notification type
  SELECT * INTO v_preferences
  FROM notification_preferences 
  WHERE user_id = p_user_id AND notification_type = p_notification_type;
  
  -- If no preferences exist, use defaults
  IF NOT FOUND THEN
    v_channels := ARRAY['in_app', 'email'];
  ELSE
    -- Build channels array based on preferences
    IF v_preferences.in_app_enabled THEN
      v_channels := array_append(v_channels, 'in_app');
    END IF;
    IF v_preferences.email_enabled THEN
      v_channels := array_append(v_channels, 'email');
    END IF;
    IF v_preferences.sms_enabled THEN
      v_channels := array_append(v_channels, 'sms');
    END IF;
    IF v_preferences.push_enabled THEN
      v_channels := array_append(v_channels, 'push');
    END IF;
  END IF;
  
  -- Create the notification
  INSERT INTO notifications (
    user_id,
    notification_type,
    title,
    message,
    data,
    channels,
    related_shipment_id,
    related_order_id,
    priority
  ) VALUES (
    p_user_id,
    p_notification_type,
    p_title,
    p_message,
    p_data,
    v_channels,
    p_related_shipment_id,
    p_related_order_id,
    p_priority
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle shipment status change notifications
CREATE OR REPLACE FUNCTION public.handle_shipment_status_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id UUID;
  v_vendor_id UUID;
  v_notification_title TEXT;
  v_notification_message TEXT;
  v_notification_type notification_type;
BEGIN
  -- Determine notification type based on status
  CASE NEW.status
    WHEN 'pending' THEN
      v_notification_type := 'shipment_created';
      v_notification_title := 'Shipment Created';
      v_notification_message := 'Your shipment has been created with tracking number ' || NEW.tracking_number;
    WHEN 'picked_up' THEN
      v_notification_type := 'shipment_picked_up';
      v_notification_title := 'Package Picked Up';
      v_notification_message := 'Your package has been picked up and is now in transit.';
    WHEN 'in_transit' THEN
      v_notification_type := 'shipment_in_transit';
      v_notification_title := 'Package In Transit';
      v_notification_message := 'Your package is on its way to the destination.';
    WHEN 'out_for_delivery' THEN
      v_notification_type := 'shipment_out_for_delivery';
      v_notification_title := 'Out for Delivery';
      v_notification_message := 'Your package is out for delivery and will arrive today.';
    WHEN 'delivered' THEN
      v_notification_type := 'shipment_delivered';
      v_notification_title := 'Package Delivered';
      v_notification_message := 'Your package has been successfully delivered.';
    WHEN 'delayed' THEN
      v_notification_type := 'shipment_delayed';
      v_notification_title := 'Shipment Delayed';
      v_notification_message := 'Your shipment has been delayed. We apologize for the inconvenience.';
    WHEN 'exception' THEN
      v_notification_type := 'shipment_exception';
      v_notification_title := 'Shipment Exception';
      v_notification_message := 'There was an issue with your shipment. Please contact support.';
    ELSE
      RETURN NEW;
  END CASE;
  
  -- Get customer and vendor IDs
  IF NEW.order_id IS NOT NULL THEN
    SELECT buyer_id, vendor_id INTO v_customer_id, v_vendor_id
    FROM marketplace_orders mo
    LEFT JOIN marketplace_vendors mv ON mo.vendor_id = mv.id
    WHERE mo.id = NEW.order_id;
  END IF;
  
  -- Create notification for customer if available
  IF v_customer_id IS NOT NULL THEN
    PERFORM create_notification(
      v_customer_id,
      v_notification_type,
      v_notification_title,
      v_notification_message,
      jsonb_build_object(
        'tracking_number', NEW.tracking_number,
        'shipment_id', NEW.id,
        'order_id', NEW.order_id,
        'status', NEW.status
      ),
      NEW.id,
      NEW.order_id,
      CASE WHEN NEW.status IN ('delayed', 'exception') THEN 'high' ELSE 'medium' END
    );
  END IF;
  
  -- Create notification for vendor if available
  IF v_vendor_id IS NOT NULL THEN
    PERFORM create_notification(
      (SELECT user_id FROM marketplace_vendors WHERE id = v_vendor_id),
      v_notification_type,
      'Shipment Status Update',
      'Shipment ' || NEW.tracking_number || ' status changed to ' || NEW.status,
      jsonb_build_object(
        'tracking_number', NEW.tracking_number,
        'shipment_id', NEW.id,
        'order_id', NEW.order_id,
        'status', NEW.status
      ),
      NEW.id,
      NEW.order_id,
      'low'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for shipment status changes
CREATE TRIGGER shipment_status_notification_trigger
  AFTER UPDATE ON shipments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_shipment_status_notification();

-- Insert default notification templates
INSERT INTO notification_templates (template_type, channel, template_name, subject_template, body_template, variables) VALUES
('shipment_created', 'email', 'default', 'Shipment Created - {{tracking_number}}', 
 'Your shipment has been created with tracking number {{tracking_number}}. You can track its progress at {{tracking_url}}.', 
 '{"tracking_number": "string", "tracking_url": "string"}'),
 
('shipment_delivered', 'email', 'default', 'Package Delivered - {{tracking_number}}', 
 'Great news! Your package with tracking number {{tracking_number}} has been successfully delivered.', 
 '{"tracking_number": "string", "delivery_time": "string"}'),
 
('shipment_delayed', 'email', 'default', 'Shipment Delayed - {{tracking_number}}', 
 'We apologize, but your shipment {{tracking_number}} has been delayed. New estimated delivery: {{new_delivery_date}}.', 
 '{"tracking_number": "string", "new_delivery_date": "string"}'),

('shipment_out_for_delivery', 'email', 'default', 'Out for Delivery - {{tracking_number}}', 
 'Your package {{tracking_number}} is out for delivery and should arrive today between {{delivery_window}}.', 
 '{"tracking_number": "string", "delivery_window": "string"}'),

('shipment_exception', 'email', 'default', 'Shipment Exception - {{tracking_number}}', 
 'There was an issue with your shipment {{tracking_number}}. Please contact our support team for assistance.', 
 '{"tracking_number": "string", "support_contact": "string"}');

-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;