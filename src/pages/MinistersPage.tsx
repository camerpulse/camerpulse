import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin } from 'lucide-react';
import { useMinisters } from '@/hooks/useMinisters';
import { usePlugin } from '@/contexts/PluginContext';
import { EnhancedPoliticalGrid } from '@/components/Politics/EnhancedPoliticalGrid';
import { UnifiedPoliticalCard } from '@/components/Politics/UnifiedPoliticalCard';

const MinistersPage = () => {
  const { isPluginEnabled } = usePlugin();
  const { data: ministers, isLoading, error } = useMinisters();

  if (!isPluginEnabled) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-muted-foreground">
              Ministers Directory is not available
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
            <p className="text-muted-foreground mt-4">Loading Ministers...</p>
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
            <h1 className="text-2xl font-bold text-destructive">Error loading Ministers</h1>
            <p className="text-muted-foreground mt-2">Please try again later.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Transform Ministers data to match UnifiedPoliticalCard props
  const transformedMinisters = ministers?.map(minister => ({
    id: minister.id,
    name: minister.full_name,
    position: minister.position_title,
    party: minister.political_party,
    region: minister.region,
    photo_url: minister.profile_picture_url,
    average_rating: minister.average_rating || 0,
    total_ratings: minister.total_ratings || 0,
    transparency_score: minister.transparency_score,
    performance_score: minister.performance_score,
    civic_engagement_score: minister.civic_engagement_score,
    is_verified: minister.is_verified || false,
    follower_count: minister.follower_count || 0,
    can_receive_messages: minister.can_receive_messages ?? true,
    bio: `Ministry: ${minister.ministry}`,
    type: 'minister' as const
  })) || [];

  // Get unique ministries and regions for filters
  const ministries = [...new Set(ministers?.map(minister => minister.ministry).filter(Boolean))];
  const regions = [...new Set(ministers?.map(minister => minister.region).filter(Boolean))];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Building className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Government Ministers</h1>
          </div>
          <p className="text-muted-foreground">
            Directory of Cameroon&apos;s Government Ministers and their ministries
          </p>
          
          <div className="flex gap-4 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              {ministers?.length || 0} Ministers
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {ministries.length} Ministries
            </Badge>
          </div>
        </div>

        <EnhancedPoliticalGrid
          entities={transformedMinisters}
          loading={isLoading}
          title="Government Ministers"
          subtitle="Directory of Cameroon's Government Ministers and their ministries"
          entityType="minister"
          regions={regions}
          parties={ministries}
        />
      </div>
    </AppLayout>
  );
};

export default MinistersPage;