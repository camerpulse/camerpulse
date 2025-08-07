import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { validateMessageContent, sanitizeInput } from '@/utils/security';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSecureChange?: (value: string, isValid: boolean) => void;
  maxLength?: number;
  validateXSS?: boolean;
}

interface SecureTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSecureChange?: (value: string, isValid: boolean) => void;
  maxLength?: number;
  validateXSS?: boolean;
}

/**
 * Secure input component with built-in XSS protection and validation
 */
export const SecureInput: React.FC<SecureInputProps> = ({
  onSecureChange,
  onChange,
  maxLength = 1000,
  validateXSS = true,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    if (validateXSS) {
      const validation = validateMessageContent(rawValue);
      const sanitizedValue = validation.isValid ? validation.sanitized || rawValue : sanitizeInput(rawValue);
      
      // Update the input value with sanitized content
      e.target.value = sanitizedValue;
      
      onSecureChange?.(sanitizedValue, validation.isValid);
    } else {
      onSecureChange?.(rawValue, true);
    }
    
    onChange?.(e);
  };

  return (
    <Input
      {...props}
      maxLength={maxLength}
      onChange={handleChange}
    />
  );
};

/**
 * Secure textarea component with built-in XSS protection and validation
 */
export const SecureTextarea: React.FC<SecureTextareaProps> = ({
  onSecureChange,
  onChange,
  maxLength = 10000,
  validateXSS = true,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = e.target.value;
    
    if (validateXSS) {
      const validation = validateMessageContent(rawValue);
      const sanitizedValue = validation.isValid ? validation.sanitized || rawValue : sanitizeInput(rawValue);
      
      // Update the textarea value with sanitized content
      e.target.value = sanitizedValue;
      
      onSecureChange?.(sanitizedValue, validation.isValid);
    } else {
      onSecureChange?.(rawValue, true);
    }
    
    onChange?.(e);
  };

  return (
    <Textarea
      {...props}
      maxLength={maxLength}
      onChange={handleChange}
    />
  );
};