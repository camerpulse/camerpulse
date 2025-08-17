import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Minister {
  id: string;
  full_name: string;
  position_title: string;
  ministry: string;
  political_party?: string;
  political_party_id?: string;
  political_parties?: {
    id: string;
    name: string;
    acronym?: string;
    logo_url?: string;
    party_president?: string;
    official_website?: string;
  };
  region?: string;
  date_of_birth?: string;
  education?: string;
  profile_picture_url?: string;
  career_timeline: any[];
  term_start_date?: string;
  term_end_date?: string;
  email?: string;
  phone?: string;
  village_hometown?: string;
  official_profile_url?: string;
  is_claimed: boolean;
  claimed_by?: string;
  is_verified: boolean;
  average_rating: number;
  total_ratings: number;
  transparency_score: number;
  civic_engagement_score: number;
  crisis_response_score: number;
  promise_delivery_score: number;
  performance_score: number;
  view_count: number;
  follower_count: number;
  can_receive_messages: boolean;
  created_at: string;
  updated_at: string;
}

export interface MinisterRating {
  id: string;
  minister_id: string;
  user_id: string;
  overall_rating: number;
  transparency_rating?: number;
  civic_engagement_rating?: number;
  crisis_response_rating?: number;
  promise_delivery_rating?: number;
  performance_rating?: number;
  comment?: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

// Hook to fetch all Ministers
export function useMinisters() {
  return useQuery({
    queryKey: ['ministers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ministers')
        .select(`
          *, 
          political_parties!political_party_id (
            id, name, acronym, logo_url, party_president, official_website
          )
        `)
        .order('average_rating', { ascending: false });

      if (error) throw error;
      return data as Minister[];
    },
  });
}

// Hook to fetch a single Minister
export function useMinister(id: string) {
  return useQuery({
    queryKey: ['minister', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ministers')
        .select(`
          *, 
          political_parties!political_party_id (
            id, name, acronym, logo_url, party_president, official_website
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Minister;
    },
    enabled: !!id,
  });
}

// Hook to fetch Minister ratings
export function useMinisterRatings(ministerId: string) {
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
    enabled: !!ministerId,
  });
}

// Hook to get user's rating for a specific Minister
export function useUserMinisterRating(ministerId: string) {
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
    enabled: !!ministerId,
  });
}

// Hook to rate a Minister
export function useRateMinister() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (rating: {
      minister_id: string;
      overall_rating: number;
      transparency_rating?: number;
      civic_engagement_rating?: number;
      crisis_response_rating?: number;
      promise_delivery_rating?: number;
      performance_rating?: number;
      comment?: string;
      is_anonymous?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to rate a Minister');

      const { data, error } = await supabase
        .from('minister_ratings')
        .upsert({
          ...rating,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['minister-ratings', data.minister_id] });
      queryClient.invalidateQueries({ queryKey: ['user-minister-rating', data.minister_id] });
      queryClient.invalidateQueries({ queryKey: ['minister', data.minister_id] });
      queryClient.invalidateQueries({ queryKey: ['ministers'] });
      toast({
        title: "Rating submitted",
        description: "Your Minister rating has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error submitting rating",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Hook to follow/unfollow a Minister
export function useMinisterFollowing(ministerId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: isFollowing, isLoading } = useQuery({
    queryKey: ['minister-following', ministerId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('minister_followers')
        .select('id')
        .eq('minister_id', ministerId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!ministerId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to follow a Minister');

      const { error } = await supabase
        .from('minister_followers')
        .insert({
          minister_id: ministerId,
          user_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minister-following', ministerId] });
      toast({
        title: "Following Minister",
        description: "You are now following this Minister.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error following Minister",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to unfollow a Minister');

      const { error } = await supabase
        .from('minister_followers')
        .delete()
        .eq('minister_id', ministerId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minister-following', ministerId] });
      toast({
        title: "Unfollowed Minister",
        description: "You are no longer following this Minister.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error unfollowing Minister",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    isFollowing: isFollowing || false,
    isLoading,
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    isFollowPending: followMutation.isPending,
    isUnfollowPending: unfollowMutation.isPending,
  };
}