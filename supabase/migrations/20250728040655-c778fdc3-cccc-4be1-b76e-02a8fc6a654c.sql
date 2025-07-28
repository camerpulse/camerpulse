-- Phase 1: Complete missing components for Advanced Label Printing Engine

-- Check if agency_branding_settings table exists, if not create it
CREATE TABLE IF NOT EXISTS public.agency_branding_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID,
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

-- Enable RLS if not already enabled
ALTER TABLE public.agency_branding_settings ENABLE ROW LEVEL SECURITY;

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_agency_branding_agency_id ON public.agency_branding_settings(agency_id);

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_agency_branding_updated_at') THEN
        CREATE TRIGGER update_agency_branding_updated_at
            BEFORE UPDATE ON public.agency_branding_settings
            FOR EACH ROW EXECUTE FUNCTION public.update_label_updated_at();
    END IF;
END $$;

-- Insert default system settings (only if they don't exist)
INSERT INTO public.system_label_settings (setting_key, setting_value, setting_type, is_active) VALUES
('default_label_sizes', '["A4", "A5", "A6", "4x6", "Receipt"]', 'global', true),
('default_fonts', '["Roboto", "Arial", "Montserrat", "Ubuntu", "Courier"]', 'global', true),
('barcode_settings', '{"type": "CODE128", "height": 50, "width": 2}', 'global', true),
('qr_code_settings', '{"type": "QR", "size": 100, "error_correction": "M"}', 'global', true),
('thermal_printer_settings', '{"dpi": 203, "width": "4 inch", "supported_formats": ["PDF", "PNG"]}', 'global', true),
('tracking_url_template', '{"base_url": "https://camerpulse.cm/track/{tracking_number}", "redirect_enabled": true}', 'global', true)
ON CONFLICT (setting_key) DO NOTHING;