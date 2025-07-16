import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreatePollDialog } from '@/components/Polls/CreatePollDialog';
import { RegionalHeatmap } from '@/components/Polls/RegionalHeatmap';
import { CommentThread } from '@/components/Polls/CommentThread';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  Plus, 
  Vote, 
  Users, 
  Clock,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  MapPin,
  Shield,
  EyeOff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Poll {
  id: string;
  title: string;
  description?: string;
  options: string[];
  votes_count: number;
  is_active: boolean;
  ends_at?: string;
  created_at: string;
  creator_id: string;
  privacy_mode: 'public' | 'private' | 'anonymous';
  show_results_after_expiry: boolean;
  auto_delete_at?: string;
  profiles?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  user_vote?: number;
  vote_results?: number[];
}

const Polls = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [expandedHeatmaps, setExpandedHeatmaps] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);

      // Fetch polls first
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;

      // Get vote results for each poll
      const pollsWithResults = await Promise.all(
        pollsData?.map(async (poll) => {
          // Get creator profile
          const { data: creatorProfile } = await supabase
            .from('profiles')
            .select('username, display_name, avatar_url')
            .eq('user_id', poll.creator_id)
            .single();
          
          // Ensure options is an array of strings
          const pollOptions = Array.isArray(poll.options) 
            ? poll.options.map(option => String(option))
            : [];
          
          // Get vote counts for each option
          const { data: votesData } = await supabase
            .from('poll_votes')
            .select('option_index')
            .eq('poll_id', poll.id);

          const optionCounts = new Array(pollOptions.length).fill(0);
          votesData?.forEach(vote => {
            if (vote.option_index < optionCounts.length) {
              optionCounts[vote.option_index]++;
            }
          });

          // Get user's vote if logged in
          let userVote = undefined;
          if (user) {
            const { data: userVoteData } = await supabase
              .from('poll_votes')
              .select('option_index')
              .eq('poll_id', poll.id)
              .eq('user_id', user.id)
              .single();

            userVote = userVoteData?.option_index;
          }

          return {
            id: poll.id,
            title: poll.title,
            description: poll.description || undefined,
            options: pollOptions,
            votes_count: votesData?.length || 0,
            is_active: poll.is_active || false,
            ends_at: poll.ends_at || undefined,
            created_at: poll.created_at,
            creator_id: poll.creator_id,
            privacy_mode: poll.privacy_mode || 'public',
            show_results_after_expiry: poll.show_results_after_expiry !== false,
            auto_delete_at: poll.auto_delete_at || undefined,
            profiles: creatorProfile || undefined,
            user_vote: userVote,
            vote_results: optionCounts
          } as Poll;
        }) || []
      );

      setPolls(pollsWithResults);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast({
        title: "Error",
        description: "Failed to load polls",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitVote = async (pollId: string, optionIndex: number, region?: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "You must be logged in to vote",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        toast({
          title: "Already voted",
          description: "You have already voted in this poll",
          variant: "destructive"
        });
        return;
      }

      // For now, region tracking is optional and can be enhanced later
      let userRegion = region;

      // Submit vote with region tracking
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: user.id,
          option_index: optionIndex,
          region: userRegion
        });

      if (error) throw error;

      toast({
        title: "Vote submitted!",
        description: "Thank you for participating in the poll! +10 points earned"
      });
      
      // Award points for voting
      if (user) {
        try {
          await supabase.rpc('award_points', {
            p_user_id: user.id,
            p_activity_type: 'poll_voted',
            p_activity_reference_id: pollId,
            p_description: `Voted in poll: ${polls.find(p => p.id === pollId)?.title || 'Unknown poll'}`
          });
        } catch (error) {
          console.error('Error awarding points:', error);
        }
      }

      // Refresh polls to show updated results
      fetchPolls();
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive"
      });
    }
  };

  const isPollActive = (poll: Poll) => {
    if (!poll.is_active) return false;
    if (poll.ends_at && new Date(poll.ends_at) < new Date()) return false;
    return true;
  };

  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  const toggleHeatmap = (pollId: string) => {
    const newExpanded = new Set(expandedHeatmaps);
    if (newExpanded.has(pollId)) {
      newExpanded.delete(pollId);
    } else {
      newExpanded.add(pollId);
    }
    setExpandedHeatmaps(newExpanded);
  };

  return (
    <AppLayout>
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Democratic Polls
            </h1>
            <p className="text-muted-foreground">
              Voice your opinion on important civic matters
            </p>
          </div>
          
          {user && (
            <Button onClick={() => setShowCreatePoll(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Poll
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Vote className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{polls.length}</div>
              <div className="text-sm text-muted-foreground">Total Polls</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-cm-green mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {polls.reduce((sum, poll) => sum + poll.votes_count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Votes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-cm-yellow mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {polls.filter(poll => isPollActive(poll)).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Polls</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-8 h-8 text-cm-red mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {Math.round(polls.reduce((sum, poll) => sum + poll.votes_count, 0) / Math.max(polls.length, 1))}
              </div>
              <div className="text-sm text-muted-foreground">Avg Votes</div>
            </CardContent>
          </Card>
        </div>

        {/* Polls List */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-muted rounded mb-4"></div>
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-10 bg-muted rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : polls.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Vote className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No polls yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create a poll and engage the community
              </p>
              {user && (
                <Button onClick={() => setShowCreatePoll(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Poll
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {polls.map((poll) => {
              const isActive = isPollActive(poll);
              const hasVoted = poll.user_vote !== undefined;
              
              return (
                <Card key={poll.id} className="border-0 shadow-elegant">
                  <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar>
                            <AvatarImage src={poll.privacy_mode === 'anonymous' ? '' : poll.profiles?.avatar_url} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {poll.privacy_mode === 'anonymous' ? '?' : poll.profiles?.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{poll.title}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>
                                by {poll.privacy_mode === 'anonymous' ? 'Anonymous' : `@${poll.profiles?.username}`}
                              </span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                      
                        <div className="flex items-center gap-2">
                          {poll.privacy_mode !== 'public' && (
                            <Badge variant="outline" className="gap-1">
                              {poll.privacy_mode === 'private' && <Shield className="w-3 h-3" />}
                              {poll.privacy_mode === 'anonymous' && <EyeOff className="w-3 h-3" />}
                              <span className="capitalize">{poll.privacy_mode}</span>
                            </Badge>
                          )}
                          
                          {isActive ? (
                            <Badge className="bg-cm-green text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="w-3 h-3 mr-1" />
                              Closed
                            </Badge>
                          )}
                          
                          {poll.ends_at && (
                            <Badge variant="outline">
                              <Calendar className="w-3 h-3 mr-1" />
                              Ends {formatDistanceToNow(new Date(poll.ends_at), { addSuffix: true })}
                            </Badge>
                          )}
                        </div>
                    </div>
                    
                    {poll.description && (
                      <p className="text-muted-foreground mt-2">
                        {poll.description}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {poll.options.map((option, index) => {
                        const votes = poll.vote_results?.[index] || 0;
                        const percentage = getVotePercentage(votes, poll.votes_count);
                        const isSelected = poll.user_vote === index;
                        
                        // Determine if results should be shown
                        const showResults = hasVoted || !isActive || 
                          (!isActive && poll.show_results_after_expiry);
                        
                        return (
                          <div key={index} className="space-y-2">
                            <Button
                              variant={isSelected ? "default" : "outline"}
                              className="w-full justify-start text-left h-auto p-4"
                              onClick={() => isActive && !hasVoted ? submitVote(poll.id, index) : undefined}
                              disabled={!isActive || hasVoted}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="flex-1">{option}</span>
                                {showResults && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">
                                      {votes} votes ({percentage}%)
                                    </span>
                                    {isSelected && (
                                      <CheckCircle className="w-4 h-4" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </Button>
                            
                            {showResults && (
                              <Progress value={percentage} className="h-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{poll.votes_count} votes</span>
                        </div>
                        {poll.ends_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(poll.ends_at) > new Date() ? 'Ends' : 'Ended'} {' '}
                              {formatDistanceToNow(new Date(poll.ends_at), { addSuffix: true })}
                            </span>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHeatmap(poll.id)}
                          className="flex items-center gap-1 h-6 px-2"
                        >
                          <MapPin className="w-3 h-3" />
                          Regional Map
                        </Button>
                      </div>
                      
                      {hasVoted && (
                        <Badge variant="outline" className="border-cm-green text-cm-green">
                          ✓ Voted
                        </Badge>
                      )}
                    </div>
                    
                    {/* Regional Heatmap */}
                    {expandedHeatmaps.has(poll.id) && (
                      <div className="mt-4">
                        <RegionalHeatmap
                          pollId={poll.id}
                          pollOptions={poll.options}
                          isVisible={expandedHeatmaps.has(poll.id)}
                        />
                      </div>
                    )}
                    
                    {/* Comment Thread */}
                    <div className="mt-6 pt-6 border-t">
                      <CommentThread pollId={poll.id} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Poll Dialog */}
      <CreatePollDialog
        isOpen={showCreatePoll}
        onClose={() => setShowCreatePoll(false)}
        onSuccess={() => {
          setShowCreatePoll(false);
          fetchPolls();
        }}
      />
    </AppLayout>
  );
};

export default Polls;