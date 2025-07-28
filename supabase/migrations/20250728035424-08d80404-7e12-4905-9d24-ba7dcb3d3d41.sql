-- Advanced Label Printing & Management Engine Database Schema

-- 1. Label Templates Table
CREATE TABLE public.label_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL DEFAULT 'shipping_label', -- shipping_label, invoice_label, warehouse_label
    agency_id UUID REFERENCES shipping_companies(id),
    created_by UUID NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    label_size TEXT NOT NULL DEFAULT 'A4', -- A4, A5, A6, 4x6, Receipt
    orientation TEXT DEFAULT 'portrait', -- portrait, landscape
    
    -- Template Configuration (JSON structure for layout, fields, styling)
    template_config JSONB NOT NULL DEFAULT '{}',
    
    -- Branding Settings
    branding_config JSONB DEFAULT '{
        "logo_url": null,
        "primary_color": "#10b981",
        "secondary_color": "#ef4444", 
        "font_family": "Roboto",
        "show_watermark": false,
        "custom_header": null,
        "custom_footer": null
    }',
    
    -- Field Configuration
    fields_config JSONB DEFAULT '{
        "sender": {"enabled": true, "required": true, "position": {"x": 0, "y": 0}},
        "receiver": {"enabled": true, "required": true, "position": {"x": 0, "y": 100}},
        "tracking_number": {"enabled": true, "required": true, "position": {"x": 0, "y": 200}},
        "barcode": {"enabled": true, "required": true, "position": {"x": 0, "y": 250}},
        "qr_code": {"enabled": true, "required": true, "position": {"x": 300, "y": 250}}
    }',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Agency Branding Settings
CREATE TABLE public.agency_branding_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID REFERENCES shipping_companies(id) UNIQUE,
    
    -- Logo and Visual Branding
    logo_url TEXT,
    header_logo_url TEXT,
    watermark_url TEXT,
    
    -- Color Scheme
    primary_color TEXT DEFAULT '#10b981',
    secondary_color TEXT DEFAULT '#ef4444',
    accent_color TEXT DEFAULT '#3b82f6',
    text_color TEXT DEFAULT '#1f2937',
    background_color TEXT DEFAULT '#ffffff',
    
    -- Typography
    primary_font TEXT DEFAULT 'Roboto',
    secondary_font TEXT DEFAULT 'Arial',
    font_sizes JSONB DEFAULT '{
        "title": 16,
        "subtitle": 14, 
        "body": 12,
        "small": 10
    }',
    
    -- Label Preferences
    default_label_size TEXT DEFAULT 'A4',
    default_orientation TEXT DEFAULT 'portrait',
    enable_thermal_printing BOOLEAN DEFAULT true,
    enable_watermark BOOLEAN DEFAULT false,
    
    -- Contact Information Override
    contact_info JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Label Print History
CREATE TABLE public.label_print_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID REFERENCES shipments(id),
    template_id UUID REFERENCES label_templates(id),
    
    -- Print Details
    printed_by UUID NOT NULL,
    print_type TEXT NOT NULL, -- original, duplicate, warehouse_copy, sender_copy
    printer_type TEXT, -- thermal, desktop, pdf_only
    label_format TEXT, -- PDF, PNG
    
    -- Print Metadata
    print_settings JSONB DEFAULT '{}',
    file_path TEXT, -- stored file location if applicable
    
    -- Tracking
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. QR Code Scan Logs
CREATE TABLE public.label_scan_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_number TEXT NOT NULL,
    shipment_id UUID REFERENCES shipments(id),
    
    -- Scan Details
    scan_type TEXT DEFAULT 'qr_code', -- qr_code, barcode
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- User Agent & Location Data
    user_agent TEXT,
    ip_address INET,
    scan_location TEXT, -- user provided or detected location
    
    -- Redirect Information
    redirected_to TEXT,
    redirect_successful BOOLEAN DEFAULT true,
    
    -- Device Information
    device_info JSONB DEFAULT '{}'
);

-- 5. System Label Settings (Global Admin Controls)
CREATE TABLE public.system_label_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_description TEXT,
    
    -- Admin Controls
    is_system_setting BOOLEAN DEFAULT true,
    requires_admin_approval BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.label_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_branding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_print_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_label_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Label Templates
CREATE POLICY "Agency users can manage their templates" 
ON public.label_templates 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM shipping_company_staff scs 
        WHERE scs.user_id = auth.uid() 
        AND scs.company_id = label_templates.agency_id
    ) OR auth.uid() = created_by
);

CREATE POLICY "Public can view active default templates" 
ON public.label_templates 
FOR SELECT 
USING (is_active = true AND is_default = true);

-- RLS Policies for Agency Branding Settings
CREATE POLICY "Agency staff can manage their branding" 
ON public.agency_branding_settings 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM shipping_company_staff scs 
        WHERE scs.user_id = auth.uid() 
        AND scs.company_id = agency_branding_settings.agency_id
        AND scs.role IN ('admin', 'manager')
    )
);

-- RLS Policies for Print History
CREATE POLICY "Users can view their print history" 
ON public.label_print_history 
FOR SELECT 
USING (auth.uid() = printed_by);

CREATE POLICY "Users can create print records" 
ON public.label_print_history 
FOR INSERT 
WITH CHECK (auth.uid() = printed_by);

-- RLS Policies for Scan Logs (mostly system managed)
CREATE POLICY "System can manage scan logs" 
ON public.label_scan_logs 
FOR ALL 
USING (true);

-- RLS Policies for System Settings
CREATE POLICY "Admins can manage system settings" 
ON public.system_label_settings 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

CREATE POLICY "Public can view non-sensitive system settings" 
ON public.system_label_settings 
FOR SELECT 
USING (is_system_setting = false OR setting_key NOT LIKE '%secret%');

-- Insert default system settings
INSERT INTO public.system_label_settings (setting_key, setting_value, setting_description) VALUES
('default_tracking_domain', '"https://camerpulse.cm"', 'Default domain for tracking URL generation'),
('supported_label_sizes', '["A4", "A5", "A6", "4x6", "Receipt"]', 'Supported label sizes for printing'),
('supported_fonts', '["Roboto", "Arial", "Montserrat", "Ubuntu", "Courier"]', 'Available font options for labels'),
('barcode_settings', '{"type": "CODE128", "height": 50, "width": 2}', 'Default barcode configuration'),
('qr_code_settings', '{"version": 2, "error_correction": "M", "size": 100}', 'Default QR code configuration'),
('thermal_printer_dpi', '203', 'Default DPI for thermal printer optimization'),
('max_print_history_days', '365', 'Days to retain print history records');

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_label_templates_updated_at BEFORE UPDATE ON public.label_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agency_branding_updated_at BEFORE UPDATE ON public.agency_branding_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_label_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();