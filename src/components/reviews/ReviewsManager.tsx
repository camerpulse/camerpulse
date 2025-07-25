import React, { useState, useEffect } from 'react';
import { Plus, Filter, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { EmployerReviewForm } from './EmployerReviewForm';
import { ExpertReviewForm } from './ExpertReviewForm';
import { ReviewDisplayCard } from './ReviewDisplayCard';
import { supabase } from '@/integrations/supabase/client';

interface ReviewsManagerProps {
  entityId: string;
  entityType: 'employer' | 'expert';
  canAddReview?: boolean;
  canRespond?: boolean;
}

export const ReviewsManager: React.FC<ReviewsManagerProps> = ({
  entityId,
  entityType,
  canAddReview = true,
  canRespond = false
}) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    recommendationRate: 0
  });

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [entityId, entityType, sortBy, filterRating]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const tableName = entityType === 'employer' ? 'employer_reviews' : 'expert_performance_reviews';
      const entityField = entityType === 'employer' ? 'employer_id' : 'expert_id';
      
      // Build query step by step to avoid type inference issues
      let query = supabase
        .from(tableName as any)
        .select('*')
        .eq(entityField, entityId)
        .eq('status', 'active');

      // Apply filters
      if (filterRating !== 'all') {
        query = query.eq('overall_rating', parseInt(filterRating));
      }

      // Apply sorting
      const orderColumn = sortBy === 'rating' ? 'overall_rating' : 'created_at';
      const ascending = sortBy === 'rating' ? false : sortBy === 'oldest';
      query = query.order(orderColumn, { ascending });

      const { data, error } = await query;
      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const tableName = entityType === 'employer' ? 'employer_reviews' : 'expert_performance_reviews';
      const entityField = entityType === 'employer' ? 'employer_id' : 'expert_id';
      
      const { data, error } = await supabase
        .from(tableName)
        .select('overall_rating, would_recommend')
        .eq(entityField, entityId)
        .eq('status', 'active');

      if (error) throw error;
      
      if (data && data.length > 0) {
        const totalReviews = data.length;
        const averageRating = data.reduce((sum, review) => sum + review.overall_rating, 0) / totalReviews;
        const recommendations = data.filter(review => review.would_recommend === true).length;
        const recommendationRate = recommendations / totalReviews * 100;
        
        setStats({
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          recommendationRate: Math.round(recommendationRate)
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    fetchReviews();
    fetchStats();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reviews & Ratings</CardTitle>
            {canAddReview && (
              <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Write Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  {entityType === 'employer' ? (
                    <EmployerReviewForm
                      employerId={entityId}
                      onReviewSubmitted={handleReviewSubmitted}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  ) : (
                    <ExpertReviewForm
                      expertId={entityId}
                      onReviewSubmitted={handleReviewSubmitted}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {renderStars(Math.round(stats.averageRating))}
                <span className="text-2xl font-bold">{stats.averageRating}</span>
              </div>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{stats.totalReviews}</div>
              <p className="text-muted-foreground">Total Reviews</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{stats.recommendationRate}%</div>
              <p className="text-muted-foreground">Would Recommend</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter & Sort:</span>
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground">
                Be the first to share your experience and help others make informed decisions.
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <ReviewDisplayCard
              key={review.id}
              review={review}
              reviewType={entityType === 'employer' ? 'employer_review' : 'expert_review'}
              canRespond={canRespond}
              entityId={entityId}
              onReviewUpdated={fetchReviews}
            />
          ))
        )}
      </div>
    </div>
  );
};