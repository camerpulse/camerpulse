import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Check, 
  X, 
  Eye, 
  MessageSquare, 
  Calendar,
  User,
  Edit3,
  AlertCircle
} from 'lucide-react';
import { useAllEditSuggestions, useUpdateSuggestionStatus, EditSuggestion } from '@/hooks/useEditSuggestions';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const EditSuggestionReviewPanel = () => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<EditSuggestion | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { data: suggestions, isLoading, error } = useAllEditSuggestions();
  const updateStatus = useUpdateSuggestionStatus();

  const handleApprove = async () => {
    if (!selectedSuggestion) return;
    
    await updateStatus.mutateAsync({
      suggestionId: selectedSuggestion.id,
      status: 'approved',
      adminNotes: adminNotes.trim() || undefined
    });
    
    setSelectedSuggestion(null);
    setAdminNotes('');
  };

  const handleReject = async () => {
    if (!selectedSuggestion) return;
    
    await updateStatus.mutateAsync({
      suggestionId: selectedSuggestion.id,
      status: 'rejected',
      adminNotes: adminNotes.trim() || undefined
    });
    
    setSelectedSuggestion(null);
    setAdminNotes('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Suggestions Review</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner size="sm" text="Loading edit suggestions..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Suggestions Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load edit suggestions. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const pendingSuggestions = suggestions?.filter(s => s.status === 'pending') || [];
  const reviewedSuggestions = suggestions?.filter(s => s.status !== 'pending') || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const renderSuggestionCard = (suggestion: EditSuggestion) => (
    <Card 
      key={suggestion.id} 
      className={`cursor-pointer transition-colors ${
        selectedSuggestion?.id === suggestion.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
      }`}
      onClick={() => setSelectedSuggestion(suggestion)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={suggestion.user_profile?.avatar_url} />
            <AvatarFallback>
              {suggestion.user_profile?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium truncate">
                {suggestion.entity_name}
              </p>
              {getStatusBadge(suggestion.status)}
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              Field: <span className="font-medium">{suggestion.field_name}</span>
            </p>
            
            <p className="text-xs text-muted-foreground line-clamp-2">
              {suggestion.justification}
            </p>
            
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{suggestion.user_profile?.display_name || 'Anonymous'}</span>
              <Calendar className="h-3 w-3 ml-2" />
              <span>{new Date(suggestion.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[800px]">
      {/* Suggestions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Suggestions
          </CardTitle>
          <CardDescription>
            Review community-submitted profile edits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pending ({pendingSuggestions.length})
              </TabsTrigger>
              <TabsTrigger value="reviewed">
                Reviewed ({reviewedSuggestions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-4">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {pendingSuggestions.length > 0 ? (
                    pendingSuggestions.map(renderSuggestionCard)
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No pending suggestions
                    </p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="reviewed" className="mt-4">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {reviewedSuggestions.length > 0 ? (
                    reviewedSuggestions.map(renderSuggestionCard)
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No reviewed suggestions
                    </p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Suggestion Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Suggestion Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedSuggestion ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedSuggestion.entity_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedSuggestion.entity_type} • Field: {selectedSuggestion.field_name}
                  </p>
                </div>
                {getStatusBadge(selectedSuggestion.status)}
              </div>

              {/* Current vs Suggested */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Current Value:</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      {selectedSuggestion.current_value || <em>Not set</em>}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Suggested Value:</p>
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm">{selectedSuggestion.suggested_value}</p>
                  </div>
                </div>
              </div>

              {/* Justification */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Justification:</p>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{selectedSuggestion.justification}</p>
                </div>
              </div>

              {/* Submitter Info */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedSuggestion.user_profile?.avatar_url} />
                  <AvatarFallback>
                    {selectedSuggestion.user_profile?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {selectedSuggestion.user_profile?.display_name || 'Anonymous User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted {new Date(selectedSuggestion.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedSuggestion.status === 'pending' && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Admin Notes (optional):
                  </label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              )}

              {/* Review Actions */}
              {selectedSuggestion.status === 'pending' && (
                <div className="flex gap-3">
                  <Button 
                    onClick={handleApprove}
                    disabled={updateStatus.isPending}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleReject}
                    disabled={updateStatus.isPending}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}

              {/* Reviewed Status */}
              {selectedSuggestion.status !== 'pending' && (
                <Alert>
                  <MessageSquare className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Status:</strong> {selectedSuggestion.status} 
                    {selectedSuggestion.reviewed_at && (
                      <span> on {new Date(selectedSuggestion.reviewed_at).toLocaleDateString()}</span>
                    )}
                    {selectedSuggestion.admin_notes && (
                      <div className="mt-2">
                        <strong>Admin Notes:</strong> {selectedSuggestion.admin_notes}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Edit3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Select a suggestion to view details and take action
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};