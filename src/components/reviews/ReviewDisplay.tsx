import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Flag, MessageSquare, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  overall_rating: number;
  criteria_ratings: any; // JSON field
  review_title?: string;
  review_text?: string;
  is_anonymous: boolean;
  helpful_votes: number;
  unhelpful_votes: number;
  is_verified_reviewer: boolean;
  created_at: string;
  reviewer_id: string;
  institution_id: string;
  institution_type: string;
}

interface ReviewDisplayProps {
  institutionId: string;
  institutionType: string;
}

export const ReviewDisplay = ({ institutionId, institutionType }: ReviewDisplayProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('newest');
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagDetails, setFlagDetails] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
    fetchUserVotes();
  }, [institutionId, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('institution_reviews')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('moderation_status', 'approved');

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest_rated':
          query = query.order('overall_rating', { ascending: false });
          break;
        case 'lowest_rated':
          query = query.order('overall_rating', { ascending: true });
          break;
        case 'most_helpful':
          query = query.order('helpful_votes', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('review_votes')
        .select('review_id, vote_type')
        .eq('voter_id', user.user.id);

      if (error) throw error;

      const votesMap = (data || []).reduce((acc, vote) => {
        acc[vote.review_id] = vote.vote_type;
        return acc;
      }, {} as Record<string, string>);

      setUserVotes(votesMap);
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const handleVote = async (reviewId: string, voteType: 'helpful' | 'unhelpful') => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to vote on reviews",
          variant: "destructive",
        });
        return;
      }

      const existingVote = userVotes[reviewId];
      
      if (existingVote === voteType) {
        // Remove vote if clicking the same type
        const { error } = await supabase
          .from('review_votes')
          .delete()
          .eq('review_id', reviewId)
          .eq('voter_id', user.user.id);

        if (error) throw error;

        setUserVotes(prev => {
          const newVotes = { ...prev };
          delete newVotes[reviewId];
          return newVotes;
        });
      } else {
        // Insert or update vote
        const { error } = await supabase
          .from('review_votes')
          .upsert({
            review_id: reviewId,
            voter_id: user.user.id,
            vote_type: voteType,
          });

        if (error) throw error;

        setUserVotes(prev => ({
          ...prev,
          [reviewId]: voteType
        }));
      }

      fetchReviews(); // Refresh to update vote counts
    } catch (error) {
      console.error('Error voting on review:', error);
      toast({
        title: "Vote Failed",
        description: "Failed to record your vote",
        variant: "destructive",
      });
    }
  };

  const handleFlag = async () => {
    if (!selectedReview || !flagReason) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to flag reviews",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('review_flags')
        .insert({
          review_id: selectedReview,
          flagger_id: user.user.id,
          flag_reason: flagReason,
          flag_details: flagDetails,
        });

      if (error) throw error;

      toast({
        title: "Review Flagged",
        description: "Thank you for reporting this review. It will be reviewed by our moderators.",
      });

      setFlagDialogOpen(false);
      setSelectedReview(null);
      setFlagReason('');
      setFlagDetails('');
    } catch (error) {
      console.error('Error flagging review:', error);
      toast({
        title: "Flag Failed",
        description: "Failed to flag review",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number, size = 'small') => {
    const starSize = size === 'small' ? 'h-4 w-4' : 'h-5 w-5';
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const formatCriteriaName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.overall_rating, 0);
    return total / reviews.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Reviews ({reviews.length})</h3>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  {renderStars(getAverageRating())}
                  <span className="text-sm text-muted-foreground">
                    Average of {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest_rated">Highest Rated</SelectItem>
                <SelectItem value="lowest_rated">Lowest Rated</SelectItem>
                <SelectItem value="most_helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No reviews yet. Be the first to write one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {renderStars(review.overall_rating)}
                      {review.is_verified_reviewer && (
                        <Badge variant="secondary">Verified</Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {review.review_title && (
                      <h4 className="font-semibold mb-2">{review.review_title}</h4>
                    )}

                    {review.review_text && (
                      <p className="text-muted-foreground mb-4">{review.review_text}</p>
                    )}

                    {/* Criteria Ratings */}
                    {review.criteria_ratings && typeof review.criteria_ratings === 'object' && Object.keys(review.criteria_ratings).length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium mb-2">Category Ratings:</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(review.criteria_ratings).map(([criteria, rating]) => (
                            <div key={criteria} className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                {formatCriteriaName(criteria)}:
                              </span>
                              <div className="flex items-center gap-1">
                                {renderStars(rating as number, 'small')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Vote Buttons */}
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(review.id, 'helpful')}
                        className={userVotes[review.id] === 'helpful' ? 'text-green-600' : ''}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful ({review.helpful_votes})
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(review.id, 'unhelpful')}
                        className={userVotes[review.id] === 'unhelpful' ? 'text-red-600' : ''}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Not Helpful ({review.unhelpful_votes})
                      </Button>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedReview(review.id);
                          setFlagDialogOpen(true);
                        }}
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Flag Review
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Flag Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Review</DialogTitle>
            <DialogDescription>
              Help us maintain quality by reporting inappropriate content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for flagging:</label>
              <Select value={flagReason} onValueChange={setFlagReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inappropriate_language">Inappropriate Language</SelectItem>
                  <SelectItem value="false_information">False Information</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="irrelevant">Irrelevant Content</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Additional details (optional):</label>
              <Textarea
                placeholder="Provide more context..."
                value={flagDetails}
                onChange={(e) => setFlagDetails(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleFlag} disabled={!flagReason}>
                Submit Flag
              </Button>
              <Button variant="outline" onClick={() => setFlagDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};