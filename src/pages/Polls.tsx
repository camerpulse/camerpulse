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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-6xl">
          {/* Header Section */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-8">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Democratic Polls
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
                Voice your opinion on important civic matters and help shape democracy
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => window.location.href = '/polls/discover'}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Découvrir
              </Button>
              {user && (
                <Button 
                  onClick={() => setShowCreatePoll(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Poll
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
            <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
                  <Vote className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{polls.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Polls</div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-emerald-500" />
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  {polls.reduce((sum, poll) => sum + poll.votes_count, 0)}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Votes</div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-amber-500" />
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  {polls.filter(poll => isPollActive(poll)).length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Active Polls</div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300 col-span-2 lg:col-span-1">
              <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-rose-500" />
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  {Math.round(polls.reduce((sum, poll) => sum + poll.votes_count, 0) / Math.max(polls.length, 1))}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Avg Votes</div>
              </CardContent>
            </Card>
          </div>

          {/* Polls List */}
          {loading ? (
            <div className="space-y-4 lg:space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse backdrop-blur-sm bg-card/80 border-border/50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-3 sm:h-4 bg-muted rounded mb-2"></div>
                        <div className="h-2 sm:h-3 bg-muted rounded w-1/3"></div>
                      </div>
                    </div>
                    <div className="h-4 sm:h-6 bg-muted rounded mb-4"></div>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-8 sm:h-10 bg-muted rounded"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : polls.length === 0 ? (
            <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-elegant">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Vote className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No polls yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
                  Be the first to create a poll and engage the community in meaningful civic discussions
                </p>
                {user && (
                  <Button 
                    onClick={() => setShowCreatePoll(true)}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Poll
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 lg:space-y-6">
              {polls.map((poll) => {
                const isActive = isPollActive(poll);
                const hasVoted = poll.user_vote !== undefined;
                
                return (
                  <Card key={poll.id} className="backdrop-blur-sm bg-card/80 border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="w-8 h-8 sm:w-10 sm:h-10 shrink-0">
                              <AvatarImage src={poll.privacy_mode === 'anonymous' ? '' : poll.profiles?.avatar_url} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {poll.privacy_mode === 'anonymous' ? '?' : poll.profiles?.username?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base sm:text-lg leading-tight mb-1 truncate">{poll.title}</CardTitle>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                                <span className="truncate">
                                  by {poll.privacy_mode === 'anonymous' ? 'Anonymous' : `@${poll.profiles?.username}`}
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span className="truncate">{formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}</span>
                              </div>
                            </div>
                          </div>
                        
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {poll.privacy_mode !== 'public' && (
                              <Badge variant="outline" className="gap-1 text-xs">
                                {poll.privacy_mode === 'private' && <Shield className="w-3 h-3" />}
                                {poll.privacy_mode === 'anonymous' && <EyeOff className="w-3 h-3" />}
                                <span className="capitalize">{poll.privacy_mode}</span>
                              </Badge>
                            )}
                            
                            {isActive ? (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <XCircle className="w-3 h-3 mr-1" />
                                Closed
                              </Badge>
                            )}
                            
                            {poll.ends_at && (
                              <Badge variant="outline" className="text-xs hidden sm:flex">
                                <Calendar className="w-3 h-3 mr-1" />
                                Ends {formatDistanceToNow(new Date(poll.ends_at), { addSuffix: true })}
                              </Badge>
                            )}
                          </div>
                      </div>
                      
                      {poll.description && (
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                          {poll.description}
                        </p>
                      )}
                    </CardHeader>
                  
                    <CardContent className="pt-0">
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
                                className={`w-full justify-start text-left h-auto p-3 sm:p-4 transition-all duration-200 ${
                                  isActive && !hasVoted ? 'hover:scale-[1.02] hover:shadow-md' : ''
                                } ${isSelected ? 'bg-gradient-to-r from-primary to-accent' : ''}`}
                                onClick={() => isActive && !hasVoted ? submitVote(poll.id, index) : undefined}
                                disabled={!isActive || hasVoted}
                              >
                                <div className="flex items-center justify-between w-full gap-3">
                                  <span className="flex-1 text-sm sm:text-base leading-relaxed">{option}</span>
                                  {showResults && (
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-xs sm:text-sm whitespace-nowrap">
                                        {votes} ({percentage}%)
                                      </span>
                                      {isSelected && (
                                        <CheckCircle className="w-4 h-4" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </Button>
                              
                              {showResults && (
                                <div className="px-1">
                                  <Progress value={percentage} className="h-2" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-border/50">
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{poll.votes_count} votes</span>
                          </div>
                          {poll.ends_at && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span className="hidden sm:inline">
                                {new Date(poll.ends_at) > new Date() ? 'Ends' : 'Ended'} {' '}
                                {formatDistanceToNow(new Date(poll.ends_at), { addSuffix: true })}
                              </span>
                              <span className="sm:hidden">
                                {formatDistanceToNow(new Date(poll.ends_at), { addSuffix: true })}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleHeatmap(poll.id)}
                          className="flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center"
                        >
                          <MapPin className="w-4 h-4" />
                          Regional Map
                        </Button>
                      </div>
                      
                      {expandedHeatmaps.has(poll.id) && (
                        <div className="mt-4 p-3 sm:p-4 border rounded-lg bg-muted/20">
                          <RegionalHeatmap 
                            pollId={poll.id} 
                            pollOptions={poll.options}
                            isVisible={expandedHeatmaps.has(poll.id)}
                          />
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <CommentThread pollId={poll.id} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <CreatePollDialog 
            isOpen={showCreatePoll} 
            onClose={() => setShowCreatePoll(false)} 
            onSuccess={() => {
              setShowCreatePoll(false);
              fetchPolls();
            }}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Polls;