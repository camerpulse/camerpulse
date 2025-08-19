import { useState, useCallback } from 'react';
import { validateMessageContent, validateFileUpload, messageRateLimiter } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

interface UseSecureFormOptions {
  maxInputLength?: number;
  enableRateLimit?: boolean;
  sanitizeInput?: boolean;
  allowedFileTypes?: string[];
  maxFileSize?: number;
}

export const useSecureForm = (options: UseSecureFormOptions = {}) => {
  const {
    maxInputLength = 1000,
    enableRateLimit = true,
    sanitizeInput = true,
    allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    maxFileSize = 5 * 1024 * 1024 // 5MB
  } = options;

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateInput = useCallback((input: string, fieldName: string = 'input'): string | null => {
    if (!input || input.trim() === '') {
      return `${fieldName} is required`;
    }

    if (input.length > maxInputLength) {
      return `${fieldName} must be less than ${maxInputLength} characters`;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>/i,
      /<object[^>]*>/i,
      /<embed[^>]*>/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(input)) {
        return `${fieldName} contains invalid content`;
      }
    }

    return null;
  }, [maxInputLength]);

  const validateFile = useCallback((file: File): string | null => {
    if (!allowedFileTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }

    if (file.size > maxFileSize) {
      return `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`;
    }

    // Check for suspicious file names
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.js', '.vbs'];
    const fileName = file.name.toLowerCase();
    
    for (const ext of suspiciousExtensions) {
      if (fileName.endsWith(ext)) {
        return 'File type not allowed for security reasons';
      }
    }

    return null;
  }, [allowedFileTypes, maxFileSize]);

  const sanitizeValue = useCallback((value: string): string => {
    if (!sanitizeInput) return value;

    // Remove dangerous HTML tags and attributes
    let sanitized = value
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>.*?<\/embed>/gi, '');

    return sanitized.trim();
  }, [sanitizeInput]);

  const checkRateLimit = useCallback((action: string = 'form_submit'): boolean => {
    if (!enableRateLimit) return true;

    if (!messageRateLimiter.checkLimit('anonymous')) {
      toast({
        title: "Rate Limit Exceeded",
        description: "Please wait before submitting again",
        variant: "destructive"
      });
      return false;
    }

    return true;
  }, [enableRateLimit, toast]);

  const secureSubmit = useCallback(async (
    formData: Record<string, any>,
    submitFunction: (data: Record<string, any>) => Promise<void>
  ) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Rate limiting check
      if (!checkRateLimit()) {
        return;
      }

      // Validate and sanitize all string inputs
      const sanitizedData: Record<string, any> = {};
      const errors: string[] = [];

      for (const [key, value] of Object.entries(formData)) {
        if (typeof value === 'string') {
          const error = validateInput(value, key);
          if (error) {
            errors.push(error);
            continue;
          }
          sanitizedData[key] = sanitizeValue(value);
        } else if (value instanceof File) {
          const error = validateFile(value);
          if (error) {
            errors.push(error);
            continue;
          }
          sanitizedData[key] = value;
        } else {
          sanitizedData[key] = value;
        }
      }

      if (errors.length > 0) {
        toast({
          title: "Validation Error",
          description: errors.join(', '),
          variant: "destructive"
        });
        return;
      }

      // Execute the submit function with sanitized data
      await submitFunction(sanitizedData);

    } catch (error: any) {
      console.error('Secure form submission error:', error);
      toast({
        title: "Submission Error",
        description: error.message || "An error occurred while submitting the form",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, checkRateLimit, validateInput, validateFile, sanitizeValue, toast]);

  return {
    validateInput,
    validateFile,
    sanitizeValue,
    checkRateLimit,
    secureSubmit,
    isSubmitting
  };
};