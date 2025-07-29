import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Bot, Shield, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BotDetectionResult {
  isBot: boolean;
  confidence: number;
  reasons: string[];
  riskScore: number;
}

interface EnhancedBotDetectionProps {
  pollId: string;
  onDetectionComplete: (result: BotDetectionResult) => void;
}

export const EnhancedBotDetection = ({ pollId, onDetectionComplete }: EnhancedBotDetectionProps) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCheck, setCurrentCheck] = useState('');
  const [result, setResult] = useState<BotDetectionResult | null>(null);

  const botDetectionChecks = [
    { name: 'Mouse Movement Analysis', weight: 20 },
    { name: 'Keyboard Patterns', weight: 15 },
    { name: 'Browser Fingerprint', weight: 25 },
    { name: 'Behavioral Timing', weight: 20 },
    { name: 'Device Capabilities', weight: 10 },
    { name: 'Network Analysis', weight: 10 }
  ];

  const runBotDetection = async () => {
    setScanning(true);
    setProgress(0);
    const reasons: string[] = [];
    let riskScore = 0;

    for (let i = 0; i < botDetectionChecks.length; i++) {
      const check = botDetectionChecks[i];
      setCurrentCheck(check.name);
      setProgress(((i + 1) / botDetectionChecks.length) * 100);

      // Simulate detection checks
      await new Promise(resolve => setTimeout(resolve, 800));

      switch (check.name) {
        case 'Mouse Movement Analysis':
          if (!detectMouseMovement()) {
            reasons.push('No natural mouse movement detected');
            riskScore += check.weight;
          }
          break;
        
        case 'Keyboard Patterns':
          if (!detectKeyboardPatterns()) {
            reasons.push('Unnatural typing patterns');
            riskScore += check.weight * 0.5;
          }
          break;
        
        case 'Browser Fingerprint':
          if (detectAutomation()) {
            reasons.push('Automation tools detected');
            riskScore += check.weight;
          }
          break;
        
        case 'Behavioral Timing':
          if (detectSuspiciousTiming()) {
            reasons.push('Suspicious interaction timing');
            riskScore += check.weight * 0.7;
          }
          break;
        
        case 'Device Capabilities':
          if (!detectDeviceCapabilities()) {
            reasons.push('Limited device capabilities');
            riskScore += check.weight * 0.3;
          }
          break;
        
        case 'Network Analysis':
          if (await detectSuspiciousNetwork()) {
            reasons.push('Suspicious network patterns');
            riskScore += check.weight * 0.8;
          }
          break;
      }
    }

    const isBot = riskScore > 40; // Threshold for bot detection
    const confidence = Math.min(riskScore / 60, 1) * 100;

    const detectionResult: BotDetectionResult = {
      isBot,
      confidence,
      reasons,
      riskScore
    };

    setResult(detectionResult);
    setScanning(false);
    onDetectionComplete(detectionResult);

    // Log the detection result
    try {
      await supabase.from('poll_bot_detection_logs').insert({
        poll_id: pollId,
        is_bot: isBot,
        confidence_score: confidence,
        risk_score: riskScore,
        detection_reasons: reasons,
        user_agent: navigator.userAgent,
        device_fingerprint: generateDeviceFingerprint()
      });
    } catch (error) {
      console.error('Error logging bot detection:', error);
    }
  };

  // Detection algorithms
  const detectMouseMovement = (): boolean => {
    // Check if mouse events were recorded
    return (window as any).mouseMovements?.length > 10;
  };

  const detectKeyboardPatterns = (): boolean => {
    // Check for natural keyboard patterns
    return (window as any).keyboardEvents?.length > 5;
  };

  const detectAutomation = (): boolean => {
    // Check for automation indicators
    return !!(
      (window as any).webdriver ||
      (window as any).phantom ||
      (window as any).__nightmare ||
      (navigator as any).webdriver ||
      document.documentElement.getAttribute('webdriver')
    );
  };

  const detectSuspiciousTiming = (): boolean => {
    // Check if actions are too fast or too regular
    const pageLoadTime = performance.now();
    return pageLoadTime < 1000; // Page interaction too fast
  };

  const detectDeviceCapabilities = (): boolean => {
    // Check device capabilities
    return !!(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.screen.width > 800
    );
  };

  const detectSuspiciousNetwork = async (): Promise<boolean> => {
    try {
      // Simple network timing check
      const start = performance.now();
      await fetch('/api/ping', { method: 'HEAD' }).catch(() => {});
      const timing = performance.now() - start;
      return timing < 10; // Suspiciously fast network
    } catch {
      return false;
    }
  };

  const generateDeviceFingerprint = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Bot detection fingerprint', 2, 2);
    }
    
    return btoa([
      navigator.userAgent,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.language,
      canvas.toDataURL()
    ].join('|'));
  };

  useEffect(() => {
    // Track mouse movements for bot detection
    let mouseMovements = 0;
    const handleMouseMove = () => {
      mouseMovements++;
      (window as any).mouseMovements = (window as any).mouseMovements || [];
      (window as any).mouseMovements.push(Date.now());
    };

    let keyboardEvents = 0;
    const handleKeyPress = () => {
      keyboardEvents++;
      (window as any).keyboardEvents = (window as any).keyboardEvents || [];
      (window as any).keyboardEvents.push(Date.now());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keypress', handleKeyPress);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, []);

  if (!scanning && !result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Enhanced Bot Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Advanced behavioral analysis to detect automated voting attempts.
          </p>
          <Button onClick={runBotDetection} className="w-full">
            <Shield className="w-4 h-4 mr-2" />
            Run Bot Detection Scan
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (scanning) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 animate-spin" />
            Scanning for Bot Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentCheck}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {botDetectionChecks.map((check, index) => (
              <div 
                key={check.name}
                className={`p-2 rounded text-xs ${
                  progress > (index / botDetectionChecks.length) * 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {check.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    return (
      <Card className={result.isBot ? 'border-destructive' : 'border-emerald-500'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {result.isBot ? (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            )}
            Bot Detection Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Detection Status:</span>
            <Badge variant={result.isBot ? 'destructive' : 'default'}>
              {result.isBot ? 'Bot Detected' : 'Human Verified'}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Confidence Level:</span>
              <span>{Math.round(result.confidence)}%</span>
            </div>
            <Progress value={result.confidence} className="w-full" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Risk Score:</span>
              <span>{result.riskScore}/100</span>
            </div>
            <Progress value={result.riskScore} className="w-full" />
          </div>
          
          {result.reasons.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Detection Reasons:</span>
              <ul className="space-y-1">
                {result.reasons.map((reason, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setResult(null);
              runBotDetection();
            }}
            className="w-full"
          >
            Run Scan Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};