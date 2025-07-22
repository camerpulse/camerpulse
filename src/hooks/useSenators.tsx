import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Senator {
  id: string;
  name: string;
  full_name?: string;
  position: string;
  photo_url?: string;
  about?: string;
  email?: string;
  phone?: string;
  region?: string;
  constituency?: string;
  party_affiliation?: string;
  political_party?: string;
  years_of_service: number;
  committee_memberships: any[];
  social_media_links: any;
  is_verified: boolean;
  status: string;
  average_rating: number;
  total_ratings: number;
  performance_score?: number;
  transparency_score?: number;
  civic_engagement_score?: number;
  badges?: string[];
  bills_proposed_count?: number;
  bills_passed_count?: number;
  career_history?: any[];
  education?: any[];
  date_of_birth?: string;
  official_senate_url?: string;
  created_at: string;
  updated_at: string;
  
  // Extended senator fields
  is_claimable?: boolean;
  is_claimed?: boolean;
  claimed_at?: string;
  claimed_by?: string;
  claim_fee_paid?: boolean;
  claim_payment_reference?: string;
  claim_documents_url?: string[];
  claim_status?: 'unclaimed' | 'pending' | 'approved' | 'rejected';
  verification_notes?: string;
  last_scraped_at?: string;
  scrape_source?: string;
  trust_score?: number;
  misconduct_reports_count?: number;
  profile_completeness_score?: number;
  last_activity_at?: string;
  follower_count?: number;
  engagement_score?: number;
  response_rate?: number;
  senate_id?: string;
  term_start_date?: string;
  term_end_date?: string;
  timeline_events?: any[];
  achievements?: any[];
  media_mentions_count?: number;
  can_receive_messages?: boolean;
  message_response_time_hours?: number;
  auto_imported?: boolean;
}

export interface SenatorRating {
  id?: string;
  senator_id: string;
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

export const useSenators = () => {
  return useQuery({
    queryKey: ['senators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('senators')
        .select('*')
        .eq('status', 'active')
        .order('average_rating', { ascending: false });
      
      if (error) throw error;
      return data as Senator[];
    }
  });
};

export const useSenator = (id: string) => {
  return useQuery({
    queryKey: ['senator', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('senators')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Senator;
    },
    enabled: !!id
  });
};

export const useSenatorRatings = (senatorId: string) => {
  return useQuery({
    queryKey: ['senator-ratings', senatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('senator_ratings')
        .select('*')
        .eq('senator_id', senatorId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SenatorRating[];
    },
    enabled: !!senatorId
  });
};

export const useUserSenatorRating = (senatorId: string) => {
  return useQuery({
    queryKey: ['user-senator-rating', senatorId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('senator_ratings')
        .select('*')
        .eq('senator_id', senatorId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as SenatorRating | null;
    },
    enabled: !!senatorId
  });
};

export const useRateSenator = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rating: SenatorRating) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to rate a senator');

      const ratingData = {
        ...rating,
        user_id: user.id,
        ip_address: '127.0.0.1' // In production, get real IP
      };

      const { data, error } = await supabase
        .from('senator_ratings')
        .upsert(ratingData, {
          onConflict: 'senator_id,user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['senators'] });
      queryClient.invalidateQueries({ queryKey: ['senator', data.senator_id] });
      queryClient.invalidateQueries({ queryKey: ['senator-ratings', data.senator_id] });
      queryClient.invalidateQueries({ queryKey: ['user-senator-rating', data.senator_id] });
      
      toast({
        title: "Rating Submitted",
        description: "Your senator rating has been saved successfully",
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

export const useImportSenators = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('import-senators');
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senators'] });
      toast({
        title: "Import Successful",
        description: "Senators data has been imported successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};