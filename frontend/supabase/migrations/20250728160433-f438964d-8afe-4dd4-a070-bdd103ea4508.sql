-- Make created_by nullable for system templates and add default templates
ALTER TABLE label_templates ALTER COLUMN created_by DROP NOT NULL;

-- Insert 20 diverse shipping label templates with sample data
INSERT INTO label_templates (template_name, template_config, template_type, is_active) VALUES
-- Standard Templates  
('Standard Shipping Label', '{"layout": "standard", "fields": [{"id": "sender", "type": "text", "position": {"x": 20, "y": 20}, "size": {"width": 200, "height": 80}}, {"id": "receiver", "type": "text", "position": {"x": 20, "y": 120}, "size": {"width": 200, "height": 80}}, {"id": "tracking", "type": "barcode", "position": {"x": 250, "y": 20}, "size": {"width": 150, "height": 40}}, {"id": "qr_code", "type": "qr_code", "position": {"x": 250, "y": 80}, "size": {"width": 60, "height": 60}}], "colors": {"primary": "#1f2937", "secondary": "#6b7280"}}', 'shipping_label', true),
('Express Delivery Label', '{"layout": "express", "fields": [{"id": "priority_badge", "type": "text", "position": {"x": 10, "y": 10}, "size": {"width": 100, "height": 30}}, {"id": "sender", "type": "text", "position": {"x": 20, "y": 50}, "size": {"width": 180, "height": 70}}, {"id": "receiver", "type": "text", "position": {"x": 20, "y": 130}, "size": {"width": 180, "height": 70}}, {"id": "tracking", "type": "barcode", "position": {"x": 220, "y": 50}, "size": {"width": 120, "height": 35}}], "colors": {"primary": "#dc2626", "secondary": "#fca5a5"}}', 'shipping_label', true),
('International Shipping', '{"layout": "international", "fields": [{"id": "customs_info", "type": "text", "position": {"x": 10, "y": 10}, "size": {"width": 200, "height": 40}}, {"id": "sender", "type": "text", "position": {"x": 20, "y": 60}, "size": {"width": 160, "height": 60}}, {"id": "receiver", "type": "text", "position": {"x": 20, "y": 130}, "size": {"width": 160, "height": 80}}, {"id": "tracking", "type": "barcode", "position": {"x": 200, "y": 60}, "size": {"width": 100, "height": 30}}, {"id": "country_code", "type": "text", "position": {"x": 200, "y": 100}, "size": {"width": 80, "height": 20}}], "colors": {"primary": "#059669", "secondary": "#34d399"}}', 'shipping_label', true),

-- Thermal Printer Templates
('Thermal 4x6 Standard', '{"layout": "thermal_4x6", "thermal_optimized": true, "fields": [{"id": "sender", "type": "text", "position": {"x": 10, "y": 10}, "size": {"width": 180, "height": 60}, "style": {"fontSize": 10}}, {"id": "receiver", "type": "text", "position": {"x": 10, "y": 80}, "size": {"width": 180, "height": 80}, "style": {"fontSize": 12, "fontWeight": "bold"}}, {"id": "tracking", "type": "barcode", "position": {"x": 200, "y": 10}, "size": {"width": 150, "height": 40}}, {"id": "service_type", "type": "text", "position": {"x": 200, "y": 60}, "size": {"width": 100, "height": 20}}], "colors": {"primary": "#000000", "background": "#ffffff"}}', 'thermal_label', true),
('Thermal Receipt Style', '{"layout": "thermal_receipt", "thermal_optimized": true, "fields": [{"id": "header", "type": "text", "position": {"x": 10, "y": 5}, "size": {"width": 200, "height": 25}}, {"id": "tracking", "type": "barcode", "position": {"x": 20, "y": 35}, "size": {"width": 180, "height": 30}}, {"id": "addresses", "type": "text", "position": {"x": 10, "y": 75}, "size": {"width": 200, "height": 120}}], "colors": {"primary": "#000000"}}', 'thermal_label', true),

