import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Village {
  id: string;
  village_name: string;
  region: string;
  division: string;
  subdivision: string;
  population_estimate: number | null;
  overall_rating: number;
  sons_daughters_count: number;
  view_count: number;
  is_verified: boolean;
  infrastructure_score: number;
  education_score: number;
  health_score: number;
  peace_security_score: number;
  economic_activity_score: number;
  governance_score: number;
  social_spirit_score: number;
  diaspora_engagement_score: number;
  civic_participation_score: number;
  achievements_score: number;
  total_ratings_count: number;
  created_at: string;
  updated_at: string;
}

export interface VillageStats {
  total_villages: number;
  total_projects: number;
  total_villagers: number;
  total_petitions: number;
  verified_chiefs: number;
}

// Get all villages
export const useVillages = () => {
  return useQuery({
    queryKey: ['villages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('villages')
        .select('*')
        .order('overall_rating', { ascending: false });
      
      if (error) throw error;
      return data as Village[];
    },
  });
};

// Get top villages by different criteria
export const useTopVillages = (criteria: string, limit: number = 10) => {
  return useQuery({
    queryKey: ['top-villages', criteria, limit],
    queryFn: async () => {
      let orderBy: string;
      let ascending = false;
      
      switch (criteria) {
        case 'developed':
          orderBy = 'infrastructure_score';
          break;
        case 'chiefs':
          orderBy = 'governance_score';
          break;
        case 'diaspora':
          orderBy = 'diaspora_engagement_score';
          break;
        case 'education':
          orderBy = 'education_score';
          break;
        case 'clean':
          orderBy = 'health_score';
          break;
        case 'popular':
          orderBy = 'view_count';
          break;
        default:
          orderBy = 'overall_rating';
      }
      
      const { data, error } = await supabase
        .from('villages')
        .select('*')
        .order(orderBy, { ascending })
        .limit(limit);
      
      if (error) throw error;
      return data as Village[];
    },
  });
};

// Get villages by region
export const useVillagesByRegion = (region?: string) => {
  return useQuery({
    queryKey: ['villages-by-region', region],
    queryFn: async () => {
      let query = supabase.from('villages').select('*');
      
      if (region) {
        query = query.eq('region', region);
      }
      
      const { data, error } = await query.order('village_name', { ascending: true });
      
      if (error) throw error;
      return data as Village[];
    },
  });
};

// Get village statistics
export const useVillageStats = () => {
  return useQuery({
    queryKey: ['village-stats'],
    queryFn: async (): Promise<VillageStats> => {
      // Get villages count
      const { count: villagesCount } = await supabase
        .from('villages')
        .select('*', { count: 'exact', head: true });

      // Get projects count  
      const { count: projectsCount } = await supabase
        .from('village_projects')
        .select('*', { count: 'exact', head: true });

      // Get total villagers
      const { data: villagersData } = await supabase
        .from('villages')
        .select('sons_daughters_count');
      
      const totalVillagers = villagersData?.reduce((sum, village) => sum + (village.sons_daughters_count || 0), 0) || 0;

      // Get petitions count
      const { count: petitionsCount } = await supabase
        .from('village_petitions')
        .select('*', { count: 'exact', head: true });

      // Mock chiefs count for now
      const chiefsCount = 150;

      return {
        total_villages: villagesCount || 0,
        total_projects: projectsCount || 0,
        total_villagers: totalVillagers,
        total_petitions: petitionsCount || 0,
        verified_chiefs: chiefsCount,
      };
    },
  });
};

// Get featured village of the week
export const useFeaturedVillage = () => {
  return useQuery({
    queryKey: ['featured-village'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('villages')
        .select('*')
        .order('overall_rating', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data as Village;
    },
  });
};

// Search villages
export const useSearchVillages = (searchTerm: string) => {
  return useQuery({
    queryKey: ['search-villages', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      
      const { data, error } = await supabase
        .from('villages')
        .select('*')
        .or(`village_name.ilike.%${searchTerm}%,region.ilike.%${searchTerm}%,division.ilike.%${searchTerm}%`)
        .order('overall_rating', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as Village[];
    },
    enabled: !!searchTerm,
  });
};

// Get recent village activity
export const useVillageActivity = () => {
  return useQuery({
    queryKey: ['village-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('villages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
  });
};