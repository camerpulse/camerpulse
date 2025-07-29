-- Create 20 professional shipping label templates
INSERT INTO label_templates (template_name, template_data, template_type, created_by) VALUES

-- Standard Business Templates
('CamerPulse Express Standard', '{
  "fields": [
    {"id": "header", "type": "text", "content": "CamerPulse Express", "x": 20, "y": 20, "style": {"fontSize": 24, "fontWeight": "bold", "color": "#1e40af"}},
    {"id": "tracking", "type": "barcode", "binding": "tracking_number", "x": 350, "y": 20, "width": 150, "height": 40},
    {"id": "tracking_text", "type": "text", "binding": "tracking_number", "x": 350, "y": 70, "style": {"fontSize": 12, "fontFamily": "monospace"}},
    {"id": "from_label", "type": "text", "content": "FROM:", "x": 20, "y": 100, "style": {"fontSize": 12, "fontWeight": "bold"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 20, "y": 120, "style": {"fontSize": 14}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 20, "y": 140, "style": {"fontSize": 10}},
    {"id": "to_label", "type": "text", "content": "TO:", "x": 20, "y": 200, "style": {"fontSize": 12, "fontWeight": "bold"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 20, "y": 220, "style": {"fontSize": 14}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 20, "y": 240, "style": {"fontSize": 10}},
    {"id": "service", "type": "text", "binding": "service_level", "x": 350, "y": 200, "style": {"fontSize": 12, "color": "#dc2626"}}
  ],
  "dimensions": {"width": 600, "height": 400}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000'),

('Premium Express Label', '{
  "fields": [
    {"id": "logo_bg", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 80, "style": {"fill": "#7c3aed"}},
    {"id": "header", "type": "text", "content": "PREMIUM EXPRESS", "x": 30, "y": 30, "style": {"fontSize": 28, "fontWeight": "bold", "color": "white"}},
    {"id": "qr_code", "type": "qr", "binding": "tracking_number", "x": 450, "y": 10, "width": 60, "height": 60},
    {"id": "tracking_big", "type": "text", "binding": "tracking_number", "x": 30, "y": 120, "style": {"fontSize": 20, "fontFamily": "monospace", "fontWeight": "bold"}},
    {"id": "sender_section", "type": "rectangle", "x": 20, "y": 160, "width": 260, "height": 120, "style": {"stroke": "#7c3aed", "strokeWidth": 2, "fill": "none"}},
    {"id": "sender_header", "type": "text", "content": "SENDER", "x": 30, "y": 180, "style": {"fontSize": 12, "fontWeight": "bold", "color": "#7c3aed"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 30, "y": 200, "style": {"fontSize": 12}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 30, "y": 220, "style": {"fontSize": 10}},
    {"id": "receiver_section", "type": "rectangle", "x": 300, "y": 160, "width": 260, "height": 120, "style": {"stroke": "#dc2626", "strokeWidth": 2, "fill": "none"}},
    {"id": "receiver_header", "type": "text", "content": "DELIVERY TO", "x": 310, "y": 180, "style": {"fontSize": 12, "fontWeight": "bold", "color": "#dc2626"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 310, "y": 200, "style": {"fontSize": 12}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 310, "y": 220, "style": {"fontSize": 10}},
    {"id": "service_badge", "type": "rectangle", "x": 20, "y": 300, "width": 100, "height": 30, "style": {"fill": "#10b981"}},
    {"id": "service_text", "type": "text", "binding": "service_level", "x": 25, "y": 320, "style": {"fontSize": 10, "color": "white", "fontWeight": "bold"}}
  ],
  "dimensions": {"width": 600, "height": 400}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000'),

('Minimalist Professional', '{
  "fields": [
    {"id": "company", "type": "text", "content": "CamerPulse Logistics", "x": 20, "y": 30, "style": {"fontSize": 22, "fontWeight": "300", "color": "#374151"}},
    {"id": "divider", "type": "line", "x1": 20, "y1": 60, "x2": 580, "y2": 60, "style": {"stroke": "#d1d5db", "strokeWidth": 1}},
    {"id": "tracking", "type": "text", "binding": "tracking_number", "x": 20, "y": 90, "style": {"fontSize": 16, "fontFamily": "monospace"}},
    {"id": "barcode", "type": "barcode", "binding": "tracking_number", "x": 400, "y": 70, "width": 160, "height": 30},
    {"id": "sender", "type": "text", "content": "From", "x": 20, "y": 140, "style": {"fontSize": 11, "color": "#6b7280", "textTransform": "uppercase"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 20, "y": 160, "style": {"fontSize": 14, "fontWeight": "500"}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 20, "y": 180, "style": {"fontSize": 11, "color": "#6b7280"}},
    {"id": "receiver", "type": "text", "content": "To", "x": 20, "y": 230, "style": {"fontSize": 11, "color": "#6b7280", "textTransform": "uppercase"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 20, "y": 250, "style": {"fontSize": 14, "fontWeight": "500"}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 20, "y": 270, "style": {"fontSize": 11, "color": "#6b7280"}},
    {"id": "service", "type": "text", "binding": "service_level", "x": 400, "y": 140, "style": {"fontSize": 12, "color": "#059669"}}
  ],
  "dimensions": {"width": 600, "height": 350}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000'),

('Colorful Modern Design', '{
  "fields": [
    {"id": "bg_gradient", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 100, "style": {"fill": "linear-gradient(45deg, #06b6d4, #3b82f6)"}},
    {"id": "header", "type": "text", "content": "SHIPPING LABEL", "x": 30, "y": 40, "style": {"fontSize": 24, "fontWeight": "bold", "color": "white"}},
    {"id": "tracking_bg", "type": "rectangle", "x": 20, "y": 120, "width": 560, "height": 50, "style": {"fill": "#fef3c7", "stroke": "#f59e0b", "strokeWidth": 2}},
    {"id": "tracking", "type": "text", "binding": "tracking_number", "x": 40, "y": 150, "style": {"fontSize": 18, "fontFamily": "monospace", "fontWeight": "bold", "color": "#92400e"}},
    {"id": "qr", "type": "qr", "binding": "tracking_number", "x": 450, "y": 125, "width": 40, "height": 40},
    {"id": "sender_bg", "type": "rectangle", "x": 20, "y": 190, "width": 270, "height": 100, "style": {"fill": "#ecfccb", "stroke": "#65a30d", "strokeWidth": 1}},
    {"id": "sender_label", "type": "text", "content": "📦 FROM", "x": 30, "y": 210, "style": {"fontSize": 12, "fontWeight": "bold", "color": "#365314"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 30, "y": 230, "style": {"fontSize": 12, "color": "#365314"}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 30, "y": 250, "style": {"fontSize": 10, "color": "#365314"}},
    {"id": "receiver_bg", "type": "rectangle", "x": 310, "y": 190, "width": 270, "height": 100, "style": {"fill": "#fef2f2", "stroke": "#dc2626", "strokeWidth": 1}},
    {"id": "receiver_label", "type": "text", "content": "🎯 TO", "x": 320, "y": 210, "style": {"fontSize": 12, "fontWeight": "bold", "color": "#7f1d1d"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 320, "y": 230, "style": {"fontSize": 12, "color": "#7f1d1d"}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 320, "y": 250, "style": {"fontSize": 10, "color": "#7f1d1d"}}
  ],
  "dimensions": {"width": 600, "height": 320}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000'),

('Corporate Blue Theme', '{
  "fields": [
    {"id": "header_bg", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 70, "style": {"fill": "#1e3a8a"}},
    {"id": "logo_text", "type": "text", "content": "CAMERPULSE", "x": 30, "y": 30, "style": {"fontSize": 20, "fontWeight": "bold", "color": "white"}},
    {"id": "subtitle", "type": "text", "content": "Express Delivery Solutions", "x": 30, "y": 50, "style": {"fontSize": 10, "color": "#bfdbfe"}},
    {"id": "tracking_area", "type": "rectangle", "x": 20, "y": 90, "width": 560, "height": 40, "style": {"fill": "#eff6ff", "stroke": "#1e3a8a", "strokeWidth": 1}},
    {"id": "tracking_label", "type": "text", "content": "TRACKING NUMBER", "x": 30, "y": 105, "style": {"fontSize": 8, "color": "#1e3a8a"}},
    {"id": "tracking", "type": "text", "binding": "tracking_number", "x": 30, "y": 120, "style": {"fontSize": 14, "fontFamily": "monospace", "fontWeight": "bold", "color": "#1e3a8a"}},
    {"id": "barcode", "type": "barcode", "binding": "tracking_number", "x": 400, "y": 95, "width": 150, "height": 30},
    {"id": "content_area", "type": "rectangle", "x": 20, "y": 150, "width": 560, "height": 180, "style": {"stroke": "#e5e7eb", "strokeWidth": 1, "fill": "none"}},
    {"id": "from_section", "type": "text", "content": "FROM:", "x": 40, "y": 175, "style": {"fontSize": 12, "fontWeight": "bold", "color": "#1e3a8a"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 40, "y": 195, "style": {"fontSize": 12}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 40, "y": 215, "style": {"fontSize": 10, "color": "#6b7280"}},
    {"id": "to_section", "type": "text", "content": "DELIVER TO:", "x": 320, "y": 175, "style": {"fontSize": 12, "fontWeight": "bold", "color": "#dc2626"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 320, "y": 195, "style": {"fontSize": 12}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 320, "y": 215, "style": {"fontSize": 10, "color": "#6b7280"}},
    {"id": "service_info", "type": "text", "binding": "service_level", "x": 40, "y": 280, "style": {"fontSize": 11, "color": "#059669"}},
    {"id": "weight_info", "type": "text", "binding": "weight", "x": 40, "y": 300, "style": {"fontSize": 10, "color": "#6b7280"}}
  ],
  "dimensions": {"width": 600, "height": 350}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000');

-- Continue with more templates
INSERT INTO label_templates (template_name, template_data, template_type, created_by) VALUES

('Eco Green Theme', '{
  "fields": [
    {"id": "eco_bg", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 60, "style": {"fill": "#059669"}},
    {"id": "eco_text", "type": "text", "content": "🌱 ECO-FRIENDLY SHIPPING", "x": 30, "y": 35, "style": {"fontSize": 18, "fontWeight": "bold", "color": "white"}},
    {"id": "tracking_section", "type": "rectangle", "x": 20, "y": 80, "width": 560, "height": 50, "style": {"fill": "#f0fdf4", "stroke": "#059669", "strokeWidth": 2}},
    {"id": "tracking", "type": "text", "binding": "tracking_number", "x": 40, "y": 110, "style": {"fontSize": 16, "fontFamily": "monospace", "fontWeight": "bold", "color": "#14532d"}},
    {"id": "qr_code", "type": "qr", "binding": "tracking_number", "x": 480, "y": 85, "width": 40, "height": 40},
    {"id": "sender_title", "type": "text", "content": "🏪 PICKUP FROM", "x": 30, "y": 160, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#059669"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 30, "y": 180, "style": {"fontSize": 12}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 30, "y": 200, "style": {"fontSize": 10, "color": "#6b7280"}},
    {"id": "receiver_title", "type": "text", "content": "🚚 DELIVER TO", "x": 320, "y": 160, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#dc2626"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 320, "y": 180, "style": {"fontSize": 12}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 320, "y": 200, "style": {"fontSize": 10, "color": "#6b7280"}},
    {"id": "eco_footer", "type": "text", "content": "♻️ Carbon Neutral Delivery - Protecting Our Environment", "x": 30, "y": 280, "style": {"fontSize": 9, "color": "#059669", "fontStyle": "italic"}}
  ],
  "dimensions": {"width": 600, "height": 300}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000'),

('Express Priority Red', '{
  "fields": [
    {"id": "priority_bg", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 80, "style": {"fill": "#dc2626"}},
    {"id": "priority_text", "type": "text", "content": "⚡ PRIORITY EXPRESS", "x": 30, "y": 35, "style": {"fontSize": 24, "fontWeight": "bold", "color": "white"}},
    {"id": "urgent_badge", "type": "rectangle", "x": 400, "y": 10, "width": 180, "height": 25, "style": {"fill": "#fbbf24", "stroke": "#f59e0b", "strokeWidth": 2}},
    {"id": "urgent_text", "type": "text", "content": "🔥 NEXT DAY DELIVERY", "x": 410, "y": 27, "style": {"fontSize": 10, "fontWeight": "bold", "color": "#92400e"}},
    {"id": "tracking_big", "type": "text", "binding": "tracking_number", "x": 30, "y": 120, "style": {"fontSize": 20, "fontFamily": "monospace", "fontWeight": "bold", "color": "#dc2626"}},
    {"id": "barcode_large", "type": "barcode", "binding": "tracking_number", "x": 350, "y": 100, "width": 220, "height": 40},
    {"id": "sender_box", "type": "rectangle", "x": 20, "y": 160, "width": 260, "height": 100, "style": {"fill": "#fee2e2", "stroke": "#dc2626", "strokeWidth": 2}},
    {"id": "sender_header", "type": "text", "content": "PICKUP LOCATION", "x": 30, "y": 180, "style": {"fontSize": 10, "fontWeight": "bold", "color": "#dc2626"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 30, "y": 200, "style": {"fontSize": 12, "fontWeight": "bold"}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 30, "y": 220, "style": {"fontSize": 10}},
    {"id": "receiver_box", "type": "rectangle", "x": 300, "y": 160, "width": 280, "height": 100, "style": {"fill": "#f3f4f6", "stroke": "#374151", "strokeWidth": 2}},
    {"id": "receiver_header", "type": "text", "content": "PRIORITY DELIVERY TO", "x": 310, "y": 180, "style": {"fontSize": 10, "fontWeight": "bold", "color": "#374151"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 310, "y": 200, "style": {"fontSize": 12, "fontWeight": "bold"}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 310, "y": 220, "style": {"fontSize": 10}},
    {"id": "service_guarantee", "type": "text", "content": "✅ Signature Required • Insured • Real-time Tracking", "x": 30, "y": 290, "style": {"fontSize": 10, "color": "#059669", "fontWeight": "bold"}}
  ],
  "dimensions": {"width": 600, "height": 320}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000'),

('International Shipping', '{
  "fields": [
    {"id": "intl_header", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 70, "style": {"fill": "#1f2937"}},
    {"id": "intl_text", "type": "text", "content": "🌍 INTERNATIONAL SHIPPING", "x": 30, "y": 30, "style": {"fontSize": 20, "fontWeight": "bold", "color": "white"}},
    {"id": "customs_icon", "type": "text", "content": "📋", "x": 450, "y": 30, "style": {"fontSize": 24}},
    {"id": "customs_text", "type": "text", "content": "CUSTOMS DECLARATION", "x": 480, "y": 35, "style": {"fontSize": 8, "color": "white"}},
    {"id": "tracking_intl", "type": "text", "binding": "tracking_number", "x": 30, "y": 100, "style": {"fontSize": 18, "fontFamily": "monospace", "fontWeight": "bold"}},
    {"id": "origin_country", "type": "text", "content": "🇨🇲 CAMEROON", "x": 30, "y": 130, "style": {"fontSize": 12, "fontWeight": "bold", "color": "#059669"}},
    {"id": "sender_intl", "type": "text", "content": "SENDER (EXPEDITEUR)", "x": 30, "y": 160, "style": {"fontSize": 10, "fontWeight": "bold"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 30, "y": 180, "style": {"fontSize": 12}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 30, "y": 200, "style": {"fontSize": 10}},
    {"id": "receiver_intl", "type": "text", "content": "RECIPIENT (DESTINATAIRE)", "x": 320, "y": 160, "style": {"fontSize": 10, "fontWeight": "bold"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 320, "y": 180, "style": {"fontSize": 12}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 320, "y": 200, "style": {"fontSize": 10}},
    {"id": "customs_info", "type": "rectangle", "x": 20, "y": 240, "width": 560, "height": 80, "style": {"fill": "#fef3c7", "stroke": "#f59e0b", "strokeWidth": 2}},
    {"id": "customs_header", "type": "text", "content": "📦 CUSTOMS INFORMATION", "x": 30, "y": 260, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#92400e"}},
    {"id": "declared_value", "type": "text", "content": "Declared Value: See attached CN22/CN23", "x": 30, "y": 280, "style": {"fontSize": 10, "color": "#92400e"}},
    {"id": "content_desc", "type": "text", "content": "Contents: Commercial Goods", "x": 30, "y": 300, "style": {"fontSize": 10, "color": "#92400e"}}
  ],
  "dimensions": {"width": 600, "height": 340}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000'),

('Fragile Package Warning', '{
  "fields": [
    {"id": "warning_bg", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 60, "style": {"fill": "#f59e0b"}},
    {"id": "fragile_text", "type": "text", "content": "⚠️ FRAGILE - HANDLE WITH CARE", "x": 30, "y": 35, "style": {"fontSize": 20, "fontWeight": "bold", "color": "white"}},
    {"id": "tracking_fragile", "type": "text", "binding": "tracking_number", "x": 30, "y": 90, "style": {"fontSize": 16, "fontFamily": "monospace", "fontWeight": "bold"}},
    {"id": "warning_symbols", "type": "text", "content": "📦🔥❄️⚠️", "x": 400, "y": 90, "style": {"fontSize": 24}},
    {"id": "handling_instructions", "type": "rectangle", "x": 20, "y": 120, "width": 560, "height": 40, "style": {"fill": "#fef3c7", "stroke": "#f59e0b", "strokeWidth": 3}},
    {"id": "instructions", "type": "text", "content": "⚠️ THIS SIDE UP • NO STACKING • FRAGILE CONTENTS • HANDLE GENTLY", "x": 30, "y": 145, "style": {"fontSize": 12, "fontWeight": "bold", "color": "#92400e"}},
    {"id": "sender_fragile", "type": "text", "content": "FROM:", "x": 30, "y": 180, "style": {"fontSize": 11, "fontWeight": "bold"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 30, "y": 200, "style": {"fontSize": 12}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 30, "y": 220, "style": {"fontSize": 10}},
    {"id": "receiver_fragile", "type": "text", "content": "DELIVER TO:", "x": 320, "y": 180, "style": {"fontSize": 11, "fontWeight": "bold"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 320, "y": 200, "style": {"fontSize": 12}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 320, "y": 220, "style": {"fontSize": 10}},
    {"id": "special_care", "type": "text", "content": "🛡️ SPECIAL HANDLING REQUIRED - INSURANCE INCLUDED", "x": 30, "y": 270, "style": {"fontSize": 10, "color": "#dc2626", "fontWeight": "bold"}}
  ],
  "dimensions": {"width": 600, "height": 300}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000');

-- Continue with remaining templates (part 2)
INSERT INTO label_templates (template_name, template_data, template_type, created_by) VALUES

('Overnight Express', '{
  "fields": [
    {"id": "overnight_bg", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 70, "style": {"fill": "#7c2d12"}},
    {"id": "overnight_text", "type": "text", "content": "🌙 OVERNIGHT EXPRESS", "x": 30, "y": 35, "style": {"fontSize": 22, "fontWeight": "bold", "color": "white"}},
    {"id": "delivery_promise", "type": "text", "content": "GUARANTEED BY 10:30 AM NEXT DAY", "x": 30, "y": 55, "style": {"fontSize": 10, "color": "#fed7aa"}},
    {"id": "tracking_overnight", "type": "text", "binding": "tracking_number", "x": 30, "y": 100, "style": {"fontSize": 18, "fontFamily": "monospace", "fontWeight": "bold", "color": "#7c2d12"}},
    {"id": "time_sensitive", "type": "rectangle", "x": 400, "y": 85, "width": 180, "height": 30, "style": {"fill": "#dc2626", "stroke": "#991b1b", "strokeWidth": 2}},
    {"id": "time_text", "type": "text", "content": "⏰ TIME SENSITIVE", "x": 420, "y": 105, "style": {"fontSize": 11, "fontWeight": "bold", "color": "white"}},
    {"id": "sender_overnight", "type": "text", "content": "PICKUP FROM:", "x": 30, "y": 140, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#7c2d12"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 30, "y": 160, "style": {"fontSize": 12}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 30, "y": 180, "style": {"fontSize": 10}},
    {"id": "receiver_overnight", "type": "text", "content": "URGENT DELIVERY TO:", "x": 320, "y": 140, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#dc2626"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 320, "y": 160, "style": {"fontSize": 12}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 320, "y": 180, "style": {"fontSize": 10}},
    {"id": "service_commitment", "type": "text", "content": "✅ Signature Required • Real-time Updates • Money-back Guarantee", "x": 30, "y": 230, "style": {"fontSize": 10, "color": "#059669", "fontWeight": "bold"}}
  ],
  "dimensions": {"width": 600, "height": 260}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000'),

('Bulk Commercial Shipping', '{
  "fields": [
    {"id": "commercial_header", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 50, "style": {"fill": "#374151"}},
    {"id": "commercial_text", "type": "text", "content": "📋 COMMERCIAL SHIPMENT", "x": 30, "y": 30, "style": {"fontSize": 18, "fontWeight": "bold", "color": "white"}},
    {"id": "tracking_commercial", "type": "text", "binding": "tracking_number", "x": 30, "y": 80, "style": {"fontSize": 16, "fontFamily": "monospace", "fontWeight": "bold"}},
    {"id": "barcode_commercial", "type": "barcode", "binding": "tracking_number", "x": 350, "y": 60, "width": 220, "height": 35},
    {"id": "business_info", "type": "rectangle", "x": 20, "y": 110, "width": 560, "height": 30, "style": {"fill": "#f3f4f6", "stroke": "#9ca3af", "strokeWidth": 1}},
    {"id": "invoice_ref", "type": "text", "content": "📄 Invoice/PO Reference: See attached documentation", "x": 30, "y": 130, "style": {"fontSize": 10, "color": "#374151"}},
    {"id": "shipper_section", "type": "text", "content": "SHIPPER:", "x": 30, "y": 160, "style": {"fontSize": 11, "fontWeight": "bold"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 30, "y": 180, "style": {"fontSize": 12}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 30, "y": 200, "style": {"fontSize": 10}},
    {"id": "consignee_section", "type": "text", "content": "CONSIGNEE:", "x": 320, "y": 160, "style": {"fontSize": 11, "fontWeight": "bold"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 320, "y": 180, "style": {"fontSize": 12}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 320, "y": 200, "style": {"fontSize": 10}},
    {"id": "commercial_terms", "type": "text", "content": "📊 Terms: FOB • Payment: NET30 • Incoterms: CIF", "x": 30, "y": 250, "style": {"fontSize": 10, "color": "#6b7280"}}
  ],
  "dimensions": {"width": 600, "height": 280}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000'),

('Small Package Economy', '{
  "fields": [
    {"id": "economy_header", "type": "text", "content": "💰 ECONOMY SHIPPING", "x": 20, "y": 25, "style": {"fontSize": 16, "fontWeight": "bold", "color": "#059669"}},
    {"id": "economy_note", "type": "text", "content": "Standard Delivery • 3-5 Business Days", "x": 20, "y": 45, "style": {"fontSize": 10, "color": "#6b7280"}},
    {"id": "tracking_economy", "type": "text", "binding": "tracking_number", "x": 20, "y": 75, "style": {"fontSize": 14, "fontFamily": "monospace", "fontWeight": "bold"}},
    {"id": "simple_barcode", "type": "barcode", "binding": "tracking_number", "x": 320, "y": 55, "width": 160, "height": 25},
    {"id": "from_simple", "type": "text", "content": "From:", "x": 20, "y": 110, "style": {"fontSize": 10, "fontWeight": "bold"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 20, "y": 125, "style": {"fontSize": 11}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 20, "y": 140, "style": {"fontSize": 9}},
    {"id": "to_simple", "type": "text", "content": "To:", "x": 20, "y": 170, "style": {"fontSize": 10, "fontWeight": "bold"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 20, "y": 185, "style": {"fontSize": 11}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 20, "y": 200, "style": {"fontSize": 9}},
    {"id": "economy_footer", "type": "text", "content": "📞 Track online at camerpulse.com/track", "x": 20, "y": 240, "style": {"fontSize": 8, "color": "#6b7280"}}
  ],
  "dimensions": {"width": 500, "height": 260}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000'),

('Same Day Rush Delivery', '{
  "fields": [
    {"id": "rush_bg", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 80, "style": {"fill": "#dc2626"}},
    {"id": "rush_icon", "type": "text", "content": "🚀", "x": 30, "y": 40, "style": {"fontSize": 30}},
    {"id": "rush_text", "type": "text", "content": "SAME DAY RUSH", "x": 80, "y": 35, "style": {"fontSize": 24, "fontWeight": "bold", "color": "white"}},
    {"id": "delivery_today", "type": "text", "content": "DELIVERY TODAY BEFORE 6PM", "x": 80, "y": 55, "style": {"fontSize": 12, "color": "#fecaca"}},
    {"id": "countdown", "type": "text", "content": "⏱️ ACTIVE TRACKING", "x": 400, "y": 40, "style": {"fontSize": 14, "fontWeight": "bold", "color": "#fbbf24"}},
    {"id": "tracking_rush", "type": "text", "binding": "tracking_number", "x": 30, "y": 110, "style": {"fontSize": 20, "fontFamily": "monospace", "fontWeight": "bold", "color": "#dc2626"}},
    {"id": "qr_rush", "type": "qr", "binding": "tracking_number", "x": 450, "y": 90, "width": 50, "height": 50},
    {"id": "live_tracking", "type": "text", "content": "📱 Live GPS Tracking Available", "x": 450, "y": 150, "style": {"fontSize": 9, "color": "#059669"}},
    {"id": "rush_sender", "type": "text", "content": "PICKUP:", "x": 30, "y": 160, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#dc2626"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 30, "y": 180, "style": {"fontSize": 12}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 30, "y": 200, "style": {"fontSize": 10}},
    {"id": "rush_receiver", "type": "text", "content": "SAME DAY DELIVERY:", "x": 250, "y": 160, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#dc2626"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 250, "y": 180, "style": {"fontSize": 12}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 250, "y": 200, "style": {"fontSize": 10}},
    {"id": "premium_service", "type": "text", "content": "🌟 Premium Service • Real-time Updates • Guaranteed Delivery", "x": 30, "y": 240, "style": {"fontSize": 10, "color": "#059669", "fontWeight": "bold"}}
  ],
  "dimensions": {"width": 600, "height": 270}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000'),

('Cold Chain Temperature Sensitive', '{
  "fields": [
    {"id": "cold_bg", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 70, "style": {"fill": "#0ea5e9"}},
    {"id": "cold_text", "type": "text", "content": "❄️ TEMPERATURE CONTROLLED", "x": 30, "y": 35, "style": {"fontSize": 20, "fontWeight": "bold", "color": "white"}},
    {"id": "temp_range", "type": "text", "content": "🌡️ KEEP BETWEEN 2°C - 8°C", "x": 30, "y": 55, "style": {"fontSize": 12, "color": "#bae6fd"}},
    {"id": "tracking_cold", "type": "text", "binding": "tracking_number", "x": 30, "y": 100, "style": {"fontSize": 16, "fontFamily": "monospace", "fontWeight": "bold", "color": "#0369a1"}},
    {"id": "temp_monitor", "type": "rectangle", "x": 400, "y": 80, "width": 180, "height": 40, "style": {"fill": "#e0f2fe", "stroke": "#0ea5e9", "strokeWidth": 2}},
    {"id": "monitor_text", "type": "text", "content": "📊 TEMP MONITORED", "x": 420, "y": 105, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#0369a1"}},
    {"id": "cold_instructions", "type": "rectangle", "x": 20, "y": 130, "width": 560, "height": 50, "style": {"fill": "#f0f9ff", "stroke": "#0ea5e9", "strokeWidth": 2}},
    {"id": "handling_cold", "type": "text", "content": "❄️ REFRIGERATED PRODUCT • DO NOT FREEZE • HANDLE IMMEDIATELY", "x": 30, "y": 155, "style": {"fontSize": 12, "fontWeight": "bold", "color": "#0369a1"}},
    {"id": "cold_sender", "type": "text", "content": "COLD STORAGE FROM:", "x": 30, "y": 200, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#0ea5e9"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 30, "y": 220, "style": {"fontSize": 12}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 30, "y": 240, "style": {"fontSize": 10}},
    {"id": "cold_receiver", "type": "text", "content": "REFRIGERATED DELIVERY TO:", "x": 320, "y": 200, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#dc2626"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 320, "y": 220, "style": {"fontSize": 12}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 320, "y": 240, "style": {"fontSize": 10}},
    {"id": "cold_warning", "type": "text", "content": "⚠️ PERISHABLE GOODS • TIME SENSITIVE • REFRIGERATION REQUIRED", "x": 30, "y": 280, "style": {"fontSize": 10, "color": "#dc2626", "fontWeight": "bold"}}
  ],
  "dimensions": {"width": 600, "height": 310}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000');

-- Final batch of templates (part 3)
INSERT INTO label_templates (template_name, template_data, template_type, created_by) VALUES

('Return Label', '{
  "fields": [
    {"id": "return_bg", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 60, "style": {"fill": "#f59e0b"}},
    {"id": "return_text", "type": "text", "content": "↩️ RETURN SHIPMENT", "x": 30, "y": 35, "style": {"fontSize": 20, "fontWeight": "bold", "color": "white"}},
    {"id": "return_instructions", "type": "text", "content": "Pre-paid Return Label • No Additional Charges", "x": 320, "y": 35, "style": {"fontSize": 10, "color": "#fed7aa"}},
    {"id": "tracking_return", "type": "text", "binding": "tracking_number", "x": 30, "y": 90, "style": {"fontSize": 16, "fontFamily": "monospace", "fontWeight": "bold", "color": "#f59e0b"}},
    {"id": "return_reason", "type": "rectangle", "x": 20, "y": 120, "width": 560, "height": 30, "style": {"fill": "#fef3c7", "stroke": "#f59e0b", "strokeWidth": 1}},
    {"id": "reason_text", "type": "text", "content": "📝 Return Reason: See enclosed return form", "x": 30, "y": 140, "style": {"fontSize": 11, "color": "#92400e"}},
    {"id": "return_from", "type": "text", "content": "RETURN FROM:", "x": 30, "y": 170, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#f59e0b"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 30, "y": 190, "style": {"fontSize": 12}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 30, "y": 210, "style": {"fontSize": 10}},
    {"id": "return_to", "type": "text", "content": "RETURN TO WAREHOUSE:", "x": 320, "y": 170, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#059669"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 320, "y": 190, "style": {"fontSize": 12}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 320, "y": 210, "style": {"fontSize": 10}},
    {"id": "return_process", "type": "text", "content": "📦 Inspect package • Process refund within 5-7 business days", "x": 30, "y": 250, "style": {"fontSize": 10, "color": "#6b7280"}}
  ],
  "dimensions": {"width": 600, "height": 280}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000'),

('High Value Insured', '{
  "fields": [
    {"id": "insured_bg", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 70, "style": {"fill": "#7c3aed"}},
    {"id": "insured_text", "type": "text", "content": "🛡️ HIGH VALUE INSURED", "x": 30, "y": 35, "style": {"fontSize": 22, "fontWeight": "bold", "color": "white"}},
    {"id": "insurance_value", "type": "text", "content": "💎 INSURED UP TO 500,000 FCFA", "x": 30, "y": 55, "style": {"fontSize": 12, "color": "#ddd6fe"}},
    {"id": "tracking_insured", "type": "text", "binding": "tracking_number", "x": 30, "y": 100, "style": {"fontSize": 18, "fontFamily": "monospace", "fontWeight": "bold", "color": "#7c3aed"}},
    {"id": "security_seal", "type": "rectangle", "x": 400, "y": 80, "width": 180, "height": 40, "style": {"fill": "#fef3c7", "stroke": "#f59e0b", "strokeWidth": 3}},
    {"id": "seal_text", "type": "text", "content": "🔒 SECURITY SEALED", "x": 420, "y": 105, "style": {"fontSize": 12, "fontWeight": "bold", "color": "#92400e"}},
    {"id": "security_notice", "type": "rectangle", "x": 20, "y": 130, "width": 560, "height": 40, "style": {"fill": "#f3e8ff", "stroke": "#7c3aed", "strokeWidth": 2}},
    {"id": "security_text", "type": "text", "content": "🚨 HIGH VALUE CARGO • TAMPER EVIDENT • SIGNATURE REQUIRED", "x": 30, "y": 155, "style": {"fontSize": 12, "fontWeight": "bold", "color": "#5b21b6"}},
    {"id": "insured_sender", "type": "text", "content": "INSURED PICKUP FROM:", "x": 30, "y": 190, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#7c3aed"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 30, "y": 210, "style": {"fontSize": 12}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 30, "y": 230, "style": {"fontSize": 10}},
    {"id": "insured_receiver", "type": "text", "content": "SECURE DELIVERY TO:", "x": 320, "y": 190, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#dc2626"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 320, "y": 210, "style": {"fontSize": 12}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 320, "y": 230, "style": {"fontSize": 10"}},
    {"id": "insurance_terms", "type": "text", "content": "📋 Insurance Terms Apply • Photo ID Required • Adult Signature Only", "x": 30, "y": 270, "style": {"fontSize": 10, "color": "#059669", "fontWeight": "bold"}}
  ],
  "dimensions": {"width": 600, "height": 300}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000'),

('Medical Supplies', '{
  "fields": [
    {"id": "medical_bg", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 70, "style": {"fill": "#dc2626"}},
    {"id": "medical_cross", "type": "text", "content": "⚕️", "x": 30, "y": 40, "style": {"fontSize": 30, "color": "white"}},
    {"id": "medical_text", "type": "text", "content": "MEDICAL SUPPLIES", "x": 80, "y": 35, "style": {"fontSize": 22, "fontWeight": "bold", "color": "white"}},
    {"id": "urgent_medical", "type": "text", "content": "🚨 URGENT MEDICAL DELIVERY", "x": 80, "y": 55, "style": {"fontSize": 12, "color": "#fecaca"}},
    {"id": "tracking_medical", "type": "text", "binding": "tracking_number", "x": 30, "y": 100, "style": {"fontSize": 16, "fontFamily": "monospace", "fontWeight": "bold", "color": "#dc2626"}},
    {"id": "medical_priority", "type": "rectangle", "x": 400, "y": 80, "width": 180, "height": 40, "style": {"fill": "#fbbf24", "stroke": "#f59e0b", "strokeWidth": 2}},
    {"id": "priority_text", "type": "text", "content": "⏰ PRIORITY MEDICAL", "x": 420, "y": 105, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#92400e"}},
    {"id": "medical_instructions", "type": "rectangle", "x": 20, "y": 130, "width": 560, "height": 50, "style": {"fill": "#fef2f2", "stroke": "#dc2626", "strokeWidth": 2}},
    {"id": "handling_medical", "type": "text", "content": "⚕️ MEDICAL SUPPLIES • STERILE PACKAGING • HANDLE WITH CARE", "x": 30, "y": 160, "style": {"fontSize": 12, "fontWeight": "bold", "color": "#7f1d1d"}},
    {"id": "medical_sender", "type": "text", "content": "MEDICAL FACILITY:", "x": 30, "y": 200, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#dc2626"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 30, "y": 220, "style": {"fontSize": 12}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 30, "y": 240, "style": {"fontSize": 10}},
    {"id": "medical_receiver", "type": "text", "content": "DELIVER TO MEDICAL FACILITY:", "x": 320, "y": 200, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#dc2626"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 320, "y": 220, "style": {"fontSize": 12}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 320, "y": 240, "style": {"fontSize": 10}},
    {"id": "medical_compliance", "type": "text", "content": "🏥 Medical Grade Transport • Regulatory Compliant • Chain of Custody", "x": 30, "y": 280, "style": {"fontSize": 10, "color": "#059669", "fontWeight": "bold"}}
  ],
  "dimensions": {"width": 600, "height": 310}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000'),

('Document Express', '{
  "fields": [
    {"id": "doc_header", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 60, "style": {"fill": "#1f2937"}},
    {"id": "doc_icon", "type": "text", "content": "📄", "x": 30, "y": 35, "style": {"fontSize": 24}},
    {"id": "doc_text", "type": "text", "content": "DOCUMENT EXPRESS", "x": 70, "y": 35, "style": {"fontSize": 18, "fontWeight": "bold", "color": "white"}},
    {"id": "confidential", "type": "text", "content": "🔒 CONFIDENTIAL", "x": 400, "y": 35, "style": {"fontSize": 12, "fontWeight": "bold", "color": "#fbbf24"}},
    {"id": "tracking_doc", "type": "text", "binding": "tracking_number", "x": 30, "y": 90, "style": {"fontSize": 16, "fontFamily": "monospace", "fontWeight": "bold"}},
    {"id": "doc_barcode", "type": "barcode", "binding": "tracking_number", "x": 350, "y": 70, "width": 200, "height": 30},
    {"id": "doc_type", "type": "rectangle", "x": 20, "y": 110, "width": 560, "height": 30, "style": {"fill": "#f9fafb", "stroke": "#9ca3af", "strokeWidth": 1}},
    {"id": "doc_contents", "type": "text", "content": "📋 Contents: Legal Documents • Contracts • Certificates", "x": 30, "y": 130, "style": {"fontSize": 11, "color": "#374151"}},
    {"id": "doc_sender", "type": "text", "content": "DOCUMENT FROM:", "x": 30, "y": 160, "style": {"fontSize": 11, "fontWeight": "bold"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 30, "y": 180, "style": {"fontSize": 12}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 30, "y": 200, "style": {"fontSize": 10}},
    {"id": "doc_receiver", "type": "text", "content": "DELIVER DOCUMENTS TO:", "x": 320, "y": 160, "style": {"fontSize": 11, "fontWeight": "bold"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 320, "y": 180, "style": {"fontSize": 12}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 320, "y": 200, "style": {"fontSize": 10}},
    {"id": "doc_security", "type": "text", "content": "🛡️ Secure Document Delivery • Chain of Custody • Signature Required", "x": 30, "y": 240, "style": {"fontSize": 10, "color": "#059669", "fontWeight": "bold"}}
  ],
  "dimensions": {"width": 600, "height": 270}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000'),

('Large Package Freight', '{
  "fields": [
    {"id": "freight_bg", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 70, "style": {"fill": "#0f172a"}},
    {"id": "freight_icon", "type": "text", "content": "🚛", "x": 30, "y": 40, "style": {"fontSize": 30}},
    {"id": "freight_text", "type": "text", "content": "FREIGHT SHIPMENT", "x": 80, "y": 35, "style": {"fontSize": 22, "fontWeight": "bold", "color": "white"}},
    {"id": "heavy_duty", "type": "text", "content": "HEAVY DUTY TRANSPORT", "x": 80, "y": 55, "style": {"fontSize": 12, "color": "#94a3b8"}},
    {"id": "tracking_freight", "type": "text", "binding": "tracking_number", "x": 30, "y": 100, "style": {"fontSize": 18, "fontFamily": "monospace", "fontWeight": "bold", "color": "#0f172a"}},
    {"id": "weight_dimensions", "type": "rectangle", "x": 400, "y": 80, "width": 180, "height": 50, "style": {"fill": "#fef3c7", "stroke": "#f59e0b", "strokeWidth": 2}},
    {"id": "weight_text", "type": "text", "content": "⚖️ OVERSIZED/HEAVY", "x": 420, "y": 105, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#92400e"}},
    {"id": "dimensions_text", "type": "text", "content": "📏 See attached specs", "x": 420, "y": 120, "style": {"fontSize": 9, "color": "#92400e"}},
    {"id": "freight_warnings", "type": "rectangle", "x": 20, "y": 140, "width": 560, "height": 40, "style": {"fill": "#fef2f2", "stroke": "#dc2626", "strokeWidth": 2}},
    {"id": "warning_text", "type": "text", "content": "⚠️ HEAVY LIFT REQUIRED • SPECIAL HANDLING • FORKLIFT ACCESS NEEDED", "x": 30, "y": 165, "style": {"fontSize": 12, "fontWeight": "bold", "color": "#7f1d1d"}},
    {"id": "freight_sender", "type": "text", "content": "FREIGHT PICKUP:", "x": 30, "y": 200, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#0f172a"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 30, "y": 220, "style": {"fontSize": 12}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 30, "y": 240, "style": {"fontSize": 10}},
    {"id": "freight_receiver", "type": "text", "content": "FREIGHT DELIVERY:", "x": 320, "y": 200, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#dc2626"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 320, "y": 220, "style": {"fontSize": 12}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 320, "y": 240, "style": {"fontSize": 10}},
    {"id": "freight_notes", "type": "text", "content": "🏗️ Commercial Delivery • Dock Access Required • Business Hours Only", "x": 30, "y": 280, "style": {"fontSize": 10, "color": "#059669", "fontWeight": "bold"}}
  ],
  "dimensions": {"width": 600, "height": 310}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000'),

('Gift Package Special', '{
  "fields": [
    {"id": "gift_bg", "type": "rectangle", "x": 0, "y": 0, "width": 600, "height": 70, "style": {"fill": "#ec4899"}},
    {"id": "gift_icon", "type": "text", "content": "🎁", "x": 30, "y": 40, "style": {"fontSize": 30}},
    {"id": "gift_text", "type": "text", "content": "SPECIAL GIFT DELIVERY", "x": 80, "y": 35, "style": {"fontSize": 20, "fontWeight": "bold", "color": "white"}},
    {"id": "surprise", "type": "text", "content": "Handle with Love ❤️", "x": 80, "y": 55, "style": {"fontSize": 12, "color": "#fce7f3"}},
    {"id": "tracking_gift", "type": "text", "binding": "tracking_number", "x": 30, "y": 100, "style": {"fontSize": 16, "fontFamily": "monospace", "fontWeight": "bold", "color": "#ec4899"}},
    {"id": "gift_note", "type": "rectangle", "x": 400, "y": 80, "width": 180, "height": 40, "style": {"fill": "#fef7ff", "stroke": "#ec4899", "strokeWidth": 2}},
    {"id": "note_text", "type": "text", "content": "💌 GIFT MESSAGE", "x": 420, "y": 105, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#be185d"}},
    {"id": "gift_instructions", "type": "rectangle", "x": 20, "y": 130, "width": 560, "height": 40, "style": {"fill": "#fdf2f8", "stroke": "#ec4899", "strokeWidth": 1}},
    {"id": "care_text", "type": "text", "content": "🎀 GIFT PACKAGE • FRAGILE CONTENTS • KEEP SURPRISE INTACT", "x": 30, "y": 155, "style": {"fontSize": 12, "fontWeight": "bold", "color": "#be185d"}},
    {"id": "gift_sender", "type": "text", "content": "GIFT FROM:", "x": 30, "y": 190, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#ec4899"}},
    {"id": "sender_name", "type": "text", "binding": "sender_name", "x": 30, "y": 210, "style": {"fontSize": 12}},
    {"id": "sender_address", "type": "text", "binding": "sender_address", "x": 30, "y": 230, "style": {"fontSize": 10}},
    {"id": "gift_receiver", "type": "text", "content": "SPECIAL DELIVERY TO:", "x": 320, "y": 190, "style": {"fontSize": 11, "fontWeight": "bold", "color": "#dc2626"}},
    {"id": "receiver_name", "type": "text", "binding": "receiver_name", "x": 320, "y": 210, "style": {"fontSize": 12}},
    {"id": "receiver_address", "type": "text", "binding": "receiver_address", "x": 320, "y": 230, "style": {"fontSize": 10}},
    {"id": "gift_service", "type": "text", "content": "🌟 White Glove Service • Gift Wrapping Preserved • Smile Guaranteed", "x": 30, "y": 270, "style": {"fontSize": 10, "color": "#059669", "fontWeight": "bold"}}
  ],
  "dimensions": {"width": 600, "height": 300}
}', 'shipping_label', '00000000-0000-0000-0000-000000000000');