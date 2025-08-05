// Security utilities for input validation and XSS protection

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Sanitize user input to prevent XSS attacks - Enhanced version
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove dangerous HTML tags and elements
  let sanitized = input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<form[^>]*>.*?<\/form>/gi, '')
    .replace(/<input[^>]*>/gi, '')
    .replace(/<button[^>]*>.*?<\/button>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '');
  
  // Remove dangerous protocols
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/data:application\//gi, '');
  
  // Remove event handlers more comprehensively
  sanitized = sanitized
    .replace(/on\w+\s*=/gi, '')
    .replace(/xmlns\s*=/gi, '')
    .replace(/formaction\s*=/gi, '');
  
  // Encode HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  // Additional security: remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
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
 * Validate file upload - Enhanced security
 */
export function validateFileUpload(file: File): ValidationResult {
  // Strict allowed types - more restrictive for security
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'application/pdf',
    'text/plain'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' };
  }
  
  // More conservative file size limits based on type
  const maxSizes = {
    'image/jpeg': 10 * 1024 * 1024, // 10MB
    'image/png': 10 * 1024 * 1024,  // 10MB
    'image/gif': 5 * 1024 * 1024,   // 5MB
    'image/webp': 10 * 1024 * 1024, // 10MB
    'video/mp4': 50 * 1024 * 1024,  // 50MB
    'video/webm': 50 * 1024 * 1024, // 50MB
    'audio/mpeg': 10 * 1024 * 1024, // 10MB
    'audio/wav': 10 * 1024 * 1024,  // 10MB
    'application/pdf': 25 * 1024 * 1024, // 25MB
    'text/plain': 1 * 1024 * 1024   // 1MB
  };
  
  const maxSize = maxSizes[file.type as keyof typeof maxSizes] || 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit for this file type` };
  }
  
  // Enhanced file name validation
  const dangerousPatterns = [
    /\.\./,           // Directory traversal
    /[\/\\]/,         // Path separators
    /\x00/,           // Null bytes
    /[<>:"|?*]/,      // Invalid filename characters
    /^\./,            // Hidden files
    /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|app|deb|pkg|dmg)$/i, // Executable extensions
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i // Reserved Windows names
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(file.name)) {
      return { isValid: false, error: 'Invalid or potentially dangerous file name' };
    }
  }
  
  // Check file name length
  if (file.name.length > 255) {
    return { isValid: false, error: 'File name too long' };
  }
  
  // Ensure file has an extension
  if (!file.name.includes('.')) {
    return { isValid: false, error: 'File must have an extension' };
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

// Enhanced rate limiters with more conservative limits
export const messageRateLimiter = new RateLimiter(20, 60000); // 20 messages per minute
export const fileUploadRateLimiter = new RateLimiter(5, 60000); // 5 uploads per minute
export const conversationRateLimiter = new RateLimiter(3, 60000); // 3 conversations per minute
export const authRateLimiter = new RateLimiter(5, 300000); // 5 login attempts per 5 minutes
export const pollVoteRateLimiter = new RateLimiter(10, 60000); // 10 poll votes per minute

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
 * Validate URL for safe redirects
 */
export function validateRedirectUrl(url: string, allowedDomains: string[] = []): ValidationResult {
  if (!url) {
    return { isValid: false, error: 'URL cannot be empty' };
  }
  
  try {
    const urlObj = new URL(url);
    
    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
    if (dangerousProtocols.includes(urlObj.protocol)) {
      return { isValid: false, error: 'Unsafe protocol detected' };
    }
    
    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }
    
    // Check against allowed domains if specified
    if (allowedDomains.length > 0 && !allowedDomains.includes(urlObj.hostname)) {
      return { isValid: false, error: 'Domain not in allowed list' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password cannot be empty' };
  }
  
  const minLength = 8;
  const maxLength = 128;
  
  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters long` };
  }
  
  if (password.length > maxLength) {
    return { isValid: false, error: `Password must not exceed ${maxLength} characters` };
  }
  
  const checks = [
    { regex: /[a-z]/, message: 'at least one lowercase letter' },
    { regex: /[A-Z]/, message: 'at least one uppercase letter' },
    { regex: /[0-9]/, message: 'at least one number' },
    { regex: /[^a-zA-Z0-9]/, message: 'at least one special character' }
  ];
  
  for (const check of checks) {
    if (!check.regex.test(password)) {
      return { isValid: false, error: `Password must contain ${check.message}` };
    }
  }
  
  // Check for common weak patterns
  const weakPatterns = [
    /(.)\1{3,}/, // Repeated characters
    /123456|password|qwerty|admin|letmein/i, // Common passwords
    /^[a-zA-Z]+$|^[0-9]+$/ // Only letters or only numbers
  ];
  
  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      return { isValid: false, error: 'Password contains weak patterns' };
    }
  }
  
  return { isValid: true };
}

/**
 * Validate email format with enhanced security
 */
export function validateEmailSecurity(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email cannot be empty' };
  }
  
  // Basic email format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  // Check for potentially dangerous characters
  const dangerousChars = ['<', '>', '"', "'", '\\', '/', '&'];
  for (const char of dangerousChars) {
    if (email.includes(char)) {
      return { isValid: false, error: 'Email contains invalid characters' };
    }
  }
  
  // Length validation
  if (email.length > 254) {
    return { isValid: false, error: 'Email address too long' };
  }
  
  return { isValid: true };
}

/**
 * Detect potential security threats in user input
 */
export function detectSecurityThreats(input: string): string[] {
  const threats: string[] = [];
  
  // SQL injection patterns
  const sqlPatterns = [
    /union\s+select/gi,
    /drop\s+table/gi,
    /insert\s+into/gi,
    /delete\s+from/gi,
    /exec\s*\(/gi,
    /'.*or.*'/gi,
    /;\s*--/gi
  ];
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      threats.push('SQL injection attempt detected');
      break;
    }
  }
  
  // XSS patterns
  const xssPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /eval\s*\(/gi,
    /document\.cookie/gi
  ];
  
  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      threats.push('XSS attempt detected');
      break;
    }
  }
  
  // Path traversal
  if (input.includes('../') || input.includes('..\\')) {
    threats.push('Path traversal attempt detected');
  }
  
  // Command injection
  const commandPatterns = [
    /;\s*cat\s+/gi,
    /;\s*ls\s+/gi,
    /;\s*rm\s+/gi,
    /\|\s*cat\s+/gi,
    /`.*`/gi,
    /\$\(.*\)/gi
  ];
  
  for (const pattern of commandPatterns) {
    if (pattern.test(input)) {
      threats.push('Command injection attempt detected');
      break;
    }
  }
  
  return threats;
}

/**
 * Audit logging utility - Enhanced with Supabase integration
 */
export async function logSecurityEvent(
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
) {
  try {
    // Enhanced logging with more details
    const logData = {
      action,
      resourceType,
      resourceId,
      details,
      severity,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer
    };
    
    console.log('Security Event:', logData);
    
    // Detect threats in the action/details
    const threats = detectSecurityThreats(JSON.stringify(details || {}));
    if (threats.length > 0) {
      console.warn('Security threats detected:', threats);
      logData.details = { ...logData.details, threats };
    }
    
    // In production, this would call your audit logging function
    // const { supabase } = await import('@/integrations/supabase/client');
    // await supabase.rpc('log_security_event', {
    //   p_action_type: action,
    //   p_resource_type: resourceType,
    //   p_resource_id: resourceId,
    //   p_details: logData.details || {},
    //   p_severity: severity
    // });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}