import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ElderKnowledge {
  id: string;
  village_id: string;
  elder_user_id: string;
  submitted_by_user_id: string | null;
  title: string;
  content: string;
  knowledge_type: string;
  category: string;
  language: string;
  audio_url: string | null;
  video_url: string | null;
  images: any;
  tags: any;
  verification_status: string;
  verified_by: string | null;
  verified_at: string | null;
  views_count: number;
  preservation_priority: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const useElderKnowledge = (villageId: string) => {
  const [knowledge, setKnowledge] = useState<ElderKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchKnowledge = async () => {
    try {
      const { data, error } = await supabase
        .from('village_elder_knowledge')
        .select('*')
        .eq('village_id', villageId)
        .eq('is_public', true)
        .order('verification_status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKnowledge(data || []);
    } catch (error) {
      console.error('Error fetching elder knowledge:', error);
      toast({
        title: "Error",
        description: "Failed to load elder knowledge",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitKnowledge = async (knowledgeData: Partial<ElderKnowledge>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit knowledge",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('village_elder_knowledge')
        .insert({
          village_id: villageId,
          submitted_by_user_id: user.id,
          elder_user_id: knowledgeData.elder_user_id || user.id,
          title: knowledgeData.title || '',
          content: knowledgeData.content || '',
          ...knowledgeData,
        });

      if (error) throw error;

      await fetchKnowledge();
      toast({
        title: "Success",
        description: "Knowledge submitted successfully",
      });
      return true;
    } catch (error) {
      console.error('Error submitting knowledge:', error);
      toast({
        title: "Error",
        description: "Failed to submit knowledge",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateKnowledge = async (id: string, updates: Partial<ElderKnowledge>) => {
    try {
      const { error } = await supabase
        .from('village_elder_knowledge')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchKnowledge();
      toast({
        title: "Success",
        description: "Knowledge updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating knowledge:', error);
      toast({
        title: "Error",
        description: "Failed to update knowledge",
        variant: "destructive",
      });
      return false;
    }
  };

  const incrementViews = async (id: string) => {
    try {
      const { error } = await supabase
        .from('village_elder_knowledge')
        .update({ 
          views_count: knowledge.find(k => k.id === id)?.views_count + 1 || 1 
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  useEffect(() => {
    if (villageId) {
      fetchKnowledge();
    }
  }, [villageId]);

  return {
    knowledge,
    loading,
    submitKnowledge,
    updateKnowledge,
    incrementViews,
    refetch: fetchKnowledge,
  };
};