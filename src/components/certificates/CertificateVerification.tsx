import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Shield, 
  Calendar,
  User,
  Award,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface VerificationResult {
  id: string;
  certificate_title: string;
  recipient_name: string;
  recipient_role: string;
  verification_code: string;
  issued_at: string;
  certificate_status: string;
  is_verified: boolean;
  civic_events?: {
    name: string;
    start_date: string;
  };
}

export const CertificateVerification: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyCertificate = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter a verification code');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // First, search for the certificate
      const { data: certificate, error: certError } = await supabase
        .from('event_certificates')
        .select(`
          *,
          civic_events (name, start_date)
        `)
        .eq('verification_code', verificationCode.trim().toUpperCase())
        .single();

      if (certError) {
        if (certError.code === 'PGRST116') {
          setError('Certificate not found. Please check the verification code.');
        } else {
          throw certError;
        }
        return;
      }

      // Log the verification attempt
      await supabase
        .from('certificate_verification_logs')
        .insert({
          certificate_id: certificate.id,
          verification_code: verificationCode.trim().toUpperCase(),
          is_valid: certificate.certificate_status === 'issued' || certificate.certificate_status === 'claimed'
        });

      setResult(certificate);
      
      if (certificate.certificate_status === 'revoked') {
        setError('This certificate has been revoked and is no longer valid.');
      } else if (certificate.certificate_status === 'pending') {
        setError('This certificate is still pending approval.');
      }

    } catch (error) {
      console.error('Error verifying certificate:', error);
      setError('An error occurred while verifying the certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyCertificate();
    }
  };

  const isValid = result && (result.certificate_status === 'issued' || result.certificate_status === 'claimed');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Certificate Verification
          </CardTitle>
          <CardDescription>
            Enter a certificate verification code to check its authenticity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="verification_code">Verification Code</Label>
            <div className="flex gap-2">
              <Input
                id="verification_code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="e.g., CERT-2024-123456"
                onKeyPress={handleKeyPress}
                className="font-mono"
              />
              <Button onClick={verifyCertificate} disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <Card className={`border-2 ${isValid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isValid ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-green-700">Certificate Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-600" />
                      <span className="text-red-700">Certificate Invalid</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Recipient</span>
                    </div>
                    <div className="font-semibold">{result.recipient_name}</div>
                    <div className="text-sm text-gray-600">{result.recipient_role}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Certificate</span>
                    </div>
                    <div className="font-semibold">{result.certificate_title}</div>
                    <Badge variant={isValid ? 'default' : 'destructive'}>
                      {result.certificate_status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Event</span>
                    </div>
                    <div className="font-semibold">
                      {result.civic_events?.name || 'Event Name'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.civic_events?.start_date && 
                        format(new Date(result.civic_events.start_date), 'MMM dd, yyyy')
                      }
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Verification</span>
                    </div>
                    <div className="font-mono text-sm">{result.verification_code}</div>
                    <div className="text-sm text-gray-600">
                      Issued: {format(new Date(result.issued_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>

                {isValid && (
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-sm text-green-700">
                      ✓ This certificate is authentic and has been verified by CamerPulse.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Verify</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </div>
              <div>
                <div className="font-medium">Locate the verification code</div>
                <div className="text-gray-600">Find the verification code on the bottom right of the certificate</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </div>
              <div>
                <div className="font-medium">Enter the code</div>
                <div className="text-gray-600">Type or paste the verification code in the field above</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </div>
              <div>
                <div className="font-medium">View results</div>
                <div className="text-gray-600">See the certificate details and verification status</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};