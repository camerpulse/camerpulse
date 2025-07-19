import React, { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Hospital {
  id: string;
  name: string;
  type: string;
  village_or_city: string;
  division: string;
}

interface RateHospitalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospital: Hospital;
  onRatingAdded: () => void;
}

interface RatingCriteria {
  cleanliness: number;
  staff_response_time: number;
  equipment_availability: number;
  service_quality: number;
  emergency_readiness: number;
  patient_experience: number;
}

export function RateHospitalDialog({ open, onOpenChange, hospital, onRatingAdded }: RateHospitalDialogProps) {
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState<RatingCriteria>({
    cleanliness: 0,
    staff_response_time: 0,
    equipment_availability: 0,
    service_quality: 0,
    emergency_readiness: 0,
    patient_experience: 0,
  });
  const [reviewText, setReviewText] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const { toast } = useToast();

  const ratingCriteria = [
    { key: 'cleanliness', label: 'Cleanliness & Hygiene', description: 'How clean and hygienic is the facility?' },
    { key: 'staff_response_time', label: 'Staff Response Time', description: 'How quickly do staff respond to patients?' },
    { key: 'equipment_availability', label: 'Equipment Availability', description: 'Are necessary medical equipment available?' },
    { key: 'service_quality', label: 'Service Quality', description: 'Overall quality of medical services provided' },
    { key: 'emergency_readiness', label: 'Emergency Readiness', description: 'How well prepared for emergencies?' },
    { key: 'patient_experience', label: 'Patient Experience', description: 'Overall experience as a patient' },
  ] as const;

  const handleStarClick = (criteriaKey: keyof RatingCriteria, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [criteriaKey]: rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to rate this hospital',
          variant: 'destructive',
        });
        return;
      }

      // Validate that at least one rating is provided
      const hasRating = Object.values(ratings).some(rating => rating > 0);
      if (!hasRating) {
        toast({
          title: 'Rating Required',
          description: 'Please provide at least one rating',
          variant: 'destructive',
        });
        return;
      }

      const ratingData = {
        hospital_id: hospital.id,
        user_id: user.id,
        ...ratings,
        review_text: reviewText.trim() || null,
        anonymous,
      };

      const { error } = await supabase
        .from('hospital_ratings')
        .upsert([ratingData], { onConflict: 'hospital_id,user_id' });

      if (error) {
        throw error;
      }

      onRatingAdded();
      
      // Reset form
      setRatings({
        cleanliness: 0,
        staff_response_time: 0,
        equipment_availability: 0,
        service_quality: 0,
        emergency_readiness: 0,
        patient_experience: 0,
      });
      setReviewText('');
      setAnonymous(false);

    } catch (error: any) {
      console.error('Error adding rating:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit rating',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, criteriaKey }: { 
    value: number; 
    onChange: (rating: number) => void;
    criteriaKey: string;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= value
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rate {hospital.name}</DialogTitle>
          <DialogDescription>
            Share your experience to help others make informed decisions about healthcare.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Criteria */}
          <div className="space-y-4">
            <h3 className="font-medium">Rate Your Experience</h3>
            {ratingCriteria.map((criteria) => (
              <div key={criteria.key} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">{criteria.label}</Label>
                    <p className="text-xs text-muted-foreground">{criteria.description}</p>
                  </div>
                  <StarRating
                    value={ratings[criteria.key]}
                    onChange={(rating) => handleStarClick(criteria.key, rating)}
                    criteriaKey={criteria.key}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review">Additional Comments (Optional)</Label>
            <Textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience, specific feedback, or recommendations..."
              rows={4}
            />
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={anonymous}
              onCheckedChange={(checked) => setAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="text-sm">
              Submit this rating anonymously
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Rating
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}