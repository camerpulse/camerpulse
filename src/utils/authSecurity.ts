/**
 * Authentication security utilities for CamerPulse
 */

export interface AuthSecurityConfig {
  maxLoginAttempts: number;
  lockoutDurationMs: number;
  sessionTimeoutMs: number;
  requireStrongPasswords: boolean;
  enableTwoFactor: boolean;
}

export const DEFAULT_AUTH_CONFIG: AuthSecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  sessionTimeoutMs: 24 * 60 * 60 * 1000, // 24 hours
  requireStrongPasswords: true,
  enableTwoFactor: false
};

// Password strength validation
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common patterns
  const commonPatterns = [
    /^password/i,
    /^123456/,
    /^qwerty/i,
    /^admin/i,
    /^letmein/i,
    /^welcome/i
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common patterns and is not secure');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Session security management
export class SessionSecurity {
  private static readonly SESSION_KEY = 'camerpulse_session';
  private static readonly LAST_ACTIVITY_KEY = 'camerpulse_last_activity';
  
  static isSessionValid(timeoutMs: number = DEFAULT_AUTH_CONFIG.sessionTimeoutMs): boolean {
    try {
      const lastActivity = localStorage.getItem(this.LAST_ACTIVITY_KEY);
      if (!lastActivity) return false;
      
      const timeSinceActivity = Date.now() - parseInt(lastActivity);
      return timeSinceActivity < timeoutMs;
    } catch {
      return false;
    }
  }
  
  static updateActivity(): void {
    try {
      localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
    } catch (error) {
      console.warn('Failed to update session activity:', error);
    }
  }
  
  static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.LAST_ACTIVITY_KEY);
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear session data:', error);
    }
  }
  
  static setupActivityMonitoring(callback?: () => void): () => void {
    const updateActivity = () => {
      this.updateActivity();
      
      // Check if session has expired
      if (!this.isSessionValid()) {
        this.clearSession();
        callback?.();
      }
    };
    
    // Monitor user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const throttledUpdate = throttle(updateActivity, 30000); // Update max once per 30 seconds
    
    events.forEach(event => {
      document.addEventListener(event, throttledUpdate, { passive: true });
    });
    
    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdate);
      });
    };
  }
}

// Login attempt tracking
export class LoginAttemptTracker {
  private static readonly ATTEMPTS_KEY = 'login_attempts';
  private static readonly LOCKOUT_KEY = 'login_lockout';
  
  static recordAttempt(identifier: string): void {
    try {
      const attempts = this.getAttempts();
      const now = Date.now();
      
      if (!attempts[identifier]) {
        attempts[identifier] = { count: 0, firstAttempt: now, lastAttempt: now };
      }
      
      attempts[identifier].count++;
      attempts[identifier].lastAttempt = now;
      
      localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(attempts));
      
      // Check if should be locked out
      if (attempts[identifier].count >= DEFAULT_AUTH_CONFIG.maxLoginAttempts) {
        this.lockoutUser(identifier);
      }
    } catch (error) {
      console.warn('Failed to record login attempt:', error);
    }
  }
  
  static isLockedOut(identifier: string): boolean {
    try {
      const lockouts = JSON.parse(localStorage.getItem(this.LOCKOUT_KEY) || '{}');
      const lockout = lockouts[identifier];
      
      if (!lockout) return false;
      
      const now = Date.now();
      if (now - lockout.lockedAt < DEFAULT_AUTH_CONFIG.lockoutDurationMs) {
        return true;
      }
      
      // Lockout period has expired, remove it
      delete lockouts[identifier];
      localStorage.setItem(this.LOCKOUT_KEY, JSON.stringify(lockouts));
      return false;
    } catch {
      return false;
    }
  }
  
  static getRemainingLockoutTime(identifier: string): number {
    try {
      const lockouts = JSON.parse(localStorage.getItem(this.LOCKOUT_KEY) || '{}');
      const lockout = lockouts[identifier];
      
      if (!lockout) return 0;
      
      const elapsed = Date.now() - lockout.lockedAt;
      const remaining = DEFAULT_AUTH_CONFIG.lockoutDurationMs - elapsed;
      
      return Math.max(0, remaining);
    } catch {
      return 0;
    }
  }
  
  static clearAttempts(identifier: string): void {
    try {
      const attempts = this.getAttempts();
      delete attempts[identifier];
      localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(attempts));
      
      const lockouts = JSON.parse(localStorage.getItem(this.LOCKOUT_KEY) || '{}');
      delete lockouts[identifier];
      localStorage.setItem(this.LOCKOUT_KEY, JSON.stringify(lockouts));
    } catch (error) {
      console.warn('Failed to clear login attempts:', error);
    }
  }
  
  private static getAttempts(): Record<string, any> {
    try {
      return JSON.parse(localStorage.getItem(this.ATTEMPTS_KEY) || '{}');
    } catch {
      return {};
    }
  }
  
  private static lockoutUser(identifier: string): void {
    try {
      const lockouts = JSON.parse(localStorage.getItem(this.LOCKOUT_KEY) || '{}');
      lockouts[identifier] = { lockedAt: Date.now() };
      localStorage.setItem(this.LOCKOUT_KEY, JSON.stringify(lockouts));
    } catch (error) {
      console.warn('Failed to lockout user:', error);
    }
  }
}

// Utility function for throttling
function throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return ((...args: any[]) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  }) as T;
}

// CSRF token management
export const CSRFProtection = {
  generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },
  
  setToken(token: string): void {
    try {
      sessionStorage.setItem('csrf_token', token);
    } catch (error) {
      console.warn('Failed to set CSRF token:', error);
    }
  },
  
  getToken(): string | null {
    try {
      return sessionStorage.getItem('csrf_token');
    } catch {
      return null;
    }
  },
  
  validateToken(token: string): boolean {
    const storedToken = this.getToken();
    return storedToken !== null && storedToken === token;
  }
};