import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Brain, CheckCircle, XCircle, Eye, Clock, TrendingUp, AlertTriangle } from "lucide-react";

interface PollSuggestion {
  id: string;
  title: string;
  description: string;
  question: string;
  options: string[];
  trending_topics: string[];
  confidence_score: number;
  priority_level: string;
  status: string;
  source_event: string;
  created_at: string;
  reviewed_at?: string;
  published_poll_id?: string;
}

const PollSuggestionsPanel = () => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<PollSuggestion | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch poll suggestions
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['poll-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('poll_suggestions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PollSuggestion[];
    }
  });

  // Generate new suggestions
  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-poll-suggestions');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Generated ${data.suggestions_generated} new poll suggestions`);
      queryClient.invalidateQueries({ queryKey: ['poll-suggestions'] });
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate poll suggestions');
      setIsGenerating(false);
    }
  });

  // Approve and publish suggestion
  const approveMutation = useMutation({
    mutationFn: async ({ suggestionId, publishImmediately }: { suggestionId: string; publishImmediately: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('approve_and_publish_poll_suggestion', {
        p_suggestion_id: suggestionId,
        p_admin_id: user.id,
        p_publish_immediately: publishImmediately
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.publishImmediately ? 'Poll published successfully!' : 'Poll approved for later publishing');
      queryClient.invalidateQueries({ queryKey: ['poll-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
    onError: (error) => {
      console.error('Error approving suggestion:', error);
      toast.error('Failed to approve poll suggestion');
    }
  });

  // Reject suggestion
  const rejectMutation = useMutation({
    mutationFn: async ({ suggestionId, reason }: { suggestionId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('reject_poll_suggestion', {
        p_suggestion_id: suggestionId,
        p_admin_id: user.id,
        p_reason: reason
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Poll suggestion rejected');
      queryClient.invalidateQueries({ queryKey: ['poll-suggestions'] });
      setRejectionReason('');
    },
    onError: (error) => {
      console.error('Error rejecting suggestion:', error);
      toast.error('Failed to reject poll suggestion');
    }
  });

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    generateSuggestionsMutation.mutate();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'published': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const pendingSuggestions = suggestions?.filter(s => s.status === 'pending') || [];
  const reviewedSuggestions = suggestions?.filter(s => s.status !== 'pending') || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Poll Suggestions
          </h2>
          <p className="text-muted-foreground">
            CamerPulse Intelligence generates poll suggestions based on trending political and economic events
          </p>
        </div>
        <Button 
          onClick={handleGenerateSuggestions}
          disabled={isGenerating || generateSuggestionsMutation.isPending}
          className="gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate New Suggestions'}
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pending Review ({pendingSuggestions.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="gap-2">
            <Eye className="h-4 w-4" />
            Reviewed ({reviewedSuggestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingSuggestions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No pending poll suggestions. Generate new ones based on trending topics.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingSuggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onApprove={(publishImmediately) => 
                    approveMutation.mutate({ suggestionId: suggestion.id, publishImmediately })
                  }
                  onReject={() => setSelectedSuggestion(suggestion)}
                  isProcessing={approveMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          <div className="grid gap-4">
            {reviewedSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                readonly
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={!!selectedSuggestion} onOpenChange={() => setSelectedSuggestion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Poll Suggestion</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this poll suggestion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedSuggestion(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedSuggestion) {
                    rejectMutation.mutate({
                      suggestionId: selectedSuggestion.id,
                      reason: rejectionReason
                    });
                    setSelectedSuggestion(null);
                  }
                }}
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
              >
                Reject Suggestion
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SuggestionCard = ({ 
  suggestion, 
  onApprove, 
  onReject, 
  isProcessing, 
  readonly = false 
}: {
  suggestion: PollSuggestion;
  onApprove?: (publishImmediately: boolean) => void;
  onReject?: () => void;
  isProcessing?: boolean;
  readonly?: boolean;
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'published': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{suggestion.title}</CardTitle>
            <CardDescription>{suggestion.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(suggestion.status)}
            <Badge variant={getPriorityColor(suggestion.priority_level)}>
              {suggestion.priority_level}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Poll Question:</h4>
          <p className="text-sm text-muted-foreground">{suggestion.question}</p>
        </div>

        <div>
          <h4 className="font-medium mb-2">Options:</h4>
          <ul className="list-disc list-inside space-y-1">
            {suggestion.options.map((option, index) => (
              <li key={index} className="text-sm text-muted-foreground">{option}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestion.trending_topics.map((topic, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Confidence: {Math.round(suggestion.confidence_score * 100)}%</span>
          <span>{new Date(suggestion.created_at).toLocaleDateString()}</span>
        </div>

        {!readonly && suggestion.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => onApprove?.(true)}
              disabled={isProcessing}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve & Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onApprove?.(false)}
              disabled={isProcessing}
            >
              Approve Only
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onReject}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PollSuggestionsPanel;