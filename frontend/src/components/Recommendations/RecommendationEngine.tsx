import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/Marketplace/ProductCard';
import { Sparkles, TrendingUp, Heart, Star, ShoppingBag, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Recommendation {
  id: string;
  product_id: string;
  recommendation_type: string;
  confidence_score: number;
  reason_tags: string[];
  is_clicked: boolean;
  is_purchased: boolean;
  created_at: string;
  marketplace_products: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    description?: string;
    rating?: number;
    vendor: {
      business_name: string;
    };
  };
}

interface RecommendationEngineProps {
  maxRecommendations?: number;
  showHeader?: boolean;
}

export const RecommendationEngine = ({ 
  maxRecommendations = 6, 
  showHeader = true 
}: RecommendationEngineProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch personalized recommendations
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['product-recommendations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('product_recommendations')
        .select(`
          *,
          marketplace_products (
            *,
            marketplace_vendors (business_name)
          )
        `)
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('confidence_score', { ascending: false })
        .limit(maxRecommendations);

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  // Track user behavior
  const trackBehaviorMutation = useMutation({
    mutationFn: async ({ 
      actionType, 
      targetType, 
      targetId, 
      contextData 
    }: {
      actionType: string;
      targetType: string;
      targetId: string;
      contextData?: any;
    }) => {
      if (!user) return;

      const { error } = await supabase
        .from('user_behavior_tracking')
        .insert({
          user_id: user.id,
          action_type: actionType,
          target_type: targetType,
          target_id: targetId,
          context_data: contextData || {},
          session_id: sessionStorage.getItem('session_id') || 'anonymous',
        });

      if (error) throw error;
    },
  });

  // Update recommendation click status
  const updateRecommendationMutation = useMutation({
    mutationFn: async ({ recommendationId, updates }: { 
      recommendationId: string; 
      updates: Partial<Recommendation> 
    }) => {
      const { error } = await supabase
        .from('product_recommendations')
        .update(updates)
        .eq('id', recommendationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-recommendations'] });
    },
  });

  // Generate recommendations based on user behavior
  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      // This would typically call an AI service or edge function
      // For now, we'll create some basic recommendations based on popular products
      const { data: popularProducts } = await supabase
        .from('marketplace_products')
        .select(`
          *,
          marketplace_vendors (business_name)
        `)
        .eq('in_stock', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (popularProducts && user) {
        const recommendationsToInsert = popularProducts.map(product => ({
          user_id: user.id,
          product_id: product.id,
          recommendation_type: 'trending',
          confidence_score: Math.random() * 0.5 + 0.5, // Random confidence between 0.5-1.0
          reason_tags: ['trending', 'popular'],
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        }));

        const { error } = await supabase
          .from('product_recommendations')
          .upsert(recommendationsToInsert, {
            onConflict: 'user_id,product_id',
            ignoreDuplicates: true,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-recommendations'] });
      toast.success('Recommendations updated based on your interests!');
    },
  });

  const handleProductClick = (recommendation: Recommendation) => {
    // Track click behavior
    trackBehaviorMutation.mutate({
      actionType: 'product_click',
      targetType: 'product',
      targetId: recommendation.product_id,
      contextData: {
        recommendation_type: recommendation.recommendation_type,
        confidence_score: recommendation.confidence_score,
      },
    });

    // Update recommendation click status
    updateRecommendationMutation.mutate({
      recommendationId: recommendation.id,
      updates: { is_clicked: true },
    });
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'trending':
        return <TrendingUp className="w-4 h-4" />;
      case 'similar':
        return <Star className="w-4 h-4" />;
      case 'wishlist':
        return <Heart className="w-4 h-4" />;
      case 'viewed':
        return <Eye className="w-4 h-4" />;
      case 'purchased':
        return <ShoppingBag className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getRecommendationLabel = (type: string) => {
    switch (type) {
      case 'trending':
        return 'Trending';
      case 'similar':
        return 'Similar to your interests';
      case 'wishlist':
        return 'From your wishlist';
      case 'viewed':
        return 'Recently viewed';
      case 'purchased':
        return 'You might also like';
      default:
        return 'Recommended';
    }
  };

  // Auto-generate recommendations if user has none
  useEffect(() => {
    if (user && recommendations && recommendations.length === 0) {
      generateRecommendationsMutation.mutate();
    }
  }, [user, recommendations]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>Personalized Recommendations</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateRecommendationsMutation.mutate()}
              disabled={generateRecommendationsMutation.isPending}
            >
              Generate Recommendations
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
            <p className="text-muted-foreground mb-4">
              Browse products to get personalized recommendations
            </p>
            <Button
              onClick={() => generateRecommendationsMutation.mutate()}
              disabled={generateRecommendationsMutation.isPending}
            >
              Get Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Sparkles className="w-6 h-6" />
              <span>Recommended for You</span>
            </h2>
            <p className="text-muted-foreground">
              Personalized product suggestions based on your interests
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateRecommendationsMutation.mutate()}
            disabled={generateRecommendationsMutation.isPending}
          >
            Refresh
          </Button>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recommendation) => (
          <div key={recommendation.id} className="relative">
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="secondary" className="flex items-center space-x-1">
                {getRecommendationIcon(recommendation.recommendation_type)}
                <span className="text-xs">
                  {getRecommendationLabel(recommendation.recommendation_type)}
                </span>
              </Badge>
            </div>
            
            <div 
              onClick={() => handleProductClick(recommendation)}
              className="cursor-pointer"
            >
              <ProductCard 
                product={{
                  ...recommendation.marketplace_products,
                  vendor_id: recommendation.marketplace_products.vendor_id || '',
                  vendor: recommendation.marketplace_products.marketplace_vendors || { business_name: 'Unknown Vendor' }
                }} 
              />
            </div>

            {recommendation.confidence_score > 0.8 && (
              <div className="absolute top-2 right-2 z-10">
                <Badge variant="default" className="text-xs">
                  {Math.round(recommendation.confidence_score * 100)}% match
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};