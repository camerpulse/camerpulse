import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { CaptchaChallenge } from './CaptchaChallenge';
import { EnhancedBotDetection } from './EnhancedBotDetection';
import { useFraudProtection } from '@/hooks/useFraudProtection';

interface SecurityCheckResult {
  passed: boolean;
  reason?: string;
  captchaToken?: string;
  botDetectionResult?: any;
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
    
    // Validate with our fraud protection system
    const validation = await validateVote(pollId, undefined, finalToken);
    
    if (validation.canVote) {
      setSecurityPassed(true);
      setSecurityStep('completed');
      onSecurityPassed({
        passed: true,
        captchaToken: finalToken,
        botDetectionResult
      });
    } else {
      // Security check failed
      onSecurityPassed({
        passed: false,
        reason: validation.reason
      });
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