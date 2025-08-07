import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TraditionalLeader {
  id: string;
  full_name: string;
  title: string;
  village_id?: string;
  region: string;
  division?: string;
  subdivision?: string;
  gender?: string;
  accession_date?: string;
  biography?: string;
  portrait_url?: string;
  overall_rating: number;
  total_ratings: number;
  is_verified: boolean;
  status: string;
  slug: string;
  villages?: {
    village_name: string;
  };
}

export const useTraditionalLeaders = () => {
  const [leaders, setLeaders] = useState<TraditionalLeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('traditional_leaders')
        .select(`
          *,
          villages:village_id(village_name)
        `)
        .eq('status', 'active')
        .order('overall_rating', { ascending: false });

      if (error) throw error;
      setLeaders(data || []);
    } catch (error) {
      console.error('Error fetching traditional leaders:', error);
      setError('Failed to load traditional leaders');
      toast.error('Failed to load traditional leaders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  return { leaders, loading, error, refetch: fetchLeaders };
};

export const useTraditionalLeaderBySlug = (slug: string) => {
  const [leader, setLeader] = useState<TraditionalLeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeader = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('traditional_leaders')
          .select(`
            *,
            villages:village_id(village_name)
          `)
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setLeader(data);
      } catch (error) {
        console.error('Error fetching traditional leader:', error);
        setError('Leader not found');
      } finally {
        setLoading(false);
      }
    };

    fetchLeader();
  }, [slug]);

  return { leader, loading, error };
};