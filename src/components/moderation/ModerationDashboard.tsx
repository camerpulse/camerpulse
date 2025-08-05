import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Clock, Eye, Flag, MessageSquare } from 'lucide-react';
import { VerificationChecklist } from './VerificationChecklist';
import { ModerationActions } from './ModerationActions';

interface InstitutionSubmission {
  id: string;
  institution_type: string;
  name: string;
  description?: string;
  location: any;
  contact_info: any;
  verification_status: 'pending' | 'verified' | 'flagged' | 'rejected' | 'under_review';
  verification_checklist: any;
  moderator_notes?: string;
  flagged_reasons?: string[];
  created_at: string;
  submitted_by: string;
  assigned_moderator?: string;
  reviewed_at?: string;
  verified_at?: string;
  updated_at: string;
  metadata?: any;
}

interface ClaimRequest {
  id: string;
  institution_type: string;
  claim_reason?: string;
  status: 'pending' | 'verified' | 'flagged' | 'rejected' | 'under_review';
  created_at: string;
  claimant_user_id: string;
  evidence_documents?: string[];
  institution_id: string;
  reviewed_by?: string;
  reviewer_notes?: string;
  reviewed_at?: string;
  updated_at: string;
}

export const ModerationDashboard = () => {
  const [submissions, setSubmissions] = useState<InstitutionSubmission[]>([]);
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');
  const { toast } = useToast();

  useEffect(() => {
    fetchModerationData();
  }, []);

  const fetchModerationData = async () => {
    try {
      setLoading(true);
      
      // Fetch pending submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('institution_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (submissionsError) throw submissionsError;
      
      // Fetch claim requests
      const { data: claimsData, error: claimsError } = await supabase
        .from('claim_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (claimsError) throw claimsError;

      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('moderation_notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (notificationsError) throw notificationsError;

      setSubmissions(submissionsData || []);
      setClaims(claimsData || []);
      setNotifications(notificationsData || []);
    } catch (error) {
      console.error('Error fetching moderation data:', error);
      toast({
        title: "Error",
        description: "Failed to load moderation dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'flagged':
        return <Flag className="h-4 w-4 text-destructive" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'under_review':
        return <Eye className="h-4 w-4 text-primary" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'verified' ? 'default' : 
                   status === 'pending' ? 'secondary' : 
                   'destructive';
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (selectedTab === 'all') return true;
    return submission.verification_status === selectedTab;
  });

  const pendingCount = submissions.filter(s => s.verification_status === 'pending').length;
  const flaggedCount = submissions.filter(s => s.verification_status === 'flagged').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Moderation Dashboard</h1>
          <p className="text-muted-foreground">Manage institution submissions and claims</p>
        </div>
        <div className="flex gap-4">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">{pendingCount} Pending</span>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">{flaggedCount} Flagged</span>
            </div>
          </Card>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged ({flaggedCount})</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No submissions found for this category.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredSubmissions.map((submission) => (
                <Card key={submission.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{submission.name}</h3>
                        {getStatusBadge(submission.verification_status)}
                        <Badge variant="outline">
                          {submission.institution_type.charAt(0).toUpperCase() + 
                           submission.institution_type.slice(1)}
                        </Badge>
                      </div>
                      
                      {submission.description && (
                        <p className="text-muted-foreground mb-3">{submission.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Submitted: {new Date(submission.created_at).toLocaleDateString()}</span>
                        {submission.location?.region && (
                          <span>Region: {submission.location.region}</span>
                        )}
                        {submission.flagged_reasons && submission.flagged_reasons.length > 0 && (
                          <span className="text-destructive">
                            Flagged: {submission.flagged_reasons.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                  
                  {submission.verification_status === 'pending' && (
                    <div className="mt-4 pt-4 border-t">
                      <VerificationChecklist 
                        checklist={submission.verification_checklist}
                        submissionId={submission.id}
                        onUpdate={fetchModerationData}
                      />
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t">
                    <ModerationActions 
                      submission={submission}
                      onUpdate={fetchModerationData}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {claims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Claim Requests</CardTitle>
            <CardDescription>Review ownership claims for institutions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {claims.filter(c => c.status === 'pending').map((claim) => (
                <div key={claim.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{claim.institution_type} Claim</span>
                    <p className="text-sm text-muted-foreground">{claim.claim_reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Review</Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};