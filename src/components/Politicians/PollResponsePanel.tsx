import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Send, 
  Eye, 
  EyeOff, 
  Calendar,
  Vote,
  TrendingUp,
  Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Poll {
  id: string;
  title: string;
  description?: string;
  options: string[];
  votes_count: number;
  is_active: boolean;
  created_at: string;
  ends_at?: string;
  creator_profiles?: {
    username: string;
    display_name?: string;
  };
}

interface PollResponse {
  id: string;
  poll_id: string;
  response_text: string;
  response_type: string;
  visibility: string;
  is_official_position: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  polls?: Poll;
}

interface PollResponsePanelProps {
  politicianId: string;
}

export const PollResponsePanel: React.FC<PollResponsePanelProps> = ({ politicianId }) => {
  const { toast } = useToast();
  const [availablePolls, setAvailablePolls] = useState<Poll[]>([]);
  const [responses, setResponses] = useState<PollResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responseType, setResponseType] = useState('statement');
  const [visibility, setVisibility] = useState('public');
  const [isOfficial, setIsOfficial] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAvailablePolls();
    fetchExistingResponses();
  }, [politicianId]);

  const fetchAvailablePolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = data?.map(poll => ({
        id: poll.id,
        title: poll.title,
        description: poll.description,
        options: Array.isArray(poll.options) ? poll.options.map(String) : [],
        votes_count: poll.votes_count || 0,
        is_active: poll.is_active || false,
        created_at: poll.created_at,
        ends_at: poll.ends_at
      })) || [];
      
      setAvailablePolls(transformedData);
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  };

  const fetchExistingResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('politician_poll_responses')
        .select(`
          *,
          polls(id, title, description, options, votes_count, is_active, created_at, ends_at)
        `)
        .eq('politician_id', politicianId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = data?.map(response => ({
        id: response.id,
        poll_id: response.poll_id,
        response_text: response.response_text,
        response_type: response.response_type,
        visibility: response.visibility,
        is_official_position: response.is_official_position,
        is_verified: response.is_verified,
        created_at: response.created_at,
        updated_at: response.updated_at,
        polls: response.polls ? {
          id: response.polls.id,
          title: response.polls.title,
          description: response.polls.description,
          options: Array.isArray(response.polls.options) ? response.polls.options.map(String) : [],
          votes_count: response.polls.votes_count || 0,
          is_active: response.polls.is_active || false,
          created_at: response.polls.created_at,
          ends_at: response.polls.ends_at
        } : undefined
      })) || [];
      
      setResponses(transformedData);
    } catch (error) {
      console.error('Error fetching responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async () => {
    if (!selectedPoll || !responseText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a poll and enter your response",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('politician_poll_responses')
        .insert({
          politician_id: politicianId,
          poll_id: selectedPoll.id,
          response_text: responseText.trim(),
          response_type: responseType,
          visibility: visibility,
          is_official_position: isOfficial
        });

      if (error) throw error;

      toast({
        title: "Response Submitted",
        description: "Your poll response has been submitted successfully"
      });

      // Reset form
      setSelectedPoll(null);
      setResponseText('');
      setResponseType('statement');
      setVisibility('public');
      setIsOfficial(true);

      // Refresh data
      fetchExistingResponses();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getResponseTypeColor = (type: string) => {
    switch (type) {
      case 'statement': return 'bg-blue-100 text-blue-800';
      case 'commitment': return 'bg-green-100 text-green-800';
      case 'clarification': return 'bg-yellow-100 text-yellow-800';
      case 'opposition': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    return visibility === 'public' ? 
      <Eye className="w-3 h-3" /> : 
      <EyeOff className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded mb-4"></div>
              <div className="h-16 bg-muted rounded mb-4"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded w-20"></div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Response Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Respond to Civic Polls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Poll Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Poll</label>
            <Select onValueChange={(value) => {
              const poll = availablePolls.find(p => p.id === value);
              setSelectedPoll(poll || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a poll to respond to" />
              </SelectTrigger>
              <SelectContent>
                {availablePolls.map((poll) => (
                  <SelectItem key={poll.id} value={poll.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{poll.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {poll.votes_count} votes • {formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPoll && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">{selectedPoll.title}</h4>
                {selectedPoll.description && (
                  <p className="text-sm text-muted-foreground mb-3">{selectedPoll.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {selectedPoll.votes_count} votes
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDistanceToNow(new Date(selectedPoll.created_at), { addSuffix: true })}
                  </div>
                  {selectedPoll.ends_at && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Ends {formatDistanceToNow(new Date(selectedPoll.ends_at), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Response Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Response Type</label>
              <Select value={responseType} onValueChange={setResponseType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="statement">Statement</SelectItem>
                  <SelectItem value="commitment">Commitment</SelectItem>
                  <SelectItem value="clarification">Clarification</SelectItem>
                  <SelectItem value="opposition">Opposition</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Visibility</label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="supporters_only">Supporters Only</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setIsOfficial(!isOfficial)}
                className={isOfficial ? 'bg-primary text-primary-foreground' : ''}
              >
                {isOfficial ? 'Official Position' : 'Personal View'}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Your Response</label>
            <Textarea
              placeholder="Enter your response to this poll..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button 
            onClick={submitResponse} 
            disabled={!selectedPoll || !responseText.trim() || submitting}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit Response'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Responses */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Poll Responses ({responses.length})</h3>
        
        {responses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No poll responses yet</p>
              <p className="text-sm text-muted-foreground">
                Start engaging with civic polls to build your public presence
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {responses.map((response) => (
              <Card key={response.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{response.polls?.title}</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getResponseTypeColor(response.response_type)}>
                          {response.response_type}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getVisibilityIcon(response.visibility)}
                          {response.visibility}
                        </Badge>
                        {response.is_official_position && (
                          <Badge variant="outline" className="border-primary text-primary">
                            Official
                          </Badge>
                        )}
                        {response.is_verified && (
                          <Badge className="bg-cm-green text-white">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed">{response.response_text}</p>

                  {response.polls && (
                    <div className="mt-4 pt-4 border-t border-muted">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Vote className="w-3 h-3" />
                          Poll: {response.polls.votes_count} votes
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(response.polls.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
