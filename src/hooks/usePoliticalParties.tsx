import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PoliticalParty {
  id: string;
  name: string;
  acronym: string;
  logo_url?: string;
  description?: string;
  founded_year?: number;
  ideology?: string;
  president_name?: string;
  headquarters?: string;
  website_url?: string;
  social_media?: any;
  member_count?: number;
  seats_national_assembly?: number;
  seats_senate?: number;
  is_ruling_party?: boolean;
  is_active?: boolean;
  slug?: string;
  created_at?: string;
  updated_at?: string;
}

export function usePoliticalParties() {
  return useQuery({
    queryKey: ['political-parties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('political_parties')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as PoliticalParty[];
    },
  });
}

export function usePoliticalParty(slug: string) {
  return useQuery({
    queryKey: ['political-party', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('political_parties')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as PoliticalParty;
    },
    enabled: !!slug,
  });
}

export function usePoliticalPartyMembers(partyId: string) {
  return useQuery({
    queryKey: ['political-party-members', partyId],
    queryFn: async () => {
      // Get all politicians from this party
      const [ministersResponse, mpsResponse, senatorsResponse] = await Promise.all([
        supabase
          .from('ministers')
          .select(`
            id, full_name, position_title, ministry, profile_picture_url,
            political_parties!inner(name, acronym, logo_url)
          `)
          .eq('political_party_id', partyId),
        
        supabase
          .from('mps')
          .select(`
            id, full_name, constituency, region, profile_picture_url,
            political_parties!inner(name, acronym, logo_url)
          `)
          .eq('political_party_id', partyId),
        
        supabase
          .from('senators')
          .select(`
            id, full_name, region, profile_picture_url,
            political_parties!inner(name, acronym, logo_url)
          `)
          .eq('political_party_id', partyId)
      ]);

      if (ministersResponse.error) throw ministersResponse.error;
      if (mpsResponse.error) throw mpsResponse.error;
      if (senatorsResponse.error) throw senatorsResponse.error;

      return {
        ministers: ministersResponse.data || [],
        mps: mpsResponse.data || [],
        senators: senatorsResponse.data || [],
        totalMembers: (ministersResponse.data?.length || 0) + 
                     (mpsResponse.data?.length || 0) + 
                     (senatorsResponse.data?.length || 0)
      };
    },
    enabled: !!partyId,
  });
}