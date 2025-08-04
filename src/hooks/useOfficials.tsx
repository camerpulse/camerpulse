import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Official {
  id: string;
  name: string;
  title: string;
  party?: string;
  region?: string;
  average_rating?: number;
  total_ratings?: number;
  created_at: string;
  updated_at: string;
  photo_url?: string;
  biography?: string;
  contact_info?: string;
  verified?: boolean;
  category: 'senator' | 'mp' | 'minister' | 'governor' | 'mayor' | 'other';
}

interface UseOfficialsOptions {
  category?: string;
  region?: string;
  search?: string;
  sortBy?: string;
}

export const useOfficials = (options: UseOfficialsOptions = {}) => {
  return useQuery({
    queryKey: ['officials', options],
    queryFn: async () => {
      // Combine data from senators, mps, and ministers tables
      const officials: Official[] = [];

      // Fetch senators if category is 'all' or 'senators'
      if (!options.category || options.category === 'all' || options.category === 'senators') {
        const { data: senators } = await supabase
          .from('senators')
          .select('*')
          .ilike('name', `%${options.search || ''}%`)
          .order(getSortColumn(options.sortBy));

        if (senators) {
          officials.push(...senators.map(senator => ({
            id: senator.id,
            name: senator.name,
            title: senator.position || 'Senator',
            party: senator.political_party,
            region: senator.region,
            average_rating: senator.average_rating || 0,
            total_ratings: senator.total_ratings || 0,
            created_at: senator.created_at,
            updated_at: senator.updated_at,
            photo_url: senator.photo_url,
            biography: senator.about,
            verified: senator.is_verified,
            category: 'senator' as const
          })));
        }
      }

      // Fetch MPs if category is 'all' or 'mps'
      if (!options.category || options.category === 'all' || options.category === 'mps') {
        const { data: mps } = await supabase
          .from('mps')
          .select('*')
          .ilike('full_name', `%${options.search || ''}%`)
          .order(getSortColumn(options.sortBy));

        if (mps) {
          officials.push(...mps.map(mp => ({
            id: mp.id,
            name: mp.full_name,
            title: mp.constituency ? `MP for ${mp.constituency}` : 'Member of Parliament',
            party: mp.political_party,
            region: mp.region,
            average_rating: mp.average_rating || 0,
            total_ratings: mp.total_ratings || 0,
            created_at: mp.created_at,
            updated_at: mp.updated_at,
            photo_url: mp.profile_picture_url,
            biography: mp.education,
            verified: mp.is_verified,
            category: 'mp' as const
          })));
        }
      }

      // Fetch ministers if category is 'all' or 'ministers'
      if (!options.category || options.category === 'all' || options.category === 'ministers') {
        const { data: ministers } = await supabase
          .from('ministers')
          .select('*')
          .ilike('full_name', `%${options.search || ''}%`)
          .order(getSortColumn(options.sortBy));

        if (ministers) {
          officials.push(...ministers.map(minister => ({
            id: minister.id,
            name: minister.full_name,
            title: minister.position_title,
            party: minister.political_party,
            region: minister.region,
            average_rating: minister.average_rating || 0,
            total_ratings: minister.total_ratings || 0,
            created_at: minister.created_at,
            updated_at: minister.updated_at,
            photo_url: minister.profile_picture_url,
            biography: minister.education,
            verified: minister.is_verified,
            category: 'minister' as const
          })));
        }
      }

      // Filter by region if specified
      let filteredOfficials = officials;
      if (options.region) {
        filteredOfficials = officials.filter(official => 
          official.region === options.region
        );
      }

      // Sort the combined results
      return sortOfficials(filteredOfficials, options.sortBy);
    },
  });
};

const getSortColumn = (sortBy?: string) => {
  switch (sortBy) {
    case 'rating':
      return 'average_rating';
    case 'recent':
      return 'created_at';
    case 'position':
      return 'title';
    default:
      return 'name';
  }
};

const sortOfficials = (officials: Official[], sortBy?: string) => {
  const sorted = [...officials];
  
  switch (sortBy) {
    case 'rating':
      return sorted.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    case 'recent':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'position':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
};

export const useOfficial = (id: string) => {
  return useQuery({
    queryKey: ['official', id],
    queryFn: async () => {
      // Try to find the official in each table
      const { data: senator } = await supabase
        .from('senators')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (senator) {
        return {
          id: senator.id,
          name: senator.name,
          title: senator.position || 'Senator',
          party: senator.political_party,
          region: senator.region,
          average_rating: senator.average_rating || 0,
          total_ratings: senator.total_ratings || 0,
          created_at: senator.created_at,
          updated_at: senator.updated_at,
          photo_url: senator.photo_url,
          biography: senator.about,
          verified: senator.is_verified,
          category: 'senator' as const
        };
      }

      const { data: mp } = await supabase
        .from('mps')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (mp) {
        return {
          id: mp.id,
          name: mp.full_name,
          title: mp.constituency ? `MP for ${mp.constituency}` : 'Member of Parliament',
          party: mp.political_party,
          region: mp.region,
          average_rating: mp.average_rating || 0,
          total_ratings: mp.total_ratings || 0,
          created_at: mp.created_at,
          updated_at: mp.updated_at,
          photo_url: mp.profile_picture_url,
          biography: mp.education,
          verified: mp.is_verified,
          category: 'mp' as const
        };
      }

      const { data: minister } = await supabase
        .from('ministers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (minister) {
        return {
          id: minister.id,
          name: minister.full_name,
          title: minister.position_title,
          party: minister.political_party,
          region: minister.region,
          average_rating: minister.average_rating || 0,
          total_ratings: minister.total_ratings || 0,
          created_at: minister.created_at,
          updated_at: minister.updated_at,
          photo_url: minister.profile_picture_url,
          biography: minister.education,
          verified: minister.is_verified,
          category: 'minister' as const
        };
      }

      throw new Error('Official not found');
    },
    enabled: !!id,
  });
};