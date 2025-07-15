import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { PoliticalImportDashboard } from '@/components/Politics/PoliticalImportDashboard';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  FileText, 
  Download,
  Users,
  Building2,
  AlertTriangle,
  Crown,
  Shield
} from 'lucide-react';

interface ClaimRequest {
  id: string;
  user_id: string;
  party_id?: string;
  politician_id?: string;
  claim_fee_amount: number;
  payment_method: string;
  payment_reference: string;
  payment_status: string;
  documents_uploaded: string[];
  admin_notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
  processed_at?: string;
  processed_by?: string;
  party_name?: string;
  politician_name?: string;
  user_email?: string;
}

const PoliticalImportAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClaim, setSelectedClaim] = useState<ClaimRequest | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [claimDecision, setClaimDecision] = useState<'approved' | 'rejected'>('approved');

  // Fetch all claim requests
  const { data: claimRequests, isLoading } = useQuery({
    queryKey: ['claim-requests'],
    queryFn: async (): Promise<ClaimRequest[]> => {
      const [partyClaimsResponse, politicianClaimsResponse] = await Promise.all([
        supabase
          .from('party_claims')
          .select(`
            *,
            political_parties!party_id(name)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('politician_claims')
          .select(`
            *,
            politicians!politician_id(name)
          `)
          .order('created_at', { ascending: false })
      ]);

      const partyClaims = (partyClaimsResponse.data || []).map((claim: any) => ({
        ...claim,
        party_name: claim.political_parties?.name,
        user_email: 'User'
      }));

      const politicianClaims = (politicianClaimsResponse.data || []).map((claim: any) => ({
        ...claim,
        politician_name: claim.politicians?.name,
        user_email: 'User'
      }));

      return [...partyClaims, ...politicianClaims] as ClaimRequest[];
    }
  });

  // Process claim mutation
  const processClaim = useMutation({
    mutationFn: async ({ claimId, decision, notes, type }: {
      claimId: string;
      decision: 'approved' | 'rejected';
      notes: string;
      type: 'party' | 'politician';
    }) => {
      const table = type === 'party' ? 'party_claims' : 'politician_claims';
      
      // Update claim status
      const { error: claimError } = await supabase
        .from(table)
        .update({
          status: decision,
          admin_notes: notes,
          processed_at: new Date().toISOString()
        })
        .eq('id', claimId);

      if (claimError) throw claimError;

      // If approved, update the profile claim status
      if (decision === 'approved') {
        const claim = claimRequests?.find(c => c.id === claimId);
        if (claim) {
          const targetTable = type === 'party' ? 'political_parties' : 'politicians';
          const targetId = type === 'party' ? claim.party_id : claim.politician_id;
          
          const { error: profileError } = await supabase
            .from(targetTable)
            .update({
              is_claimed: true,
              claimed_at: new Date().toISOString(),
              claimed_by: claim.user_id,
              claim_fee_paid: true,
              claim_payment_reference: claim.payment_reference,
              claim_status: 'approved'
            })
            .eq('id', targetId);

          if (profileError) throw profileError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claim-requests'] });
      toast({
        title: "Claim Processed",
        description: `Claim has been ${claimDecision}`,
      });
      setShowClaimModal(false);
      setSelectedClaim(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process claim",
        variant: "destructive"
      });
      console.error('Error processing claim:', error);
    }
  });

  const openClaimModal = (claim: ClaimRequest) => {
    setSelectedClaim(claim);
    setAdminNotes(claim.admin_notes || '');
    setClaimDecision('approved');
    setShowClaimModal(true);
  };

  const handleProcessClaim = () => {
    if (!selectedClaim) return;

    const type = selectedClaim.party_id ? 'party' : 'politician';
    processClaim.mutate({
      claimId: selectedClaim.id,
      decision: claimDecision,
      notes: adminNotes,
      type
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

   const formatAmount = (amount: number) => {
     return new Intl.NumberFormat('en-US').format(amount) + ' FCFA';
   };

  const pendingClaims = claimRequests?.filter(c => c.status === 'pending') || [];
  const processedClaims = claimRequests?.filter(c => c.status !== 'pending') || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Political Import Administration</h1>
          <p className="text-muted-foreground">
            Manage political parties, politicians, and profile claim requests
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Import Dashboard</TabsTrigger>
            <TabsTrigger value="pending-claims">
              Pending Claims ({pendingClaims.length})
            </TabsTrigger>
            <TabsTrigger value="processed-claims">Claim History</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <PoliticalImportDashboard />
          </TabsContent>

          <TabsContent value="pending-claims" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Pending Profile Claims
                </CardTitle>
                <CardDescription>
                  Review and approve profile claim requests from users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div>Loading claims...</div>
                ) : pendingClaims.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending claims</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingClaims.map((claim) => (
                      <Card key={claim.id} className="border-orange-200">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                {claim.party_id ? (
                                  <Building2 className="h-6 w-6" />
                                ) : (
                                  <Users className="h-6 w-6" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium">
                                  {claim.party_name || claim.politician_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Claimed by: {claim.user_email}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Fee: {formatAmount(claim.claim_fee_amount)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Payment: {claim.payment_method} - {claim.payment_reference}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={claim.payment_status === 'paid' ? 'default' : 'secondary'}>
                                {claim.payment_status}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openClaimModal(claim)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processed-claims" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Processed Claims</CardTitle>
                <CardDescription>
                  History of approved and rejected profile claims
                </CardDescription>
              </CardHeader>
              <CardContent>
                {processedClaims.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No processed claims yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {processedClaims.map((claim) => (
                      <Card key={claim.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                {claim.party_id ? (
                                  <Building2 className="h-6 w-6" />
                                ) : (
                                  <Users className="h-6 w-6" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium">
                                  {claim.party_name || claim.politician_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Claimed by: {claim.user_email}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Processed: {new Date(claim.processed_at || '').toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(claim.status)}
                              {claim.status === 'approved' && (
                                <Badge variant="outline" className="gap-1">
                                  <Crown className="h-3 w-3" />
                                  Claimed
                                </Badge>
                              )}
                            </div>
                          </div>
                          {claim.admin_notes && (
                            <div className="mt-3 p-3 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                <strong>Admin Notes:</strong> {claim.admin_notes}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Claim Review Modal */}
        <Dialog open={showClaimModal} onOpenChange={setShowClaimModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Review Profile Claim
              </DialogTitle>
            </DialogHeader>

            {selectedClaim && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">
                      {selectedClaim.party_id ? 'Political Party' : 'Politician'}
                    </h3>
                    <p className="text-lg font-bold">
                      {selectedClaim.party_name || selectedClaim.politician_name}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Claimant</h3>
                    <p>{selectedClaim.user_email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Claim Fee</h3>
                    <p>{formatAmount(selectedClaim.claim_fee_amount)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Payment Status</h3>
                    <Badge variant={selectedClaim.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {selectedClaim.payment_status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Documents Uploaded</h3>
                  {selectedClaim.documents_uploaded?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedClaim.documents_uploaded.map((doc, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{doc}</span>
                          <Button variant="outline" size="sm" className="ml-auto">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No documents uploaded</p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-2">Decision</h3>
                  <Select value={claimDecision} onValueChange={(value: 'approved' | 'rejected') => setClaimDecision(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approve Claim</SelectItem>
                      <SelectItem value="rejected">Reject Claim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Admin Notes</h3>
                  <Textarea
                    placeholder="Add notes about this decision..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                {selectedClaim.payment_status !== 'paid' && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Warning: Payment status is not confirmed as paid. Verify payment before approving.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowClaimModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleProcessClaim}
                    disabled={processClaim.isPending}
                    variant={claimDecision === 'approved' ? 'default' : 'destructive'}
                  >
                    {processClaim.isPending ? 'Processing...' : `${claimDecision === 'approved' ? 'Approve' : 'Reject'} Claim`}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PoliticalImportAdmin;