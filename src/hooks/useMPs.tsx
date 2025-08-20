import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/utils/auth';

export interface MP {
  id: string;
  full_name: string;
  constituency?: string;
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
  bills_sponsored: number;
  parliament_attendance: number;
  term_start_date?: string;
  term_end_date?: string;
  media_appearances: number;
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
  legislative_activity_score: number;
  view_count: number;
  follower_count: number;
  can_receive_messages: boolean;
  created_at: string;
  updated_at: string;
}

export interface MPRating {
  id: string;
  mp_id: string;
  user_id: string;
  overall_rating: number;
  transparency_rating?: number;
  civic_engagement_rating?: number;
  crisis_response_rating?: number;
  promise_delivery_rating?: number;
  legislative_activity_rating?: number;
  comment?: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

// Hook to fetch all MPs
export function useMPs() {
  return useQuery({
    queryKey: ['mps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mps')
        .select(`
          *, 
          political_parties!political_party_id (
            id, name, acronym, logo_url, party_president, official_website
          )
        `)
        .order('average_rating', { ascending: false });

      if (error) throw error;
      return data as MP[];
    },
  });
}

// Hook to fetch a single MP
export function useMP(id: string) {
  return useQuery({
    queryKey: ['mp', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mps')
        .select(`
          *, 
          political_parties!political_party_id (
            id, name, acronym, logo_url, party_president, official_website
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as MP;
    },
    enabled: !!id,
  });
}

// Hook to fetch MP ratings
export function useMPRatings(mpId: string) {
  return useQuery({
    queryKey: ['mp-ratings', mpId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mp_ratings')
        .select('*')
        .eq('mp_id', mpId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MPRating[];
    },
    enabled: !!mpId,
  });
}

// Hook to get user's rating for a specific MP
export function useUserMPRating(mpId: string) {
  return useQuery({
    queryKey: ['user-mp-rating', mpId],
    queryFn: async () => {
      const user = await AuthService.getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('mp_ratings')
        .select('*')
        .eq('mp_id', mpId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as MPRating | null;
    },
    enabled: !!mpId,
  });
}

// Hook to rate an MP
export function useRateMP() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (rating: {
      mp_id: string;
      overall_rating: number;
      transparency_rating?: number;
      civic_engagement_rating?: number;
      crisis_response_rating?: number;
      promise_delivery_rating?: number;
      legislative_activity_rating?: number;
      comment?: string;
      is_anonymous?: boolean;
    }) => {
      const user = await AuthService.requireAuth('You must be logged in to rate an MP');

      const { data, error } = await supabase
        .from('mp_ratings')
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
      queryClient.invalidateQueries({ queryKey: ['mp-ratings', data.mp_id] });
      queryClient.invalidateQueries({ queryKey: ['user-mp-rating', data.mp_id] });
      queryClient.invalidateQueries({ queryKey: ['mp', data.mp_id] });
      queryClient.invalidateQueries({ queryKey: ['mps'] });
      toast({
        title: "Rating submitted",
        description: "Your MP rating has been saved successfully.",
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

// Hook to follow/unfollow an MP
export function useMPFollowing(mpId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: isFollowing, isLoading } = useQuery({
    queryKey: ['mp-following', mpId],
    queryFn: async () => {
      const user = await AuthService.getCurrentUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('mp_followers')
        .select('id')
        .eq('mp_id', mpId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!mpId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const user = await AuthService.requireAuth('You must be logged in to follow an MP');

      const { error } = await supabase
        .from('mp_followers')
        .insert({
          mp_id: mpId,
          user_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mp-following', mpId] });
      toast({
        title: "Following MP",
        description: "You are now following this MP.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error following MP",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      const user = await AuthService.requireAuth('You must be logged in to unfollow an MP');

      const { error } = await supabase
        .from('mp_followers')
        .delete()
        .eq('mp_id', mpId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mp-following', mpId] });
      toast({
        title: "Unfollowed MP",
        description: "You are no longer following this MP.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error unfollowing MP",
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