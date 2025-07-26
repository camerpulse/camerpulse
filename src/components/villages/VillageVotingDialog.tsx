import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VillageVotingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  villageId: string;
  villageName: string;
  onVoteSubmitted: () => void;
}

const VOTING_CRITERIA = [
  {
    key: 'development_progress_rating',
    label: 'Development Progress',
    description: 'Rate the village\'s progress in infrastructure and development projects'
  },
  {
    key: 'leadership_transparency_rating',
    label: 'Leadership Transparency',
    description: 'How transparent and accountable are the village leaders?'
  },
  {
    key: 'village_unity_rating',
    label: 'Village Unity & Peace',
    description: 'Rate the level of unity, cooperation, and conflict resolution'
  },
  {
    key: 'access_to_services_rating',
    label: 'Access to Services',
    description: 'Rate access to health, education, water, and other essential services'
  },
  {
    key: 'overall_satisfaction_rating',
    label: 'Overall Satisfaction',
    description: 'Your overall satisfaction with living in or being associated with this village'
  }
];

export function VillageVotingDialog({
  open,
  onOpenChange,
  villageId,
  villageName,
  onVoteSubmitted
}: VillageVotingDialogProps) {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [isDiasporaVote, setIsDiasporaVote] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRatingChange = (criterion: string, rating: number) => {
    setRatings(prev => ({ ...prev, [criterion]: rating }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    if (Object.keys(ratings).length === 0) {
      toast.error('Please rate at least one criterion');
      return;
    }

    setSubmitting(true);

    try {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

      const voteData = {
        village_id: villageId,
        voter_user_id: user.id,
        vote_month: currentMonth,
        development_progress_rating: ratings.development_progress_rating || null,
        leadership_transparency_rating: ratings.leadership_transparency_rating || null,
        village_unity_rating: ratings.village_unity_rating || null,
        access_to_services_rating: ratings.access_to_services_rating || null,
        overall_satisfaction_rating: ratings.overall_satisfaction_rating || null,
        comment: comment.trim() || null,
        is_diaspora_vote: isDiasporaVote
      };

      const { error } = await supabase
        .from('village_monthly_votes')
        .upsert(voteData, {
          onConflict: 'village_id,voter_user_id,vote_month'
        });

      if (error) throw error;

      // Recalculate reputation score
      await supabase.rpc('calculate_village_reputation_index', {
        p_village_id: villageId
      });

      toast.success('Thank you for rating this village!');
      onVoteSubmitted();
      onOpenChange(false);
      setRatings({});
      setComment('');
      setIsDiasporaVote(false);
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('Failed to submit vote. Please try again.');
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
          <DialogTitle>Rate {villageName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Your monthly vote helps build the Village Reputation Index. Rate the village on various criteria 
            to help other citizens and diaspora understand its development progress.
          </p>

          {VOTING_CRITERIA.map((criterion) => (
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
              placeholder="Share your thoughts about this village's development, leadership, or any specific issues..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="diaspora"
              checked={isDiasporaVote}
              onCheckedChange={(checked) => setIsDiasporaVote(checked as boolean)}
            />
            <Label htmlFor="diaspora" className="text-sm">
              I am voting as a member of the diaspora (living outside Cameroon)
            </Label>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Vote'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}