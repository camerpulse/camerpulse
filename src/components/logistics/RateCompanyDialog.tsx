import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RatingStars } from '@/components/camerpulse/RatingStars';
import {
  Building2,
  Star,
  Truck,
  Clock,
  DollarSign,
  Package,
  MessageSquare,
  X
} from 'lucide-react';

interface RateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: {
    id: string;
    name: string;
    code: string;
  };
  onRatingAdded?: () => void;
}

interface RatingCategories {
  overall_rating: number;
  reliability_rating: number;
  speed_rating: number;
  customer_service_rating: number;
  pricing_rating: number;
  packaging_rating: number;
}

const RATING_CATEGORIES = [
  {
    key: 'overall_rating' as keyof RatingCategories,
    label: 'Overall Experience',
    icon: Star,
    description: 'Rate your overall experience with this company'
  },
  {
    key: 'reliability_rating' as keyof RatingCategories,
    label: 'Reliability',
    icon: Building2,
    description: 'How reliable are their delivery services?'
  },
  {
    key: 'speed_rating' as keyof RatingCategories,
    label: 'Delivery Speed',
    icon: Clock,
    description: 'How fast do they deliver packages?'
  },
  {
    key: 'customer_service_rating' as keyof RatingCategories,
    label: 'Customer Service',
    icon: MessageSquare,
    description: 'Quality of customer support and communication'
  },
  {
    key: 'pricing_rating' as keyof RatingCategories,
    label: 'Pricing',
    icon: DollarSign,
    description: 'Value for money and fair pricing'
  },
  {
    key: 'packaging_rating' as keyof RatingCategories,
    label: 'Package Handling',
    icon: Package,
    description: 'How well do they handle and protect packages?'
  }
];

export const RateCompanyDialog: React.FC<RateCompanyDialogProps> = ({
  open,
  onOpenChange,
  company,
  onRatingAdded
}) => {
  const { toast } = useToast();
  const [ratings, setRatings] = useState<RatingCategories>({
    overall_rating: 0,
    reliability_rating: 0,
    speed_rating: 0,
    customer_service_rating: 0,
    pricing_rating: 0,
    packaging_rating: 0
  });
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (category: keyof RatingCategories, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (ratings.overall_rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide at least an overall rating",
        variant: "destructive"
      });
      return;
    }

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to rate companies",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare rating data - only include non-zero ratings
      const ratingData: any = {
        company_id: company.id,
        user_id: user.id,
        overall_rating: ratings.overall_rating,
        review_text: reviewText.trim() || null
      };

      // Add optional ratings only if they were provided
      if (ratings.reliability_rating > 0) ratingData.reliability_rating = ratings.reliability_rating;
      if (ratings.speed_rating > 0) ratingData.speed_rating = ratings.speed_rating;
      if (ratings.customer_service_rating > 0) ratingData.customer_service_rating = ratings.customer_service_rating;
      if (ratings.pricing_rating > 0) ratingData.pricing_rating = ratings.pricing_rating;
      if (ratings.packaging_rating > 0) ratingData.packaging_rating = ratings.packaging_rating;

      const { error } = await supabase
        .from('shipping_company_ratings')
        .upsert(ratingData, {
          onConflict: 'company_id,user_id'
        });

      if (error) {
        console.error('Error submitting rating:', error);
        toast({
          title: "Error",
          description: "Failed to submit rating. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!"
      });

      // Reset form
      setRatings({
        overall_rating: 0,
        reliability_rating: 0,
        speed_rating: 0,
        customer_service_rating: 0,
        pricing_rating: 0,
        packaging_rating: 0
      });
      setReviewText('');
      onOpenChange(false);
      onRatingAdded?.();

    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold">Rate {company.name}</div>
              <div className="text-sm text-muted-foreground font-normal">Company ID: {company.code}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Rating Categories */}
          <div className="space-y-6">
            {RATING_CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              return (
                <div key={category.key} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{category.label}</div>
                      <div className="text-sm text-muted-foreground">{category.description}</div>
                    </div>
                  </div>
                  <div className="ml-11">
                    <RatingStars
                      rating={ratings[category.key]}
                      maxRating={5}
                      size="lg"
                      onRatingChange={(rating) => handleRatingChange(category.key, rating)}
                      showLabel={true}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Review Text */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <div className="font-medium">Write a Review</div>
                <div className="text-sm text-muted-foreground">Share your experience (optional)</div>
              </div>
            </div>
            <Textarea
              placeholder="Tell others about your experience with this shipping company..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="ml-11"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || ratings.overall_rating === 0}
              className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            >
              <Star className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};