import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, MessageSquare, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  overall_rating: number;
  reliability_rating?: number;
  speed_rating?: number;
  customer_service_rating?: number;
  pricing_rating?: number;
  packaging_rating?: number;
  review_text?: string;
  created_at: string;
  user_id: string;
}

interface CompanyReviewsProps {
  companyId: string;
  reviews: Review[];
  loading: boolean;
}

export const CompanyReviews: React.FC<CompanyReviewsProps> = ({
  companyId,
  reviews,
  loading
}) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-secondary text-secondary'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
        <span className={`ml-2 font-medium ${getRatingColor(rating)}`}>
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground">
              Be the first to review this company and help others make informed decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Customer Reviews ({reviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border/50 pb-6 last:border-b-0 last:pb-0">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Customer Review</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {renderStars(review.overall_rating)}
                </div>
              </div>

              {/* Review Text */}
              {review.review_text && (
                <div className="mb-4">
                  <p className="text-foreground leading-relaxed">
                    "{review.review_text}"
                  </p>
                </div>
              )}

              {/* Detailed Ratings */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {review.reliability_rating && (
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Reliability</div>
                    <div className="font-semibold text-sm">{review.reliability_rating.toFixed(1)}</div>
                  </div>
                )}
                {review.speed_rating && (
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Speed</div>
                    <div className="font-semibold text-sm">{review.speed_rating.toFixed(1)}</div>
                  </div>
                )}
                {review.customer_service_rating && (
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Service</div>
                    <div className="font-semibold text-sm">{review.customer_service_rating.toFixed(1)}</div>
                  </div>
                )}
                {review.pricing_rating && (
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Pricing</div>
                    <div className="font-semibold text-sm">{review.pricing_rating.toFixed(1)}</div>
                  </div>
                )}
                {review.packaging_rating && (
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Packaging</div>
                    <div className="font-semibold text-sm">{review.packaging_rating.toFixed(1)}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};