import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar, 
  User, 
  Star, 
  AlertTriangle,
  Clock,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useModerationQueue, CivicSuggestion, SuggestionStatus } from '@/hooks/useCivicSuggestions';
import { formatDistanceToNow } from 'date-fns';

const statusColors: Record<SuggestionStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  needs_revision: 'bg-orange-100 text-orange-800',
};

const statusIcons: Record<SuggestionStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  under_review: <Eye className="h-4 w-4" />,
  approved: <CheckCircle className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
  needs_revision: <AlertTriangle className="h-4 w-4" />,
};

interface ReviewDialogProps {
  suggestion: CivicSuggestion;
  onUpdate: (id: string, status: SuggestionStatus, notes?: string, rejection_reason?: string) => void;
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({ suggestion, onUpdate }) => {
  const [status, setStatus] = useState<SuggestionStatus>('pending');
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    onUpdate(suggestion.id, status, notes, rejectionReason);
    setIsOpen(false);
    setNotes('');
    setRejectionReason('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Suggestion: {suggestion.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Suggestion Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Entity Type</Label>
              <p className="capitalize">{suggestion.entity_type.replace('_', ' ')}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Suggestion Type</Label>
              <p className="capitalize">{suggestion.suggestion_type.replace('_', ' ')}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Submitted</Label>
              <p>{formatDistanceToNow(new Date(suggestion.created_at), { addSuffix: true })}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Current Status</Label>
              <Badge className={statusColors[suggestion.status]}>
                {statusIcons[suggestion.status]}
                <span className="ml-1 capitalize">{suggestion.status.replace('_', ' ')}</span>
              </Badge>
            </div>
          </div>

          {/* Description */}
          {suggestion.description && (
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="mt-1 p-3 bg-gray-50 rounded-lg">{suggestion.description}</p>
            </div>
          )}

          {/* Change Summary for edits */}
          {suggestion.change_summary && (
            <div>
              <Label className="text-sm font-medium">Requested Changes</Label>
              <p className="mt-1 p-3 bg-blue-50 rounded-lg">{suggestion.change_summary}</p>
            </div>
          )}

          {/* Suggested Data */}
          <div>
            <Label className="text-sm font-medium">Suggested Data</Label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(suggestion.suggested_data, null, 2)}
              </pre>
            </div>
          </div>

          {/* Evidence URLs */}
          {suggestion.evidence_urls && suggestion.evidence_urls.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Supporting Evidence</Label>
              <div className="mt-1 space-y-1">
                {suggestion.evidence_urls.map((url, index) => (
                  <a 
                    key={index} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:text-blue-800 text-sm truncate"
                  >
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Review Form */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium mb-4">Review Decision</h4>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Decision</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as SuggestionStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                    <SelectItem value="needs_revision">Needs Revision</SelectItem>
                    <SelectItem value="under_review">Mark Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Moderator Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes about this review decision..."
                  rows={3}
                />
              </div>

              {status === 'rejected' && (
                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason (will be shown to submitter)</Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this suggestion was rejected..."
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  Submit Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ModerationDashboard: React.FC = () => {
  const { pendingSuggestions, isLoading, updateSuggestionStatus, isUpdating } = useModerationQueue();

  const groupedSuggestions = {
    pending: pendingSuggestions?.filter(s => s.status === 'pending') || [],
    under_review: pendingSuggestions?.filter(s => s.status === 'under_review') || [],
    needs_revision: pendingSuggestions?.filter(s => s.status === 'needs_revision') || [],
  };

  const SuggestionCard: React.FC<{ suggestion: CivicSuggestion }> = ({ suggestion }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{suggestion.title}</CardTitle>
            <CardDescription className="mt-1">
              <div className="flex items-center gap-4 text-sm">
                <span className="capitalize">
                  {suggestion.suggestion_type.replace('_', ' ')} • {suggestion.entity_type.replace('_', ' ')}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(suggestion.created_at), { addSuffix: true })}
                </span>
              </div>
            </CardDescription>
          </div>
          <Badge className={statusColors[suggestion.status]}>
            {statusIcons[suggestion.status]}
            <span className="ml-1 capitalize">{suggestion.status.replace('_', ' ')}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {suggestion.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {suggestion.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Submitter ID: {suggestion.submitter_id.slice(0, 8)}...
            </span>
            {suggestion.evidence_urls && suggestion.evidence_urls.length > 0 && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {suggestion.evidence_urls.length} evidence file(s)
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <ReviewDialog 
              suggestion={suggestion} 
              onUpdate={updateSuggestionStatus}
            />
            
            {suggestion.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateSuggestionStatus(suggestion.id, 'approved')}
                  disabled={isUpdating}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Quick Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateSuggestionStatus(suggestion.id, 'rejected')}
                  disabled={isUpdating}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Quick Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading moderation queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
          <p className="text-gray-600">Review and manage civic entity suggestions</p>
        </div>
        
        <div className="flex gap-4">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {groupedSuggestions.pending.length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {groupedSuggestions.under_review.length}
              </div>
              <div className="text-sm text-gray-600">Under Review</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {groupedSuggestions.needs_revision.length}
              </div>
              <div className="text-sm text-gray-600">Needs Revision</div>
            </div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({groupedSuggestions.pending.length})
          </TabsTrigger>
          <TabsTrigger value="under_review" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Under Review ({groupedSuggestions.under_review.length})
          </TabsTrigger>
          <TabsTrigger value="needs_revision" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Needs Revision ({groupedSuggestions.needs_revision.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {groupedSuggestions.pending.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No pending suggestions</h3>
                <p className="text-gray-600">All suggestions have been reviewed!</p>
              </Card>
            ) : (
              groupedSuggestions.pending.map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="under_review" className="mt-6">
          <div className="space-y-4">
            {groupedSuggestions.under_review.length === 0 ? (
              <Card className="p-8 text-center">
                <Eye className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No suggestions under review</h3>
                <p className="text-gray-600">Start reviewing pending suggestions.</p>
              </Card>
            ) : (
              groupedSuggestions.under_review.map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="needs_revision" className="mt-6">
          <div className="space-y-4">
            {groupedSuggestions.needs_revision.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No suggestions need revision</h3>
                <p className="text-gray-600">All feedback has been addressed.</p>
              </Card>
            ) : (
              groupedSuggestions.needs_revision.map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};