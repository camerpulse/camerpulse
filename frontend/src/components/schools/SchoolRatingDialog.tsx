import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SchoolRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: {
    id: string;
    name: string;
  };
  onRatingAdded: () => void;
}

const SCHOOL_RATING_CRITERIA = [
  { key: 'teaching_quality', label: 'Teaching Quality', description: 'Quality of teachers and instruction' },
  { key: 'academic_performance', label: 'Academic Performance', description: 'Student exam results and achievements' },
  { key: 'infrastructure', label: 'Infrastructure', description: 'Buildings, classrooms, and facilities' },
  { key: 'discipline_safety', label: 'Discipline & Safety', description: 'School discipline and student safety' },
  { key: 'tech_access', label: 'Technology Access', description: 'Computer labs and internet access' },
  { key: 'community_trust', label: 'Community Trust', description: 'Reputation and community confidence' },
  { key: 'inclusiveness', label: 'Inclusiveness', description: 'Support for diverse students and needs' },
];

export function SchoolRatingDialog({ open, onOpenChange, school, onRatingAdded }: SchoolRatingDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRatingChange = (criterion: string, rating: number) => {
    setRatings(prev => ({ ...prev, [criterion]: rating }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to rate schools.',
        variant: 'destructive',
      });
      return;
    }

    if (Object.keys(ratings).length === 0) {
      toast({
        title: 'No Ratings',
        description: 'Please rate at least one criterion.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('school_ratings')
        .insert({
          school_id: school.id,
          user_id: user.id,
          teaching_quality: ratings.teaching_quality || null,
          academic_performance: ratings.academic_performance || null,
          infrastructure: ratings.infrastructure || null,
          discipline_safety: ratings.discipline_safety || null,
          tech_access: ratings.tech_access || null,
          community_trust: ratings.community_trust || null,
          inclusiveness: ratings.inclusiveness || null,
          comment: comment.trim() || null,
        });

      if (error) throw error;

      toast({
        title: 'Rating Submitted',
        description: 'Thank you for rating this school!',
      });

      onRatingAdded();
      onOpenChange(false);
      setRatings({});
      setComment('');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit rating. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = (criterion: string, currentRating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(criterion, star)}
            className="hover:scale-110 transition-transform"
          >
            <Star
              className={`h-6 w-6 ${
                star <= currentRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
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
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Please rate this school on the following criteria. Your feedback helps other parents and students make informed decisions.
          </p>

          {SCHOOL_RATING_CRITERIA.map((criterion) => (
            <div key={criterion.key} className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <Label className="text-sm font-medium">{criterion.label}</Label>
                  <p className="text-xs text-muted-foreground">{criterion.description}</p>
                </div>
                {renderStarRating(criterion.key, ratings[criterion.key] || 0)}
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="comment">Additional Comments (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this school..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}