import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { TrendingUp, Target, Users, Sparkles } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  rating?: number;
  vendor_id: string;
}

interface RecommendationMetadata {
  total_considered: number;
  collaborative_filtering: boolean;
  cross_selling: boolean;
  ab_test_group: string;
  ai_enhanced: boolean;
  recommendation_type: string;
}

interface MarketplaceRecommendationsProps {
  userId?: string;
  productId?: string;
  limit?: number;
  recommendationType?: 'general' | 'cross_sell' | 'trending' | 'similar_users';
}

export function MarketplaceRecommendations({
  userId,
  productId,
  limit = 8,
  recommendationType = 'general'
}: MarketplaceRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [metadata, setMetadata] = useState<RecommendationMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [abTestGroup, setAbTestGroup] = useState<string>('control');

  // Determine A/B test group on component mount
  useEffect(() => {
    const getAbTestGroup = async () => {
      try {
        const { data: config } = await supabase
          .from('ab_test_configs')
          .select('traffic_allocation')
          .eq('test_name', 'recommendation_algorithm_test')
          .eq('is_active', true)
          .single();

        if (config?.traffic_allocation) {
          const allocation = config.traffic_allocation as Record<string, number>;
          const random = Math.random() * 100;
          let cumulative = 0;
          
          for (const [group, percentage] of Object.entries(allocation)) {
            cumulative += percentage;
            if (random <= cumulative) {
              setAbTestGroup(group);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error getting A/B test config:', error);
      }
    };

    getAbTestGroup();
  }, []);

  // Track product views
  const trackProductView = async (productId: string) => {
    if (!userId) return;
    
    try {
      await supabase.rpc('increment_product_view', {
        p_product_id: productId,
        p_user_id: userId,
        p_session_id: `session_${Date.now()}`
      });
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-marketplace-recommendations', {
        body: {
          userId,
          productId,
          recommendationType,
          limit,
          includeCollaborative: true,
          includeCrossSell: true,
          abTestGroup
        }
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
      setMetadata(data.metadata);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Track recommendation click
  const trackRecommendationClick = async (clickedProductId: string) => {
    if (!userId) return;

    try {
      await supabase
        .from('recommendation_events')
        .update({
          clicked_product_id: clickedProductId,
          clicked_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('recommendation_type', recommendationType)
        .order('created_at', { ascending: false })
        .limit(1);

      await trackProductView(clickedProductId);
    } catch (error) {
      console.error('Error tracking recommendation click:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    }
  }, [userId, productId, recommendationType, abTestGroup]);

  // Get recommendation icon based on type
  const getRecommendationIcon = () => {
    switch (abTestGroup) {
      case 'personalized':
        return <Sparkles className="h-5 w-5" />;
      case 'trending':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  // Get recommendation title based on A/B test group
  const getRecommendationTitle = () => {
    switch (abTestGroup) {
      case 'personalized':
        return 'Personalized for You';
      case 'trending':
        return 'Trending Now';
      default:
        return 'Recommended Products';
    }
  };

  if (!userId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Sign in to see personalized recommendations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getRecommendationIcon()}
            {getRecommendationTitle()}
            {metadata?.ai_enhanced && (
              <Badge variant="secondary" className="ml-2">
                AI Enhanced
              </Badge>
            )}
          </CardTitle>
          {metadata && (
            <div className="flex gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {metadata.collaborative_filtering ? 'Collaborative' : 'Content-based'}
              </Badge>
              <Badge variant="outline">
                Group: {metadata.ab_test_group}
              </Badge>
              <Badge variant="outline">
                {metadata.total_considered} products analyzed
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-40 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No recommendations available right now</p>
              <Button 
                variant="outline" 
                onClick={fetchRecommendations}
                className="mt-4"
              >
                Refresh Recommendations
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map((product) => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => trackRecommendationClick(product.id)}
                >
                  <CardContent className="p-4">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-40 object-cover rounded-md mb-4"
                      />
                    )}
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'XAF'
                        }).format(product.price)}
                      </span>
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm">{product.rating}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {product.category}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* A/B Testing Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && metadata && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <pre>{JSON.stringify(metadata, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}