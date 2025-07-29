import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Simple mathematical CAPTCHA for demonstration
// In production, integrate with reCAPTCHA or hCaptcha
export const CaptchaChallenge = ({ onVerify, onError, difficulty = 'medium' }: CaptchaProps) => {
  const { toast } = useToast();
  const [challenge, setChallenge] = useState<string>('');
  const [answer, setAnswer] = useState<number>(0);
  const [userInput, setUserInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const generateChallenge = useCallback(() => {
    let challengeText = '';
    let correctAnswer = 0;

    switch (difficulty) {
      case 'easy':
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        challengeText = `${a} + ${b}`;
        correctAnswer = a + b;
        break;
      
      case 'medium':
        const x = Math.floor(Math.random() * 20) + 1;
        const y = Math.floor(Math.random() * 20) + 1;
        const op = Math.random() > 0.5 ? '+' : '-';
        if (op === '+') {
          challengeText = `${x} + ${y}`;
          correctAnswer = x + y;
        } else {
          challengeText = `${Math.max(x, y)} - ${Math.min(x, y)}`;
          correctAnswer = Math.max(x, y) - Math.min(x, y);
        }
        break;
      
      case 'hard':
        const m = Math.floor(Math.random() * 12) + 2;
        const n = Math.floor(Math.random() * 12) + 2;
        challengeText = `${m} × ${n}`;
        correctAnswer = m * n;
        break;
    }

    setChallenge(challengeText);
    setAnswer(correctAnswer);
    setUserInput('');
  }, [difficulty]);

  useEffect(() => {
    generateChallenge();
  }, [generateChallenge]);

  const handleVerify = () => {
    const inputValue = parseInt(userInput);
    
    if (inputValue === answer) {
      // Generate a simple token for verification
      const token = btoa(JSON.stringify({
        challenge: challenge,
        answer: answer,
        timestamp: Date.now(),
        verified: true
      }));
      
      toast({
        title: "CAPTCHA Verified",
        description: "Human verification successful"
      });
      
      onVerify(token);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        onError?.('Too many failed attempts. Please try again later.');
        toast({
          title: "CAPTCHA Failed",
          description: "Too many incorrect attempts",
          variant: "destructive"
        });
        
        // Lock for 30 seconds
        setTimeout(() => {
          setIsLocked(false);
          setAttempts(0);
          generateChallenge();
        }, 30000);
      } else {
        toast({
          title: "Incorrect Answer",
          description: `${3 - newAttempts} attempts remaining`,
          variant: "destructive"
        });
        generateChallenge();
      }
    }
  };

  const handleRefresh = () => {
    generateChallenge();
    setAttempts(0);
  };

  if (isLocked) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="w-5 h-5" />
            CAPTCHA Locked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Too many failed attempts. Please wait 30 seconds before trying again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Human Verification Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="bg-muted p-4 rounded-lg inline-block">
            <span className="text-2xl font-mono font-bold">
              {challenge} = ?
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="captcha-input">Enter the answer:</Label>
          <div className="flex gap-2">
            <Input
              id="captcha-input"
              type="number"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Your answer"
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              title="New challenge"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <Button 
          onClick={handleVerify} 
          className="w-full"
          disabled={!userInput || isLocked}
        >
          Verify
        </Button>
        
        {attempts > 0 && (
          <p className="text-sm text-amber-600">
            {3 - attempts} attempts remaining
          </p>
        )}
      </CardContent>
    </Card>
  );
};