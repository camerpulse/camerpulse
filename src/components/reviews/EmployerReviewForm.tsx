import React, { useState } from 'react';
import { Star, Briefcase, Users, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmployerReviewFormProps {
  employerId: string;
  jobId?: string;
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
  work_environment_rating: 0,
  management_rating: 0,
  compensation_rating: 0,
  work_life_balance_rating: 0,
  career_growth_rating: 0,
};

const ratingCriteria: RatingCriteria[] = [
  {
    id: 'overall_rating',
    label: 'Overall Experience',
    icon: <Star className="h-4 w-4" />,
    description: 'Your overall satisfaction with this employer'
  },
  {
    id: 'work_environment_rating',
    label: 'Work Environment',
    icon: <Briefcase className="h-4 w-4" />,
    description: 'Office culture, tools, and working conditions'
  },
  {
    id: 'management_rating',
    label: 'Management Quality',
    icon: <Users className="h-4 w-4" />,
    description: 'Leadership, communication, and support from managers'
  },
  {
    id: 'compensation_rating',
    label: 'Compensation & Benefits',
    icon: <DollarSign className="h-4 w-4" />,
    description: 'Salary, bonuses, health insurance, and other benefits'
  },
  {
    id: 'work_life_balance_rating',
    label: 'Work-Life Balance',
    icon: <Clock className="h-4 w-4" />,
    description: 'Flexibility, hours, vacation time, and personal time respect'
  },
  {
    id: 'career_growth_rating',
    label: 'Career Growth',
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Promotion opportunities, skill development, and career advancement'
  },
];

export const EmployerReviewForm: React.FC<EmployerReviewFormProps> = ({
  employerId,
  jobId,
  onReviewSubmitted,
  onCancel
}) => {
  const [ratings, setRatings] = useState(initialRatings);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [employmentDuration, setEmploymentDuration] = useState('');
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
        .from('employer_reviews')
        .insert({
          employer_id: employerId,
          reviewer_id: user.id,
          job_id: jobId,
          ...ratings,
          review_title: reviewTitle,
          review_content: reviewContent,
          employment_type: employmentType || null,
          employment_duration: employmentDuration || null,
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
            reviewType: 'employer_review'
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
        <CardTitle>Share Your Employer Experience</CardTitle>
        <p className="text-muted-foreground">
          Help other job seekers by sharing your honest experience with this employer.
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
              placeholder="Summarize your experience in one line"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="review-content">Detailed Review *</Label>
            <Textarea
              id="review-content"
              placeholder="Share details about your experience, what you liked, areas for improvement, advice for future employees, etc. (minimum 50 characters)"
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
              <Label htmlFor="employment-type">Employment Type</Label>
              <Select value={employmentType} onValueChange={setEmploymentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="employment-duration">Employment Duration</Label>
              <Select value={employmentDuration} onValueChange={setEmploymentDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="How long did you work there?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="less-than-1-month">Less than 1 month</SelectItem>
                  <SelectItem value="1-3-months">1-3 months</SelectItem>
                  <SelectItem value="3-6-months">3-6 months</SelectItem>
                  <SelectItem value="6-12-months">6-12 months</SelectItem>
                  <SelectItem value="1-2-years">1-2 years</SelectItem>
                  <SelectItem value="2-5-years">2-5 years</SelectItem>
                  <SelectItem value="more-than-5-years">More than 5 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Would you recommend this employer to a friend?</Label>
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