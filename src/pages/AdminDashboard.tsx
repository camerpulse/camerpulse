import { useState } from 'react';
import { useUserProfileClaims, useUpdateClaimStatus } from '@/hooks/useProfileClaims';
import { useUserEditSuggestions, useUpdateSuggestionStatus } from '@/hooks/useEditSuggestions';
import { useAllRatings, useModerateRating } from '@/hooks/useMinisterRatings';
import { ClaimReviewPanel } from '@/components/Admin/ClaimReviewPanel';
import { EditSuggestionReviewPanel } from '@/components/Admin/EditSuggestionReviewPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Eye, Calendar, User, Star, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const { data: claims, isLoading: claimsLoading } = useUserProfileClaims();
  const { data: suggestions, isLoading: suggestionsLoading } = useUserEditSuggestions();
  const { data: ratings, isLoading: ratingsLoading } = useAllRatings();
  const updateClaim = useUpdateClaimStatus();
  const updateSuggestion = useUpdateSuggestionStatus();
  const moderateRating = useModerateRating();
  
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [selectedRating, setSelectedRating] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const handleClaimAction = async (claimId: string, status: 'approved' | 'rejected') => {
    await updateClaim.mutateAsync({
      claimId,
      status,
      adminNotes
    });
    setAdminNotes('');
    setSelectedClaim(null);
  };

  const handleSuggestionAction = async (suggestionId: string, status: 'approved' | 'rejected') => {
    await updateSuggestion.mutateAsync({
      suggestionId,
      status,
      adminNotes
    });
    setAdminNotes('');
    setSelectedSuggestion(null);
  };

  const handleRatingAction = async (ratingId: string, action: 'remove' | 'flag' | 'approve') => {
    await moderateRating.mutateAsync({
      ratingId,
      action,
      adminNotes
    });
    setAdminNotes('');
    setSelectedRating(null);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      approved: 'bg-success/10 text-success border-success/20',
      rejected: 'bg-destructive/10 text-destructive border-destructive/20'
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  if (claimsLoading || suggestionsLoading || ratingsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Pending Claims: {claims?.filter(c => c.status === 'pending').length || 0}</span>
          <span>Pending Suggestions: {suggestions?.filter(s => s.status === 'pending').length || 0}</span>
          <span>Flagged Ratings: {ratings?.filter(r => r.is_flagged).length || 0}</span>
        </div>
      </div>

      <Tabs defaultValue="claims" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="claims">Profile Claims</TabsTrigger>
          <TabsTrigger value="suggestions">Edit Suggestions</TabsTrigger>
          <TabsTrigger value="ratings">Rating Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-4">
          {claims?.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No profile claims submitted yet.</p>
              </CardContent>
            </Card>
          ) : (
            claims?.map((claim) => (
              <Card key={claim.id} className="border border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">
                        {claim.entity_type.toUpperCase()} Profile Claim
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>Claim Type: {claim.claim_type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(claim.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge className={getStatusBadge(claim.status)}>
                      {claim.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {claim.claim_reason && (
                    <div>
                      <Label className="text-sm font-medium">Reason:</Label>
                      <p className="text-sm text-muted-foreground mt-1">{claim.claim_reason}</p>
                    </div>
                  )}
                  
                  {claim.evidence_files && claim.evidence_files.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Evidence Files:</Label>
                      <div className="flex gap-2 mt-1">
                        {claim.evidence_files.map((file, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {file}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {claim.status === 'pending' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedClaim(claim)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review Claim
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Review Profile Claim</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Admin Notes (Optional)</Label>
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add any notes about this decision..."
                              className="mt-1"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleClaimAction(claim.id, 'approved')}
                              className="flex-1"
                              disabled={updateClaim.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleClaimAction(claim.id, 'rejected')}
                              variant="destructive"
                              className="flex-1"
                              disabled={updateClaim.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {claim.admin_notes && (
                    <div className="pt-2 border-t border-border/50">
                      <Label className="text-sm font-medium">Admin Notes:</Label>
                      <p className="text-sm text-muted-foreground mt-1">{claim.admin_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          {suggestions?.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No edit suggestions submitted yet.</p>
              </CardContent>
            </Card>
          ) : (
            suggestions?.map((suggestion) => (
              <Card key={suggestion.id} className="border border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">
                        {suggestion.entity_type.toUpperCase()} Edit Suggestion
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(suggestion.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge className={getStatusBadge(suggestion.status)}>
                      {suggestion.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Suggested Changes:</Label>
                    <div className="bg-muted/50 p-3 rounded-md mt-1 space-y-2">
                      <div>
                        <span className="text-sm font-medium">Field: </span>
                        <span className="text-sm">{suggestion.suggested_changes.field}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Current: </span>
                        <span className="text-sm">{suggestion.suggested_changes.current_value}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Suggested: </span>
                        <span className="text-sm">{suggestion.suggested_changes.suggested_value}</span>
                      </div>
                    </div>
                  </div>
                  
                  {suggestion.change_reason && (
                    <div>
                      <Label className="text-sm font-medium">Reason:</Label>
                      <p className="text-sm text-muted-foreground mt-1">{suggestion.change_reason}</p>
                    </div>
                  )}

                  {suggestion.status === 'pending' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSuggestion(suggestion)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review Suggestion
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Review Edit Suggestion</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Admin Notes (Optional)</Label>
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add any notes about this decision..."
                              className="mt-1"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSuggestionAction(suggestion.id, 'approved')}
                              className="flex-1"
                              disabled={updateSuggestion.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleSuggestionAction(suggestion.id, 'rejected')}
                              variant="destructive"
                              className="flex-1"
                              disabled={updateSuggestion.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {suggestion.admin_notes && (
                    <div className="pt-2 border-t border-border/50">
                      <Label className="text-sm font-medium">Admin Notes:</Label>
                      <p className="text-sm text-muted-foreground mt-1">{suggestion.admin_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="ratings" className="space-y-4">
          {ratings?.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No ratings submitted yet.</p>
              </CardContent>
            </Card>
          ) : (
            ratings?.map((rating) => (
              <Card key={rating.id} className="border border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        Rating for {rating.politician_name || 'Unknown'}
                        {rating.is_flagged && <AlertTriangle className="w-4 h-4 text-warning" />}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(rating.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= rating.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {rating.rating}/5 stars
                        </span>
                      </div>
                    </div>
                    <Badge className={rating.is_flagged ? 'bg-warning/10 text-warning border-warning/20' : 'bg-success/10 text-success border-success/20'}>
                      {rating.is_flagged ? 'Flagged' : 'Clean'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rating.comment && (
                    <div>
                      <Label className="text-sm font-medium">Comment:</Label>
                      <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted/50 rounded-md">
                        {rating.comment}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRating(rating)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Moderate Rating
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Moderate Rating</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-muted/50 rounded-md">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= rating.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium">{rating.rating}/5</span>
                            </div>
                            {rating.comment && (
                              <p className="text-sm text-muted-foreground">{rating.comment}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label>Admin Notes (Optional)</Label>
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add any notes about this moderation action..."
                              className="mt-1"
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleRatingAction(rating.id, 'approve')}
                              className="flex-1"
                              disabled={moderateRating.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleRatingAction(rating.id, 'flag')}
                              variant="outline"
                              className="flex-1"
                              disabled={moderateRating.isPending}
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Flag
                            </Button>
                            <Button
                              onClick={() => handleRatingAction(rating.id, 'remove')}
                              variant="destructive"
                              className="flex-1"
                              disabled={moderateRating.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {rating.admin_notes && (
                    <div className="pt-2 border-t border-border/50">
                      <Label className="text-sm font-medium">Admin Notes:</Label>
                      <p className="text-sm text-muted-foreground mt-1">{rating.admin_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}