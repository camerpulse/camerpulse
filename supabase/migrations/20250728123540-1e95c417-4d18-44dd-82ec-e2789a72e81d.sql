-- Create label templates table
CREATE TABLE public.label_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  canvas_dimensions JSONB NOT NULL DEFAULT '{"width": 400, "height": 600}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create label template usage tracking
CREATE TABLE public.label_template_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.label_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL DEFAULT 'create', -- 'create', 'edit', 'print', 'download'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shipment tracking table
CREATE TABLE public.shipment_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_info JSONB NOT NULL DEFAULT '{}',
  receiver_info JSONB NOT NULL DEFAULT '{}',
  delivery_type TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'pending',
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  last_scanned_location JSONB,
  events JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tracking events table
CREATE TABLE public.tracking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL REFERENCES public.shipment_tracking(tracking_number) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'pickup', 'transit', 'delivery', 'exception'
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.label_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_template_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for label_templates
CREATE POLICY "Users can view public templates" 
ON public.label_templates 
FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own templates" 
ON public.label_templates 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for label_template_usage
CREATE POLICY "Users can view their template usage" 
ON public.label_template_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can log their template usage" 
ON public.label_template_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for shipment_tracking
CREATE POLICY "Users can view their shipments" 
ON public.shipment_tracking 
FOR SELECT 
USING (auth.uid() = user_id OR tracking_number IN (
  SELECT tracking_number FROM public.shipment_tracking WHERE auth.uid() = user_id
));

CREATE POLICY "Users can manage their shipments" 
ON public.shipment_tracking 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view tracking by tracking number" 
ON public.shipment_tracking 
FOR SELECT 
USING (true);

-- RLS Policies for tracking_events
CREATE POLICY "Public can view tracking events" 
ON public.tracking_events 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert tracking events" 
ON public.tracking_events 
FOR INSERT 
WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_label_templates_updated_at
  BEFORE UPDATE ON public.label_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipment_tracking_updated_at
  BEFORE UPDATE ON public.shipment_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();