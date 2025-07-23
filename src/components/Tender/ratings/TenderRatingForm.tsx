import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RatingStars } from '@/components/camerpulse/RatingStars';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TenderRatingFormProps {
  tenderId: string;
  tenderTitle: string;
  onRatingSubmitted?: () => void;
}

export function TenderRatingForm({ tenderId, tenderTitle, onRatingSubmitted }: TenderRatingFormProps) {
  const [qualityRating, setQualityRating] = useState(0);
  const [budgetRating, setBudgetRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [transparencyRating, setTransparencyRating] = useState(0);
  const [comment, setComment] = useState('');
  const [fraudFlag, setFraudFlag] = useState(false);
  const [fraudEvidence, setFraudEvidence] = useState('');

  const queryClient = useQueryClient();

  const submitRatingMutation = useMutation({
    mutationFn: async (ratingData: any) => {
      const { data, error } = await supabase
        .from('tender_ratings')
        .insert({
          tender_id: tenderId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          quality_rating: ratingData.qualityRating,
          budget_fidelity_rating: ratingData.budgetRating,
          timeliness_rating: ratingData.timelinessRating,
          transparency_rating: ratingData.transparencyRating,
          comment: ratingData.comment || null,
          fraud_flag: ratingData.fraudFlag,
          fraud_evidence: ratingData.fraudEvidence || null,
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Rating submitted successfully",
        description: "Your tender rating has been recorded and will help improve transparency.",
      });
      queryClient.invalidateQueries({ queryKey: ['tender-ratings', tenderId] });
      queryClient.invalidateQueries({ queryKey: ['tender-aggregates', tenderId] });
      onRatingSubmitted?.();
      // Reset form
      setQualityRating(0);
      setBudgetRating(0);
      setTimelinessRating(0);
      setTransparencyRating(0);
      setComment('');
      setFraudFlag(false);
      setFraudEvidence('');
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting rating",
        description: error.message || "Failed to submit your rating. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!qualityRating || !budgetRating || !timelinessRating || !transparencyRating) {
      toast({
        title: "Incomplete rating",
        description: "Please provide ratings for all four categories.",
        variant: "destructive",
      });
      return;
    }

    if (fraudFlag && !fraudEvidence.trim()) {
      toast({
        title: "Evidence required",
        description: "Please provide evidence when flagging potential fraud.",
        variant: "destructive",
      });
      return;
    }

    submitRatingMutation.mutate({
      qualityRating,
      budgetRating,
      timelinessRating,
      transparencyRating,
      comment,
      fraudFlag,
      fraudEvidence,
    });
  };

  const isFormValid = qualityRating && budgetRating && timelinessRating && transparencyRating;
  const overallRating = isFormValid ? (qualityRating + budgetRating + timelinessRating + transparencyRating) / 4 : 0;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Rate Completed Tender
        </CardTitle>
        <CardDescription>
          Rate the execution of "{tenderTitle}" to help build transparency and accountability in procurement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Categories */}
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quality of Execution</Label>
              <RatingStars 
                rating={qualityRating}
                onRatingChange={setQualityRating}
                size="md"
                showLabel
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Budget Fidelity</Label>
              <p className="text-xs text-muted-foreground">Was the project delivered within reasonable cost expectations?</p>
              <RatingStars 
                rating={budgetRating}
                onRatingChange={setBudgetRating}
                size="md"
                showLabel
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Timeliness</Label>
              <p className="text-xs text-muted-foreground">Was the project completed on schedule?</p>
              <RatingStars 
                rating={timelinessRating}
                onRatingChange={setTimelinessRating}
                size="md"
                showLabel
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Transparency</Label>
              <p className="text-xs text-muted-foreground">How transparent was the process and communication?</p>
              <RatingStars 
                rating={transparencyRating}
                onRatingChange={setTransparencyRating}
                size="md"
                showLabel
              />
            </div>
          </div>

          {/* Overall Rating Display */}
          {isFormValid && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Overall Rating:</span>
                <div className="flex items-center gap-2">
                  <RatingStars rating={overallRating} size="md" disabled />
                  <span className="text-lg font-semibold">{overallRating.toFixed(1)}/5</span>
                </div>
              </div>
            </div>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Additional Comments (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience and specific feedback about this tender execution..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {/* Fraud Flag */}
          <div className="space-y-4 p-4 border border-amber-200 bg-amber-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="fraud-flag"
                checked={fraudFlag}
                onCheckedChange={(checked) => setFraudFlag(checked as boolean)}
              />
              <Label htmlFor="fraud-flag" className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                Flag potential fraud or irregularities
              </Label>
            </div>
            
            {fraudFlag && (
              <div className="space-y-2">
                <Label htmlFor="fraud-evidence" className="text-amber-800">
                  Evidence or Details (Required when flagging)
                </Label>
                <Textarea
                  id="fraud-evidence"
                  placeholder="Please provide specific details, evidence, or concerns about potential fraud or irregularities..."
                  value={fraudEvidence}
                  onChange={(e) => setFraudEvidence(e.target.value)}
                  required={fraudFlag}
                  rows={3}
                  className="border-amber-300 focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isFormValid || submitRatingMutation.isPending}
          >
            {submitRatingMutation.isPending ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}