import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SuggestedFollow {
  id: string;
  name: string;
  username: string;
  type: 'government' | 'education' | 'ngo' | 'infrastructure' | 'hospital' | 'user';
  verified: boolean;
  avatar_url?: string;
}

export const useSuggestedFollows = () => {
  return useQuery({
    queryKey: ['suggested-follows'],
    queryFn: async (): Promise<SuggestedFollow[]> => {
      const suggestions: SuggestedFollow[] = [];

      // Get verified users/organizations
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('verified', true)
        .limit(10);

      if (profiles) {
        profiles.forEach(profile => {
          suggestions.push({
            id: profile.id,
            name: profile.display_name || profile.username || 'User',
            username: profile.username || 'user',
            type: profile.user_type || 'user',
            verified: profile.verified,
            avatar_url: profile.avatar_url,
          });
        });
      }

      // Get hospitals that are claimed (these are likely official)
      const { data: hospitals } = await supabase
        .from('hospitals')
        .select('id, name, claimed_by, verification_status')
        .not('claimed_by', 'is', null)
        .eq('verification_status', 'verified')
        .limit(5);

      if (hospitals) {
        hospitals.forEach(hospital => {
          suggestions.push({
            id: hospital.id,
            name: hospital.name,
            username: hospital.name.toLowerCase().replace(/\s+/g, '_'),
            type: 'hospital',
            verified: true,
          });
        });
      }

      // If we don't have enough suggestions, add defaults
      if (suggestions.length < 4) {
        const defaults: SuggestedFollow[] = [
          { id: '1', name: 'Ministry of Health', username: 'minsante_cm', type: 'government', verified: true },
          { id: '2', name: 'University of Yaoundé I', username: 'uy1_official', type: 'education', verified: true },
          { id: '3', name: 'Transparency CM', username: 'transparency_cm', type: 'ngo', verified: true },
          { id: '4', name: 'Douala Port Authority', username: 'douala_port', type: 'infrastructure', verified: true },
        ];
        
        defaults.forEach(defaultItem => {
          if (!suggestions.find(s => s.username === defaultItem.username)) {
            suggestions.push(defaultItem);
          }
        });
      }

      return suggestions.slice(0, 4);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};