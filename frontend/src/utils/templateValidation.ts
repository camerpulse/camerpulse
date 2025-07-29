import { TemplateField, LABEL_SIZES, LabelSize } from './labelGeneration';

// Template validation utilities
export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Field position validation
export const validateFieldPosition = (
  field: TemplateField,
  labelSize: LabelSize
): string[] => {
  const errors: string[] = [];
  const size = LABEL_SIZES[labelSize];

  // Check if field is within label bounds
  if (field.position.x < 0) {
    errors.push(`${field.label}: X position cannot be negative`);
  }

  if (field.position.y < 0) {
    errors.push(`${field.label}: Y position cannot be negative`);
  }

  if (field.position.x + field.size.width > size.width) {
    errors.push(`${field.label}: Field extends beyond right edge of label`);
  }

  if (field.position.y + field.size.height > size.height) {
    errors.push(`${field.label}: Field extends beyond bottom edge of label`);
  }

  return errors;
};

// Field overlap detection
export const detectFieldOverlaps = (fields: TemplateField[]): string[] => {
  const errors: string[] = [];
  const activeFields = fields.filter(f => f.enabled);

  for (let i = 0; i < activeFields.length; i++) {
    for (let j = i + 1; j < activeFields.length; j++) {
      const field1 = activeFields[i];
      const field2 = activeFields[j];

      // Check if rectangles overlap
      const rect1 = {
        left: field1.position.x,
        top: field1.position.y,
        right: field1.position.x + field1.size.width,
        bottom: field1.position.y + field1.size.height,
      };

      const rect2 = {
        left: field2.position.x,
        top: field2.position.y,
        right: field2.position.x + field2.size.width,
        bottom: field2.position.y + field2.size.height,
      };

      if (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
      ) {
        errors.push(`Fields "${field1.label}" and "${field2.label}" overlap`);
      }
    }
  }

  return errors;
};

// Field size validation
export const validateFieldSize = (field: TemplateField): string[] => {
  const errors: string[] = [];

  if (field.size.width <= 0) {
    errors.push(`${field.label}: Width must be positive`);
  }

  if (field.size.height <= 0) {
    errors.push(`${field.label}: Height must be positive`);
  }

  // Type-specific size validations
  switch (field.type) {
    case 'barcode':
      if (field.size.width < 50) {
        errors.push(`${field.label}: Barcode width should be at least 50pt for readability`);
      }
      if (field.size.height < 30) {
        errors.push(`${field.label}: Barcode height should be at least 30pt for readability`);
      }
      break;

    case 'qr_code':
      if (field.size.width < 50) {
        errors.push(`${field.label}: QR code width should be at least 50pt for readability`);
      }
      if (field.size.height < 50) {
        errors.push(`${field.label}: QR code height should be at least 50pt for readability`);
      }
      // QR codes should be square
      if (Math.abs(field.size.width - field.size.height) > 5) {
        errors.push(`${field.label}: QR codes should be square (width ≈ height)`);
      }
      break;

    case 'text':
      if (field.style?.fontSize && field.size.height < field.style.fontSize * 1.2) {
        errors.push(`${field.label}: Height is too small for the font size`);
      }
      break;
  }

  return errors;
};

// Text field validation
export const validateTextField = (field: TemplateField): string[] => {
  const errors: string[] = [];

  if (field.type !== 'text') return errors;

  if (field.style?.fontSize && field.style.fontSize < 6) {
    errors.push(`${field.label}: Font size should be at least 6pt for readability`);
  }

  if (field.style?.fontSize && field.style.fontSize > 72) {
    errors.push(`${field.label}: Font size should not exceed 72pt`);
  }

  return errors;
};

// Required fields validation
export const validateRequiredFields = (fields: TemplateField[]): string[] => {
  const errors: string[] = [];
  const activeFields = fields.filter(f => f.enabled);
  
  // Check for essential shipping label fields
  const essentialFields = [
    { id: 'tracking_number', name: 'Tracking Number' },
    { id: 'sender', name: 'Sender Information' },
    { id: 'receiver', name: 'Receiver Information' },
  ];

  for (const essential of essentialFields) {
    const hasField = activeFields.some(f => 
      f.id === essential.id || 
      f.label.toLowerCase().includes(essential.name.toLowerCase())
    );

    if (!hasField) {
      errors.push(`Missing essential field: ${essential.name}`);
    }
  }

  return errors;
};

