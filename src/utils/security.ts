// Security utilities for input validation and XSS protection

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove script tags and javascript: protocols
  let sanitized = input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<meta[^>]*>/gi, '');
  
  // Encode potentially dangerous characters
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized;
}

/**
 * Validate message content
 */
export function validateMessageContent(content: string): ValidationResult {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Message content cannot be empty' };
  }
  
  if (content.length > 10000) {
    return { isValid: false, error: 'Message content exceeds maximum length of 10,000 characters' };
  }
  
  // Check for potentially malicious content
  const dangerousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      return { isValid: false, error: 'Message contains potentially dangerous content' };
    }
  }
  
  return { isValid: true, sanitized: sanitizeInput(content) };
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File): ValidationResult {
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' };
  }
  
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 100MB limit' };
  }
  
  // Check for potentially dangerous file names
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return { isValid: false, error: 'Invalid file name' };
  }
  
  return { isValid: true };
}

/**
 * Validate conversation title
 */
export function validateConversationTitle(title: string): ValidationResult {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Conversation title cannot be empty' };
  }
  
  if (title.length > 200) {
    return { isValid: false, error: 'Conversation title exceeds maximum length of 200 characters' };
  }
  
  return { isValid: true, sanitized: sanitizeInput(title) };
}

/**
 * Rate limiting utility
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  reset(key: string): void {
    this.requests.delete(key);
  }
}

// Global rate limiters
export const messageRateLimiter = new RateLimiter(30, 60000); // 30 messages per minute
export const fileUploadRateLimiter = new RateLimiter(10, 60000); // 10 uploads per minute
export const conversationRateLimiter = new RateLimiter(5, 60000); // 5 conversations per minute

/**
 * Content Security Policy configuration
 */
export const CSP_DIRECTIVES = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
  'style-src': "'self' 'unsafe-inline'",
  'img-src': "'self' data: blob: https:",
  'media-src': "'self' blob:",
  'connect-src': "'self' wss: https:",
  'font-src': "'self'",
  'object-src': "'none'",
  'frame-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'"
};

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

/**
 * Audit logging utility
 */
export async function logSecurityEvent(
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
) {
  try {
    // This would integrate with your Supabase client
    console.log('Security Event:', {
      action,
      resourceType,
      resourceId,
      details,
      severity,
      timestamp: new Date().toISOString()
    });
    
    // In production, this would call your audit logging function
    // await supabase.rpc('log_security_event', {
    //   p_action_type: action,
    //   p_resource_type: resourceType,
    //   p_resource_id: resourceId,
    //   p_details: details || {},
    //   p_severity: severity
    // });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}