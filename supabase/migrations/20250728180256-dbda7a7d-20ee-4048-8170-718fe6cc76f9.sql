-- Create shipping labels and templates tables
CREATE TABLE public.shipping_label_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  width_mm numeric NOT NULL DEFAULT 100,
  height_mm numeric NOT NULL DEFAULT 150,
  template_data jsonb NOT NULL DEFAULT '{}',
  is_default boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.shipping_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES shipping_companies(id),
  template_id uuid REFERENCES shipping_label_templates(id),
  tracking_number text UNIQUE NOT NULL,
  sender_name text NOT NULL,
  sender_address jsonb NOT NULL,
  recipient_name text NOT NULL,
  recipient_address jsonb NOT NULL,
  package_details jsonb DEFAULT '{}',
  label_data jsonb DEFAULT '{}',
  qr_code_data text,
  barcode_data text,
  status text DEFAULT 'created',
  printed_at timestamp with time zone,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_label_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_labels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view public templates" ON shipping_label_templates
  FOR SELECT USING (true);

CREATE POLICY "Company staff can manage their templates" ON shipping_label_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shipping_company_staff scs
      WHERE scs.user_id = auth.uid() 
      AND scs.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Company staff can manage their labels" ON shipping_labels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shipping_company_staff scs
      WHERE scs.user_id = auth.uid() 
      AND scs.company_id = shipping_labels.company_id
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_shipping_label_templates_updated_at
  BEFORE UPDATE ON shipping_label_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_labels_updated_at
  BEFORE UPDATE ON shipping_labels  
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default template
INSERT INTO public.shipping_label_templates (
  name,
  description,
  width_mm,
  height_mm,
  template_data,
  is_default
) VALUES (
  'Standard Shipping Label',
  'Standard 4x6 inch shipping label template',
  101.6,
  152.4,
  '{
    "background_color": "#ffffff",
    "border": true,
    "sections": {
      "header": {"height": 30, "show_logo": true},
      "tracking": {"height": 40, "show_barcode": true, "show_qr": true},
      "sender": {"height": 60},
      "recipient": {"height": 80},
      "package": {"height": 40}
    },
    "fonts": {
      "header": {"size": 16, "weight": "bold"},
      "tracking": {"size": 14, "weight": "bold"},
      "address": {"size": 12, "weight": "normal"},
      "package": {"size": 10, "weight": "normal"}
    }
  }',
  true
);

-- Insert sample shipping labels for Cemac Track
INSERT INTO public.shipping_labels (
  company_id,
  template_id,
  tracking_number,
  sender_name,
  sender_address,
  recipient_name,
  recipient_address,
  package_details,
  qr_code_data,
  barcode_data,
  status
) VALUES 
(
  (SELECT id FROM shipping_companies WHERE company_name = 'Cemac Track' LIMIT 1),
  (SELECT id FROM shipping_label_templates WHERE is_default = true LIMIT 1),
  'CEMAC001',
  'Cemac Track Logistics',
  '{"street": "Business District", "city": "Douala", "region": "Littoral", "country": "Cameroon", "postal_code": "00237"}',
  'John Doe',
  '{"street": "123 Main Street", "city": "Yaoundé", "region": "Centre", "country": "Cameroon", "postal_code": "00237"}',
  '{"weight": "2.5kg", "dimensions": "30x20x15cm", "contents": "Electronics", "value": "50000 FCFA"}',
  'CEMAC001-QR-DATA',
  'CEMAC001',
  'ready_to_print'
),
(
  (SELECT id FROM shipping_companies WHERE company_name = 'Cemac Track' LIMIT 1),
  (SELECT id FROM shipping_label_templates WHERE is_default = true LIMIT 1),
  'CEMAC002',
  'Cemac Track Logistics',
  '{"street": "Business District", "city": "Douala", "region": "Littoral", "country": "Cameroon", "postal_code": "00237"}',
  'Marie Nguyen',
  '{"street": "456 Market Road", "city": "Bamenda", "region": "North West", "country": "Cameroon", "postal_code": "00237"}',
  '{"weight": "1.2kg", "dimensions": "25x15x10cm", "contents": "Books", "value": "25000 FCFA"}',
  'CEMAC002-QR-DATA',
  'CEMAC002',
  'ready_to_print'
);