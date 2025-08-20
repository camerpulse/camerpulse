import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PoliticalPartyMember {
  id: string;
  name: string;
  role: string;
  region: string;
  political_party_id: string;
  political_party: {
    id: string;
    name: string;
    acronym: string;
    logo_url: string;
  };
  avatar_url?: string;
  is_claimed?: boolean;
  entity_type: 'politician' | 'senator' | 'mp' | 'minister';
}

export const usePoliticalPartyMembers = (partyId: string) => {
  return useQuery({
    queryKey: ['political-party-members', partyId],
    queryFn: async () => {
      if (!partyId) return null;

      const [politiciansRes, senatorsRes, mpsRes, ministersRes] = await Promise.all([
        supabase
          .from('politicians')
          .select(`
            id, name, role, region, political_party_id, avatar_url, is_claimed,
            political_parties!inner(id, name, acronym, logo_url)
          `)
          .eq('political_party_id', partyId),

        supabase
          .from('senators')
          .select(`
            id, name, role, region, political_party_id, avatar_url, is_claimed,
            political_parties!inner(id, name, acronym, logo_url)
          `)
          .eq('political_party_id', partyId),

        supabase
          .from('mps')
          .select(`
            id, name, role, region, political_party_id, avatar_url, is_claimed,
            political_parties!inner(id, name, acronym, logo_url)
          `)
          .eq('political_party_id', partyId),

        supabase
          .from('ministers')
          .select(`
            id, name, role, region, political_party_id, avatar_url, is_claimed,
            political_parties!inner(id, name, acronym, logo_url)
          `)
          .eq('political_party_id', partyId)
      ]);

      const politicians = (politiciansRes.data || []).map(p => ({ ...p, entity_type: 'politician' as const }));
      const senators = (senatorsRes.data || []).map(s => ({ ...s, entity_type: 'senator' as const }));
      const mps = (mpsRes.data || []).map(m => ({ ...m, entity_type: 'mp' as const }));
      const ministers = (ministersRes.data || []).map(m => ({ ...m, entity_type: 'minister' as const }));

      return {
        politicians,
        senators,
        mps,
        ministers,
        allMembers: [...politicians, ...senators, ...mps, ...ministers] as PoliticalPartyMember[],
        totalMembers: politicians.length + senators.length + mps.length + ministers.length
      };
    },
    enabled: !!partyId
  });
};

export const usePoliticianPartyInfo = (politicianId: string, entityType: 'politician' | 'senator' | 'mp' | 'minister') => {
  return useQuery({
    queryKey: ['politician-party-info', politicianId, entityType],
    queryFn: async () => {
      if (!politicianId || !entityType) return null;

      const tableName = entityType === 'politician' ? 'politicians' : 
                       entityType === 'senator' ? 'senators' :
                       entityType === 'mp' ? 'mps' : 'ministers';

      const { data, error } = await supabase
        .from(tableName)
        .select(`
          id, name, political_party_id,
          political_parties(id, name, acronym, logo_url, is_claimed)
        `)
        .eq('id', politicianId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!politicianId && !!entityType
  });
};