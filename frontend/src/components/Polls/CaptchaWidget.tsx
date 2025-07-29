import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, RefreshCw, Check, AlertTriangle, Eye, Lock } from 'lucide-react';

interface CaptchaWidgetProps {
  pollId: string;
  onVerified: (token: string) => void;
  onError?: (error: string) => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
}

// Simple CAPTCHA implementation (in production, use Google reCAPTCHA or similar)
export const CaptchaWidget: React.FC<CaptchaWidgetProps> = ({
  pollId,
  onVerified,
  onError,
  theme = 'light',
  size = 'normal'
}) => {
  const [challenge, setChallenge] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateChallenge();
  }, []);

  useEffect(() => {
    if (blockedUntil) {
      const timer = setInterval(() => {
        if (new Date() > blockedUntil) {
          setBlockedUntil(null);
          setAttempts(0);
          generateChallenge();
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [blockedUntil]);

  const generateChallenge = () => {
    // Generate a simple math problem
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '×'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer: number;
    let challengeText: string;
    
    switch (operator) {
      case '+':
        answer = num1 + num2;
        challengeText = `${num1} + ${num2}`;
        break;
      case '-':
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        answer = larger - smaller;
        challengeText = `${larger} - ${smaller}`;
        break;
      case '×':
        answer = num1 * num2;
        challengeText = `${num1} × ${num2}`;
        break;
      default:
        answer = num1 + num2;
        challengeText = `${num1} + ${num2}`;
    }
    
    setChallenge(challengeText);
    setUserAnswer('');
    
    // Store the answer securely (in production, this would be server-side)
    sessionStorage.setItem(`captcha_answer_${pollId}`, answer.toString());
    
    // Draw challenge on canvas with noise
    drawChallengeOnCanvas(challengeText);
  };

  const drawChallengeOnCanvas = (text: string) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = theme === 'dark' ? '#1f2937' : '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add noise lines
    ctx.strokeStyle = theme === 'dark' ? '#374151' : '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    // Draw text
    ctx.font = size === 'compact' ? '18px Arial' : '24px Arial';
    ctx.fillStyle = theme === 'dark' ? '#f3f4f6' : '#1f2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add slight random rotation and position
    const x = canvas.width / 2 + (Math.random() - 0.5) * 10;
    const y = canvas.height / 2 + (Math.random() - 0.5) * 10;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((Math.random() - 0.5) * 0.2);
    ctx.fillText(text, 0, 0);
    ctx.restore();
    
    // Add noise dots
    ctx.fillStyle = theme === 'dark' ? '#6b7280' : '#9ca3af';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const verifyCaptcha = async () => {
    if (blockedUntil) return;
    
    setIsVerifying(true);
    
    try {
      const correctAnswer = sessionStorage.getItem(`captcha_answer_${pollId}`);
      const isCorrect = userAnswer.trim() === correctAnswer;
      
      if (isCorrect) {
        // Generate verification token
        const token = `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store verification in database
        const { error } = await supabase
          .from('poll_captcha_verifications')
          .insert([{
            session_id: sessionStorage.getItem('session_id') || 'anonymous',
            poll_id: pollId,
            captcha_token: token
          }]);
        
        if (error) throw error;
        
        setIsVerified(true);
        setAttempts(0);
        onVerified(token);
        sessionStorage.removeItem(`captcha_answer_${pollId}`);
        
        toast.success('CAPTCHA verified successfully!');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          // Block for 5 minutes after 3 failed attempts
          const blockTime = new Date(Date.now() + 5 * 60 * 1000);
          setBlockedUntil(blockTime);
          toast.error('Too many failed attempts. Please wait 5 minutes.');
        } else {
          generateChallenge();
          toast.error(`Incorrect answer. ${3 - newAttempts} attempts remaining.`);
        }
        
        if (onError) {
          onError(`Incorrect answer. Attempts: ${newAttempts}/3`);
        }
      }
    } catch (error) {
      console.error('CAPTCHA verification error:', error);
      toast.error('CAPTCHA verification failed. Please try again.');
      if (onError) {
        onError('Verification failed');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !blockedUntil && !isVerified) {
      verifyCaptcha();
    }
  };

  if (isVerified) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <Check className="h-5 w-5" />
            <span className="font-medium">Verified</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeRemaining = blockedUntil ? Math.ceil((blockedUntil.getTime() - Date.now()) / 1000) : 0;

  return (
    <Card className={`w-full ${size === 'compact' ? 'max-w-xs' : 'max-w-sm'}`}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-medium">Security Verification</span>
        </div>
        
        {blockedUntil ? (
          <div className="text-center space-y-2">
            <AlertTriangle className="h-8 w-8 mx-auto text-red-500" />
            <p className="text-sm text-red-600">
              Too many failed attempts. Please wait.
            </p>
            <div className="text-lg font-mono">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Solve this problem to continue:
              </p>
              <div className="bg-muted/50 border rounded p-2 flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={size === 'compact' ? 120 : 150}
                  height={size === 'compact' ? 40 : 50}
                  className="border rounded"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Your answer"
                className="flex-1 px-3 py-2 border rounded-md text-center"
                disabled={isVerifying}
              />
              <Button
                onClick={verifyCaptcha}
                disabled={isVerifying || !userAnswer.trim()}
                size="sm"
              >
                {isVerifying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={generateChallenge}
                disabled={isVerifying}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                New challenge
              </Button>
              
              {attempts > 0 && (
                <Badge variant="destructive" className="text-xs">
                  Attempts: {attempts}/3
                </Badge>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Enhanced fraud protection hook
export const useFraudProtection = (pollId: string) => {
  const [riskScore, setRiskScore] = useState<number>(0);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [captchaRequired, setCaptchaRequired] = useState<boolean>(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');

  const checkFraudRisk = async (additionalData: {
    userAgent?: string;
    deviceFingerprint?: string;
    sessionId?: string;
  } = {}) => {
    try {
      const { data, error } = await supabase.rpc('detect_bot_behavior', {
        p_user_agent: additionalData.userAgent || navigator.userAgent,
        p_device_fingerprint: additionalData.deviceFingerprint || '',
        p_hashed_ip: '', // Would be set server-side
        p_poll_id: pollId,
        p_session_id: additionalData.sessionId || sessionStorage.getItem('session_id') || ''
      });

      if (error) throw error;

      const calculatedRiskScore = data || 0;
      setRiskScore(calculatedRiskScore);
      
      // Determine if CAPTCHA is required
      if (calculatedRiskScore >= 50) {
        setCaptchaRequired(true);
      }
      
      // Block if risk score is very high
      if (calculatedRiskScore >= 85) {
        setIsBlocked(true);
        toast.error('Suspicious activity detected. Access temporarily blocked.');
      }

      return calculatedRiskScore;
    } catch (error) {
      console.error('Fraud detection error:', error);
      return 0;
    }
  };

  const checkRateLimit = async (action: string = 'vote') => {
    try {
      const identifier = sessionStorage.getItem('session_id') || 'anonymous';
      
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_identifier_type: 'session',
        p_identifier_value: identifier,
        p_poll_id: pollId,
        p_action_type: action,
        p_limit_per_hour: action === 'vote' ? 10 : 100
      });

      if (error) throw error;

      if (!data) {
        toast.error('Rate limit exceeded. Please wait before trying again.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return false;
    }
  };

  const verifyCaptcha = (token: string) => {
    setCaptchaToken(token);
    setCaptchaRequired(false);
  };

  return {
    riskScore,
    isBlocked,
    captchaRequired,
    captchaToken,
    checkFraudRisk,
    checkRateLimit,
    verifyCaptcha
  };
};