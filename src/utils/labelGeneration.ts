import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

// QR Code generation utilities
export interface QRCodeOptions {
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
}

export const generateQRCode = async (
  text: string, 
  options: QRCodeOptions = {}
): Promise<string> => {
  const defaultOptions = {
    width: options.size || 100,
    errorCorrectionLevel: options.errorCorrectionLevel || 'M' as const,
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#FFFFFF',
    },
  };

  try {
    return await QRCode.toDataURL(text, defaultOptions);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Barcode generation utilities
export interface BarcodeOptions {
  format?: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC';
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  textPosition?: 'bottom' | 'top';
  background?: string;
  lineColor?: string;
}

export const generateBarcode = (
  text: string,
  options: BarcodeOptions = {}
): string => {
  const canvas = document.createElement('canvas');
  const defaultOptions = {
    format: options.format || 'CODE128',
    width: options.width || 2,
    height: options.height || 50,
    displayValue: options.displayValue !== false,
    fontSize: options.fontSize || 12,
    textAlign: options.textAlign || 'center' as const,
    textPosition: options.textPosition || 'bottom' as const,
    background: options.background || '#FFFFFF',
    lineColor: options.lineColor || '#000000',
  };

  try {
    JsBarcode(canvas, text, defaultOptions);
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating barcode:', error);
    throw new Error('Failed to generate barcode');
  }
};

// Tracking URL generation
export const generateTrackingURL = (trackingNumber: string, domain?: string): string => {
  const baseDomain = domain || 'https://camerpulse.cm';
  return `${baseDomain}/track/${trackingNumber}`;
};

// Generate QR code with tracking URL
export const generateTrackingQRCode = async (
  trackingNumber: string,
  domain?: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  const trackingURL = generateTrackingURL(trackingNumber, domain);
  return generateQRCode(trackingURL, options);
};

// Label size presets
export const LABEL_SIZES = {
  A4: { width: 595, height: 842, unit: 'pt' },
  A5: { width: 420, height: 595, unit: 'pt' },
  A6: { width: 298, height: 420, unit: 'pt' },
  '4x6': { width: 288, height: 432, unit: 'pt' },
  'Receipt': { width: 226, height: 600, unit: 'pt' },
} as const;

export type LabelSize = keyof typeof LABEL_SIZES;

// Font options
export const FONT_OPTIONS = [
  'Roboto',
  'Arial', 
  'Montserrat',
  'Ubuntu',
  'Courier',
] as const;

export type FontOption = typeof FONT_OPTIONS[number];

// Color scheme presets
export const COLOR_SCHEMES = {
  camerpulse: {
    primary: '#10b981',
    secondary: '#ef4444',
    accent: '#3b82f6',
    text: '#1f2937',
    background: '#ffffff',
  },
  professional: {
    primary: '#1f2937',
    secondary: '#6b7280',
    accent: '#3b82f6',
    text: '#111827',
    background: '#ffffff',
  },
  warm: {
    primary: '#f59e0b',
    secondary: '#ef4444',
    accent: '#10b981',
    text: '#1f2937',
    background: '#fffbeb',
  },
} as const;

export type ColorScheme = keyof typeof COLOR_SCHEMES;

// Template field types
export interface TemplateField {
  id: string;
  type: 'text' | 'barcode' | 'qr_code' | 'image' | 'line' | 'rectangle';
  label: string;
  enabled: boolean;
  required: boolean;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  style?: {
    fontSize?: number;
    fontFamily?: FontOption;
    fontWeight?: 'normal' | 'bold';
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    border?: {
      width: number;
      color: string;
      style: 'solid' | 'dashed' | 'dotted';
    };
  };
  data?: any; // Field-specific data (e.g., barcode format, QR options)
}

// Default template fields
export const DEFAULT_TEMPLATE_FIELDS: TemplateField[] = [
  {
    id: 'sender',
    type: 'text',
    label: 'Sender Information',
    enabled: true,
    required: true,
    position: { x: 20, y: 20 },
    size: { width: 250, height: 80 },
    style: {
      fontSize: 12,
      fontFamily: 'Roboto',
      fontWeight: 'normal',
      color: '#1f2937',
    },
  },
  {
    id: 'receiver',
    type: 'text',
    label: 'Receiver Information',
    enabled: true,
    required: true,
    position: { x: 300, y: 20 },
    size: { width: 250, height: 80 },
    style: {
      fontSize: 12,
      fontFamily: 'Roboto',
      fontWeight: 'normal',
      color: '#1f2937',
    },
  },
  {
    id: 'tracking_number',
    type: 'text',
    label: 'Tracking Number',
    enabled: true,
    required: true,
    position: { x: 20, y: 120 },
    size: { width: 200, height: 30 },
    style: {
      fontSize: 16,
      fontFamily: 'Roboto',
      fontWeight: 'bold',
      color: '#1f2937',
    },
  },
  {
    id: 'barcode',
    type: 'barcode',
    label: 'Barcode',
    enabled: true,
    required: true,
    position: { x: 20, y: 160 },
    size: { width: 200, height: 50 },
    data: {
      format: 'CODE128',
      displayValue: true,
    },
  },
  {
    id: 'qr_code',
    type: 'qr_code',
    label: 'QR Code',
    enabled: true,
    required: true,
    position: { x: 450, y: 120 },
    size: { width: 100, height: 100 },
    data: {
      errorCorrectionLevel: 'M',
      includeTrackingURL: true,
    },
  },
];

// Validation utilities
export const validateTemplateField = (field: TemplateField): string[] => {
  const errors: string[] = [];

  if (!field.label.trim()) {
    errors.push('Field label is required');
  }

  if (field.position.x < 0 || field.position.y < 0) {
    errors.push('Position coordinates must be positive');
  }

  if (field.size.width <= 0 || field.size.height <= 0) {
    errors.push('Size dimensions must be positive');
  }

  if (field.type === 'text' && field.style?.fontSize && field.style.fontSize < 6) {
    errors.push('Font size must be at least 6pt');
  }

  return errors;
};

export const validateTemplate = (fields: TemplateField[]): string[] => {
  const errors: string[] = [];
  
  // Check for required fields
  const requiredFieldTypes = ['tracking_number'];
  const presentFieldTypes = fields.filter(f => f.enabled).map(f => f.id);
  
  for (const requiredType of requiredFieldTypes) {
    if (!presentFieldTypes.includes(requiredType)) {
      errors.push(`Required field '${requiredType}' is missing`);
    }
  }

  // Validate individual fields
  fields.forEach((field, index) => {
    const fieldErrors = validateTemplateField(field);
    fieldErrors.forEach(error => {
      errors.push(`Field ${index + 1} (${field.label}): ${error}`);
    });
  });

  return errors;
};