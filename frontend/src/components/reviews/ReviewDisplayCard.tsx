import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Flag, Reply, MoreVertical, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReviewData {
  id: string;
  overall_rating: number;
  work_environment_rating?: number;
  management_rating?: number;
  compensation_rating?: number;
  work_life_balance_rating?: number;
  career_growth_rating?: number;
  communication_rating?: number;
  technical_skills_rating?: number;
  timeliness_rating?: number;
  professionalism_rating?: number;
  problem_solving_rating?: number;
  review_title: string;
  review_content: string;
  employment_type?: string;
  employment_duration?: string;
  project_duration?: string;
  project_budget_range?: string;
  would_recommend: boolean | null;
  is_anonymous: boolean;
  is_verified: boolean;
  status: string;
  created_at: string;
  reviewer_id: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
}

interface ReviewDisplayCardProps {
  review: ReviewData;
  reviewType: 'employer_review' | 'expert_review';
  canRespond?: boolean;
  entityId?: string;
  onReviewUpdated?: () => void;
}

interface ReviewResponse {
  id: string;
  response_content: string;
  responder_type: string;
  is_official_response: boolean;
  created_at: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export const ReviewDisplayCard: React.FC<ReviewDisplayCardProps> = ({
  review,
  reviewType,
  canRespond = false,
  entityId,
  onReviewUpdated
}) => {
  const [helpfulVotes, setHelpfulVotes] = useState({ helpful: 0, notHelpful: 0 });
  const [userVote, setUserVote] = useState<boolean | null>(null);
  const [responses, setResponses] = useState<ReviewResponse[]>([]);
  const [responseText, setResponseText] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchHelpfulVotes();
    fetchResponses();
    fetchUserVote();
  }, [review.id]);

  const fetchHelpfulVotes = async () => {
    const { data, error } = await supabase
      .from('review_helpfulness_votes')
      .select('is_helpful')
      .eq('review_id', review.id)
      .eq('review_type', reviewType);

    if (!error && data) {
      const helpful = data.filter(vote => vote.is_helpful).length;
      const notHelpful = data.filter(vote => !vote.is_helpful).length;
      setHelpfulVotes({ helpful, notHelpful });
    }
  };

  const fetchUserVote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('review_helpfulness_votes')
      .select('is_helpful')
      .eq('review_id', review.id)
      .eq('review_type', reviewType)
      .eq('voter_id', user.id)
      .single();

    if (!error && data) {
      setUserVote(data.is_helpful);
    }
  };

  const fetchResponses = async () => {
    const { data, error } = await supabase
      .from('review_responses')
      .select(`
        id,
        response_content,
        responder_type,
        is_official_response,
        created_at,
        responder_id,
        profiles:responder_id (
          display_name,
          avatar_url
        )
      `)
      .eq('original_review_id', review.id)
      .eq('original_review_type', reviewType)
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setResponses(data as ReviewResponse[]);
    }
  };

  const handleVote = async (isHelpful: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote on reviews.",
        variant: "destructive",
      });
      return;
    }

    if (userVote === isHelpful) {
      // Remove vote if clicking the same option
      await supabase
        .from('review_helpfulness_votes')
        .delete()
        .eq('review_id', review.id)
        .eq('review_type', reviewType)
        .eq('voter_id', user.id);
      
      setUserVote(null);
    } else {
      // Add or update vote
      await supabase
        .from('review_helpfulness_votes')
        .upsert({
          review_id: review.id,
          review_type: reviewType,
          voter_id: user.id,
          is_helpful: isHelpful,
        });
      
      setUserVote(isHelpful);
    }

    fetchHelpfulVotes();
  };

  const handleFlag = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to flag reviews.",
        variant: "destructive",
      });
      return;
    }

    try {
      await supabase
        .from('review_moderation_queue')
        .insert({
          review_id: review.id,
          review_type: reviewType,
          flagged_reason: 'User reported inappropriate content',
          flagged_by: user.id,
          auto_flagged: false,
          moderation_priority: 2,
        });

      toast({
        title: "Review Flagged",
        description: "Thank you for reporting. Our moderation team will review this content.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to flag review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResponse = async () => {
    if (!responseText.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to respond to reviews.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingResponse(true);

    try {
      const { data: responseData, error } = await supabase
        .from('review_responses')
        .insert({
          original_review_id: review.id,
          original_review_type: reviewType,
          responder_id: user.id,
          responder_type: reviewType === 'employer_review' ? 'employer' : 'expert',
          response_content: responseText,
          is_official_response: canRespond,
        })
        .select()
        .single();

      if (error) throw error;

      // Analyze response for toxicity
      try {
        await supabase.functions.invoke('analyze-toxicity', {
          body: {
            content: responseText,
            reviewId: responseData.id,
            reviewType: 'review_response'
          }
        });
      } catch (toxicityError) {
        console.warn('Toxicity analysis failed:', toxicityError);
      }

      toast({
        title: "Response Submitted",
        description: "Your response has been posted.",
      });

      setResponseText('');
      setShowResponseForm(false);
      fetchResponses();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRecommendationBadge = () => {
    if (review.would_recommend === null) return null;
    
    return (
      <Badge variant={review.would_recommend ? "default" : "destructive"}>
        {review.would_recommend ? "👍 Recommends" : "👎 Doesn't Recommend"}
      </Badge>
    );
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.profiles?.avatar_url} />
              <AvatarFallback>
                {review.is_anonymous ? 'A' : (review.profiles?.display_name?.[0] || 'U')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">
                  {review.is_anonymous ? 'Anonymous' : (review.profiles?.display_name || 'User')}
                </p>
                {review.is_verified && (
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {renderStars(review.overall_rating)}
                <span>•</span>
                <span>{formatDate(review.created_at)}</span>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleFlag}>
                <Flag className="h-4 w-4 mr-2" />
                Flag Review
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Review Content */}
        <div className="space-y-3">
          <h4 className="font-semibold text-lg">{review.review_title}</h4>
          <p className="text-muted-foreground leading-relaxed">{review.review_content}</p>
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {review.employment_type && (
              <Badge variant="outline">{review.employment_type}</Badge>
            )}
            {review.employment_duration && (
              <Badge variant="outline">{review.employment_duration}</Badge>
            )}
            {review.project_duration && (
              <Badge variant="outline">{review.project_duration}</Badge>
            )}
            {getRecommendationBadge()}
          </div>
        </div>

        {/* Detailed Ratings */}
        {(review.work_environment_rating || review.communication_rating) && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <h5 className="font-medium mb-3">Detailed Ratings</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {reviewType === 'employer_review' && (
                <>
                  {review.work_environment_rating && (
                    <div className="flex justify-between items-center">
                      <span>Work Environment:</span>
                      {renderStars(review.work_environment_rating)}
                    </div>
                  )}
                  {review.management_rating && (
                    <div className="flex justify-between items-center">
                      <span>Management:</span>
                      {renderStars(review.management_rating)}
                    </div>
                  )}
                  {review.compensation_rating && (
                    <div className="flex justify-between items-center">
                      <span>Compensation:</span>
                      {renderStars(review.compensation_rating)}
                    </div>
                  )}
                  {review.work_life_balance_rating && (
                    <div className="flex justify-between items-center">
                      <span>Work-Life Balance:</span>
                      {renderStars(review.work_life_balance_rating)}
                    </div>
                  )}
                  {review.career_growth_rating && (
                    <div className="flex justify-between items-center">
                      <span>Career Growth:</span>
                      {renderStars(review.career_growth_rating)}
                    </div>
                  )}
                </>
              )}
              
              {reviewType === 'expert_review' && (
                <>
                  {review.communication_rating && (
                    <div className="flex justify-between items-center">
                      <span>Communication:</span>
                      {renderStars(review.communication_rating)}
                    </div>
                  )}
                  {review.technical_skills_rating && (
                    <div className="flex justify-between items-center">
                      <span>Technical Skills:</span>
                      {renderStars(review.technical_skills_rating)}
                    </div>
                  )}
                  {review.timeliness_rating && (
                    <div className="flex justify-between items-center">
                      <span>Timeliness:</span>
                      {renderStars(review.timeliness_rating)}
                    </div>
                  )}
                  {review.professionalism_rating && (
                    <div className="flex justify-between items-center">
                      <span>Professionalism:</span>
                      {renderStars(review.professionalism_rating)}
                    </div>
                  )}
                  {review.problem_solving_rating && (
                    <div className="flex justify-between items-center">
                      <span>Problem Solving:</span>
                      {renderStars(review.problem_solving_rating)}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant={userVote === true ? "default" : "ghost"}
              size="sm"
              onClick={() => handleVote(true)}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Helpful ({helpfulVotes.helpful})
            </Button>
            <Button
              variant={userVote === false ? "destructive" : "ghost"}
              size="sm"
              onClick={() => handleVote(false)}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              Not Helpful ({helpfulVotes.notHelpful})
            </Button>
          </div>
          
          {canRespond && (
            <Button variant="outline" size="sm" onClick={() => setShowResponseForm(true)}>
              <Reply className="h-4 w-4 mr-1" />
              Respond
            </Button>
          )}
        </div>

        {/* Response Form */}
        {showResponseForm && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <h5 className="font-medium mb-3">Respond to this review</h5>
            <Textarea
              placeholder="Write your response..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={3}
              maxLength={1000}
            />
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleResponse}
                disabled={isSubmittingResponse || !responseText.trim()}
                size="sm"
              >
                {isSubmittingResponse ? 'Posting...' : 'Post Response'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowResponseForm(false)}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Responses */}
        {responses.length > 0 && (
          <div className="mt-4 space-y-3">
            <h5 className="font-medium">Responses</h5>
            {responses.map((response) => (
              <div key={response.id} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={response.profiles?.avatar_url} />
                    <AvatarFallback>
                      {response.profiles?.display_name?.[0] || 'R'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">
                    {response.profiles?.display_name || 'User'}
                  </span>
                  {response.is_official_response && (
                    <Badge variant="secondary" className="text-xs">
                      Official Response
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(response.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {response.response_content}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};