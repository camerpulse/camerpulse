import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type LanguageEntry = Database['public']['Tables']['language_preservation']['Row'];

export const useLanguagePreservation = (villageId: string) => {
  const [entries, setEntries] = useState<LanguageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('language_preservation')
        .select('*')
        .eq('village_id', villageId)
        .eq('verification_status', 'verified')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries((data as LanguageEntry[]) || []);
    } catch (error) {
      console.error('Error fetching language entries:', error);
      toast({
        title: "Error",
        description: "Failed to load language preservation entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitEntry = async (entryData: Partial<LanguageEntry>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to submit language entries",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('language_preservation')
        .insert({
          ...entryData,
          village_id: villageId,
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setEntries(prev => [data as LanguageEntry, ...prev]);
      toast({
        title: "Success",
        description: "Language entry submitted successfully",
      });

      return data;
    } catch (error) {
      console.error('Error submitting language entry:', error);
      toast({
        title: "Error",
        description: "Failed to submit language entry",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEntry = async (id: string, updates: Partial<LanguageEntry>) => {
    try {
      const { data, error } = await supabase
        .from('language_preservation')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setEntries(prev => prev.map(entry => 
        entry.id === id ? data as LanguageEntry : entry
      ));

      toast({
        title: "Success",
        description: "Language entry updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating language entry:', error);
      toast({
        title: "Error",
        description: "Failed to update language entry",
        variant: "destructive",
      });
      throw error;
    }
  };

  const incrementPractice = async (id: string) => {
    try {
      const entry = entries.find(e => e.id === id);
      if (entry) {
        await supabase
          .from('language_preservation')
          .update({ practice_count: entry.practice_count + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error incrementing practice count:', error);
    }
  };

  useEffect(() => {
    if (villageId) {
      fetchEntries();
    }
  }, [villageId]);

  return {
    entries,
    loading,
    submitEntry,
    updateEntry,
    incrementPractice,
    refetch: fetchEntries,
  };
};