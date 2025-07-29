import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CulturalHeritage {
  id: string;
  village_id: string;
  contributor_user_id: string;
  title: string;
  description: string;
  heritage_type: string;
  category: string;
  historical_period: string | null;
  significance_level: string;
  media_urls: any;
  documentation: any;
  related_knowledge_ids: any;
  preservation_status: string;
  threats: any;
  preservation_actions: any;
  community_involvement: string | null;
  expert_validation: any;
  views_count: number;
  likes_count: number;
  is_featured: boolean;
  visibility: string;
  created_at: string;
  updated_at: string;
}

export const useCulturalHeritage = (villageId: string) => {
  const [heritage, setHeritage] = useState<CulturalHeritage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHeritage = async () => {
    try {
      const { data, error } = await supabase
        .from('village_cultural_heritage')
        .select('*')
        .eq('village_id', villageId)
        .eq('visibility', 'public')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHeritage(data || []);
    } catch (error) {
      console.error('Error fetching cultural heritage:', error);
      toast({
        title: "Error",
        description: "Failed to load cultural heritage",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const contributeHeritage = async (heritageData: Partial<CulturalHeritage>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to contribute heritage",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('village_cultural_heritage')
        .insert({
          village_id: villageId,
          contributor_user_id: user.id,
          title: heritageData.title || '',
          description: heritageData.description || '',
          ...heritageData,
        });

      if (error) throw error;

      await fetchHeritage();
      toast({
        title: "Success",
        description: "Heritage contribution submitted successfully",
      });
      return true;
    } catch (error) {
      console.error('Error contributing heritage:', error);
      toast({
        title: "Error",
        description: "Failed to contribute heritage",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateHeritage = async (id: string, updates: Partial<CulturalHeritage>) => {
    try {
      const { error } = await supabase
        .from('village_cultural_heritage')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchHeritage();
      toast({
        title: "Success",
        description: "Heritage updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating heritage:', error);
      toast({
        title: "Error",
        description: "Failed to update heritage",
        variant: "destructive",
      });
      return false;
    }
  };

  const incrementViews = async (id: string) => {
    try {
      const { error } = await supabase
        .from('village_cultural_heritage')
        .update({ 
          views_count: heritage.find(h => h.id === id)?.views_count + 1 || 1 
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  const toggleLike = async (id: string) => {
    try {
      const item = heritage.find(h => h.id === id);
      if (!item) return;

      const { error } = await supabase
        .from('village_cultural_heritage')
        .update({ 
          likes_count: item.likes_count + 1
        })
        .eq('id', id);

      if (error) throw error;
      await fetchHeritage();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  useEffect(() => {
    if (villageId) {
      fetchHeritage();
    }
  }, [villageId]);

  return {
    heritage,
    loading,
    contributeHeritage,
    updateHeritage,
    incrementViews,
    toggleLike,
    refetch: fetchHeritage,
  };
};