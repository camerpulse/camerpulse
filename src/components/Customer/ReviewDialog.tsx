import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
}

export const ReviewDialog = ({ open, onOpenChange, orderId }: ReviewDialogProps) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: orderItems, isLoading } = useQuery({
    queryKey: ['order-items-for-review', orderId],
    queryFn: async () => {
      if (!orderId) return [];

      const { data, error } = await supabase
        .from('marketplace_order_items')
        .select(`
          *,
          marketplace_products (
            id,
            name,
            image_url
          )
        `)
        .eq('order_id', orderId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!orderId,
  });

  const submitReviewsMutation = useMutation({
    mutationFn: async () => {
      if (!user || !orderId) throw new Error('Missing user or order');

      const reviews = orderItems?.map(item => ({
        user_id: user.id,
        product_id: item.product_id,
        order_id: orderId,
        rating: ratings[item.product_id] || 5,
        comment: comments[item.product_id] || '',
      }));

      if (!reviews || reviews.length === 0) {
        throw new Error('No reviews to submit');
      }

      const { error } = await supabase
        .from('marketplace_reviews')
        .insert(reviews);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Reviews submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['eligible-orders-for-review'] });
      onOpenChange(false);
      setRatings({});
      setComments({});
    },
    onError: (error) => {
      toast.error('Failed to submit reviews');
      console.error('Error submitting reviews:', error);
    },
  });

  const handleRatingChange = (productId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [productId]: rating }));
  };

  const handleCommentChange = (productId: string, comment: string) => {
    setComments(prev => ({ ...prev, [productId]: comment }));
  };

  const handleSubmit = () => {
    submitReviewsMutation.mutate();
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Write Review</DialogTitle>
          </DialogHeader>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write Reviews</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {orderItems?.map((item) => {
            const product = item.marketplace_products;
            const currentRating = ratings[product.id] || 0;
            
            return (
              <div key={item.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center space-x-4">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Rating</Label>
                  <div className="flex items-center space-x-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(product.id, star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= currentRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor={`comment-${product.id}`} className="text-sm font-medium">
                    Comment (optional)
                  </Label>
                  <Textarea
                    id={`comment-${product.id}`}
                    placeholder="Share your experience with this product..."
                    value={comments[product.id] || ''}
                    onChange={(e) => handleCommentChange(product.id, e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            );
          })}

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={submitReviewsMutation.isPending}
            >
              {submitReviewsMutation.isPending ? 'Submitting...' : 'Submit Reviews'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};