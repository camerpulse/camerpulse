import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Star, Loader2 } from 'lucide-react';

interface School {
  id: string;
  name: string;
  school_type: string;
  village_or_city: string;
  region: string;
}

interface RateSchoolDialogProps {
  school: School;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RateSchoolDialog({ school, open, onOpenChange, onSuccess }: RateSchoolDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [ratings, setRatings] = useState({
    teaching_quality: 0,
    academic_performance: 0,
    infrastructure: 0,
    discipline_safety: 0,
    tech_access: 0,
    community_trust: 0,
    inclusiveness: 0
  });
  
  const [reviewText, setReviewText] = useState('');

  const ratingCategories = [
    {
      key: 'teaching_quality' as keyof typeof ratings,
      label: 'Teaching Quality',
      description: 'Quality of teachers and instruction methods'
    },
    {
      key: 'academic_performance' as keyof typeof ratings,
      label: 'Academic Performance',
      description: 'Student achievements and exam results'
    },
    {
      key: 'infrastructure' as keyof typeof ratings,
      label: 'Infrastructure',
      description: 'Buildings, classrooms, facilities, and equipment'
    },
    {
      key: 'discipline_safety' as keyof typeof ratings,
      label: 'Discipline & Safety',
      description: 'School environment, security, and behavior management'
    },
    {
      key: 'tech_access' as keyof typeof ratings,
      label: 'Technology Access',
      description: 'Computers, internet, and modern learning tools'
    },
    {
      key: 'community_trust' as keyof typeof ratings,
      label: 'Community Trust',
      description: 'Reputation and trust within the local community'
    },
    {
      key: 'inclusiveness' as keyof typeof ratings,
      label: 'Inclusiveness',
      description: 'Support for students with different backgrounds and needs'
    }
  ];

  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to rate this school",
        variant: "destructive"
      });
      return;
    }

    // Check if at least one rating is provided
    const hasRatings = Object.values(ratings).some(rating => rating > 0);
    if (!hasRatings) {
      toast({
        title: "Rating required",
        description: "Please provide at least one rating",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      const ratingData = {
        school_id: school.id,
        user_id: user.id,
        ...ratings,
        review_text: reviewText.trim() || null
      };

      const { error } = await supabase
        .from('school_ratings')
        .upsert([ratingData], { onConflict: 'school_id,user_id' });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Your rating has been submitted successfully."
      });

      // Reset form
      setRatings({
        teaching_quality: 0,
        academic_performance: 0,
        infrastructure: 0,
        discipline_safety: 0,
        tech_access: 0,
        community_trust: 0,
        inclusiveness: 0
      });
      setReviewText('');
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star 
              className={`h-6 w-6 ${
                star <= value 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rate {school.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {school.village_or_city}, {school.region} • {school.school_type.charAt(0).toUpperCase() + school.school_type.slice(1)}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-4">Rate different aspects of this school</h3>
            <div className="space-y-4">
              {ratingCategories.map((category) => (
                <div key={category.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">{category.label}</Label>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating 
                        value={ratings[category.key]} 
                        onChange={(value) => handleRatingChange(category.key, value)} 
                      />
                      <span className="text-sm text-muted-foreground w-8">
                        {ratings[category.key] > 0 ? ratings[category.key] : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Written Review (Optional)</Label>
            <Textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this school, what you liked or areas for improvement..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {reviewText.length}/1000 characters
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={submitting || Object.values(ratings).every(rating => rating === 0)}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            <p>Your rating helps other parents and students make informed decisions about schools. All ratings are anonymous and will be used to calculate the school's overall rating.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}