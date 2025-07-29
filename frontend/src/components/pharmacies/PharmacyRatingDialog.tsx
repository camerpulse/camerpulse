import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PharmacyRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pharmacy: {
    id: string;
    name: string;
  };
  onRatingAdded: () => void;
}

const PHARMACY_RATING_CRITERIA = [
  { key: 'medicine_availability', label: 'Medicine Availability', description: 'Stock of medicines and medical supplies' },
  { key: 'price_fairness', label: 'Price Fairness', description: 'Reasonable and competitive pricing' },
  { key: 'service_quality', label: 'Service Quality', description: 'Customer service and assistance' },
  { key: 'staff_knowledge', label: 'Staff Knowledge', description: 'Pharmacist and staff expertise' },
  { key: 'license_status', label: 'License Status', description: 'Proper licensing and regulations compliance' },
];

export function PharmacyRatingDialog({ open, onOpenChange, pharmacy, onRatingAdded }: PharmacyRatingDialogProps) {
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
        description: 'Please sign in to rate pharmacies.',
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
        .from('pharmacy_ratings')
        .insert({
          pharmacy_id: pharmacy.id,
          user_id: user.id,
          medicine_availability: ratings.medicine_availability || null,
          price_fairness: ratings.price_fairness || null,
          service_quality: ratings.service_quality || null,
          staff_knowledge: ratings.staff_knowledge || null,
          license_status: ratings.license_status || null,
          comment: comment.trim() || null,
        });

      if (error) throw error;

      toast({
        title: 'Rating Submitted',
        description: 'Thank you for rating this pharmacy!',
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
          <DialogTitle>Rate {pharmacy.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Please rate this pharmacy on the following criteria. Your feedback helps others find reliable pharmaceutical services.
          </p>

          {PHARMACY_RATING_CRITERIA.map((criterion) => (
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
              placeholder="Share your experience with this pharmacy..."
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