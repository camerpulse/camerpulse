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

export const useAllRatings = () => {
  return useQuery({
    queryKey: ['all-ratings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_ratings')
        .select(`
          *,
          politicians(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(rating => ({
        ...rating,
        politician_name: rating.politicians?.name,
        is_flagged: false, // Add flagged status logic here
        admin_notes: null // Add admin notes if available
      }));
    }
  });
};

export const useModerateRating = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ratingId, action, adminNotes }: { 
      ratingId: string; 
      action: 'remove' | 'flag' | 'approve'; 
      adminNotes: string 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to moderate ratings');

      if (action === 'remove') {
        const { error } = await supabase
          .from('approval_ratings')
          .delete()
          .eq('id', ratingId);
        if (error) throw error;
      } else {
        // For flag/approve actions, you would update a moderation status
        // This depends on your database schema
        console.log(`${action} rating ${ratingId} with notes: ${adminNotes}`);
      }

      return { ratingId, action };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['all-ratings'] });
      
      const actionText = data.action === 'remove' ? 'removed' : data.action === 'flag' ? 'flagged' : 'approved';
      toast({
        title: "Rating Moderated",
        description: `Rating has been ${actionText} successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Moderation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
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