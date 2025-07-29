import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyRatingData {
  avg_overall_rating: number;
  avg_reliability_rating: number;
  avg_speed_rating: number;
  avg_customer_service_rating: number;
  avg_pricing_rating: number;
  avg_packaging_rating: number;
  total_reviews: number;
}

export interface UserRating {
  id: string;
  overall_rating: number;
  reliability_rating?: number;
  speed_rating?: number;
  customer_service_rating?: number;
  pricing_rating?: number;
  packaging_rating?: number;
  review_text?: string;
  created_at: string;
}

export const useShippingCompanyRatings = (companyId: string) => {
  const [ratingData, setRatingData] = useState<CompanyRatingData | null>(null);
  const [userRating, setUserRating] = useState<UserRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get aggregated ratings using the database function
      const { data: aggregatedData, error: aggregatedError } = await supabase
        .rpc('calculate_company_ratings', { company_uuid: companyId });

      if (aggregatedError) {
        console.error('Error fetching aggregated ratings:', aggregatedError);
        setError('Failed to load company ratings');
        return;
      }

      if (aggregatedData && aggregatedData.length > 0) {
        setRatingData(aggregatedData[0]);
      } else {
        setRatingData({
          avg_overall_rating: 0,
          avg_reliability_rating: 0,
          avg_speed_rating: 0,
          avg_customer_service_rating: 0,
          avg_pricing_rating: 0,
          avg_packaging_rating: 0,
          total_reviews: 0
        });
      }

      // Get current user's rating if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userRatingData, error: userRatingError } = await supabase
          .from('shipping_company_ratings')
          .select('*')
          .eq('company_id', companyId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (userRatingError && userRatingError.code !== 'PGRST116') {
          console.error('Error fetching user rating:', userRatingError);
        } else {
          setUserRating(userRatingData);
        }
      }

    } catch (err) {
      console.error('Error in fetchRatings:', err);
      setError('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  const refreshRatings = () => {
    fetchRatings();
  };

  useEffect(() => {
    if (companyId) {
      fetchRatings();
    }
  }, [companyId]);

  return {
    ratingData,
    userRating,
    loading,
    error,
    refreshRatings
  };
};

export const useRecentCompanyReviews = (companyId: string, limit: number = 5) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('shipping_company_ratings')
          .select(`
            id,
            overall_rating,
            review_text,
            created_at,
            user_id
          `)
          .eq('company_id', companyId)
          .not('review_text', 'is', null)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error fetching reviews:', error);
          return;
        }

        setReviews(data || []);
      } catch (err) {
        console.error('Error in fetchRecentReviews:', err);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchRecentReviews();
    }
  }, [companyId, limit]);

  return { reviews, loading };
};