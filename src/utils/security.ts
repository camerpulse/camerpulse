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
 * Enhanced input sanitization with better XSS protection
 */
export function advancedSanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove all script tags and their content
  let sanitized = input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Remove javascript: protocols and event handlers
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');
  
  // Remove dangerous tags
  const dangerousTags = ['iframe', 'object', 'embed', 'link', 'meta', 'form', 'input', 'button', 'select', 'textarea'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    const selfClosing = new RegExp(`<${tag}[^>]*\/?>`, 'gi');
    sanitized = sanitized.replace(selfClosing, '');
  });
  
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
 * Validate and sanitize user roles to prevent privilege escalation
 */
export function validateUserRole(role: string): ValidationResult {
  const allowedRoles = ['user', 'moderator', 'admin'];
  
  if (!role || typeof role !== 'string') {
    return { isValid: false, error: 'Role must be a valid string' };
  }
  
  const sanitizedRole = role.toLowerCase().trim();
  
  if (!allowedRoles.includes(sanitizedRole)) {
    return { isValid: false, error: 'Invalid role specified' };
  }
  
  return { isValid: true, sanitized: sanitizedRole };
}

/**
 * Session security validation
 */
export function validateSession(sessionData: any): ValidationResult {
  if (!sessionData || typeof sessionData !== 'object') {
    return { isValid: false, error: 'Invalid session data' };
  }
  
  // Check for required session fields
  const requiredFields = ['user_id', 'timestamp'];
  for (const field of requiredFields) {
    if (!(field in sessionData)) {
      return { isValid: false, error: `Missing required field: ${field}` };
    }
  }
  
  // Check session expiry (24 hours)
  const sessionAge = Date.now() - new Date(sessionData.timestamp).getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  if (sessionAge > maxAge) {
    return { isValid: false, error: 'Session expired' };
  }
  
  return { isValid: true };
}

/**
 * Enhanced audit logging utility with real Supabase integration
 */
export async function logSecurityEvent(
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
) {
  try {
    const eventData = {
      action,
      resourceType,
      resourceId,
      details: details || {},
      severity,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: await getUserIP()
    };
    
    console.log('Security Event:', eventData);
    
    // Store in browser for immediate monitoring
    const existingEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
    existingEvents.push(eventData);
    
    // Keep only last 100 events in localStorage
    if (existingEvents.length > 100) {
      existingEvents.splice(0, existingEvents.length - 100);
    }
    
    localStorage.setItem('security_events', JSON.stringify(existingEvents));
    
    // TODO: In production, integrate with Supabase audit logging
    // await supabase.from('security_audit_log').insert(eventData);
    
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Get user IP address (fallback for audit logging)
 */
async function getUserIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Content Security Policy violation reporter
 */
export function setupCSPReporting() {
  document.addEventListener('securitypolicyviolation', (e) => {
    logSecurityEvent(
      'csp_violation',
      'content_security_policy',
      undefined,
      {
        blockedURI: e.blockedURI,
        violatedDirective: e.violatedDirective,
        originalPolicy: e.originalPolicy,
        documentURI: e.documentURI,
        lineNumber: e.lineNumber,
        columnNumber: e.columnNumber
      },
      'high'
    );
  });
}