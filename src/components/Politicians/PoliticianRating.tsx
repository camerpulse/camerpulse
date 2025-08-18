import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Star, Send, ThumbsUp } from 'lucide-react';
import { useRatePolitician } from '@/hooks/usePoliticalData';

interface PoliticianRatingProps {
  politicianId: string;
  politicianName: string;
  currentRating?: number;
  totalRatings?: number;
  showForm?: boolean;
}

export const PoliticianRating: React.FC<PoliticianRatingProps> = ({
  politicianId,
  politicianName,
  currentRating = 0,
  totalRatings = 0,
  showForm = true,
}) => {
  const [ratings, setRatings] = useState({
    overall: 0,
    transparency: 0,
    integrity: 0,
    effectiveness: 0,
  });
  const [review, setReview] = useState('');
  const [showRatingForm, setShowRatingForm] = useState(false);
  const { toast } = useToast();
  
  const ratePoliticianMutation = useRatePolitician();

  const handleStarClick = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSubmitRating = async () => {
    if (ratings.overall === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide an overall rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      await ratePoliticianMutation.mutateAsync({
        politicianId,
        overall_rating: ratings.overall,
        transparency_rating: ratings.transparency,
        integrity_rating: ratings.integrity,
        effectiveness_rating: ratings.effectiveness,
        review_content: review,
      });

      // Reset form
      setRatings({ overall: 0, transparency: 0, integrity: 0, effectiveness: 0 });
      setReview('');
      setShowRatingForm(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const renderStars = (category: keyof typeof ratings, label: string) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarClick(category, star)}
              className="transition-colors hover:scale-110"
              type="button"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= ratings[category]
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {ratings[category]}/5
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Rating Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Current Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl font-bold">{currentRating.toFixed(1)}</div>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(currentRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
            </div>
          </div>
          
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm w-3">{stars}</span>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Progress value={0} className="flex-1 h-2" />
                <span className="text-sm text-muted-foreground w-8">0%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rating Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Rate {politicianName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Share your experience and help others make informed decisions.
            </p>
          </CardHeader>
          <CardContent>
            {!showRatingForm ? (
              <Button onClick={() => setShowRatingForm(true)} className="w-full">
                <Star className="h-4 w-4 mr-2" />
                Leave a Rating
              </Button>
            ) : (
              <div className="space-y-6">
                {/* Rating Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderStars('overall', 'Overall Performance')}
                  {renderStars('transparency', 'Transparency')}
                  {renderStars('integrity', 'Integrity')}
                  {renderStars('effectiveness', 'Effectiveness')}
                </div>

                {/* Review Text */}
                <div className="space-y-2">
                  <Label htmlFor="review">Review (Optional)</Label>
                  <Textarea
                    id="review"
                    placeholder="Share your thoughts about this politician's performance..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSubmitRating}
                    disabled={ratePoliticianMutation.isPending || ratings.overall === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {ratePoliticianMutation.isPending ? 'Submitting...' : 'Submit Rating'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRatingForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};