import React, { useCallback } from 'react';
import { SecureInput, SecureTextarea } from './SecureInput';
import { useToast } from '@/hooks/use-toast';

interface SecurityEnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValidationError?: (error: string) => void;
  enableCSRF?: boolean;
  logSecurityEvents?: boolean;
}

interface SecurityEnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onValidationError?: (error: string) => void;
  enableCSRF?: boolean;
  logSecurityEvents?: boolean;
}

/**
 * Enhanced secure input with advanced security features
 */
export const SecurityEnhancedInput: React.FC<SecurityEnhancedInputProps> = ({
  onValidationError,
  enableCSRF = true,
  logSecurityEvents = true,
  onChange,
  ...props
}) => {
  const { toast } = useToast();

  const handleSecureChange = useCallback((value: string, isValid: boolean) => {
    if (!isValid && logSecurityEvents) {
      // Log security event for potential threats
      console.warn('Security validation failed for input:', { value: value.substring(0, 50) });
      
      if (onValidationError) {
        onValidationError('Input contains potentially dangerous content');
      } else {
        toast({
          title: "Security Warning",
          description: "Input contains potentially dangerous content and has been sanitized",
          variant: "destructive"
        });
      }
    }
  }, [onValidationError, logSecurityEvents, toast]);

  return (
    <SecureInput
      {...props}
      onSecureChange={handleSecureChange}
      onChange={onChange}
      validateXSS={true}
      maxLength={props.maxLength || 1000}
    />
  );
};

/**
 * Enhanced secure textarea with advanced security features
 */
export const SecurityEnhancedTextarea: React.FC<SecurityEnhancedTextareaProps> = ({
  onValidationError,
  enableCSRF = true,
  logSecurityEvents = true,
  onChange,
  ...props
}) => {
  const { toast } = useToast();

  const handleSecureChange = useCallback((value: string, isValid: boolean) => {
    if (!isValid && logSecurityEvents) {
      // Log security event for potential threats
      console.warn('Security validation failed for textarea:', { value: value.substring(0, 50) });
      
      if (onValidationError) {
        onValidationError('Input contains potentially dangerous content');
      } else {
        toast({
          title: "Security Warning",
          description: "Input contains potentially dangerous content and has been sanitized",
          variant: "destructive"
        });
      }
    }
  }, [onValidationError, logSecurityEvents, toast]);

  return (
    <SecureTextarea
      {...props}
      onSecureChange={handleSecureChange}
      onChange={onChange}
      validateXSS={true}
      maxLength={props.maxLength || 10000}
    />
  );
};