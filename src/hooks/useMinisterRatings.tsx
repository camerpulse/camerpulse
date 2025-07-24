import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MinisterRating {
  id?: string;
  minister_id: string;
  user_id?: string;
  overall_rating: number;
  leadership_rating?: number;
  transparency_rating?: number;
  responsiveness_rating?: number;
  effectiveness_rating?: number;
  comment?: string;
  is_anonymous: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useMinisterRatings = (ministerId: string) => {
  return useQuery({
    queryKey: ['minister-ratings', ministerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('minister_ratings')
        .select('*')
        .eq('minister_id', ministerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MinisterRating[];
    },
    enabled: !!ministerId
  });
};

export const useUserMinisterRating = (ministerId: string) => {
  return useQuery({
    queryKey: ['user-minister-rating', ministerId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('minister_ratings')
        .select('*')
        .eq('minister_id', ministerId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as MinisterRating | null;
    },
    enabled: !!ministerId
  });
};

export const useRateMinister = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rating: MinisterRating) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to rate a minister');

      const ratingData = {
        ...rating,
        user_id: user.id,
        ip_address: '127.0.0.1' // In production, get real IP
      };

      const { data, error } = await supabase
        .from('minister_ratings')
        .upsert(ratingData, {
          onConflict: 'minister_id,user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['minister-ratings', data.minister_id] });
      queryClient.invalidateQueries({ queryKey: ['user-minister-rating', data.minister_id] });
      
      toast({
        title: "Rating Submitted",
        description: "Your minister rating has been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Rating Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};