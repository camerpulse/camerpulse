import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, CheckCircle, AlertCircle, Clock, Send, RefreshCw } from 'lucide-react';

interface VerificationToken {
  id: string;
  token: string;
  email: string;
  token_type: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

export const EmailVerification: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [emailToVerify, setEmailToVerify] = useState('');
  const [pendingTokens, setPendingTokens] = useState<VerificationToken[]>([]);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    if (user) {
      checkEmailVerificationStatus();
      fetchPendingTokens();
    }
  }, [user]);

  const checkEmailVerificationStatus = async () => {
    if (!user) return;

    // Check if email is confirmed in auth
    setIsEmailVerified(!!user.email_confirmed_at);
  };

  const fetchPendingTokens = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('user_id', user.id)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (data) {
      setPendingTokens(data);
    } else if (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  const generateVerificationToken = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const sendVerificationEmail = async () => {
    if (!user || !emailToVerify) return;

    setLoading(true);
    try {
      const token = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

      // Store token in database
      const { error: tokenError } = await supabase
        .from('email_verification_tokens')
        .insert({
          user_id: user.id,
          token,
          email: emailToVerify,
          token_type: 'email_verification',
          expires_at: expiresAt.toISOString()
        });

      if (tokenError) throw tokenError;

      // In a real implementation, you would send an email here
      // For demo purposes, we'll show the token in a toast
      toast({
        title: 'Verification Code Sent',
        description: `Your verification code is: ${token} (valid for 30 minutes)`,
      });

      await fetchPendingTokens();
      setEmailToVerify('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailWithCode = async () => {
    if (!user || !verificationCode) return;

    setLoading(true);
    try {
      // Find matching token
      const { data: tokenData, error: tokenError } = await supabase
        .from('email_verification_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('token', verificationCode.toUpperCase())
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        throw new Error('Invalid or expired verification code');
      }

      // Mark token as used
      const { error: updateError } = await supabase
        .from('email_verification_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', tokenData.id);

      if (updateError) throw updateError;

      // Update user profile verification level
      const { error: profileError } = await supabase
        .from('user_profile_extensions')
        .upsert({
          user_id: user.id,
          account_verification_level: 1
        });

      if (profileError) throw profileError;

      toast({
        title: 'Email Verified',
        description: 'Your email has been successfully verified!',
      });

      setIsEmailVerified(true);
      setVerificationCode('');
      await fetchPendingTokens();
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationToCurrentEmail = async () => {
    if (!user?.email) return;
    setEmailToVerify(user.email);
    await sendVerificationEmail();
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>Please log in to verify your email address</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Mail className="h-8 w-8 mr-3 text-primary" />
          Email Verification
        </h1>
        <p className="text-muted-foreground">Verify your email address to enhance account security</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current Email Status
              {isEmailVerified ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Unverified
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Your current email address: {user.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEmailVerified ? (
              <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-800">Email Verified</p>
                  <p className="text-sm text-green-600">Your email address has been successfully verified.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-800">Email Not Verified</p>
                    <p className="text-sm text-yellow-600">
                      Please verify your email address to access all platform features.
                    </p>
                  </div>
                </div>
                <Button onClick={resendVerificationToCurrentEmail} disabled={loading} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {!isEmailVerified && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Add New Email to Verify</CardTitle>
                <CardDescription>Add and verify a new email address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={emailToVerify}
                    onChange={(e) => setEmailToVerify(e.target.value)}
                    placeholder="Enter email address to verify"
                  />
                </div>
                <Button 
                  onClick={sendVerificationEmail} 
                  disabled={loading || !emailToVerify}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enter Verification Code</CardTitle>
                <CardDescription>Enter the 6-digit code sent to your email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="verification_code">Verification Code</Label>
                  <Input
                    id="verification_code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                </div>
                <Button 
                  onClick={verifyEmailWithCode} 
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {loading ? 'Verifying...' : 'Verify Email'}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {pendingTokens.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Pending Verifications
              </CardTitle>
              <CardDescription>Active verification codes waiting to be used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTokens.map(token => (
                  <div key={token.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{token.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Code: {token.token} • Expires: {new Date(token.expires_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};