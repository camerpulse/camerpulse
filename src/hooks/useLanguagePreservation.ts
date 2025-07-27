import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LanguageEntry {
  id: string;
  village_id: string;
  user_id: string;
  language_name: string;
  language_code?: string;
  entry_type: 'word' | 'phrase' | 'story' | 'song' | 'proverb';
  local_term: string;
  pronunciation?: string;
  audio_pronunciation?: string;
  french_translation?: string;
  english_translation?: string;
  context_usage?: string;
  grammatical_notes?: string;
  cultural_context?: string;
  example_sentences: any[];
  related_terms?: string[];
  etymology?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  is_endangered: boolean;
  speaker_generation?: string;
  contributor_name?: string;
  contributor_role?: string;
  verification_status: 'pending' | 'verified' | 'flagged';
  verified_by?: string;
  verified_at?: string;
  views_count: number;
  practice_count: number;
  created_at: string;
  updated_at: string;
}

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
        })
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