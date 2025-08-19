import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Flag, 
  Eye,
  MessageSquare,
  User,
  Calendar,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Petition {
  id: string;
  title: string;
  description: string;
  target_signatures: number;
  current_signatures: number;
  status: 'draft' | 'pending_review' | 'active' | 'rejected' | 'completed' | 'archived';
  created_by: string;
  created_at: string;
  review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  category: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  region?: string;
  tags?: string[];
}

interface PetitionReview {
  id: string;
  petition_id: string;
  reviewer_id: string;
  action: 'approve' | 'reject' | 'request_changes';
  notes: string;
  created_at: string;
  criteria_scores: {
    clarity: number;
    feasibility: number;
    public_interest: number;
    legal_compliance: number;
  };
}

export const PetitionApprovalWorkflow: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_changes'>('approve');

  // Fetch pending petitions
  const { data: pendingPetitions, isLoading } = useQuery({
    queryKey: ['pending-petitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('petitions')
        .select('*')
        .eq('status', 'pending_review')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Petition[];
    }
  });

  // Fetch petition review history
  const { data: reviewHistory } = useQuery({
    queryKey: ['petition-reviews', selectedPetition?.id],
    queryFn: async () => {
      if (!selectedPetition) return [];

      const { data, error } = await supabase
        .from('petition_reviews')
        .select(`
          *,
          reviewer:profiles!reviewer_id(display_name)
        `)
        .eq('petition_id', selectedPetition.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedPetition
  });

  // Review petition mutation
  const reviewPetitionMutation = useMutation({
    mutationFn: async ({ petitionId, action, notes, scores }: {
      petitionId: string;
      action: 'approve' | 'reject' | 'request_changes';
      notes: string;
      scores: any;
    }) => {
      // Create review record
      const { error: reviewError } = await supabase
        .from('petition_reviews')
        .insert({
          petition_id: petitionId,
          reviewer_id: user?.id,
          action,
          notes,
          criteria_scores: scores
        });

      if (reviewError) throw reviewError;

      // Update petition status
      const newStatus = action === 'approve' ? 'active' : 
                       action === 'reject' ? 'rejected' : 'pending_review';

      const { error: updateError } = await supabase
        .from('petitions')
        .update({
          status: newStatus,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes
        })
        .eq('id', petitionId);

      if (updateError) throw updateError;

      // Send notification to petition creator
      await supabase.functions.invoke('send-notification', {
        body: {
          user_id: selectedPetition?.created_by,
          type: 'petition_reviewed',
          title: `Petition ${action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Needs Changes'}`,
          message: `Your petition "${selectedPetition?.title}" has been ${action}d.`,
          data: { petition_id: petitionId, action, notes }
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Petition Reviewed",
        description: `Petition has been ${reviewAction}d successfully.`
      });
      queryClient.invalidateQueries({ queryKey: ['pending-petitions'] });
      setSelectedPetition(null);
      setReviewNotes('');
    },
    onError: (error) => {
      toast({
        title: "Review Failed",
        description: error instanceof Error ? error.message : "Failed to review petition",
        variant: "destructive"
      });
    }
  });

  const handleReview = () => {
    if (!selectedPetition || !reviewNotes.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide review notes",
        variant: "destructive"
      });
      return;
    }

    // Basic scoring system (would be more sophisticated in production)
    const scores = {
      clarity: 8,
      feasibility: 7,
      public_interest: 9,
      legal_compliance: 8
    };

    reviewPetitionMutation.mutate({
      petitionId: selectedPetition.id,
      action: reviewAction,
      notes: reviewNotes,
      scores
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending_review: { variant: 'secondary', icon: Clock, label: 'Pending Review' },
      active: { variant: 'default', icon: CheckCircle, label: 'Active' },
      rejected: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
      completed: { variant: 'outline', icon: CheckCircle, label: 'Completed' }
    } as const;

    const config = variants[status as keyof typeof variants];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getUrgencyBadge = (level: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={colors[level as keyof typeof colors] || colors.medium}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Petition Review Workflow</h2>
        <p className="text-muted-foreground">
          Review and moderate petition submissions for the CamerPulse platform
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Review ({pendingPetitions?.length || 0})</TabsTrigger>
          <TabsTrigger value="guidelines">Review Guidelines</TabsTrigger>
          <TabsTrigger value="analytics">Review Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Petition List */}
            <Card>
              <CardHeader>
                <CardTitle>Petitions Awaiting Review</CardTitle>
                <CardDescription>
                  Click on a petition to review it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-4">Loading petitions...</div>
                ) : pendingPetitions?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                    <p>No petitions pending review</p>
                  </div>
                ) : (
                  pendingPetitions?.map((petition) => (
                    <div
                      key={petition.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                        selectedPetition?.id === petition.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedPetition(petition)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium line-clamp-2">{petition.title}</h4>
                          {getUrgencyBadge(petition.urgency_level)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {petition.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Target: {petition.target_signatures.toLocaleString()} signatures</span>
                          <span>{format(new Date(petition.created_at), 'MMM dd, yyyy')}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{petition.category}</Badge>
                          {petition.region && (
                            <Badge variant="secondary">{petition.region}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Review Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Review Panel</CardTitle>
                <CardDescription>
                  {selectedPetition ? 'Review the selected petition' : 'Select a petition to review'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedPetition ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-2" />
                    <p>Select a petition from the list to start reviewing</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Petition Details */}
                    <div className="space-y-3">
                      <h3 className="font-semibold">{selectedPetition.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedPetition.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Target Signatures:</span>
                          <p>{selectedPetition.target_signatures.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>
                          <p>{selectedPetition.category}</p>
                        </div>
                        <div>
                          <span className="font-medium">Urgency:</span>
                          <p>{getUrgencyBadge(selectedPetition.urgency_level)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Region:</span>
                          <p>{selectedPetition.region || 'National'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Review Action */}
                    <div className="space-y-3">
                      <Label>Review Decision</Label>
                      <Select value={reviewAction} onValueChange={setReviewAction}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approve">Approve Petition</SelectItem>
                          <SelectItem value="request_changes">Request Changes</SelectItem>
                          <SelectItem value="reject">Reject Petition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Review Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="review-notes">Review Notes</Label>
                      <Textarea
                        id="review-notes"
                        placeholder="Provide detailed feedback about your decision..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    {/* Review Guidelines Alert */}
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Ensure the petition meets community guidelines, is legally compliant, 
                        and serves genuine public interest before approval.
                      </AlertDescription>
                    </Alert>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleReview}
                        disabled={reviewPetitionMutation.isPending || !reviewNotes.trim()}
                        className="flex-1"
                        variant={reviewAction === 'approve' ? 'default' : 
                                reviewAction === 'reject' ? 'destructive' : 'secondary'}
                      >
                        {reviewPetitionMutation.isPending ? 'Processing...' : 
                         reviewAction === 'approve' ? 'Approve Petition' :
                         reviewAction === 'reject' ? 'Reject Petition' : 'Request Changes'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Review History */}
          {selectedPetition && reviewHistory && reviewHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Review History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reviewHistory.map((review: any) => (
                    <div key={review.id} className="flex gap-3 p-3 border rounded-lg">
                      <User className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.reviewer?.display_name || 'Anonymous'}</span>
                          <Badge variant={review.action === 'approve' ? 'default' : 'destructive'}>
                            {review.action}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="guidelines">
          <Card>
            <CardHeader>
              <CardTitle>Petition Review Guidelines</CardTitle>
              <CardDescription>
                Standards and criteria for reviewing petition submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Approval Criteria
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                  <li>• Clear, specific, and achievable objectives</li>
                  <li>• Genuine public interest and community benefit</li>
                  <li>• Legal compliance and constitutional alignment</li>
                  <li>• Appropriate target signature count</li>
                  <li>• Professional language and presentation</li>
                  <li>• Proper categorization and tagging</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Rejection Reasons
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                  <li>• Violation of community guidelines</li>
                  <li>• Illegal, discriminatory, or harmful content</li>
                  <li>• Spam, duplicate, or frivolous requests</li>
                  <li>• Personal attacks or defamatory content</li>
                  <li>• Outside platform jurisdiction or scope</li>
                  <li>• Insufficient detail or unclear objectives</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Review Best Practices
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                  <li>• Provide constructive, detailed feedback</li>
                  <li>• Consider cultural and regional context</li>
                  <li>• Suggest improvements when requesting changes</li>
                  <li>• Review within 48 hours of submission</li>
                  <li>• Maintain objectivity and professionalism</li>
                  <li>• Document decisions thoroughly</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Review Time</p>
                    <p className="text-xl font-bold">24h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Approval Rate</p>
                    <p className="text-xl font-bold">78%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Flag className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Reviews</p>
                    <p className="text-xl font-bold">{pendingPetitions?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};