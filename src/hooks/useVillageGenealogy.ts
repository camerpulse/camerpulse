import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VillageAncestor {
  id: string;
  user_id: string;
  village_id: string;
  full_name: string;
  given_names: string[];
  family_name: string;
  birth_year: number;
  death_year: number;
  birth_village_id: string;
  death_village_id: string;
  gender: 'male' | 'female' | 'other';
  occupation: string;
  traditional_title: string;
  migration_story: string;
  notable_achievements: string;
  oral_stories: string;
  photo_urls: string[];
  verified_by_elders: boolean;
  verification_notes: string;
  privacy_level: 'private' | 'family' | 'village' | 'public';
  created_at: string;
  updated_at: string;
}

export interface AncestorRelationship {
  id: string;
  ancestor_id: string;
  related_ancestor_id: string;
  relationship_type: 'parent' | 'child' | 'spouse' | 'sibling' | 'grandparent' | 'grandchild' | 'uncle' | 'aunt' | 'nephew' | 'niece' | 'cousin' | 'in_law';
  marriage_date: string;
  marriage_village_id: string;
  traditional_ceremony: boolean;
  relationship_notes: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface FamilyTree {
  id: string;
  village_id: string;
  tree_name: string;
  founding_ancestor_id: string;
  tree_description: string;
  is_founding_lineage: boolean;
  tree_visibility: 'private' | 'family' | 'village' | 'public';
  created_by: string;
  collaborators: string[];
  tree_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserVillageAncestry {
  id: string;
  user_id: string;
  village_id: string;
  ancestor_id: string;
  connection_type: 'birth' | 'ancestral' | 'marriage' | 'adoption' | 'migration';
  generation_distance: number;
  connection_strength: 'direct' | 'probable' | 'possible' | 'disputed';
  evidence_type: string[];
  connection_story: string;
  verified_by_community: boolean;
  verification_votes: number;
  is_primary_village: boolean;
  created_at: string;
  updated_at: string;
}

// Get village ancestors
export const useVillageAncestors = (villageId?: string) => {
  return useQuery({
    queryKey: ['village-ancestors', villageId],
    queryFn: async () => {
      let query = supabase
        .from('village_ancestors')
        .select('*')
        .order('birth_year', { ascending: false });

      if (villageId) {
        query = query.eq('village_id', villageId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as VillageAncestor[];
    },
    enabled: !!villageId,
  });
};

// Get ancestor relationships
export const useAncestorRelationships = (ancestorId?: string) => {
  return useQuery({
    queryKey: ['ancestor-relationships', ancestorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ancestor_relationships')
        .select(`
          *,
          ancestor:village_ancestors!ancestor_id(*),
          related_ancestor:village_ancestors!related_ancestor_id(*)
        `)
        .or(`ancestor_id.eq.${ancestorId},related_ancestor_id.eq.${ancestorId}`);

      if (error) throw error;
      return data;
    },
    enabled: !!ancestorId,
  });
};

// Get family trees for a village
export const useVillageFamilyTrees = (villageId?: string) => {
  return useQuery({
    queryKey: ['village-family-trees', villageId],
    queryFn: async () => {
      let query = supabase
        .from('village_family_trees')
        .select('*')
        .order('is_founding_lineage', { ascending: false });

      if (villageId) {
        query = query.eq('village_id', villageId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FamilyTree[];
    },
    enabled: !!villageId,
  });
};

// Get user's village ancestry connections
export const useUserVillageAncestry = () => {
  return useQuery({
    queryKey: ['user-village-ancestry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_village_ancestry')
        .select(`
          *,
          village:villages(*),
          ancestor:village_ancestors(*)
        `)
        .order('generation_distance', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

// Create ancestor mutation
export const useCreateAncestor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ancestorData: Partial<VillageAncestor>) => {
      const { data, error } = await supabase
        .from('village_ancestors')
        .insert(ancestorData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['village-ancestors'] });
      toast.success('Ancestor added successfully');
    },
    onError: (error) => {
      console.error('Error creating ancestor:', error);
      toast.error('Failed to add ancestor');
    },
  });
};

// Create relationship mutation
export const useCreateRelationship = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (relationshipData: Partial<AncestorRelationship>) => {
      const { data, error } = await supabase
        .from('ancestor_relationships')
        .insert(relationshipData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ancestor-relationships'] });
      toast.success('Relationship added successfully');
    },
    onError: (error) => {
      console.error('Error creating relationship:', error);
      toast.error('Failed to add relationship');
    },
  });
};

// Create family tree mutation
export const useCreateFamilyTree = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (treeData: Partial<FamilyTree>) => {
      const { data, error } = await supabase
        .from('village_family_trees')
        .insert(treeData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['village-family-trees'] });
      toast.success('Family tree created successfully');
    },
    onError: (error) => {
      console.error('Error creating family tree:', error);
      toast.error('Failed to create family tree');
    },
  });
};

// Connect user to village ancestry
export const useConnectUserToVillage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (connectionData: Partial<UserVillageAncestry>) => {
      const { data, error } = await supabase
        .from('user_village_ancestry')
        .insert(connectionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-village-ancestry'] });
      toast.success('Village connection added successfully');
    },
    onError: (error) => {
      console.error('Error connecting to village:', error);
      toast.error('Failed to connect to village');
    },
  });
};

// Search ancestors across villages
export const useSearchAncestors = (searchTerm: string) => {
  return useQuery({
    queryKey: ['search-ancestors', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('village_ancestors')
        .select('*, village:villages(village_name)')
        .or(`full_name.ilike.%${searchTerm}%,family_name.ilike.%${searchTerm}%,occupation.ilike.%${searchTerm}%`)
        .order('birth_year', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: searchTerm.length >= 2,
  });
};