-- Modern Design Templates
('Modern Minimal', '{"layout": "modern_minimal", "fields": [{"id": "logo", "type": "image", "position": {"x": 10, "y": 10}, "size": {"width": 50, "height": 30}}, {"id": "sender", "type": "text", "position": {"x": 70, "y": 10}, "size": {"width": 150, "height": 50}}, {"id": "receiver", "type": "text", "position": {"x": 10, "y": 70}, "size": {"width": 210, "height": 80}}, {"id": "tracking_qr", "type": "qr_code", "position": {"x": 240, "y": 10}, "size": {"width": 80, "height": 80}}, {"id": "tracking_text", "type": "text", "position": {"x": 240, "y": 100}, "size": {"width": 80, "height": 20}}], "colors": {"primary": "#3b82f6", "secondary": "#e5e7eb", "accent": "#10b981"}}', 'shipping_label', true),
('Clean Corporate', '{"layout": "corporate", "fields": [{"id": "company_header", "type": "text", "position": {"x": 10, "y": 10}, "size": {"width": 300, "height": 30}}, {"id": "sender_box", "type": "text", "position": {"x": 20, "y": 50}, "size": {"width": 140, "height": 80}}, {"id": "receiver_box", "type": "text", "position": {"x": 170, "y": 50}, "size": {"width": 140, "height": 80}}, {"id": "tracking_section", "type": "barcode", "position": {"x": 20, "y": 140}, "size": {"width": 200, "height": 40}}, {"id": "service_info", "type": "text", "position": {"x": 230, "y": 140}, "size": {"width": 80, "height": 40}}], "colors": {"primary": "#1f2937", "secondary": "#f3f4f6", "brand": "#6366f1"}}', 'shipping_label', true),

-- Specialized Templates
('Fragile Items Label', '{"layout": "fragile", "fields": [{"id": "fragile_warning", "type": "text", "position": {"x": 10, "y": 10}, "size": {"width": 300, "height": 40}}, {"id": "handling_instructions", "type": "text", "position": {"x": 10, "y": 55}, "size": {"width": 150, "height": 60}}, {"id": "sender", "type": "text", "position": {"x": 170, "y": 55}, "size": {"width": 140, "height": 40}}, {"id": "receiver", "type": "text", "position": {"x": 170, "y": 100}, "size": {"width": 140, "height": 60}}, {"id": "tracking", "type": "barcode", "position": {"x": 10, "y": 125}, "size": {"width": 150, "height": 35}}], "colors": {"primary": "#dc2626", "warning": "#f59e0b", "background": "#fef2f2"}}', 'shipping_label', true),
('Cold Chain Label', '{"layout": "cold_chain", "fields": [{"id": "temperature_warning", "type": "text", "position": {"x": 10, "y": 10}, "size": {"width": 200, "height": 30}}, {"id": "temp_range", "type": "text", "position": {"x": 220, "y": 10}, "size": {"width": 100, "height": 30}}, {"id": "sender", "type": "text", "position": {"x": 10, "y": 50}, "size": {"width": 150, "height": 60}}, {"id": "receiver", "type": "text", "position": {"x": 170, "y": 50}, "size": {"width": 150, "height": 60}}, {"id": "tracking", "type": "barcode", "position": {"x": 10, "y": 120}, "size": {"width": 180, "height": 35}}, {"id": "cold_icon", "type": "image", "position": {"x": 200, "y": 120}, "size": {"width": 40, "height": 35}}], "colors": {"primary": "#0ea5e9", "secondary": "#e0f2fe", "warning": "#0891b2"}}', 'shipping_label', true),

-- Create a test shipment for demonstration
INSERT INTO shipments (
  tracking_number, 
  sender_name, 
  sender_address, 
  sender_city, 
  sender_state, 
  sender_postal_code, 
  sender_country,
  receiver_name, 
  receiver_address, 
  receiver_city, 
  receiver_state, 
  receiver_postal_code, 
  receiver_country,
  service_level, 
  package_weight, 
  package_dimensions, 
  declared_value, 
  status,
  estimated_delivery_date
) VALUES (
  'CP' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
  'CamerPulse Express',
  '123 Business District',
  'Douala',
  'Littoral',
  '00237',
  'Cameroon',
  'Jean Mballa',
  '456 Residential Avenue',
  'Yaoundé',
  'Centre',
  '00237',
  'Cameroon',
  'express',
  2.5,
  '{"length": 30, "width": 20, "height": 15}',
  75000,
  'in_transit',
  CURRENT_DATE + INTERVAL '2 days'
);