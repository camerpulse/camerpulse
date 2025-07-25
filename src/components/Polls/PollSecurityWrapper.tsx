import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { CaptchaChallenge } from './CaptchaChallenge';
import { EnhancedBotDetection } from './EnhancedBotDetection';
import { useFraudProtection } from '@/hooks/useFraudProtection';
import { supabase } from '@/integrations/supabase/client';

interface SecurityCheckResult {
  passed: boolean;
  reason?: string;
  captchaToken?: string;
  botDetectionResult?: any;
  requiresCaptcha?: boolean;
  riskScore?: number;
}

interface PollSecurityWrapperProps {
  pollId: string;
  children: React.ReactNode;
  onSecurityPassed: (result: SecurityCheckResult) => void;
}

export const PollSecurityWrapper = ({ 
  pollId, 
  children, 
  onSecurityPassed 
}: PollSecurityWrapperProps) => {
  const [securityStep, setSecurityStep] = useState<'bot-detection' | 'captcha' | 'completed'>('bot-detection');
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [botDetectionResult, setBotDetectionResult] = useState<any>(null);
  const [securityPassed, setSecurityPassed] = useState(false);
  
  const { validateVote } = useFraudProtection();

  const handleBotDetectionComplete = async (result: any) => {
    setBotDetectionResult(result);
    
    if (result.isBot && result.confidence > 70) {
      // High confidence bot detection - require CAPTCHA
      setSecurityStep('captcha');
    } else if (result.isBot && result.confidence > 40) {
      // Medium confidence - require CAPTCHA
      setSecurityStep('captcha');
    } else {
      // Low risk - proceed directly
      await handleSecurityComplete();
    }
  };

  const handleCaptchaComplete = async (token: string) => {
    setCaptchaToken(token);
    await handleSecurityComplete(token);
  };

  const handleSecurityComplete = async (captchaTokenParam?: string) => {
    const finalToken = captchaTokenParam || captchaToken;
    
    try {
      // Enhanced security validation with device fingerprinting
      const deviceFingerprint = generateDeviceFingerprint();
      const ipHash = await hashIP();
      
      // Use existing fraud protection with enhanced data
      const validation = await validateVote(pollId, undefined, finalToken);
      
      // Calculate risk score based on device fingerprint and bot detection
      let riskScore = botDetectionResult?.confidence || 0;
      
      // Add additional risk factors
      if (!deviceFingerprint || deviceFingerprint === 'unknown') {
        riskScore += 30;
      }
      
      if (ipHash === 'unknown') {
        riskScore += 20;
      }
      
      // Enhanced validation logic
      const enhancedValidation = {
        canVote: validation.canVote && riskScore < 80,
        reason: validation.canVote 
          ? (riskScore >= 80 ? 'High risk detected' : validation.reason)
          : validation.reason,
        riskScore,
        requiresCaptcha: riskScore >= 50 && !finalToken
      };
      
      if (enhancedValidation.canVote) {
        setSecurityPassed(true);
        setSecurityStep('completed');
        onSecurityPassed({
          passed: true,
          captchaToken: finalToken,
          botDetectionResult: {
            ...botDetectionResult,
            riskScore: enhancedValidation.riskScore
          },
          riskScore: enhancedValidation.riskScore
        });
      } else {
        // Security check failed
        onSecurityPassed({
          passed: false,
          reason: enhancedValidation.reason,
          requiresCaptcha: enhancedValidation.requiresCaptcha,
          riskScore: enhancedValidation.riskScore
        });
      }
    } catch (error) {
      console.error('Security validation error:', error);
      onSecurityPassed({
        passed: false,
        reason: 'Security validation failed'
      });
    }
  };
  
  // Generate device fingerprint
  const generateDeviceFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL()
    };
    
    return btoa(JSON.stringify(fingerprint)).slice(0, 32);
  };
  
  // Hash IP on client side (simplified)
  const hashIP = async () => {
    try {
      // Use a simple hash of available client info
      const clientInfo = `${navigator.userAgent}${navigator.language}${Date.now()}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(clientInfo);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
    } catch {
      return 'unknown';
    }
  };

  if (securityPassed) {
    return <>{children}</>;
  }

  if (securityStep === 'bot-detection') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              We're running a quick security check to ensure fair voting.
            </AlertDescription>
          </Alert>
          
          <EnhancedBotDetection 
            pollId={pollId}
            onDetectionComplete={handleBotDetectionComplete}
          />
        </CardContent>
      </Card>
    );
  }

  if (securityStep === 'captcha') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Additional Verification Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Please complete the CAPTCHA to verify you're human.
            </AlertDescription>
          </Alert>
          
          <CaptchaChallenge 
            onVerify={handleCaptchaComplete}
            difficulty="medium"
          />
        </CardContent>
      </Card>
    );
  }

  return null;
};