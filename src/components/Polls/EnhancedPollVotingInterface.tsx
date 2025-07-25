import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bookmark, Eye, Share2, Clock, Users, Shield, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RankedChoiceVoting } from './RankedChoiceVoting';
import { MediaPollChoice } from './MediaPollChoice';
import { RatingStars } from '../camerpulse/RatingStars';

interface Poll {
  id: string;
  title: string;
  description: string;
  options: string[];
  creator_id: string;
  created_at: string;
  ends_at: string;
  votes_count: number;
  view_count: number;
  bookmark_count: number;
  category_id?: string;
  poll_type: string;
  is_active: boolean;
  privacy_mode: string;
  tags?: string[];
  media_options?: Array<{text: string, image?: string, video?: string}>;
  advanced_settings?: any;
}

interface EnhancedPollVotingInterfaceProps {
  poll: Poll;
  onVoteSuccess?: () => void;
  showResults?: boolean;
}

const EnhancedPollVotingInterface: React.FC<EnhancedPollVotingInterfaceProps> = ({
  poll,
  onVoteSuccess,
  showResults = false
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [voteCounts, setVoteCounts] = useState<number[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserVoteStatus();
    fetchVoteCounts();
    incrementViewCount();
  }, [poll.id, user]);

  const fetchUserVoteStatus = async () => {
    if (!user) return;

    try {
      // Check if user has voted
      const { data: voteData, error: voteError } = await supabase
        .from('poll_votes')
        .select('option_index')
        .eq('poll_id', poll.id)
        .eq('user_id', user.id)
        .single();

      if (!voteError && voteData) {
        setHasVoted(true);
        setSelectedOption(voteData.option_index);
      }

      // Check if user has bookmarked
      const { data: bookmarkData, error: bookmarkError } = await supabase
        .from('poll_bookmarks')
        .select('id')
        .eq('poll_id', poll.id)
        .eq('user_id', user.id)
        .single();

      if (!bookmarkError && bookmarkData) {
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error fetching user vote status:', error);
    }
  };

  const fetchVoteCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('poll_options')
        .select('option_order, vote_count')
        .eq('poll_id', poll.id)
        .order('option_order');

      if (error) throw error;

      const counts = new Array(poll.options.length).fill(0);
      data?.forEach(option => {
        if (option.option_order < counts.length) {
          counts[option.option_order] = option.vote_count || 0;
        }
      });
      setVoteCounts(counts);
    } catch (error) {
      console.error('Error fetching vote counts:', error);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_poll_view_count', {
        p_poll_id: poll.id,
        p_user_id: user?.id || null
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleVote = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote on this poll.",
        variant: "destructive"
      });
      return;
    }

    if (selectedOption === null) {
      toast({
        title: "No Option Selected",
        description: "Please select an option before voting.",
        variant: "destructive"
      });
      return;
    }

    setIsVoting(true);

    try {
      const voteData = {
        poll_id: poll.id,
        option_index: selectedOption,
        user_id: user.id,
        region: 'Centre' // Default region, could be dynamic
      };

      const { error } = await supabase
        .from('poll_votes')
        .insert([voteData]);

      if (error) throw error;

      setHasVoted(true);
      fetchVoteCounts();
      onVoteSuccess?.();

      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded successfully.",
      });
    } catch (error: any) {
      console.error('Error submitting vote:', error);
      toast({
        title: "Vote Failed",
        description: error.message || "Failed to submit your vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark polls.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await supabase.rpc('toggle_poll_bookmark', {
        p_poll_id: poll.id,
        p_user_id: user.id
      });

      setIsBookmarked(!isBookmarked);
      toast({
        title: isBookmarked ? "Bookmark Removed" : "Poll Bookmarked",
        description: isBookmarked ? "Poll removed from bookmarks." : "Poll added to bookmarks.",
      });
    } catch (error: any) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Bookmark Failed",
        description: error.message || "Failed to update bookmark.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/polls/${poll.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "Poll link has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const getTotalVotes = () => voteCounts.reduce((sum, count) => sum + count, 0);
  const getPercentage = (votes: number) => {
    const total = getTotalVotes();
    return total > 0 ? (votes / total) * 100 : 0;
  };

  const isExpired = new Date() > new Date(poll.ends_at);
  const canVote = user && !hasVoted && !isExpired && poll.is_active;
  const shouldShowResults = showResults || hasVoted || isExpired;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold leading-tight">
              {poll.title}
            </CardTitle>
            {poll.description && (
              <p className="text-muted-foreground mt-2">{poll.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={isBookmarked ? "text-yellow-500" : ""}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            {poll.votes_count} votes
          </Badge>
          <Badge variant="secondary">
            <Eye className="h-3 w-3 mr-1" />
            {poll.view_count || 0} views
          </Badge>
          {poll.bookmark_count && poll.bookmark_count > 0 && (
            <Badge variant="secondary">
              <Bookmark className="h-3 w-3 mr-1" />
              {poll.bookmark_count} bookmarks
            </Badge>
          )}
          {poll.privacy_mode && (
            <Badge variant="outline">
              <Shield className="h-3 w-3 mr-1" />
              {poll.privacy_mode}
            </Badge>
          )}
          {isExpired && (
            <Badge variant="destructive">
              <Clock className="h-3 w-3 mr-1" />
              Expired
            </Badge>
          )}
          {poll.tags?.map(tag => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {!isExpired && (
          <div className="text-sm text-muted-foreground">
            Ends: {new Date(poll.ends_at).toLocaleDateString()}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {canVote && !shouldShowResults ? (
          <div className="space-y-4">
            {/* Standard Single/Multiple Choice */}
            {(!poll.poll_type || ['single_choice', 'multiple_choice'].includes(poll.poll_type)) && (
              <>
                <RadioGroup value={selectedOption?.toString()} onValueChange={(value) => setSelectedOption(parseInt(value))}>
                  {poll.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <Button 
                  onClick={handleVote} 
                  disabled={isVoting || selectedOption === null}
                  className="w-full"
                >
                  {isVoting ? "Submitting Vote..." : "Submit Vote"}
                </Button>
              </>
            )}

            {/* Ranked Choice Voting */}
            {poll.poll_type === 'ranked_choice' && (
              <RankedChoiceVoting
                options={poll.options}
                onVoteSubmit={(rankings) => {
                  // Handle ranked choice vote submission
                  setSelectedOption(0); // Temporary
                  handleVote();
                }}
                allowPartialRanking={poll.advanced_settings?.allowPartialRanking || false}
                disabled={isVoting}
              />
            )}

            {/* Rating Scale */}
            {poll.poll_type === 'rating_scale' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">Rate this item:</p>
                  <RatingStars
                    rating={selectedOption || 0}
                    maxRating={poll.advanced_settings?.scale || 5}
                    size="lg"
                    showLabel
                    onRatingChange={setSelectedOption}
                  />
                </div>
                <Button 
                  onClick={handleVote} 
                  disabled={isVoting || selectedOption === null}
                  className="w-full"
                >
                  {isVoting ? "Submitting Rating..." : "Submit Rating"}
                </Button>
              </div>
            )}

            {/* Image/Media Choice */}
            {poll.poll_type === 'image_choice' && poll.media_options && (
              <MediaPollChoice
                options={poll.media_options.map((opt: any, index: number) => ({
                  id: index.toString(),
                  text: opt.text,
                  image: opt.image,
                  video: opt.video
                }))}
                onVoteSubmit={(selectedIds) => {
                  setSelectedOption(parseInt(selectedIds[0]));
                  handleVote();
                }}
                multipleChoice={false}
                disabled={isVoting}
              />
            )}
          </div>
        ) : shouldShowResults ? (
          <div className="space-y-4">
            {poll.options.map((option, index) => {
              const votes = voteCounts[index] || 0;
              const percentage = getPercentage(votes);
              const isUserChoice = hasVoted && selectedOption === index;

              return (
                <div key={index} className={`p-4 rounded-lg border ${isUserChoice ? 'bg-primary/10 border-primary' : 'bg-background'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{option}</span>
                    <div className="flex items-center gap-2">
                      {isUserChoice && <Badge variant="default">Your Vote</Badge>}
                      <span className="text-sm text-muted-foreground">
                        {votes} votes ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}

            <div className="text-center text-sm text-muted-foreground">
              Total votes: {getTotalVotes()}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {!user ? "Please sign in to vote on this poll." : "Loading poll data..."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedPollVotingInterface;