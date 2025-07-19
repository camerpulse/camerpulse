import { useState, useEffect } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReviewSubmissionProps {
  institutionId: string;
  institutionType: string;
  institutionName: string;
  onSubmitted?: () => void;
}

interface RatingCriteria {
  id: string;
  criteria_name: string;
  criteria_description: string;
  weight: number;
  display_order: number;
}

export const ReviewSubmission = ({ institutionId, institutionType, institutionName, onSubmitted }: ReviewSubmissionProps) => {
  const [criteria, setCriteria] = useState<RatingCriteria[]>([]);
  const [overallRating, setOverallRating] = useState(0);
  const [criteriaRatings, setCriteriaRatings] = useState<Record<string, number>>({});
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRatingCriteria();
  }, [institutionType]);

  const fetchRatingCriteria = async () => {
    try {
      const { data, error } = await supabase
        .from('rating_criteria')
        .select('*')
        .eq('institution_type', institutionType as any)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setCriteria(data || []);
    } catch (error) {
      console.error('Error fetching rating criteria:', error);
    }
  };

  const renderStarRating = (rating: number, onRatingChange: (rating: number) => void, size = 'small') => {
    const starSize = size === 'large' ? 'h-8 w-8' : 'h-5 w-5';
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none transition-colors duration-200"
          >
            <Star
              className={`${starSize} transition-colors ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{rating > 0 ? `${rating}/5` : 'Rate this'}</span>
      </div>
    );
  };

  const handleCriteriaRatingChange = (criteriaName: string, rating: number) => {
    setCriteriaRatings(prev => ({
      ...prev,
      [criteriaName]: rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (overallRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide an overall rating",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to submit a review",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('institution_reviews')
        .insert({
          institution_id: institutionId,
          institution_type: institutionType as any,
          reviewer_id: user.user.id,
          overall_rating: overallRating,
          criteria_ratings: criteriaRatings,
          review_title: reviewTitle.trim() || null,
          review_text: reviewText.trim() || null,
          is_anonymous: isAnonymous,
          moderation_status: 'approved' // Auto-approve for now
        });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Your review has been submitted successfully!",
      });

      // Reset form
      setOverallRating(0);
      setCriteriaRatings({});
      setReviewTitle('');
      setReviewText('');
      setIsAnonymous(false);
      
      onSubmitted?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCriteriaName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Write a Review for {institutionName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Overall Rating</Label>
            {renderStarRating(overallRating, setOverallRating, 'large')}
          </div>

          {/* Criteria Ratings */}
          {criteria.length > 0 && (
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Rate by Category</Label>
              {criteria.map((criterion) => (
                <div key={criterion.id} className="space-y-2">
                  <div>
                    <Label className="font-medium">{formatCriteriaName(criterion.criteria_name)}</Label>
                    <p className="text-sm text-muted-foreground">{criterion.criteria_description}</p>
                  </div>
                  {renderStarRating(
                    criteriaRatings[criterion.criteria_name] || 0,
                    (rating) => handleCriteriaRatingChange(criterion.criteria_name, rating)
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Summarize your experience..."
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review">Your Review (Optional)</Label>
            <Textarea
              id="review"
              placeholder="Share your detailed experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {reviewText.length}/1000 characters
            </p>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="text-sm">
              Submit review anonymously
            </Label>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || overallRating === 0}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};