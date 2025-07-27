import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ReviewStars } from '@/components/Marketplace/ReviewStars';
import { ReviewDialog } from './ReviewDialog';
import { Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export const CustomerReviews = () => {
  const { user } = useAuth();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: eligibleOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['eligible-orders-for-review', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('marketplace_orders')
        .select(`
          id,
          order_number,
          created_at,
          marketplace_order_items (
            id,
            marketplace_products (
              id,
              name,
              image_url
            )
          ),
          marketplace_vendors (
            id,
            business_name
          )
        `)
        .eq('customer_email', user.email)
        .eq('order_status', 'delivered')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out orders that already have reviews
      const ordersWithoutReviews = [];
      for (const order of data || []) {
        const { data: existingReviews } = await supabase
          .from('marketplace_reviews')
          .select('id')
          .eq('order_id', order.id)
          .eq('user_id', user.id);

        if (!existingReviews || existingReviews.length === 0) {
          ordersWithoutReviews.push(order);
        }
      }

      return ordersWithoutReviews;
    },
    enabled: !!user,
  });

  const { data: myReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['my-reviews', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('marketplace_reviews')
        .select(`
          *,
          marketplace_products (
            name,
            image_url
          ),
          marketplace_vendors (
            business_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const handleWriteReview = (orderId: string) => {
    setSelectedOrderId(orderId);
    setReviewDialogOpen(true);
  };

  if (ordersLoading || reviewsLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Reviews</h2>
        <p className="text-muted-foreground">Rate and review your purchases</p>
      </div>

      {/* Orders pending review */}
      {eligibleOrders && eligibleOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Write Reviews</CardTitle>
            <CardDescription>
              You have {eligibleOrders.length} delivered order(s) waiting for your review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eligibleOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Order #{order.order_number}</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.marketplace_vendors?.business_name} • 
                      Delivered on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.marketplace_order_items?.length} item(s)
                    </p>
                  </div>
                  <Button onClick={() => handleWriteReview(order.id)}>
                    <Star className="w-4 h-4 mr-2" />
                    Write Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My existing reviews */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">My Reviews</h3>
        
        {myReviews?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
              <p className="text-muted-foreground">
                Complete your orders to start writing reviews!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myReviews?.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {review.marketplace_products?.image_url && (
                      <img
                        src={review.marketplace_products.image_url}
                        alt={review.marketplace_products.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">
                          {review.marketplace_products?.name}
                        </h4>
                        <div className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {review.marketplace_vendors?.business_name}
                      </p>
                      
                      <div className="mb-3">
                        <ReviewStars rating={review.rating} />
                      </div>
                      
                      {review.comment && (
                        <p className="text-sm">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        orderId={selectedOrderId}
      />
    </div>
  );
};