import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin } from 'lucide-react';
import { useMPs } from '@/hooks/useMPs';
import { usePlugin } from '@/contexts/PluginContext';
import { EnhancedPoliticalGrid } from '@/components/Politics/EnhancedPoliticalGrid';
import { UnifiedPoliticalCard } from '@/components/Politics/UnifiedPoliticalCard';

const MPsPage = () => {
  const { isPluginEnabled } = usePlugin();
  const { data: mps, isLoading, error } = useMPs();

  if (!isPluginEnabled) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-muted-foreground">
              MPs Directory is not available
            </h1>
            <p className="text-muted-foreground mt-2">
              This plugin is currently disabled.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading MPs...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Error loading MPs</h1>
            <p className="text-muted-foreground mt-2">Please try again later.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Transform MPs data to match UnifiedPoliticalCard props
  const transformedMPs = mps?.map(mp => ({
    id: mp.id,
    name: mp.full_name,
    position: 'Member of Parliament',
    party: mp.political_party,
    region: mp.region,
    photo_url: mp.profile_picture_url,
    average_rating: mp.average_rating || 0,
    total_ratings: mp.total_ratings || 0,
    transparency_score: mp.transparency_score,
    performance_score: mp.legislative_activity_score,
    civic_engagement_score: mp.civic_engagement_score,
    is_verified: mp.is_verified || false,
    follower_count: mp.follower_count || 0,
    can_receive_messages: mp.can_receive_messages ?? true,
    bio: `Constituency: ${mp.constituency || 'Not specified'}`,
    type: 'mp' as const
  })) || [];

  // Get unique regions and parties for filters
  const regions = [...new Set(mps?.map(mp => mp.region).filter(Boolean))];
  const parties = [...new Set(mps?.map(mp => mp.political_party).filter(Boolean))];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Members of Parliament</h1>
          </div>
          <p className="text-muted-foreground">
            Directory of Cameroon&apos;s 180 Members of Parliament from the 10th Legislative Assembly
          </p>
          
          <div className="flex gap-4 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {mps?.length || 0} MPs
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {[...new Set(mps?.map(mp => mp.region).filter(Boolean))].length} Regions
            </Badge>
          </div>
        </div>

        <EnhancedPoliticalGrid
          entities={transformedMPs}
          loading={isLoading}
          title="Members of Parliament"
          subtitle="Directory of Cameroon's 180 Members of Parliament from the 10th Legislative Assembly"
          entityType="mp"
          regions={regions}
          parties={parties}
        />
      </div>
    </AppLayout>
  );
};

export default MPsPage;