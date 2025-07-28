-- Phase 1: Core Infrastructure & Database Setup for Advanced Label Printing Engine

-- Create label_templates table
CREATE TABLE IF NOT EXISTS public.label_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN ('shipping_label', 'invoice_label', 'warehouse_label')),
    agency_id UUID REFERENCES auth.users(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    label_size TEXT NOT NULL DEFAULT 'A4',
    orientation TEXT NOT NULL DEFAULT 'portrait' CHECK (orientation IN ('portrait', 'landscape')),
    template_config JSONB NOT NULL DEFAULT '{}',
    branding_config JSONB NOT NULL DEFAULT '{}',
    fields_config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create agency_branding_settings table
CREATE TABLE IF NOT EXISTS public.agency_branding_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID REFERENCES auth.users(id),
    logo_url TEXT,
    header_logo_url TEXT,
    watermark_url TEXT,
    primary_color TEXT NOT NULL DEFAULT '#10b981',
    secondary_color TEXT NOT NULL DEFAULT '#ef4444',
    accent_color TEXT NOT NULL DEFAULT '#3b82f6',
    text_color TEXT NOT NULL DEFAULT '#1f2937',
    background_color TEXT NOT NULL DEFAULT '#ffffff',
    primary_font TEXT NOT NULL DEFAULT 'Roboto',
    secondary_font TEXT NOT NULL DEFAULT 'Arial',
    font_sizes JSONB NOT NULL DEFAULT '{"title": 16, "subtitle": 14, "body": 12, "small": 10}',
    default_label_size TEXT NOT NULL DEFAULT 'A4',
    default_orientation TEXT NOT NULL DEFAULT 'portrait',
    enable_thermal_printing BOOLEAN DEFAULT true,
    enable_watermark BOOLEAN DEFAULT false,
    contact_info JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create label_print_history table
CREATE TABLE IF NOT EXISTS public.label_print_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES public.label_templates(id),
    shipment_id UUID,
    agency_id UUID REFERENCES auth.users(id),
    printed_by UUID NOT NULL REFERENCES auth.users(id),
    print_type TEXT NOT NULL CHECK (print_type IN ('original', 'duplicate', 'copy')),
    label_data JSONB NOT NULL DEFAULT '{}',
    tracking_number TEXT,
    qr_code_data TEXT,
    barcode_data TEXT,
    print_format TEXT NOT NULL DEFAULT 'PDF',
    printer_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create label_scan_logs table
CREATE TABLE IF NOT EXISTS public.label_scan_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_number TEXT NOT NULL,
    scan_type TEXT NOT NULL CHECK (scan_type IN ('qr_code', 'barcode')),
    scanned_by UUID REFERENCES auth.users(id),
    scan_location TEXT,
    device_info JSONB DEFAULT '{}',
    user_agent TEXT,
    ip_address INET,
    redirect_url TEXT,
    scan_success BOOLEAN DEFAULT true,
    additional_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create system_label_settings table
CREATE TABLE IF NOT EXISTS public.system_label_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL DEFAULT '{}',
    setting_type TEXT NOT NULL CHECK (setting_type IN ('global', 'agency_default', 'template_default')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.label_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_branding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_print_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_label_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for label_templates
CREATE POLICY "Users can view active templates" ON public.label_templates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Agency staff can manage their templates" ON public.label_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shipping_company_staff scs 
            WHERE scs.user_id = auth.uid() 
            AND scs.company_id = agency_id
        ) OR created_by = auth.uid()
    );

CREATE POLICY "System can manage all templates" ON public.label_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- RLS Policies for agency_branding_settings
CREATE POLICY "Agency staff can manage their branding" ON public.agency_branding_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shipping_company_staff scs 
            WHERE scs.user_id = auth.uid() 
            AND scs.company_id = agency_id
            AND scs.role IN ('admin', 'manager')
        )
    );

-- RLS Policies for label_print_history
CREATE POLICY "Users can view their print history" ON public.label_print_history
    FOR SELECT USING (printed_by = auth.uid());

CREATE POLICY "Agency staff can view agency print history" ON public.label_print_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shipping_company_staff scs 
            WHERE scs.user_id = auth.uid() 
            AND scs.company_id = agency_id
        )
    );

CREATE POLICY "Users can create print records" ON public.label_print_history
    FOR INSERT WITH CHECK (printed_by = auth.uid());

-- RLS Policies for label_scan_logs
CREATE POLICY "Public can insert scan logs" ON public.label_scan_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Agency staff can view scan logs" ON public.label_scan_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shipping_company_staff scs 
            WHERE scs.user_id = auth.uid()
        )
    );

-- RLS Policies for system_label_settings
CREATE POLICY "Admins can manage system settings" ON public.system_label_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

CREATE POLICY "Users can view active settings" ON public.system_label_settings
    FOR SELECT USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_label_templates_agency_id ON public.label_templates(agency_id);
CREATE INDEX IF NOT EXISTS idx_label_templates_type ON public.label_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_label_print_history_tracking ON public.label_print_history(tracking_number);
CREATE INDEX IF NOT EXISTS idx_label_scan_logs_tracking ON public.label_scan_logs(tracking_number);
CREATE INDEX IF NOT EXISTS idx_label_scan_logs_created_at ON public.label_scan_logs(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_label_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_label_templates_updated_at
    BEFORE UPDATE ON public.label_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_label_updated_at();

CREATE TRIGGER update_agency_branding_updated_at
    BEFORE UPDATE ON public.agency_branding_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_label_updated_at();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_label_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_label_updated_at();

-- Insert default system settings
INSERT INTO public.system_label_settings (setting_key, setting_value, setting_type, is_active) VALUES
('default_label_sizes', '["A4", "A5", "A6", "4x6", "Receipt"]', 'global', true),
('default_fonts', '["Roboto", "Arial", "Montserrat", "Ubuntu", "Courier"]', 'global', true),
('barcode_settings', '{"type": "CODE128", "height": 50, "width": 2}', 'global', true),
('qr_code_settings', '{"type": "QR", "size": 100, "error_correction": "M"}', 'global', true),
('thermal_printer_settings', '{"dpi": 203, "width": "4 inch", "supported_formats": ["PDF", "PNG"]}', 'global', true),
('tracking_url_template', '{"base_url": "https://camerpulse.cm/track/{tracking_number}", "redirect_enabled": true}', 'global', true)
ON CONFLICT (setting_key) DO NOTHING;