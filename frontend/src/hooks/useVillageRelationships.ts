import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VillageRelationship {
  id: string;
  source_village_id: string;
  target_village_id: string;
  relationship_type: string;
  relationship_status: string;
  established_year?: number;
  established_by?: string;
  relationship_strength: string;
  description?: string;
  historical_context?: string;
  current_activities: any[];
  economic_benefits: Record<string, any>;
  cultural_exchanges: any[];
  shared_projects?: string[];
  contact_frequency: string;
  distance_km?: number;
  travel_time_hours?: number;
  transport_methods?: string[];
  language_barrier_level: string;
  documentation_links?: string[];
  photo_urls?: string[];
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  verification_notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CulturalConnection {
  id: string;
  village_a_id: string;
  village_b_id: string;
  connection_type: string;
  similarity_score?: number;
  description: string;
  historical_context?: string;
  evidence_type: string[];
  documentation_links?: string[];
  research_sources: any[];
  verified_by_scholars: boolean;
  verification_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Get village relationships
export const useVillageRelationships = (villageId?: string) => {
  return useQuery({
    queryKey: ['village-relationships', villageId],
    queryFn: async () => {
      let query = supabase
        .from('village_relationships')
        .select(`
          *,
          source_village:villages!source_village_id(village_name, region),
          target_village:villages!target_village_id(village_name, region)
        `)
        .order('created_at', { ascending: false });

      if (villageId) {
        query = query.or(`source_village_id.eq.${villageId},target_village_id.eq.${villageId}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!villageId,
  });
};

// Get cultural connections
export const useVillageCulturalConnections = (villageId?: string) => {
  return useQuery({
    queryKey: ['village-cultural-connections', villageId],
    queryFn: async () => {
      let query = supabase
        .from('village_cultural_connections')
        .select(`
          *,
          village_a:villages!village_a_id(village_name, region),
          village_b:villages!village_b_id(village_name, region)
        `)
        .order('similarity_score', { ascending: false });

      if (villageId) {
        query = query.or(`village_a_id.eq.${villageId},village_b_id.eq.${villageId}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!villageId,
  });
};

// Search villages for relationships
export const useSearchVillagesForRelationships = (searchTerm: string, excludeVillageId?: string) => {
  return useQuery({
    queryKey: ['search-villages-relationships', searchTerm, excludeVillageId],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      let query = supabase
        .from('villages')
        .select('id, village_name, region')
        .ilike('village_name', `%${searchTerm}%`)
        .order('village_name')
        .limit(10);

      if (excludeVillageId) {
        query = query.neq('id', excludeVillageId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: searchTerm.length >= 2,
  });
};

// Create village relationship
export const useCreateVillageRelationship = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (relationshipData: Omit<VillageRelationship, 'id' | 'created_at' | 'updated_at' | 'is_verified' | 'verified_by' | 'verified_at' | 'verification_notes'>) => {
      const { data, error } = await supabase
        .from('village_relationships')
        .insert(relationshipData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['village-relationships'] });
      toast.success('Village relationship added successfully');
    },
    onError: (error) => {
      console.error('Error creating village relationship:', error);
      toast.error('Failed to add village relationship');
    },
  });
};

// Create cultural connection
export const useCreateCulturalConnection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (connectionData: Omit<CulturalConnection, 'id' | 'created_at' | 'updated_at' | 'verified_by_scholars' | 'verification_date'>) => {
      const { data, error } = await supabase
        .from('village_cultural_connections')
        .insert(connectionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['village-cultural-connections'] });
      toast.success('Cultural connection added successfully');
    },
    onError: (error) => {
      console.error('Error creating cultural connection:', error);
      toast.error('Failed to add cultural connection');
    },
  });
};

// Get relationship statistics for a village
export const useVillageRelationshipStats = (villageId?: string) => {
  return useQuery({
    queryKey: ['village-relationship-stats', villageId],
    queryFn: async () => {
      if (!villageId) return null;

      const { data: relationships, error } = await supabase
        .from('village_relationships')
        .select('relationship_type, relationship_strength')
        .or(`source_village_id.eq.${villageId},target_village_id.eq.${villageId}`);

      if (error) throw error;

      const stats = {
        total: relationships.length,
        byType: relationships.reduce((acc, rel) => {
          acc[rel.relationship_type] = (acc[rel.relationship_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byStrength: relationships.reduce((acc, rel) => {
          acc[rel.relationship_strength] = (acc[rel.relationship_strength] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      return stats;
    },
    enabled: !!villageId,
  });
};