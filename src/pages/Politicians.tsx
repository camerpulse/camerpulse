import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/Layout/AppLayout';
import { NavigationBreadcrumb } from '@/components/Navigation/NavigationBreadcrumb';
import { PoliticalNavigation } from '@/components/Navigation/PoliticalNavigation';
import { EnhancedPoliticalGrid } from '@/components/Politics/EnhancedPoliticalGrid';

interface PoliticalEntity {
  id: string;
  name: string;
  position: string;
  party?: string;
  region?: string;
  photo_url?: string;
  average_rating: number;
  total_ratings: number;
  transparency_score?: number;
  performance_score?: number;
  civic_engagement_score?: number;
  is_verified?: boolean;
  follower_count?: number;
  can_receive_messages?: boolean;
  bio?: string;
}

const Politicians = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [politicians, setPoliticians] = useState<PoliticalEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [regions, setRegions] = useState<string[]>([]);
  const [parties, setParties] = useState<string[]>([]);

  useEffect(() => {
    fetchPoliticians();
  }, []);

  const fetchPoliticians = async () => {
    try {
      const { data, error } = await supabase
        .from('politicians')
        .select(`
          *,
          political_parties!political_party_id (
            id,
            name,
            acronym,
            logo_url
          ),
          approval_ratings(rating, user_id)
        `)
        .eq('is_archived', false)
        .order('civic_score', { ascending: false });

      if (error) throw error;

      const politiciansWithData = (data || []).map((politician) => {
        const ratings = politician.approval_ratings || [];
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0 
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
          : 0;

        return {
          id: politician.id,
          name: politician.name,
          position: politician.role_title || 'Politician',
          party: politician.party || politician.political_parties?.name,
          region: politician.region,
          photo_url: politician.profile_image_url,
          average_rating: averageRating,
          total_ratings: totalRatings,
          transparency_score: (politician.transparency_rating || 0) * 20,
          performance_score: (politician.development_impact_rating || 0) * 20,
          civic_engagement_score: (politician.civic_score || 0) / 20,
          is_verified: politician.verified,
          follower_count: politician.follower_count || 0,
          can_receive_messages: true,
          bio: politician.bio
        };
      });

      setPoliticians(politiciansWithData);
      
      // Extract unique regions and parties
      const uniqueRegions = [...new Set(politiciansWithData.map(p => p.region).filter(Boolean))];
      const uniqueParties = [...new Set(politiciansWithData.map(p => p.party).filter(Boolean))];
      
      setRegions(uniqueRegions);
      setParties(uniqueParties);
    } catch (error) {
      console.error('Error fetching politicians:', error);
      toast({
        title: "Error",
        description: "Unable to load politicians",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <NavigationBreadcrumb />
        <PoliticalNavigation />
        <EnhancedPoliticalGrid
          entities={politicians}
          loading={loading}
          title="Politicians of Cameroon"
          subtitle="Discover, follow and evaluate your political representatives"
          entityType="politician"
          regions={regions}
          parties={parties}
        />
      </div>
    </AppLayout>
  );
};

export default Politicians;