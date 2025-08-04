import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, MessageSquare, Flag, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReputationCardProps {
  entityType: 'politician' | 'ministry' | 'government_agency' | 'political_party' | 'civil_society_org' | 'media_outlet' | 'election_event' | 'policy_document' | 'government_statement';
  entityId: string;
  entityName: string;
  showFullDetails?: boolean;
  onRateClick?: () => void;
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
  last_calculated_at: string;
}

const ReputationCard: React.FC<ReputationCardProps> = ({
  entityType,
  entityId,
  entityName,
  showFullDetails = false,
  onRateClick
}) => {
  const [reputationData, setReputationData] = useState<ReputationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReputationData();
  }, [entityType, entityId]);

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

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'excellent': return 'bg-green-500 text-white';
      case 'trusted': return 'bg-blue-500 text-white';
      case 'under_watch': return 'bg-yellow-500 text-white';
      case 'flagged': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'excellent': return <Award className="h-3 w-3" />;
      case 'trusted': return <Star className="h-3 w-3" />;
      case 'under_watch': return <Flag className="h-3 w-3" />;
      case 'flagged': return <Flag className="h-3 w-3" />;
      default: return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({ 
    rating, 
    size = 'sm' 
  }) => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4'
    };

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reputationData) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No ratings yet</p>
            {onRateClick && (
              <Button size="sm" className="mt-2" onClick={onRateClick}>
                Be the first to rate
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showFullDetails) {
    // Mini reputation card
    return (
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`text-2xl font-bold ${getScoreColor(reputationData.total_score)}`}>
                {reputationData.total_score.toFixed(1)}
              </div>
              <div>
                <Badge className={`${getBadgeColor(reputationData.reputation_badge)} text-xs`}>
                  {getBadgeIcon(reputationData.reputation_badge)}
                  <span className="ml-1">
                    {reputationData.reputation_badge.replace('_', ' ').toUpperCase()}
                  </span>
                </Badge>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={Math.round(reputationData.average_rating)} />
                  <span className="text-xs text-muted-foreground">
                    ({reputationData.total_ratings})
                  </span>
                </div>
              </div>
            </div>
            {onRateClick && (
              <Button size="sm" variant="outline" onClick={onRateClick}>
                Rate
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full reputation card
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Civic Reputation</span>
          <Badge className={getBadgeColor(reputationData.reputation_badge)}>
            {getBadgeIcon(reputationData.reputation_badge)}
            <span className="ml-1">
              {reputationData.reputation_badge.replace('_', ' ').toUpperCase()}
            </span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(reputationData.total_score)} mb-2`}>
            {reputationData.total_score.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <StarRating rating={Math.round(reputationData.average_rating)} size="md" />
            <span className="text-muted-foreground">
              ({reputationData.total_ratings} reviews)
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(reputationData.last_calculated_at).toLocaleDateString()}
          </p>
        </div>

        {/* Component Scores */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Transparency</span>
              <span className="font-medium">{reputationData.transparency_score.toFixed(1)}</span>
            </div>
            <Progress value={reputationData.transparency_score} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Performance</span>
              <span className="font-medium">{reputationData.performance_score.toFixed(1)}</span>
            </div>
            <Progress value={reputationData.performance_score} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Citizen Rating</span>
              <span className="font-medium">{reputationData.citizen_rating_score.toFixed(1)}</span>
            </div>
            <Progress value={reputationData.citizen_rating_score} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Engagement</span>
              <span className="font-medium">{reputationData.engagement_score.toFixed(1)}</span>
            </div>
            <Progress value={reputationData.engagement_score} className="h-2" />
          </div>
        </div>

        {/* Rating Distribution */}
        <div>
          <h4 className="font-medium mb-3">Rating Distribution</h4>
          <div className="space-y-2">
            {[
              { stars: 5, count: reputationData.five_star_count },
              { stars: 4, count: reputationData.four_star_count },
              { stars: 3, count: reputationData.three_star_count },
              { stars: 2, count: reputationData.two_star_count },
              { stars: 1, count: reputationData.one_star_count },
            ].map(({ stars, count }) => {
              const percentage = reputationData.total_ratings > 0 
                ? (count / reputationData.total_ratings) * 100 
                : 0;
              
              return (
                <div key={stars} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{stars}★</span>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        {onRateClick && (
          <div className="flex gap-2">
            <Button onClick={onRateClick} className="flex-1">
              <Star className="h-4 w-4 mr-2" />
              Rate This {entityType.replace('_', ' ')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReputationCard;