import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Smartphone, 
  Key, 
  QrCode, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Copy
} from 'lucide-react';

interface TwoFactorAuthProps {
  userId?: string;
  isEnabled?: boolean;
  onStatusChange?: (enabled: boolean) => void;
}

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  userId,
  isEnabled = false,
  onStatusChange
}) => {
  const [twoFAEnabled, setTwoFAEnabled] = useState(isEnabled);
  const [setupStep, setSetupStep] = useState<'disabled' | 'setup' | 'verify' | 'enabled'>('disabled');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isEnabled) {
      setSetupStep('enabled');
      setTwoFAEnabled(true);
    }
  }, [isEnabled]);

  const generateSetup = async () => {
    setLoading(true);
    try {
      // Simulate API call to generate 2FA setup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in real implementation, this would come from your backend
      setQrCodeUrl('https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/CamerPulse:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=CamerPulse');
      setSecretKey('JBSWY3DPEHPK3PXP');
      setSetupStep('setup');
      
      toast({
        title: "2FA Setup Started",
        description: "Scan the QR code with your authenticator app",
      });
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Failed to generate 2FA setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifySetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate backup codes
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      setBackupCodes(codes);
      
      setTwoFAEnabled(true);
      setSetupStep('enabled');
      onStatusChange?.(true);
      
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled",
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTwoFAEnabled(false);
      setSetupStep('disabled');
      setVerificationCode('');
      setQrCodeUrl('');
      setSecretKey('');
      setBackupCodes([]);
      onStatusChange?.(false);
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
      });
    } catch (error) {
      toast({
        title: "Failed to Disable",
        description: "Failed to disable 2FA. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const getStatusBadge = () => {
    if (twoFAEnabled) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Enabled</Badge>;
    }
    return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Disabled</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {setupStep === 'disabled' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Enhanced Security</h4>
                  <p className="text-sm text-blue-800">
                    Two-factor authentication adds an extra layer of security by requiring
                    a verification code from your phone in addition to your password.
                  </p>
                </div>
              </div>
            </div>
            
            <Button onClick={generateSetup} disabled={loading}>
              {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
            </Button>
          </div>
        )}

        {setupStep === 'setup' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium mb-2">Step 1: Scan QR Code</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use your authenticator app to scan this QR code
              </p>
              
              {qrCodeUrl && (
                <div className="flex justify-center mb-4">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="border rounded" />
                </div>
              )}
              
              <div className="bg-gray-50 p-3 rounded border">
                <p className="text-xs text-muted-foreground mb-1">Manual Entry Key:</p>
                <div className="flex items-center justify-center space-x-2">
                  <code className="text-sm font-mono">{secretKey}</code>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(secretKey)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification">Step 2: Enter Verification Code</Label>
              <Input
                id="verification"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={verifySetup} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
              <Button variant="outline" onClick={() => setSetupStep('disabled')}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {setupStep === 'enabled' && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">2FA is Active</h4>
                  <p className="text-sm text-green-800">
                    Your account is now protected with two-factor authentication.
                  </p>
                </div>
              </div>
            </div>

            {backupCodes.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-900">Backup Codes</h4>
                    <p className="text-sm text-yellow-800 mb-3">
                      Save these backup codes in a safe place. You can use them to access 
                      your account if you lose your authenticator device.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="bg-white p-2 rounded border">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button variant="destructive" onClick={disable2FA} disabled={loading}>
              {loading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};