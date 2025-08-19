import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { validateNoFrenchText, FRENCH_CONTENT_ERROR } from '@/utils/frenchTextValidator';

interface EnglishOnlyValidationProps {
  text: string;
  show?: boolean;
}

/**
 * Component that validates and displays warning for French content
 */
export const EnglishOnlyValidation: React.FC<EnglishOnlyValidationProps> = ({ 
  text, 
  show = true 
}) => {
  const hasFrenchContent = text && !validateNoFrenchText(text);
  
  if (!show || !hasFrenchContent) return null;
  
  return (
    <Alert variant="destructive" className="mt-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        {FRENCH_CONTENT_ERROR}
      </AlertDescription>
    </Alert>
  );
};

/**
 * Hook for validating form fields in real-time
 */
export const useEnglishOnlyValidation = (fields: Record<string, string>) => {
  const [errors, setErrors] = React.useState<Record<string, boolean>>({});
  
  React.useEffect(() => {
    const newErrors: Record<string, boolean> = {};
    
    Object.entries(fields).forEach(([fieldName, value]) => {
      if (value && !validateNoFrenchText(value)) {
        newErrors[fieldName] = true;
      }
    });
    
    setErrors(newErrors);
  }, [fields]);
  
  return {
    errors,
    hasErrors: Object.keys(errors).length > 0,
    getFieldError: (fieldName: string) => errors[fieldName] || false
  };
};