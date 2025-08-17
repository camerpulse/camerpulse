import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PoliticalEntityWithParty {
  id: string;
  name: string;
  entity_type: 'senator' | 'minister' | 'mp' | 'politician';
  position: string;
  region?: string;
  political_party_id?: string;
  political_party?: {
    id: string;
    name: string;
    acronym?: string;
    logo_url?: string;
    party_president?: string;
    official_website?: string;
  };
  average_rating?: number;
  total_ratings?: number;
  transparency_score?: number;
  civic_engagement_score?: number;
  is_verified?: boolean;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PoliticalPartyWithMembers {
  id: string;
  name: string;
  acronym?: string;
  logo_url?: string;
  party_president?: string;
  official_website?: string;
  founded_date?: string;
  members: {
    senators: PoliticalEntityWithParty[];
    ministers: PoliticalEntityWithParty[];
    mps: PoliticalEntityWithParty[];
    politicians: PoliticalEntityWithParty[];
  };
  member_count: number;
}

// Hook to get all political entities with their party relationships
export function usePoliticalEntitiesWithParties() {
  return useQuery({
    queryKey: ['political-entities-with-parties'],
    queryFn: async () => {
      const entities: PoliticalEntityWithParty[] = [];

      // Fetch senators with party info
      const { data: senators, error: senatorsError } = await supabase
        .from('senators')
        .select(`
          id, full_name, region, political_party_id, average_rating, total_ratings,
          transparency_score, civic_engagement_score, is_verified, profile_picture_url,
          created_at, updated_at,
          political_parties!political_party_id (
            id, name, acronym, logo_url, party_president, official_website
          )
        `);

      if (senatorsError) throw senatorsError;

      senators?.forEach(senator => {
        entities.push({
          id: senator.id,
          name: senator.full_name,
          entity_type: 'senator',
          position: 'Senator',
          region: senator.region,
          political_party_id: senator.political_party_id,
          political_party: senator.political_parties,
          average_rating: senator.average_rating,
          total_ratings: senator.total_ratings,
          transparency_score: senator.transparency_score,
          civic_engagement_score: senator.civic_engagement_score,
          is_verified: senator.is_verified,
          profile_picture_url: senator.profile_picture_url,
          created_at: senator.created_at,
          updated_at: senator.updated_at,
        });
      });

      // Fetch ministers with party info
      const { data: ministers, error: ministersError } = await supabase
        .from('ministers')
        .select(`
          id, full_name, position_title, region, political_party_id, average_rating, total_ratings,
          transparency_score, civic_engagement_score, is_verified, profile_picture_url,
          created_at, updated_at,
          political_parties!political_party_id (
            id, name, acronym, logo_url, party_president, official_website
          )
        `);

      if (ministersError) throw ministersError;

      ministers?.forEach(minister => {
        entities.push({
          id: minister.id,
          name: minister.full_name,
          entity_type: 'minister',
          position: minister.position_title,
          region: minister.region,
          political_party_id: minister.political_party_id,
          political_party: minister.political_parties,
          average_rating: minister.average_rating,
          total_ratings: minister.total_ratings,
          transparency_score: minister.transparency_score,
          civic_engagement_score: minister.civic_engagement_score,
          is_verified: minister.is_verified,
          profile_picture_url: minister.profile_picture_url,
          created_at: minister.created_at,
          updated_at: minister.updated_at,
        });
      });

      // Fetch MPs with party info
      const { data: mps, error: mpsError } = await supabase
        .from('mps')
        .select(`
          id, full_name, constituency, region, political_party_id, average_rating, total_ratings,
          transparency_score, civic_engagement_score, is_verified, profile_picture_url,
          created_at, updated_at,
          political_parties!political_party_id (
            id, name, acronym, logo_url, party_president, official_website
          )
        `);

      if (mpsError) throw mpsError;

      mps?.forEach(mp => {
        entities.push({
          id: mp.id,
          name: mp.full_name,
          entity_type: 'mp',
          position: mp.constituency,
          region: mp.region,
          political_party_id: mp.political_party_id,
          political_party: mp.political_parties,
          average_rating: mp.average_rating,
          total_ratings: mp.total_ratings,
          transparency_score: mp.transparency_score,
          civic_engagement_score: mp.civic_engagement_score,
          is_verified: mp.is_verified,
          profile_picture_url: mp.profile_picture_url,
          created_at: mp.created_at,
          updated_at: mp.updated_at,
        });
      });

      // Fetch politicians with party info
      const { data: politicians, error: politiciansError } = await supabase
        .from('politicians')
        .select(`
          id, name, position, region, political_party_id, average_rating, total_ratings,
          transparency_score, civic_engagement_score, is_verified, photo_url,
          created_at, updated_at,
          political_parties!political_party_id (
            id, name, acronym, logo_url, party_president, official_website
          )
        `);

      if (politiciansError) throw politiciansError;

      politicians?.forEach(politician => {
        entities.push({
          id: politician.id,
          name: politician.name,
          entity_type: 'politician',
          position: politician.position,
          region: politician.region,
          political_party_id: politician.political_party_id,
          political_party: politician.political_parties,
          average_rating: politician.average_rating,
          total_ratings: politician.total_ratings,
          transparency_score: politician.transparency_score,
          civic_engagement_score: politician.civic_engagement_score,
          is_verified: politician.is_verified,
          profile_picture_url: politician.photo_url,
          created_at: politician.created_at,
          updated_at: politician.updated_at,
        });
      });

      return entities;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get a political party with all its members
export function usePoliticalPartyWithMembers(partyId: string) {
  return useQuery({
    queryKey: ['political-party-with-members', partyId],
    queryFn: async () => {
      // Fetch party info
      const { data: party, error: partyError } = await supabase
        .from('political_parties')
        .select('*')
        .eq('id', partyId)
        .single();

      if (partyError) throw partyError;

      const members = {
        senators: [] as PoliticalEntityWithParty[],
        ministers: [] as PoliticalEntityWithParty[],
        mps: [] as PoliticalEntityWithParty[],
        politicians: [] as PoliticalEntityWithParty[],
      };

      // Fetch senators of this party
      const { data: senators } = await supabase
        .from('senators')
        .select('*')
        .eq('political_party_id', partyId);

      senators?.forEach(senator => {
        members.senators.push({
          id: senator.id,
          name: senator.full_name,
          entity_type: 'senator',
          position: 'Senator',
          region: senator.region,
          political_party_id: senator.political_party_id,
          political_party: party,
          average_rating: senator.average_rating,
          total_ratings: senator.total_ratings,
          transparency_score: senator.transparency_score,
          civic_engagement_score: senator.civic_engagement_score,
          is_verified: senator.is_verified,
          profile_picture_url: senator.profile_picture_url,
          created_at: senator.created_at,
          updated_at: senator.updated_at,
        });
      });

      // Fetch ministers of this party
      const { data: ministers } = await supabase
        .from('ministers')
        .select('*')
        .eq('political_party_id', partyId);

      ministers?.forEach(minister => {
        members.ministers.push({
          id: minister.id,
          name: minister.full_name,
          entity_type: 'minister',
          position: minister.position_title,
          region: minister.region,
          political_party_id: minister.political_party_id,
          political_party: party,
          average_rating: minister.average_rating,
          total_ratings: minister.total_ratings,
          transparency_score: minister.transparency_score,
          civic_engagement_score: minister.civic_engagement_score,
          is_verified: minister.is_verified,
          profile_picture_url: minister.profile_picture_url,
          created_at: minister.created_at,
          updated_at: minister.updated_at,
        });
      });

      // Fetch MPs of this party
      const { data: mps } = await supabase
        .from('mps')
        .select('*')
        .eq('political_party_id', partyId);

      mps?.forEach(mp => {
        members.mps.push({
          id: mp.id,
          name: mp.full_name,
          entity_type: 'mp',
          position: mp.constituency,
          region: mp.region,
          political_party_id: mp.political_party_id,
          political_party: party,
          average_rating: mp.average_rating,
          total_ratings: mp.total_ratings,
          transparency_score: mp.transparency_score,
          civic_engagement_score: mp.civic_engagement_score,
          is_verified: mp.is_verified,
          profile_picture_url: mp.profile_picture_url,
          created_at: mp.created_at,
          updated_at: mp.updated_at,
        });
      });

      // Fetch politicians of this party
      const { data: politicians } = await supabase
        .from('politicians')
        .select('*')
        .eq('political_party_id', partyId);

      politicians?.forEach(politician => {
        members.politicians.push({
          id: politician.id,
          name: politician.name,
          entity_type: 'politician',
          position: politician.position,
          region: politician.region,
          political_party_id: politician.political_party_id,
          political_party: party,
          average_rating: politician.average_rating,
          total_ratings: politician.total_ratings,
          transparency_score: politician.transparency_score,
          civic_engagement_score: politician.civic_engagement_score,
          is_verified: politician.is_verified,
          profile_picture_url: politician.photo_url,
          created_at: politician.created_at,
          updated_at: politician.updated_at,
        });
      });

      const member_count = members.senators.length + members.ministers.length + 
                          members.mps.length + members.politicians.length;

      return {
        ...party,
        members,
        member_count,
      } as PoliticalPartyWithMembers;
    },
    enabled: !!partyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get related political entities for a specific entity
export function useRelatedPoliticalEntities(entityId: string, entityType: 'senator' | 'minister' | 'mp' | 'politician') {
  return useQuery({
    queryKey: ['related-political-entities', entityId, entityType],
    queryFn: async () => {
      // First get the entity's party
      let politicalPartyId: string | null = null;
      
      const { data: entity } = await supabase
        .from(entityType === 'politician' ? 'politicians' : `${entityType}s`)
        .select('political_party_id')
        .eq('id', entityId)
        .single();

      politicalPartyId = entity?.political_party_id;

      if (!politicalPartyId) {
        return {
          sameParty: [],
          otherEntities: [],
        };
      }

      // Get all entities from the same party
      const samePartyEntities: PoliticalEntityWithParty[] = [];

      // Fetch senators from same party
      const { data: senators } = await supabase
        .from('senators')
        .select(`
          id, full_name, region, political_party_id, average_rating, is_verified,
          profile_picture_url, created_at, updated_at,
          political_parties!political_party_id (id, name, acronym, logo_url)
        `)
        .eq('political_party_id', politicalPartyId)
        .neq('id', entityType === 'senator' ? entityId : '00000000-0000-0000-0000-000000000000');

      senators?.forEach(senator => {
        samePartyEntities.push({
          id: senator.id,
          name: senator.full_name,
          entity_type: 'senator',
          position: 'Senator',
          region: senator.region,
          political_party_id: senator.political_party_id,
          political_party: senator.political_parties,
          average_rating: senator.average_rating,
          is_verified: senator.is_verified,
          profile_picture_url: senator.profile_picture_url,
          created_at: senator.created_at,
          updated_at: senator.updated_at,
        });
      });

      // Similar for ministers, MPs, and politicians...
      const { data: ministers } = await supabase
        .from('ministers')
        .select(`
          id, full_name, position_title, region, political_party_id, average_rating, is_verified,
          profile_picture_url, created_at, updated_at,
          political_parties!political_party_id (id, name, acronym, logo_url)
        `)
        .eq('political_party_id', politicalPartyId)
        .neq('id', entityType === 'minister' ? entityId : '00000000-0000-0000-0000-000000000000');

      ministers?.forEach(minister => {
        samePartyEntities.push({
          id: minister.id,
          name: minister.full_name,
          entity_type: 'minister',
          position: minister.position_title,
          region: minister.region,
          political_party_id: minister.political_party_id,
          political_party: minister.political_parties,
          average_rating: minister.average_rating,
          is_verified: minister.is_verified,
          profile_picture_url: minister.profile_picture_url,
          created_at: minister.created_at,
          updated_at: minister.updated_at,
        });
      });

      return {
        sameParty: samePartyEntities.slice(0, 10), // Limit to 10 for performance
        politicalPartyId,
      };
    },
    enabled: !!entityId && !!entityType,
    staleTime: 5 * 60 * 1000,
  });
}