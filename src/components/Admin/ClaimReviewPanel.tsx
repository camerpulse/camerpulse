import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  FileText, 
  Calendar,
  Shield,
  Crown,
  Building2,
  Users
} from 'lucide-react';

interface ClaimRequest {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  user_id: string;
  user_email: string;
  user_name: string;
  claim_type: string;
  claim_reason: string;
  evidence_files: string[];
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
}

export const ClaimReviewPanel: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<ClaimRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (isAdmin()) {
      fetchClaims();
    }
  }, [user]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      // Fetch from all claim tables and combine
      const claimTables = [
        { table: 'politician_claims', entity_table: 'politicians', entity_type: 'politician' },
        { table: 'senator_claims', entity_table: 'senators', entity_type: 'senator' },
        { table: 'mp_claims', entity_table: 'mps', entity_type: 'mp' },
        { table: 'minister_claims', entity_table: 'ministers', entity_type: 'minister' }
      ];

      const allClaims: ClaimRequest[] = [];

      for (const { table, entity_table, entity_type } of claimTables) {
        const { data: claimData, error } = await supabase
          .from(table)
          .select(`
            id,
            ${entity_type}_id,
            user_id,
            claim_type,
            claim_reason,
            evidence_files,
            status,
            submitted_at,
            reviewed_at,
            reviewed_by,
            rejection_reason
          `)
          .order('submitted_at', { ascending: false });

        if (error) {
          console.error(`Error fetching ${table}:`, error);
          continue;
        }

        if (claimData && claimData.length > 0) {
          // Get entity details and user details
          for (const claim of claimData) {
            // Get entity details
            const { data: entityData } = await supabase
              .from(entity_table)
              .select('name')
              .eq('id', claim[`${entity_type}_id`])
              .maybeSingle();

            // Get user details
            const { data: profileData } = await supabase
              .from('profiles')
              .select('display_name, username')
              .eq('user_id', claim.user_id)
              .maybeSingle();

            allClaims.push({
              id: claim.id,
              entity_type,
              entity_id: claim[`${entity_type}_id`],
              entity_name: entityData?.name || 'Unknown',
              user_id: claim.user_id,
              user_email: user?.email || 'Unknown',
              user_name: profileData?.display_name || profileData?.username || 'Unknown User',
              claim_type: claim.claim_type,
              claim_reason: claim.claim_reason,
              evidence_files: claim.evidence_files || [],
              status: claim.status,
              submitted_at: claim.submitted_at,
              reviewed_at: claim.reviewed_at,
              reviewed_by: claim.reviewed_by,
              rejection_reason: claim.rejection_reason
            });
          }
        }
      }

      setClaims(allClaims);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast({
        title: "Error",
        description: "Failed to fetch claim requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClaim = async (action: 'approve' | 'reject') => {
    if (!selectedClaim) return;

    if (action === 'reject' && !rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this claim",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const claimTable = `${selectedClaim.entity_type}_claims`;
      const entityTable = `${selectedClaim.entity_type}s`;

      // Update claim status
      const { error: claimError } = await supabase
        .from(claimTable)
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          rejection_reason: action === 'reject' ? rejectionReason : null
        })
        .eq('id', selectedClaim.id);

      if (claimError) throw claimError;

      // If approved, update the entity to mark as claimed
      if (action === 'approve') {
        const { error: entityError } = await supabase
          .from(entityTable)
          .update({
            is_claimed: true,
            claimed_by: selectedClaim.user_id,
            claimed_at: new Date().toISOString()
          })
          .eq('id', selectedClaim.entity_id);

        if (entityError) throw entityError;
      }

      toast({
        title: `Claim ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `The claim has been ${action === 'approve' ? 'approved' : 'rejected'} successfully`
      });

      setSelectedClaim(null);
      setReviewAction(null);
      setRejectionReason('');
      fetchClaims(); // Refresh the list

    } catch (error) {
      console.error('Error reviewing claim:', error);
      toast({
        title: "Review Error",
        description: "Failed to process the claim review",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'politician':
        return <User className="h-4 w-4" />;
      case 'senator':
        return <Crown className="h-4 w-4" />;
      case 'mp':
        return <Building2 className="h-4 w-4" />;
      case 'minister':
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const filteredClaims = claims.filter(claim => {
    switch (activeTab) {
      case 'pending':
        return claim.status === 'pending';
      case 'approved':
        return claim.status === 'approved';
      case 'rejected':
        return claim.status === 'rejected';
      default:
        return true;
    }
  });

  if (!isAdmin()) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
          <p className="text-muted-foreground">
            You need administrator privileges to access the claim review panel.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Profile Claim Review</h2>
          <p className="text-muted-foreground">
            Review and approve profile ownership claims
          </p>
        </div>
        <Button onClick={fetchClaims} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({claims.filter(c => c.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({claims.filter(c => c.status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({claims.filter(c => c.status === 'rejected').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredClaims.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Claims Found</h3>
                <p className="text-muted-foreground">
                  No {activeTab} claim requests at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredClaims.map((claim) => (
                <Card key={claim.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getEntityIcon(claim.entity_type)}
                          <h3 className="font-semibold">{claim.entity_name}</h3>
                          <Badge variant="outline" className="capitalize">
                            {claim.entity_type}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(claim.status)}
                            <Badge 
                              variant={claim.status === 'approved' ? 'default' : claim.status === 'rejected' ? 'destructive' : 'secondary'}
                              className="capitalize"
                            >
                              {claim.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-2">
                          <div>Claimant: {claim.user_name}</div>
                          <div>Submitted: {new Date(claim.submitted_at).toLocaleDateString()}</div>
                          {claim.reviewed_at && (
                            <div>Reviewed: {new Date(claim.reviewed_at).toLocaleDateString()}</div>
                          )}
                        </div>
                        
                        <p className="text-sm line-clamp-2 mb-3">
                          {claim.claim_reason}
                        </p>
                        
                        {claim.evidence_files.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            📎 {claim.evidence_files.length} supporting document(s)
                          </div>
                        )}
                      </div>
                      
                      {claim.status === 'pending' && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => {
                              setSelectedClaim(claim);
                              setReviewAction('approve');
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => {
                              setSelectedClaim(claim);
                              setReviewAction('reject');
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!reviewAction} onOpenChange={() => setReviewAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Claim
            </DialogTitle>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedClaim.entity_name}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Claimed by: {selectedClaim.user_name}
                </p>
                <p className="text-sm">{selectedClaim.claim_reason}</p>
              </div>
              
              {reviewAction === 'reject' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Rejection Reason *
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please explain why this claim is being rejected..."
                    className="min-h-[100px]"
                  />
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setReviewAction(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleReviewClaim(reviewAction!)}
                  disabled={loading}
                  className={`flex-1 ${
                    reviewAction === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {loading ? 'Processing...' : `${reviewAction === 'approve' ? 'Approve' : 'Reject'} Claim`}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};