import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface Politician {
  id: string;
  name: string;
  bio?: string;
  region?: string;
  role_title?: string;
  party?: string;
  profile_image_url?: string;
  civic_score: number;
  verified: boolean;
  level_of_office?: string;
  constituency?: string;
  contact_office?: string;
  contact_website?: string;
  contact_phone?: string;
  integrity_rating: number;
  development_impact_rating: number;
  transparency_rating: number;
  performance_score: number;
  political_party_id?: string;
  follower_count: number;
  gender?: string;
  birth_date?: string;
  education?: string;
  career_background?: string;
  biography?: string;
  term_start_date?: string;
  term_end_date?: string;
  is_currently_in_office: boolean;
  term_status: string;
  created_at: string;
  updated_at: string;
}

export interface PoliticalParty {
  id: string;
  name: string;
  acronym?: string;
  logo_url?: string;
  founding_date?: string;
  headquarters_city?: string;
  headquarters_region?: string;
  official_website?: string;
  contact_email?: string;
  contact_phone?: string;
  party_president?: string;
  vice_president?: string;
  secretary_general?: string;
  mps_count: number;
  senators_count: number;
  mayors_count: number;
  mission?: string;
  vision?: string;
  ideology?: string;
  political_leaning?: string;
  approval_rating: number;
  transparency_rating: number;
  development_rating: number;
  trust_rating: number;
  total_ratings: number;
  is_active: boolean;
  slug?: string;
  created_at: string;
  updated_at: string;
}

// Politicians Hooks
export const usePoliticians = (filters?: {
  region?: string;
  party?: string;
  level_of_office?: string;
  term_status?: string;
  limit?: number;
  offset?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['politicians', filters],
    queryFn: async () => {
      let query = supabase
        .from('politicians')
        .select(`
          *,
          political_parties!political_party_id (
            id,
            name,
            acronym,
            logo_url
          )
        `)
        .order('performance_score', { ascending: false });

      if (filters?.region) {
        query = query.eq('region', filters.region);
      }
      if (filters?.party) {
        query = query.eq('party', filters.party);
      }
      if (filters?.level_of_office) {
        query = query.eq('level_of_office', filters.level_of_office);
      }
      if (filters?.term_status) {
        query = query.eq('term_status', filters.term_status);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%,role_title.ilike.%${filters.search}%`);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const usePolitician = (id: string) => {
  return useQuery({
    queryKey: ['politician', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('politicians')
        .select(`
          *,
          political_parties!political_party_id (
            id,
            name,
            acronym,
            logo_url,
            official_website
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const usePoliticianBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['politician-slug', slug],
    queryFn: async () => {
      // Since the current politicians table doesn't have a slug column, 
      // we'll generate one from the name for now
      const { data, error } = await supabase
        .from('politicians')
        .select(`
          *,
          political_parties!political_party_id (
            id,
            name,
            acronym,
            logo_url,
            official_website
          )
        `)
        .eq('name', slug.replace(/-/g, ' '))
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};

// Political Parties Hooks
export const usePoliticalParties = (filters?: {
  region?: string;
  political_leaning?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: 'name' | 'approval_rating' | 'mps_count' | 'founded_date';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['political-parties', filters],
    queryFn: async () => {
      let query = supabase
        .from('political_parties')
        .select('*');

      if (filters?.region) {
        query = query.eq('headquarters_region', filters.region);
      }
      if (filters?.political_leaning) {
        query = query.eq('political_leaning', filters.political_leaning);
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,mission.ilike.%${filters.search}%,ideology.ilike.%${filters.search}%`);
      }

      // Sort
      const sortBy = filters?.sortBy || 'approval_rating';
      const sortOrder = filters?.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const usePoliticalParty = (id: string) => {
  return useQuery({
    queryKey: ['political-party', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('political_parties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const usePoliticalPartyBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['political-party-slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('political_parties')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};

export const usePoliticalPartyMembers = (partyId: string) => {
  return useQuery({
    queryKey: ['political-party-members', partyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('politicians')
        .select('*')
        .eq('political_party_id', partyId)
        .eq('is_currently_in_office', true)
        .order('performance_score', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!partyId,
  });
};

// Stats and Analytics
export const usePoliticalStats = () => {
  return useQuery({
    queryKey: ['political-stats'],
    queryFn: async () => {
      const [politiciansRes, partiesRes, activeTermsRes] = await Promise.all([
        supabase.from('politicians').select('id').eq('is_currently_in_office', true),
        supabase.from('political_parties').select('id').eq('is_active', true),
        supabase.from('politicians').select('id, term_status').eq('term_status', 'active'),
      ]);

      if (politiciansRes.error) throw politiciansRes.error;
      if (partiesRes.error) throw partiesRes.error;
      if (activeTermsRes.error) throw activeTermsRes.error;

      return {
        totalPoliticians: politiciansRes.data?.length || 0,
        activePoliticians: activeTermsRes.data?.length || 0,
        totalParties: partiesRes.data?.length || 0,
      };
    },
  });
};

export const useTopRatedPoliticians = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-rated-politicians', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('politicians')
        .select(`
          id,
          name,
          profile_image_url,
          role_title,
          region,
          party,
          performance_score,
          transparency_rating,
          integrity_rating,
          is_currently_in_office,
          political_parties!political_party_id (
            name,
            acronym,
            logo_url
          )
        `)
        .eq('is_currently_in_office', true)
        .order('performance_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
};

// Mutations
export const useFollowPolitician = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ politicianId }: { politicianId: string }) => {
      // This would typically insert into a politician_follows table
      // For now, we'll increment the follower_count
      const { data, error } = await supabase.rpc('increment_politician_followers', {
        politician_id: politicianId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { politicianId }) => {
      queryClient.invalidateQueries({ queryKey: ['politician', politicianId] });
      toast.success('Following politician!');
    },
    onError: (error) => {
      toast.error('Failed to follow politician: ' + error.message);
    },
  });
};

export const useRatePolitician = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rating: {
      politicianId: string;
      overall_rating: number;
      transparency_rating?: number;
      integrity_rating?: number;
      effectiveness_rating?: number;
      review_content?: string;
    }) => {
      // Insert rating (this would need a politician_ratings table)
      const { data, error } = await supabase
        .from('politician_detailed_ratings')
        .insert([{
          politician_id: rating.politicianId,
          overall_rating: rating.overall_rating,
          transparency_rating: rating.transparency_rating,
          integrity_rating: rating.integrity_rating,
          effectiveness_rating: rating.effectiveness_rating,
          review_content: rating.review_content,
        }]);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { politicianId }) => {
      queryClient.invalidateQueries({ queryKey: ['politician', politicianId] });
      toast.success('Rating submitted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to submit rating: ' + error.message);
    },
  });
};