export interface LabelField {
  id: string;
  label: string;
  field_type: 'text' | 'barcode' | 'qr_code' | 'image';
  position: { x: number; y: number };
  size: { width: number; height: number };
  is_required: boolean;
  validation_rules: Record<string, any>;
  style?: {
    fontSize?: number;
    color?: string;
    fontWeight?: string;
    textAlign?: string;
  };
  default_value?: string;
}

export interface LabelDimensions {
  width: number;
  height: number;
}

export interface TemplateField {
  id: string;
  template_name: string;
  fields: LabelField[];
  dimensions: LabelDimensions;
}