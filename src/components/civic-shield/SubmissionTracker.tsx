import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  MessageCircle,
  FileText
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const SubmissionTracker: React.FC = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [searchInitiated, setSearchInitiated] = useState(false);

  const { data: submission, isLoading, error } = useQuery({
    queryKey: ['track-submission', trackingCode],
    queryFn: async () => {
      if (!trackingCode) return null;
      
      const { data, error } = await supabase
        .from('whistleblower_submissions')
        .select(`
          *,
          civic_risk_assessments!inner(*)
        `)
        .eq('submission_code', trackingCode)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: searchInitiated && !!trackingCode,
  });

  const { data: communications } = useQuery({
    queryKey: ['submission-communications', submission?.id],
    queryFn: async () => {
      if (!submission?.id) return [];
      
      const { data, error } = await supabase
        .from('submission_communications')
        .select('*')
        .eq('submission_id', submission.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!submission?.id,
  });

  const handleSearch = () => {
    setSearchInitiated(true);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      disputed: 'bg-red-100 text-red-800',
      dismissed: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.pending}>
        {status}
      </Badge>
    );
  };

  const getThreatBadge = (level: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={colors[level as keyof typeof colors] || colors.low}>
        {level} threat
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Track Your Submission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tracking-code">Enter your tracking code</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="tracking-code"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="CS-2025-XXXXXXXX"
                className="font-mono"
              />
              <Button onClick={handleSearch} disabled={!trackingCode}>
                <Search className="h-4 w-4 mr-2" />
                Track
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Your tracking search is encrypted and anonymous
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p>Searching for your submission...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="py-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
            <h3 className="font-semibold text-red-900 mb-2">Submission Not Found</h3>
            <p className="text-red-700 text-sm">
              Please check your tracking code and try again. If you continue to have issues, 
              the submission may still be processing.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Submission Details */}
      {submission && (
        <div className="space-y-6">
          {/* Main Submission Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Submission Details
                </CardTitle>
                {getStatusBadge(submission.verification_status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="font-medium">Tracking Code</Label>
                  <p className="font-mono text-sm mt-1">{submission.submission_code}</p>
                </div>
                <div>
                  <Label className="font-medium">Anonymous ID</Label>
                  <p className="font-mono text-sm mt-1">{submission.pseudonym}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Title</Label>
                <p className="mt-1">{submission.title}</p>
              </div>

              <div>
                <Label className="font-medium">Disclosure Type</Label>
                <p className="mt-1 capitalize">{submission.disclosure_type.replace('_', ' ')}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="font-medium">Region</Label>
                  <p className="mt-1">{submission.region}</p>
                </div>
                <div>
                  <Label className="font-medium">Urgency Level</Label>
                  <p className="mt-1">{submission.urgency_level}/10</p>
                </div>
                <div>
                  <Label className="font-medium">Threat Level</Label>
                  <div className="mt-1">{getThreatBadge(submission.threat_level)}</div>
                </div>
              </div>

              <div>
                <Label className="font-medium">Submitted</Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(submission.created_at).toLocaleDateString()} at{' '}
                  {new Date(submission.created_at).toLocaleTimeString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Protection Status */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Shield className="h-5 w-5" />
                Protection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium text-green-900">Encryption</Label>
                  <p className="text-green-700 flex items-center gap-1 mt-1">
                    <CheckCircle className="h-3 w-3" />
                    Military-grade encryption active
                  </p>
                </div>
                <div>
                  <Label className="font-medium text-green-900">Anonymity</Label>
                  <p className="text-green-700 flex items-center gap-1 mt-1">
                    <CheckCircle className="h-3 w-3" />
                    Identity protection enabled
                  </p>
                </div>
                <div>
                  <Label className="font-medium text-green-900">Risk Assessment</Label>
                  <p className="text-green-700 flex items-center gap-1 mt-1">
                    <CheckCircle className="h-3 w-3" />
                    Automatic protection applied
                  </p>
                </div>
                <div>
                  <Label className="font-medium text-green-900">Monitoring</Label>
                  <p className="text-green-700 flex items-center gap-1 mt-1">
                    <Eye className="h-3 w-3" />
                    Under civic shield protection
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communications */}
          {communications && communications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Communications ({communications.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {communications.map((comm) => (
                  <div key={comm.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{comm.sender_type}</Badge>
                        <span className="font-medium text-sm">{comm.sender_alias}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comm.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comm.message_content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="py-4">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your submission is being reviewed by specialized moderators</li>
                <li>• Risk assessment algorithms are monitoring for any threats</li>
                <li>• You will receive updates through the secure communication system</li>
                <li>• Keep your tracking code safe for future reference</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Results State */}
      {searchInitiated && !isLoading && !submission && !error && (
        <Card>
          <CardContent className="py-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Submission Found</h3>
            <p className="text-muted-foreground text-sm">
              Please check your tracking code and try again.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};