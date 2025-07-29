-- Insert a test shipment with correct service level
INSERT INTO shipments (
  tracking_number,
  shipping_company_id,
  sender_info,
  receiver_info,
  package_details,
  origin_address,
  destination_address,
  shipping_type,
  service_level,
  estimated_delivery_date,
  shipping_cost,
  declared_value,
  weight_kg,
  dimensions,
  status
) VALUES (
  'CP' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
  (SELECT id FROM shipping_companies LIMIT 1),
  '{"name": "CamerPulse Express", "phone": "+237-677-123-456", "email": "shipping@camerpulse.com", "address": "123 Business District, Douala, Cameroon"}',
  '{"name": "Jean Mballa", "phone": "+237-698-765-432", "email": "jean.mballa@email.com", "address": "456 Residential Avenue, Yaoundé, Cameroon"}',
  '{"type": "package", "description": "Sample shipment for testing", "contents": "Documents and electronics"}',
  '123 Business District, Douala, Cameroon',
  '456 Residential Avenue, Yaoundé, Cameroon',
  'express',
  'standard',
  CURRENT_DATE + INTERVAL '2 days',
  15000,
  75000,
  2.5,
  '{"length": 30, "width": 20, "height": 15}',
  'in_transit'
);