import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Recommendation {
  id: string;
  village_id: string;
  recommendation_type: string;
  confidence_score: number;
  reason: string;
  metadata: any;
  is_clicked: boolean;
  is_dismissed: boolean;
  created_at: string;
  expires_at?: string;
  village?: any;
}

interface UserPreferences {
  preferred_regions: string[];
  interests: string[];
  activity_level: 'low' | 'moderate' | 'high';
}

export const useRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return;
      }

      setPreferences((data as UserPreferences) || {
        preferred_regions: [],
        interests: [],
        activity_level: 'moderate'
      });
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  }, [user]);

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('village_recommendations')
        .select(`
          *,
          village:villages!village_id(*)
        `)
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('confidence_score', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recommendations:', error);
        return;
      }

      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update user preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          ...newPreferences,
          last_updated: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating preferences:', error);
        return;
      }

      setPreferences(prev => ({ ...prev, ...newPreferences } as UserPreferences));
      
      // Trigger new recommendations generation
      await generateRecommendations();
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }, [user, preferences]);

  // Mark recommendation as clicked
  const markClicked = useCallback(async (recommendationId: string) => {
    try {
      await supabase
        .from('village_recommendations')
        .update({ is_clicked: true })
        .eq('id', recommendationId);

      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === recommendationId ? { ...rec, is_clicked: true } : rec
        )
      );
    } catch (error) {
      console.error('Error marking recommendation as clicked:', error);
    }
  }, []);

  // Dismiss recommendation
  const dismissRecommendation = useCallback(async (recommendationId: string) => {
    try {
      await supabase
        .from('village_recommendations')
        .update({ is_dismissed: true })
        .eq('id', recommendationId);

      setRecommendations(prev =>
        prev.filter(rec => rec.id !== recommendationId)
      );
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  }, []);

  // Generate new recommendations based on user behavior
  const generateRecommendations = useCallback(async () => {
    if (!user) return;

    try {
      // Call the AI recommendation engine
      const { data, error } = await supabase.functions.invoke('generate-village-recommendations', {
        body: { user_id: user.id }
      });

      if (error) {
        console.error('Error generating recommendations:', error);
        return;
      }

      // Refresh recommendations
      await fetchRecommendations();
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  }, [user, fetchRecommendations]);

  useEffect(() => {
    fetchPreferences();
    fetchRecommendations();
  }, [fetchPreferences, fetchRecommendations]);

  return {
    recommendations,
    preferences,
    loading,
    updatePreferences,
    markClicked,
    dismissRecommendation,
    generateRecommendations,
    refreshRecommendations: fetchRecommendations
  };
};