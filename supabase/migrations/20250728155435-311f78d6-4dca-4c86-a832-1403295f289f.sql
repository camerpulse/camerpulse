-- First check if the label_templates table exists and has the right structure
CREATE TABLE IF NOT EXISTS label_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  template_config JSONB NOT NULL DEFAULT '{}',
  template_type TEXT NOT NULL DEFAULT 'shipping_label',
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE label_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view active templates" 
ON label_templates FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create templates" 
ON label_templates FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their templates" 
ON label_templates FOR UPDATE 
USING (auth.uid() = created_by);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_label_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_label_templates_updated_at
  BEFORE UPDATE ON label_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_label_templates_updated_at();