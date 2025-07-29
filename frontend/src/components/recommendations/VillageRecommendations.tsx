import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Star, X, MapPin, Users, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VillageRecommendation {
  id: string;
  village_id: string;
  recommendation_type: string;
  confidence_score: number;
  reason: string;
  village?: {
    name: string;
    region: string;
  };
}

export const VillageRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<VillageRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('village_recommendations')
        .select(`
          *,
          village:villages(name, region)
        `)
        .limit(5);
      
      setRecommendations((data as any) || []);
    } catch (error) {
      console.error('Error fetching village recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleVillageClick = (villageId: string, recommendationId: string) => {
    markClicked(recommendationId);
    navigate(`/villages/${villageId}`);
  };

  const markClicked = async (recommendationId: string) => {
    try {
      await supabase
        .from('village_recommendations')
        .update({ is_clicked: true })
        .eq('id', recommendationId);
    } catch (error) {
      console.error('Error marking recommendation as clicked:', error);
    }
  };

  const dismissRecommendation = async (recommendationId: string) => {
    try {
      await supabase
        .from('village_recommendations')
        .delete()
        .eq('id', recommendationId);
      
      setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  };

  const refreshRecommendations = () => {
    fetchRecommendations();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Recommended Villages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Recommended Villages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No recommendations yet. Explore some villages to get personalized suggestions!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'similar_interests':
        return <Star className="h-4 w-4" />;
      case 'popular_in_region':
        return <MapPin className="h-4 w-4" />;
      case 'trending':
        return <Users className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'similar_interests':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'popular_in_region':
        return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'trending':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended Villages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="group relative border rounded-lg p-4 hover:shadow-md transition-all duration-200"
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => dismissRecommendation(rec.id)}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">
                      {rec.village?.name || 'Unknown Village'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {rec.village?.region && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {rec.village.region}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={getRecommendationColor(rec.recommendation_type)}
                    >
                      {getRecommendationIcon(rec.recommendation_type)}
                      <span className="ml-1 text-xs">
                        {Math.round(rec.confidence_score * 100)}% match
                      </span>
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {rec.reason}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {rec.recommendation_type.replace('_', ' ').toUpperCase()}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleVillageClick(rec.village_id, rec.id)}
                    className="shrink-0"
                  >
                    Visit Village
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};