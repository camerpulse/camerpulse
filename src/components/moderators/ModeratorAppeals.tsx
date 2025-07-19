import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Clock, CheckCircle, XCircle, FileText, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Appeal {
  id: string;
  submission_id: string;
  appellant_id: string;
  appeal_reason: string;
  appeal_details: string;
  appeal_status: string;
  reviewed_by: string | null;
  review_notes: string | null;
  evidence_urls: string[];
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  moderation_queue: {
    title: string;
    content: string;
    submission_type: string;
    region: string;
  };
}

const statusConfig = {
  pending: { icon: Clock, color: 'bg-yellow-500', label: 'Pending Review' },
  under_review: { icon: AlertTriangle, color: 'bg-blue-500', label: 'Under Review' },
  approved: { icon: CheckCircle, color: 'bg-green-500', label: 'Appeal Approved' },
  rejected: { icon: XCircle, color: 'bg-red-500', label: 'Appeal Rejected' }
};

export function ModeratorAppeals() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDecision, setReviewDecision] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    fetchAppeals();

    // Set up real-time subscription
    const channel = supabase
      .channel('moderation-appeals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'moderation_appeals'
        },
        () => fetchAppeals()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchAppeals = async () => {
    if (!user) return;

    try {
      // Get appeals for submissions assigned to this moderator
      const { data, error } = await supabase
        .from('moderation_appeals')
        .select(`
          *,
          moderation_queue:submission_id (
            title,
            content,
            submission_type,
            region
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppeals(data || []);
    } catch (error: any) {
      console.error('Error fetching appeals:', error);
      toast({
        title: "Error",
        description: "Failed to load appeals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAppeal = async () => {
    if (!selectedAppeal || !reviewDecision || !reviewNotes.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a decision and review notes",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Get current moderator
      const { data: moderator } = await supabase
        .from('civic_moderators')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!moderator) throw new Error('Moderator not found');

      const { error } = await supabase
        .from('moderation_appeals')
        .update({
          appeal_status: reviewDecision,
          reviewed_by: moderator.id,
          review_notes: reviewNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedAppeal.id);

      if (error) throw error;

      toast({
        title: "Appeal Reviewed",
        description: `Appeal has been ${reviewDecision}`,
      });

      setSelectedAppeal(null);
      setReviewNotes('');
      setReviewDecision('');
      fetchAppeals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to review appeal",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appeals Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Appeals Management
          </CardTitle>
          <CardDescription>
            Review and respond to moderation appeals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appeals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No appeals to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appeals.map((appeal) => {
                const config = statusConfig[appeal.appeal_status as keyof typeof statusConfig];
                const Icon = config.icon;

                return (
                  <Card key={appeal.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Icon className="w-3 h-3" />
                              {config.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(appeal.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <h4 className="font-medium mb-1">
                            Appeal for: {appeal.moderation_queue?.title || 'Submission'}
                          </h4>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            Reason: {appeal.appeal_reason}
                          </p>
                          
                          {appeal.appeal_details && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {appeal.appeal_details}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Type: {appeal.moderation_queue?.submission_type}</span>
                            <span>Region: {appeal.moderation_queue?.region}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {appeal.appeal_status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => setSelectedAppeal(appeal)}
                            >
                              Review Appeal
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appeal Review Modal */}
      {selectedAppeal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Review Appeal
            </CardTitle>
            <CardDescription>
              Carefully review the appeal and provide your decision
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Original Submission</h4>
              <p className="text-sm">{selectedAppeal.moderation_queue?.content}</p>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Appeal Details</h4>
              <p className="text-sm font-medium">Reason: {selectedAppeal.appeal_reason}</p>
              {selectedAppeal.appeal_details && (
                <p className="text-sm mt-2">{selectedAppeal.appeal_details}</p>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Decision</label>
                <Select value={reviewDecision} onValueChange={setReviewDecision}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your decision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve Appeal</SelectItem>
                    <SelectItem value="rejected">Reject Appeal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Review Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Explain your decision and any actions taken..."
                  rows={4}
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleReviewAppeal}
                disabled={!reviewDecision || !reviewNotes.trim() || submitting}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedAppeal(null);
                  setReviewNotes('');
                  setReviewDecision('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}