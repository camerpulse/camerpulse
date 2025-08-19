// Enhanced authentication security utilities

export interface AuthSecurityConfig {
  maxLoginAttempts: number;
  lockoutDurationMs: number;
  sessionTimeoutMs: number;
  requirePasswordComplexity: boolean;
}

const DEFAULT_AUTH_CONFIG: AuthSecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  sessionTimeoutMs: 24 * 60 * 60 * 1000, // 24 hours
  requirePasswordComplexity: true
};

/**
 * Enhanced password strength validation
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('At least 8 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('One uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('One lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('One number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('One special character');
  }
  
  // Check for common patterns
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters
    /123456|654321|qwerty|password|admin/i // Common passwords
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Avoid common patterns');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};