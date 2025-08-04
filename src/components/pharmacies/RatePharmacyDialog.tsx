import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RatePharmacyDialogProps {
  pharmacy: {
    id: string;
    name: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RatePharmacyDialog({ pharmacy, open, onOpenChange }: RatePharmacyDialogProps) {
  const [ratings, setRatings] = useState({
    medicine_availability_rating: 0,
    price_fairness_rating: 0,
    service_quality_rating: 0,
    staff_knowledge_rating: 0,
    license_status_rating: 0,
  });
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const ratingCategories = [
    { key: "medicine_availability_rating", label: "Medicine Availability" },
    { key: "price_fairness_rating", label: "Price Fairness" },
    { key: "service_quality_rating", label: "Service Quality" },
    { key: "staff_knowledge_rating", label: "Staff Knowledge" },
    { key: "license_status_rating", label: "License Status" },
  ];

  const handleRatingChange = (category: string, rating: number) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if at least one rating is provided
    const hasRating = Object.values(ratings).some(rating => rating > 0);
    if (!hasRating) {
      toast({
        title: "Error",
        description: "Please provide at least one rating",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to rate a pharmacy",
          variant: "destructive",
        });
        return;
      }

      // Prepare rating data with null for unrated categories
      const ratingData = {
        pharmacy_id: pharmacy.id,
        user_id: user.id,
        medicine_availability_rating: ratings.medicine_availability_rating || null,
        price_fairness_rating: ratings.price_fairness_rating || null,
        service_quality_rating: ratings.service_quality_rating || null,
        staff_knowledge_rating: ratings.staff_knowledge_rating || null,
        license_status_rating: ratings.license_status_rating || null,
        review_text: reviewText || null,
      };

      const { error } = await supabase
        .from("pharmacy_ratings")
        .upsert([ratingData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your rating has been submitted successfully",
      });

      // Reset form
      setRatings({
        medicine_availability_rating: 0,
        price_fairness_rating: 0,
        service_quality_rating: 0,
        staff_knowledge_rating: 0,
        license_status_rating: 0,
      });
      setReviewText("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-400"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {pharmacy.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {ratingCategories.map((category) => (
              <div key={category.key} className="space-y-2">
                <Label>{category.label}</Label>
                <StarRating
                  rating={ratings[category.key as keyof typeof ratings]}
                  onRatingChange={(rating) => handleRatingChange(category.key, rating)}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Review (Optional)</Label>
            <Textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this pharmacy..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}