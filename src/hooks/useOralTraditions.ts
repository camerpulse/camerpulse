import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type OralTradition = Database['public']['Tables']['oral_traditions']['Row'];

export { type OralTradition };

export const useOralTraditions = (villageId: string) => {
  const [traditions, setTraditions] = useState<OralTradition[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTraditions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('oral_traditions')
        .select('*')
        .eq('village_id', villageId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTraditions((data as OralTradition[]) || []);
    } catch (error) {
      console.error('Error fetching oral traditions:', error);
      toast({
        title: "Error",
        description: "Failed to load oral traditions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitTradition = async (traditionData: Partial<OralTradition>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to submit oral traditions",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('oral_traditions')
        .insert({
          ...traditionData,
          village_id: villageId,
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setTraditions(prev => [data as OralTradition, ...prev]);
      toast({
        title: "Success",
        description: "Oral tradition submitted successfully",
      });

      return data;
    } catch (error) {
      console.error('Error submitting oral tradition:', error);
      toast({
        title: "Error",
        description: "Failed to submit oral tradition",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTradition = async (id: string, updates: Partial<OralTradition>) => {
    try {
      const { data, error } = await supabase
        .from('oral_traditions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTraditions(prev => prev.map(tradition => 
        tradition.id === id ? data as OralTradition : tradition
      ));

      toast({
        title: "Success",
        description: "Oral tradition updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating oral tradition:', error);
      toast({
        title: "Error",
        description: "Failed to update oral tradition",
        variant: "destructive",
      });
      throw error;
    }
  };

  const incrementViews = async (id: string) => {
    try {
      await supabase
        .from('oral_traditions')
        .update({ views_count: traditions.find(t => t.id === id)?.views_count + 1 })
        .eq('id', id);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  useEffect(() => {
    if (villageId) {
      fetchTraditions();
    }
  }, [villageId]);

  return {
    traditions,
    loading,
    submitTradition,
    updateTradition,
    incrementViews,
    refetch: fetchTraditions,
  };
};