import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  School, 
  Building2, 
  Pill, 
  TreePine, 
  Check, 
  X, 
  Eye, 
  Flag,
  Clock,
  UserCheck,
  FileText,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InstitutionClaim {
  id: string;
  user_id: string;
  institution_id: string;
  institution_name: string;
  institution_type: string;
  claim_type: string;
  claim_reason: string;
  evidence_files: string[];
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

const institutionTypeIcons = {
  school: School,
  hospital: Building2,
  pharmacy: Pill,
  village: TreePine,
  government: Building2,
  business: Building2
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

export default function ClaimModerationDashboard() {
  const { toast } = useToast();
  const [claims, setClaims] = useState<InstitutionClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<InstitutionClaim | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processingClaim, setProcessingClaim] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('institution_claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load claims",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateClaimStatus = async (claimId: string, status: string, notes: string) => {
    setProcessingClaim(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('institution_claims')
        .update({
          status,
          admin_notes: notes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', claimId);

      if (error) throw error;

      // If approved, update the institution
      if (status === 'approved') {
        const claim = claims.find(c => c.id === claimId);
        if (claim) {
          const { error: institutionError } = await supabase
            .from('institutions')
            .update({
              claimed_by: claim.user_id,
              claim_status: 'verified'
            })
            .eq('id', claim.institution_id);

          if (institutionError) throw institutionError;
        }
      }

      toast({
        title: "Success",
        description: `Claim ${status} successfully`,
      });

      loadClaims();
      setSelectedClaim(null);
      setReviewNotes('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update claim",
        variant: "destructive"
      });
    } finally {
      setProcessingClaim(false);
    }
  };

  const flagClaim = async (claimId: string) => {
    try {
      const { error } = await supabase
        .from('institution_claims')
        .update({ status: 'flagged' })
        .eq('id', claimId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Claim flagged for review",
      });

      loadClaims();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to flag claim",
        variant: "destructive"
      });
    }
  };

  const getFilteredClaims = (status: string) => {
    if (status === 'all') return claims;
    return claims.filter(claim => claim.status === status);
  };

  const renderClaimCard = (claim: InstitutionClaim) => {
    const IconComponent = institutionTypeIcons[claim.institution_type as keyof typeof institutionTypeIcons] || Building2;
    const statusColor = statusColors[claim.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';

    return (
      <Card key={claim.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{claim.institution_name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {claim.institution_type}
                  </Badge>
                  <Badge className={statusColor}>
                    {claim.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedClaim(claim)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Review Claim</DialogTitle>
                    <DialogDescription>
                      {claim.institution_name} - {claim.institution_type}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Claim Type</Label>
                      <p className="capitalize">{claim.claim_type}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Claim Reason</Label>
                      <p className="text-sm text-muted-foreground">{claim.claim_reason}</p>
                    </div>

                    {claim.evidence_files && claim.evidence_files.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Evidence Files</Label>
                        <div className="space-y-2">
                          {claim.evidence_files.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm flex-1">{file}</span>
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium">Submitted</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(claim.created_at).toLocaleDateString()} at {new Date(claim.created_at).toLocaleTimeString()}
                      </p>
                    </div>

                    {claim.status === 'pending' && (
                      <div className="space-y-4 pt-4 border-t">
                        <div>
                          <Label htmlFor="review-notes">Review Notes</Label>
                          <Textarea
                            id="review-notes"
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Add notes about your decision..."
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => updateClaimStatus(claim.id, 'approved', reviewNotes)}
                            disabled={processingClaim}
                            className="flex items-center gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => updateClaimStatus(claim.id, 'rejected', reviewNotes)}
                            disabled={processingClaim}
                            className="flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => flagClaim(claim.id)}
                            disabled={processingClaim}
                            className="flex items-center gap-2"
                          >
                            <Flag className="h-4 w-4" />
                            Flag
                          </Button>
                        </div>
                      </div>
                    )}

                    {claim.admin_notes && (
                      <div className="pt-4 border-t">
                        <Label className="text-sm font-medium">Admin Notes</Label>
                        <p className="text-sm text-muted-foreground">{claim.admin_notes}</p>
                        {claim.reviewed_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Reviewed on {new Date(claim.reviewed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {new Date(claim.created_at).toLocaleDateString()}
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {claim.claim_reason}
            </p>

            {claim.evidence_files && claim.evidence_files.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {claim.evidence_files.length} file{claim.evidence_files.length !== 1 ? 's' : ''} attached
              </div>
            )}

            {claim.reviewed_by && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserCheck className="h-4 w-4" />
                Reviewed
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const pendingCount = claims.filter(c => c.status === 'pending').length;
  const approvedCount = claims.filter(c => c.status === 'approved').length;
  const rejectedCount = claims.filter(c => c.status === 'rejected').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading claims...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Claim Moderation Dashboard</h1>
          <p className="text-muted-foreground">
            Review and moderate institution ownership claims
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{approvedCount}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <X className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{rejectedCount}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{claims.length}</p>
                  <p className="text-sm text-muted-foreground">Total Claims</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claims Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedCount})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedCount})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({claims.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredClaims('pending').map(renderClaimCard)}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredClaims('approved').map(renderClaimCard)}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredClaims('rejected').map(renderClaimCard)}
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {claims.map(renderClaimCard)}
            </div>
          </TabsContent>
        </Tabs>

        {claims.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No claims found</h3>
            <p className="text-muted-foreground">
              No institution claims have been submitted yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}