// Print quality validation
export const validatePrintQuality = (
  fields: TemplateField[],
  labelSize: LabelSize
): string[] => {
  const warnings: string[] = [];
  const size = LABEL_SIZES[labelSize];

  // Check for fields that might be too small for thermal printing
  const thermalMinSizes = {
    text: { width: 30, height: 12 },
    barcode: { width: 60, height: 25 },
    qr_code: { width: 40, height: 40 },
  };

  fields.forEach(field => {
    if (!field.enabled) return;

    const minSize = thermalMinSizes[field.type as keyof typeof thermalMinSizes];
    if (minSize) {
      if (field.size.width < minSize.width || field.size.height < minSize.height) {
        warnings.push(
          `${field.label}: Size may be too small for thermal printing ` +
          `(minimum recommended: ${minSize.width}×${minSize.height}pt)`
        );
      }
    }
  });

  // Check overall label density
  const totalFieldArea = fields
    .filter(f => f.enabled)
    .reduce((total, field) => total + (field.size.width * field.size.height), 0);
  
  const labelArea = size.width * size.height;
  const density = totalFieldArea / labelArea;

  if (density > 0.8) {
    warnings.push('Label appears crowded. Consider reducing field sizes or using a larger label');
  }

  return warnings;
};

// Complete template validation
export const validateTemplate = (
  fields: TemplateField[],
  labelSize: LabelSize,
  templateName: string
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic template validation
  if (!templateName.trim()) {
    errors.push('Template name is required');
  }

  if (fields.length === 0) {
    errors.push('Template must have at least one field');
  }

  const activeFields = fields.filter(f => f.enabled);
  if (activeFields.length === 0) {
    errors.push('Template must have at least one enabled field');
  }

  // Validate each field
  fields.forEach(field => {
    // Position validation
    errors.push(...validateFieldPosition(field, labelSize));
    
    // Size validation
    errors.push(...validateFieldSize(field));
    
    // Text field validation
    errors.push(...validateTextField(field));
  });

  // Overlap detection
  errors.push(...detectFieldOverlaps(fields));

  // Required fields validation
  errors.push(...validateRequiredFields(fields));

  // Print quality warnings
  warnings.push(...validatePrintQuality(fields, labelSize));

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Auto-layout suggestions
export const suggestLayout = (
  fields: TemplateField[],
  labelSize: LabelSize
): TemplateField[] => {
  const size = LABEL_SIZES[labelSize];
  const margin = 20;
  const spacing = 10;
  
  const suggestions = [...fields];
  let currentY = margin;

  // Sort fields by priority (required first, then by type)
  const sortedFields = suggestions.sort((a, b) => {
    if (a.required && !b.required) return -1;
    if (!a.required && b.required) return 1;
    
    const typeOrder = ['text', 'barcode', 'qr_code', 'image', 'line', 'rectangle'];
    return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
  });

  // Layout fields in rows
  sortedFields.forEach((field, index) => {
    if (!field.enabled) return;

    // Check if field fits in current row
    const availableWidth = size.width - (2 * margin);
    
    if (field.size.width <= availableWidth) {
      field.position.x = margin;
      field.position.y = currentY;
      
      // Move to next row
      currentY += field.size.height + spacing;
    } else {
      // Scale down field to fit
      const scale = availableWidth / field.size.width;
      field.size.width = availableWidth;
      field.size.height *= scale;
      
      field.position.x = margin;
      field.position.y = currentY;
      
      currentY += field.size.height + spacing;
    }
  });

  return suggestions;
};

// Export validation utilities
export const ValidationUtils = {
  validateFieldPosition,
  detectFieldOverlaps,
  validateFieldSize,
  validateTextField,
  validateRequiredFields,
  validatePrintQuality,
  validateTemplate,
  suggestLayout,
};