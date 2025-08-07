# CamerPulse Security Documentation

## Overview
CamerPulse implements comprehensive security measures to protect against XSS attacks, unauthorized access, and data breaches. This documentation covers the security components and best practices.

## Security Components

### 1. Safe HTML Rendering

#### SafeHtml Component
Replaces dangerous `dangerouslySetInnerHTML` usage with secure HTML rendering.

```tsx
import { SafeHtml } from '@/components/Security/SafeHtml';

// Basic usage
<SafeHtml>{userContent}</SafeHtml>

// With custom allowed tags
<SafeHtml 
  allowedTags={['p', 'br', 'strong', 'em', 'ul', 'li']}
  className="prose"
>
  {userContent}
</SafeHtml>
```

#### SafeText Component
For plain text content without HTML.

```tsx
import { SafeText } from '@/components/Security/SafeHtml';

<SafeText className="description">{userInput}</SafeText>
```

### 2. Secure Form Components

#### SecureInput Component
Input component with built-in XSS protection.

```tsx
import { SecureInput } from '@/components/Security/SecureInput';

<SecureInput
  placeholder="Enter content"
  onSecureChange={(value, isValid) => {
    if (isValid) {
      setFormData(prev => ({ ...prev, field: value }));
    } else {
      setError('Invalid input detected');
    }
  }}
  validateXSS={true}
  maxLength={1000}
/>
```

#### SecureTextarea Component
Textarea with XSS validation.

```tsx
import { SecureTextarea } from '@/components/Security/SecureInput';

<SecureTextarea
  placeholder="Enter description"
  onSecureChange={(value, isValid) => {
    setDescription(value);
    setIsValid(isValid);
  }}
  maxLength={10000}
/>
```

### 3. Secure Storage

#### useSecureStorage Hook
Encrypted localStorage with automatic expiry.

```tsx
import { useSecureStorage } from '@/hooks/useSecureStorage';

const [userData, setUserData] = useSecureStorage('userPreferences', {}, {
  encrypt: true,
  expiry: 24 * 60 * 60 * 1000 // 24 hours
});

// Usage
setUserData({ theme: 'dark', language: 'en' });
```

### 4. Security Monitoring

#### useSecurityMonitoring Hook
Real-time security threat detection.

```tsx
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';

const { 
  alerts, 
  metrics, 
  reportFailedLogin,
  detectSuspiciousActivity 
} = useSecurityMonitoring();

// Report failed login
reportFailedLogin({ ip: '192.168.1.1', userAgent: navigator.userAgent });

// Detect suspicious activity
detectSuspiciousActivity('rapid_requests', { count: 15 });
```

#### SecurityDashboard Component
Admin security monitoring interface.

```tsx
import { SecurityDashboard } from '@/components/Security/SecurityDashboard';

// Admin page
<SecurityDashboard />
```

### 5. Content Security Policy

#### CSP Configuration
Apply CSP headers and security policies.

```tsx
import { initializeSecurity } from '@/utils/cspConfig';

// Initialize in main App component
useEffect(() => {
  initializeSecurity();
}, []);
```

## Security Best Practices

### 1. Input Validation
- Always use `SecureInput` and `SecureTextarea` for user input
- Validate data on both client and server side
- Sanitize all user-generated content before display

### 2. XSS Prevention
- Never use `dangerouslySetInnerHTML` directly
- Use `SafeHtml` component for trusted HTML content
- Use `SafeText` for plain text content

### 3. Authentication Security
- Implement proper session management
- Use secure password policies
- Monitor failed login attempts

### 4. Data Protection
- Encrypt sensitive data in localStorage
- Use HTTPS for all communications
- Implement proper access controls

### 5. Monitoring
- Monitor security alerts in real-time
- Log all security events
- Implement automated threat detection

## Security Utilities

### Validation Functions
```tsx
import { 
  validateMessageContent, 
  validateFileUpload,
  sanitizeInput 
} from '@/utils/security';

// Validate message content
const validation = validateMessageContent(userInput);
if (!validation.isValid) {
  setError(validation.error);
}

// Validate file upload
const fileValidation = validateFileUpload(file);
if (!fileValidation.isValid) {
  setError(fileValidation.error);
}

// Sanitize input
const cleanInput = sanitizeInput(rawInput);
```

### Rate Limiting
```tsx
import { 
  messageRateLimiter, 
  fileUploadRateLimiter 
} from '@/utils/security';

// Check rate limits
if (!messageRateLimiter.isAllowed(userId)) {
  setError('Too many messages. Please wait.');
  return;
}
```

## Database Security (RLS)

### Row Level Security Policies
All database tables implement RLS policies:

- **User Data**: Users can only access their own data
- **Public Content**: Open access for viewing, user-scoped for editing
- **Admin Operations**: Restricted to admin users only
- **Marketplace**: Vendors manage their own products, buyers their orders

### Security Functions
```sql
-- Safe role checking function
SELECT public.get_user_role();

-- Audit role changes
-- Automatically logged via triggers
```

## Emergency Procedures

### Security Incident Response
1. **Identify**: Monitor alerts in SecurityDashboard
2. **Contain**: Review and block suspicious IPs
3. **Investigate**: Check audit logs and security events
4. **Remediate**: Apply patches or policy updates
5. **Document**: Log incident details for future prevention

### CSP Violations
- Automatically reported and logged
- Review in browser console and SecurityDashboard
- Update CSP configuration as needed

## Configuration

### Environment Variables
```
# Content Security Policy
CSP_REPORT_URI=/api/csp-report

# Security Headers
SECURITY_HEADERS_ENABLED=true

# Rate Limiting
RATE_LIMIT_ENABLED=true
```

### Security Headers
Applied automatically via CSP configuration:
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## Troubleshooting

### Common Issues

1. **CSP Violations**: Check allowed sources in CSP configuration
2. **XSS Validation Errors**: Review input sanitization rules
3. **Storage Encryption Errors**: Check encryption key configuration
4. **Rate Limiting**: Adjust limits based on usage patterns

### Debug Mode
Enable detailed security logging:
```tsx
localStorage.setItem('security_debug', 'true');
```

This documentation provides comprehensive guidance for implementing and maintaining security in the CamerPulse platform.