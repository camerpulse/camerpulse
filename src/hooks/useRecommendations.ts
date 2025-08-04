import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseRecommendationsProps {
  userId?: string;
  productId?: string;
  recommendationType?: 'general' | 'cross_sell' | 'trending' | 'similar_users';
  limit?: number;
}

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

export function useRecommendations({
  userId,
  productId,
  recommendationType = 'general',
  limit = 10
}: UseRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [metadata, setMetadata] = useState<RecommendationMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abTestGroup, setAbTestGroup] = useState<string>('control');

  // Get A/B test group
  useEffect(() => {
    const getAbTestGroup = async () => {
      try {
        const { data: config } = await supabase
          .from('ab_test_configs')
          .select('traffic_allocation')
          .eq('test_name', 'recommendation_algorithm_test')
          .eq('is_active', true)
          .maybeSingle();

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
      } catch (err) {
        console.error('Error getting A/B test config:', err);
      }
    };

    getAbTestGroup();
  }, []);

  // Fetch recommendations
  const fetchRecommendations = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-marketplace-recommendations', {
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

      if (functionError) throw functionError;

      setRecommendations(data.recommendations || []);
      setMetadata(data.metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Track recommendation events
  const trackClick = async (clickedProductId: string) => {
    if (!userId) return;

    try {
      // Update the most recent recommendation event
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

      // Track product view
      await supabase.rpc('increment_product_view', {
        p_product_id: clickedProductId,
        p_user_id: userId,
        p_session_id: `session_${Date.now()}`
      });
    } catch (err) {
      console.error('Error tracking recommendation click:', err);
    }
  };

  const trackConversion = async (productId: string, conversionValue: number) => {
    if (!userId) return;

    try {
      await supabase
        .from('recommendation_events')
        .update({
          converted: true,
          conversion_value: conversionValue
        })
        .eq('user_id', userId)
        .eq('clicked_product_id', productId)
        .eq('recommendation_type', recommendationType);
    } catch (err) {
      console.error('Error tracking conversion:', err);
    }
  };

  // Real-time updates for recommendations
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('recommendation-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'marketplace_orders',
          filter: `buyer_id=eq.${userId}`
        },
        () => {
          // Refresh recommendations when user makes a purchase
          fetchRecommendations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    if (userId && abTestGroup) {
      fetchRecommendations();
    }
  }, [userId, productId, recommendationType, abTestGroup]);

  return {
    recommendations,
    metadata,
    loading,
    error,
    abTestGroup,
    refetch: fetchRecommendations,
    trackClick,
    trackConversion
  };
}