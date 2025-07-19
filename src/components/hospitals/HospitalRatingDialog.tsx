import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HospitalRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospital: {
    id: string;
    name: string;
  };
  onRatingAdded: () => void;
}

const HOSPITAL_RATING_CRITERIA = [
  { key: 'cleanliness', label: 'Cleanliness', description: 'Overall hygiene and cleanliness of facilities' },
  { key: 'staff_response_time', label: 'Staff Response Time', description: 'How quickly staff attend to patients' },
  { key: 'equipment_availability', label: 'Equipment Availability', description: 'Medical equipment and supplies' },
  { key: 'service_quality', label: 'Service Quality', description: 'Quality of medical care and treatment' },
  { key: 'emergency_readiness', label: 'Emergency Readiness', description: 'Preparedness for emergencies' },
  { key: 'patient_experience', label: 'Patient Experience', description: 'Overall patient satisfaction' },
];

export function HospitalRatingDialog({ open, onOpenChange, hospital, onRatingAdded }: HospitalRatingDialogProps) {
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
        description: 'Please sign in to rate hospitals.',
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
        .from('hospital_ratings')
        .insert({
          hospital_id: hospital.id,
          user_id: user.id,
          cleanliness: ratings.cleanliness || null,
          staff_response_time: ratings.staff_response_time || null,
          equipment_availability: ratings.equipment_availability || null,
          service_quality: ratings.service_quality || null,
          emergency_readiness: ratings.emergency_readiness || null,
          patient_experience: ratings.patient_experience || null,
          comment: comment.trim() || null,
        });

      if (error) throw error;

      toast({
        title: 'Rating Submitted',
        description: 'Thank you for rating this hospital!',
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
          <DialogTitle>Rate {hospital.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Please rate this hospital on the following criteria. Your feedback helps other patients find quality healthcare.
          </p>

          {HOSPITAL_RATING_CRITERIA.map((criterion) => (
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
              placeholder="Share your experience with this hospital..."
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