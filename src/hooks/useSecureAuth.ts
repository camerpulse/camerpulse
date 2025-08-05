import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  validateEmailSecurity, 
  validatePasswordStrength, 
  authRateLimiter, 
  logSecurityEvent,
  detectSecurityThreats 
} from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

interface AuthResult {
  success: boolean;
  error?: string;
  user?: any;
}

export function useSecureAuth() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const secureSignUp = useCallback(async (
    email: string, 
    password: string, 
    additionalData?: Record<string, any>
  ): Promise<AuthResult> => {
    setLoading(true);
    
    try {
      // Rate limiting check
      const clientId = `signup_${email}`;
      if (!authRateLimiter.isAllowed(clientId)) {
        await logSecurityEvent('rate_limit_exceeded', 'auth', undefined, {
          action: 'signup',
          email: email.substring(0, 3) + '***', // Partial email for privacy
          ip: 'client'
        }, 'medium');
        
        return { 
          success: false, 
          error: 'Too many signup attempts. Please wait before trying again.' 
        };
      }

      // Email validation
      const emailValidation = validateEmailSecurity(email);
      if (!emailValidation.isValid) {
        await logSecurityEvent('invalid_email_attempt', 'auth', undefined, {
          email: email.substring(0, 3) + '***',
          error: emailValidation.error
        }, 'low');
        
        return { success: false, error: emailValidation.error };
      }

      // Password strength validation
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        await logSecurityEvent('weak_password_attempt', 'auth', undefined, {
          email: email.substring(0, 3) + '***',
          error: passwordValidation.error
        }, 'low');
        
        return { success: false, error: passwordValidation.error };
      }

      // Check for security threats in additional data
      if (additionalData) {
        const threats = detectSecurityThreats(JSON.stringify(additionalData));
        if (threats.length > 0) {
          await logSecurityEvent('malicious_signup_attempt', 'auth', undefined, {
            email: email.substring(0, 3) + '***',
            threats,
            additionalData
          }, 'high');
          
          return { 
            success: false, 
            error: 'Invalid registration data detected.' 
          };
        }
      }

      // Perform signup with enhanced security
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: additionalData
        }
      });

      if (error) {
        await logSecurityEvent('signup_failed', 'auth', undefined, {
          email: email.substring(0, 3) + '***',
          error: error.message
        }, 'medium');
        
        return { success: false, error: error.message };
      }

      // Log successful signup
      await logSecurityEvent('user_registered', 'auth', data.user?.id, {
        email: email.substring(0, 3) + '***',
        hasAdditionalData: !!additionalData
      }, 'low');

      toast({
        title: 'Account created successfully',
        description: 'Please check your email to verify your account.',
      });

      return { success: true, user: data.user };

    } catch (error: any) {
      await logSecurityEvent('signup_error', 'auth', undefined, {
        error: error.message,
        email: email.substring(0, 3) + '***'
      }, 'high');
      
      return { 
        success: false, 
        error: 'An unexpected error occurred during registration.' 
      };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const secureSignIn = useCallback(async (
    email: string, 
    password: string
  ): Promise<AuthResult> => {
    setLoading(true);
    
    try {
      // Rate limiting check
      const clientId = `signin_${email}`;
      if (!authRateLimiter.isAllowed(clientId)) {
        await logSecurityEvent('rate_limit_exceeded', 'auth', undefined, {
          action: 'signin',
          email: email.substring(0, 3) + '***',
          ip: 'client'
        }, 'high');
        
        return { 
          success: false, 
          error: 'Too many login attempts. Please wait 5 minutes before trying again.' 
        };
      }

      // Email validation
      const emailValidation = validateEmailSecurity(email);
      if (!emailValidation.isValid) {
        await logSecurityEvent('invalid_email_login', 'auth', undefined, {
          email: email.substring(0, 3) + '***',
          error: emailValidation.error
        }, 'medium');
        
        return { success: false, error: emailValidation.error };
      }

      // Check for potential security threats
      const threats = detectSecurityThreats(email + password);
      if (threats.length > 0) {
        await logSecurityEvent('malicious_login_attempt', 'auth', undefined, {
          email: email.substring(0, 3) + '***',
          threats
        }, 'critical');
        
        return { 
          success: false, 
          error: 'Invalid login credentials detected.' 
        };
      }

      // Perform signin
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        await logSecurityEvent('login_failed', 'auth', undefined, {
          email: email.substring(0, 3) + '***',
          error: error.message
        }, 'medium');
        
        // Don't reveal whether email exists or not
        return { 
          success: false, 
          error: 'Invalid login credentials.' 
        };
      }

      // Log successful login
      await logSecurityEvent('user_logged_in', 'auth', data.user?.id, {
        email: email.substring(0, 3) + '***',
        sessionId: data.session?.access_token?.substring(0, 10) + '***'
      }, 'low');

      toast({
        title: 'Welcome back!',
        description: 'You have been successfully logged in.',
      });

      return { success: true, user: data.user };

    } catch (error: any) {
      await logSecurityEvent('signin_error', 'auth', undefined, {
        error: error.message,
        email: email.substring(0, 3) + '***'
      }, 'high');
      
      return { 
        success: false, 
        error: 'An unexpected error occurred during login.' 
      };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const secureSignOut = useCallback(async (): Promise<AuthResult> => {
    setLoading(true);
    
    try {
      // Get current user before signing out
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        await logSecurityEvent('signout_failed', 'auth', user?.id, {
          error: error.message
        }, 'medium');
        
        return { success: false, error: error.message };
      }

      // Log successful signout
      await logSecurityEvent('user_logged_out', 'auth', user?.id, {
        timestamp: new Date().toISOString()
      }, 'low');

      toast({
        title: 'Signed out successfully',
        description: 'You have been securely logged out.',
      });

      return { success: true };

    } catch (error: any) {
      await logSecurityEvent('signout_error', 'auth', undefined, {
        error: error.message
      }, 'medium');
      
      return { 
        success: false, 
        error: 'An error occurred during sign out.' 
      };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    setLoading(true);
    
    try {
      // Rate limiting check
      const clientId = `reset_${email}`;
      if (!authRateLimiter.isAllowed(clientId)) {
        await logSecurityEvent('rate_limit_exceeded', 'auth', undefined, {
          action: 'password_reset',
          email: email.substring(0, 3) + '***'
        }, 'medium');
        
        return { 
          success: false, 
          error: 'Too many reset attempts. Please wait before trying again.' 
        };
      }

      // Email validation
      const emailValidation = validateEmailSecurity(email);
      if (!emailValidation.isValid) {
        return { success: false, error: emailValidation.error };
      }

      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        await logSecurityEvent('password_reset_failed', 'auth', undefined, {
          email: email.substring(0, 3) + '***',
          error: error.message
        }, 'medium');
        
        return { success: false, error: error.message };
      }

      // Log password reset request (don't reveal if email exists)
      await logSecurityEvent('password_reset_requested', 'auth', undefined, {
        email: email.substring(0, 3) + '***'
      }, 'low');

      toast({
        title: 'Password reset email sent',
        description: 'If an account with this email exists, you will receive a password reset link.',
      });

      return { success: true };

    } catch (error: any) {
      await logSecurityEvent('password_reset_error', 'auth', undefined, {
        error: error.message,
        email: email.substring(0, 3) + '***'
      }, 'medium');
      
      return { 
        success: false, 
        error: 'An error occurred while processing your request.' 
      };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    secureSignUp,
    secureSignIn,
    secureSignOut,
    resetPassword
  };
}