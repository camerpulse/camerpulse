import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, MessageSquare, Flag, User, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RatingSystemProps {
  entityType: 'ministry' | 'council' | 'elected_official' | 'appointed_official' | 'hospital' | 'school' | 'pharmacy' | 'village' | 'project' | 'petition_owner';
  entityId: string;
  entityName: string;
  region?: string;
  onRatingSubmitted?: () => void;
}

interface Rating {
  id: string;
  overall_rating: number;
  transparency_rating?: number;
  performance_rating?: number;
  engagement_rating?: number;
  comment?: string;
  is_verified: boolean;
  created_at: string;
  user_id: string;
}

interface ReputationData {
  total_score: number;
  reputation_badge: string;
  total_ratings: number;
  average_rating: number;
  transparency_score: number;
  performance_score: number;
  citizen_rating_score: number;
  engagement_score: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
}

const RatingSystem: React.FC<RatingSystemProps> = ({
  entityType,
  entityId,
  entityName,
  region,
  onRatingSubmitted
}) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [reputationData, setReputationData] = useState<ReputationData | null>(null);
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Rating form state
  const [overallRating, setOverallRating] = useState(0);
  const [transparencyRating, setTransparencyRating] = useState(0);
  const [performanceRating, setPerformanceRating] = useState(0);
  const [engagementRating, setEngagementRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    checkUser();
    fetchRatings();
    fetchReputationData();
  }, [entityType, entityId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('civic_entity_ratings')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setRatings(data || []);

      // Check if current user has already rated
      if (user) {
        const existingRating = data?.find(r => r.user_id === user.id);
        setUserRating(existingRating || null);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const fetchReputationData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('civic_reputation_scores')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setReputationData(data);
    } catch (error) {
      console.error('Error fetching reputation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async () => {
    if (!user) {
      toast.error('Please log in to submit a rating');
      return;
    }

    if (overallRating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    setSubmitting(true);

    try {
      const ratingData = {
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        user_id: user.id,
        overall_rating: overallRating,
        transparency_rating: transparencyRating > 0 ? transparencyRating : null,
        performance_rating: performanceRating > 0 ? performanceRating : null,
        engagement_rating: engagementRating > 0 ? engagementRating : null,
        comment: comment.trim() || null,
        region: region || null
      };

      let result;
      if (userRating) {
        // Update existing rating
        result = await supabase
          .from('civic_entity_ratings')
          .update(ratingData)
          .eq('id', userRating.id);
      } else {
        // Create new rating
        result = await supabase
          .from('civic_entity_ratings')
          .insert(ratingData);
      }

      if (result.error) throw result.error;

      toast.success(userRating ? 'Rating updated successfully!' : 'Rating submitted successfully!');
      
      // Reset form
      setOverallRating(0);
      setTransparencyRating(0);
      setPerformanceRating(0);
      setEngagementRating(0);
      setComment('');
      setShowRatingForm(false);

      // Refresh data
      fetchRatings();
      fetchReputationData();
      onRatingSubmitted?.();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating: React.FC<{
    rating: number;
    onRatingChange: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }> = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} cursor-pointer transition-colors ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-200'
            } ${readonly ? 'cursor-default' : ''}`}
            onClick={readonly ? undefined : () => onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'excellent': return 'bg-green-500';
      case 'trusted': return 'bg-blue-500';
      case 'under_watch': return 'bg-yellow-500';
      case 'flagged': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDistributionPercentage = (count: number, total: number) => {
    return total > 0 ? (count / total) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reputation Summary */}
      {reputationData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Reputation Score</span>
              <Badge className={`${getBadgeColor(reputationData.reputation_badge)} text-white`}>
                {reputationData.reputation_badge.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {reputationData.total_score.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <StarRating 
                      rating={Math.round(reputationData.average_rating)} 
                      onRatingChange={() => {}} 
                      readonly 
                    />
                    <span className="text-muted-foreground">
                      ({reputationData.total_ratings} reviews)
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Transparency</span>
                    <span className="font-semibold">{reputationData.transparency_score.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Performance</span>
                    <span className="font-semibold">{reputationData.performance_score.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Citizen Rating</span>
                    <span className="font-semibold">{reputationData.citizen_rating_score.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Engagement</span>
                    <span className="font-semibold">{reputationData.engagement_score.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Rating Distribution</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reputationData[`${['five', 'four', 'three', 'two', 'one'][5 - stars]}_star_count` as keyof ReputationData] as number;
                    const percentage = getDistributionPercentage(count, reputationData.total_ratings);
                    
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-sm w-8">{stars}★</span>
                        <Progress value={percentage} className="flex-1" />
                        <span className="text-sm text-muted-foreground w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rating Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Rate This {entityType.replace('_', ' ')}</span>
            {user && (
              <Button
                variant={showRatingForm ? "outline" : "default"}
                onClick={() => setShowRatingForm(!showRatingForm)}
              >
                {userRating ? 'Update Rating' : 'Add Rating'}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        {showRatingForm && (
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Overall Rating *</label>
              <StarRating rating={overallRating} onRatingChange={setOverallRating} size="lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Transparency</label>
                <StarRating rating={transparencyRating} onRatingChange={setTransparencyRating} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Performance</label>
                <StarRating rating={performanceRating} onRatingChange={setPerformanceRating} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Engagement</label>
                <StarRating rating={engagementRating} onRatingChange={setEngagementRating} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={submitRating} disabled={submitting}>
                {submitting ? 'Submitting...' : (userRating ? 'Update Rating' : 'Submit Rating')}
              </Button>
              <Button variant="outline" onClick={() => setShowRatingForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ratings.length > 0 ? (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <StarRating rating={rating.overall_rating} onRatingChange={() => {}} readonly size="sm" />
                        {rating.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      {rating.comment && (
                        <p className="text-sm text-foreground mb-2">{rating.comment}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Anonymous User
                        </span>
                        <span>{new Date(rating.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No reviews yet. Be the first to rate!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RatingSystem;