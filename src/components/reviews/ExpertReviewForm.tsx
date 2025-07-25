import React, { useState } from 'react';
import { Star, MessageSquare, Clock, User, Lightbulb, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExpertReviewFormProps {
  expertId: string;
  projectId?: string;
  onReviewSubmitted: () => void;
  onCancel: () => void;
}

interface RatingCriteria {
  id: keyof typeof initialRatings;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const initialRatings = {
  overall_rating: 0,
  communication_rating: 0,
  technical_skills_rating: 0,
  timeliness_rating: 0,
  professionalism_rating: 0,
  problem_solving_rating: 0,
};

const ratingCriteria: RatingCriteria[] = [
  {
    id: 'overall_rating',
    label: 'Overall Experience',
    icon: <Star className="h-4 w-4" />,
    description: 'Your overall satisfaction working with this expert'
  },
  {
    id: 'communication_rating',
    label: 'Communication',
    icon: <MessageSquare className="h-4 w-4" />,
    description: 'Clarity, responsiveness, and frequency of communication'
  },
  {
    id: 'technical_skills_rating',
    label: 'Technical Skills',
    icon: <Award className="h-4 w-4" />,
    description: 'Expertise, quality of work, and technical competency'
  },
  {
    id: 'timeliness_rating',
    label: 'Timeliness',
    icon: <Clock className="h-4 w-4" />,
    description: 'Meeting deadlines and delivering work on schedule'
  },
  {
    id: 'professionalism_rating',
    label: 'Professionalism',
    icon: <User className="h-4 w-4" />,
    description: 'Professional conduct, reliability, and work ethic'
  },
  {
    id: 'problem_solving_rating',
    label: 'Problem Solving',
    icon: <Lightbulb className="h-4 w-4" />,
    description: 'Ability to identify issues and provide creative solutions'
  },
];

export const ExpertReviewForm: React.FC<ExpertReviewFormProps> = ({
  expertId,
  projectId,
  onReviewSubmitted,
  onCancel
}) => {
  const [ratings, setRatings] = useState(initialRatings);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [projectDuration, setProjectDuration] = useState('');
  const [projectBudgetRange, setProjectBudgetRange] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRatingChange = (criteriaId: keyof typeof initialRatings, rating: number) => {
    setRatings(prev => ({ ...prev, [criteriaId]: rating }));
  };

  const renderStarRating = (criteriaId: keyof typeof initialRatings, currentRating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(criteriaId, star)}
            className="focus:outline-none transition-colors"
          >
            <Star
              className={`h-6 w-6 ${
                star <= currentRating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const validateForm = () => {
    if (ratings.overall_rating === 0) {
      toast({
        title: "Overall Rating Required",
        description: "Please provide an overall rating.",
        variant: "destructive",
      });
      return false;
    }

    if (!reviewTitle.trim()) {
      toast({
        title: "Review Title Required",
        description: "Please provide a title for your review.",
        variant: "destructive",
      });
      return false;
    }

    if (!reviewContent.trim() || reviewContent.trim().length < 50) {
      toast({
        title: "Review Content Required",
        description: "Please provide at least 50 characters in your review.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit a review.",
          variant: "destructive",
        });
        return;
      }

      // Submit the review
      const { data: reviewData, error: insertError } = await supabase
        .from('expert_performance_reviews')
        .insert({
          expert_id: expertId,
          reviewer_id: user.id,
          project_id: projectId,
          ...ratings,
          review_title: reviewTitle,
          review_content: reviewContent,
          project_duration: projectDuration || null,
          project_budget_range: projectBudgetRange || null,
          would_recommend: wouldRecommend,
          is_anonymous: isAnonymous,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Analyze content for toxicity
      try {
        await supabase.functions.invoke('analyze-toxicity', {
          body: {
            content: `${reviewTitle} ${reviewContent}`,
            reviewId: reviewData.id,
            reviewType: 'expert_review'
          }
        });
      } catch (toxicityError) {
        console.warn('Toxicity analysis failed:', toxicityError);
        // Don't block the review submission if toxicity analysis fails
      }

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! Your review is being processed.",
      });

      onReviewSubmitted();
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

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Review Expert Performance</CardTitle>
        <p className="text-muted-foreground">
          Help other clients by sharing your experience working with this expert.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Criteria */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Rate Your Experience</h3>
          {ratingCriteria.map((criteria) => (
            <div key={criteria.id} className="space-y-2">
              <div className="flex items-center gap-2">
                {criteria.icon}
                <Label className="text-sm font-medium">{criteria.label}</Label>
                <span className="text-xs text-muted-foreground">
                  ({ratings[criteria.id]}/5)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {criteria.description}
              </p>
              {renderStarRating(criteria.id, ratings[criteria.id])}
            </div>
          ))}
        </div>

        {/* Review Details */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="review-title">Review Title *</Label>
            <Input
              id="review-title"
              placeholder="Summarize your experience working with this expert"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="review-content">Detailed Review *</Label>
            <Textarea
              id="review-content"
              placeholder="Share details about the project, the expert's performance, what went well, areas for improvement, etc. (minimum 50 characters)"
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              rows={6}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reviewContent.length}/2000 characters (minimum 50)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project-duration">Project Duration</Label>
              <Select value={projectDuration} onValueChange={setProjectDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="How long was the project?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="less-than-1-week">Less than 1 week</SelectItem>
                  <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
                  <SelectItem value="2-4-weeks">2-4 weeks</SelectItem>
                  <SelectItem value="1-3-months">1-3 months</SelectItem>
                  <SelectItem value="3-6-months">3-6 months</SelectItem>
                  <SelectItem value="6-12-months">6-12 months</SelectItem>
                  <SelectItem value="more-than-1-year">More than 1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="project-budget">Project Budget Range</Label>
              <Select value={projectBudgetRange} onValueChange={setProjectBudgetRange}>
                <SelectTrigger>
                  <SelectValue placeholder="What was the budget range?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-100k">Under 100,000 FCFA</SelectItem>
                  <SelectItem value="100k-500k">100,000 - 500,000 FCFA</SelectItem>
                  <SelectItem value="500k-1m">500,000 - 1,000,000 FCFA</SelectItem>
                  <SelectItem value="1m-5m">1,000,000 - 5,000,000 FCFA</SelectItem>
                  <SelectItem value="5m-10m">5,000,000 - 10,000,000 FCFA</SelectItem>
                  <SelectItem value="over-10m">Over 10,000,000 FCFA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Would you recommend this expert to others?</Label>
            <div className="flex gap-4 mt-2">
              <Button
                type="button"
                variant={wouldRecommend === true ? "default" : "outline"}
                onClick={() => setWouldRecommend(true)}
                size="sm"
              >
                👍 Yes
              </Button>
              <Button
                type="button"
                variant={wouldRecommend === false ? "destructive" : "outline"}
                onClick={() => setWouldRecommend(false)}
                size="sm"
              >
                👎 No
              </Button>
              <Button
                type="button"
                variant={wouldRecommend === null ? "secondary" : "outline"}
                onClick={() => setWouldRecommend(null)}
                size="sm"
              >
                🤷 Not sure
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="text-sm">
              Submit this review anonymously
            </Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};