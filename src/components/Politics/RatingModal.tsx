import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRateSenator } from '@/hooks/useSenators';
import { useRateMP } from '@/hooks/useMPs';
import { useRateMinister } from '@/hooks/useMinisterRatings';

interface RatingModalProps {
  open: boolean;
  onClose: () => void;
  entityId: string;
  entityName: string;
  entityType: 'politician' | 'senator' | 'mp' | 'minister';
}

export const RatingModal: React.FC<RatingModalProps> = ({
  open,
  onClose,
  entityId,
  entityName,
  entityType
}) => {
  const { toast } = useToast();
  const rateSenator = useRateSenator();
  const rateMP = useRateMP();
  const rateMinister = useRateMinister();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (entityType === 'senator') {
        await rateSenator.mutateAsync({
          senator_id: entityId,
          overall_rating: rating,
          comment,
          is_anonymous: false
        });
      } else if (entityType === 'mp') {
        await rateMP.mutateAsync({
          mp_id: entityId,
          overall_rating: rating,
          comment,
          is_anonymous: false
        });
      } else if (entityType === 'minister') {
        await rateMinister.mutateAsync({
          minister_id: entityId,
          overall_rating: rating,
          comment,
          is_anonymous: false
        });
      }
      
      onClose();
      setRating(0);
      setComment('');
    } catch (error) {
      // Error handling is done in the hooks
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {entityName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              How would you rate their performance?
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {rating} out of 5 stars
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Comments (optional)
            </label>
            <Textarea
              placeholder="Share your thoughts about their performance..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || rating === 0}
              className="flex-1"
            >
              Submit Rating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};