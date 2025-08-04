import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, Users, Award } from 'lucide-react';
import { CompanyRatingData } from '@/hooks/useShippingCompanyRatings';

interface RatingStatsProps {
  ratingData: CompanyRatingData | null;
  loading: boolean;
}

export const RatingStatistics: React.FC<RatingStatsProps> = ({ ratingData, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Rating Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ratingData || ratingData.total_reviews === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Rating Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Ratings Yet</h3>
            <p className="text-muted-foreground">
              This company hasn't been rated yet. Be the first to share your experience.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryRatings = [
    { label: 'Overall Experience', value: ratingData.avg_overall_rating, icon: Star },
    { label: 'Reliability', value: ratingData.avg_reliability_rating, icon: Award },
    { label: 'Delivery Speed', value: ratingData.avg_speed_rating, icon: TrendingUp },
    { label: 'Customer Service', value: ratingData.avg_customer_service_rating, icon: Users },
    { label: 'Pricing', value: ratingData.avg_pricing_rating, icon: Star },
    { label: 'Package Handling', value: ratingData.avg_packaging_rating, icon: Award }
  ].filter(category => category.value && category.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Rating Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center p-6 bg-gradient-to-br from-primary/5 via-primary/3 to-secondary/5 rounded-lg">
          <div className="text-4xl font-bold text-primary mb-2">
            {ratingData.avg_overall_rating.toFixed(1)}
          </div>
          <div className="flex justify-center items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= ratingData.avg_overall_rating
                    ? 'fill-secondary text-secondary'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Based on {ratingData.total_reviews} review{ratingData.total_reviews !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Category Breakdown
          </h4>
          {categoryRatings.map((category) => {
            const IconComponent = category.icon;
            const percentage = (category.value / 5) * 100;
            
            return (
              <div key={category.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {category.value.toFixed(1)}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">{ratingData.total_reviews}</div>
            <div className="text-xs text-muted-foreground">Total Reviews</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-secondary">
              {ratingData.avg_overall_rating >= 4.5 ? 'Excellent' : 
               ratingData.avg_overall_rating >= 3.5 ? 'Good' : 'Fair'}
            </div>
            <div className="text-xs text-muted-foreground">Rating Level</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};