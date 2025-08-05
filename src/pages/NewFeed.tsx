import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedFeedContent } from '@/components/feed/UnifiedFeedContent';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { FeedFilters } from '@/components/feed/FeedFilters';
import { useFeedAlgorithm } from '@/hooks/useFeedAlgorithm';

export default function NewFeed() {
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    region: 'all',
    contentType: 'all',
    timeRange: '24h',
    searchQuery: '',
    tags: []
  });

  const {
    feedItems,
    userPreferences,
    loading,
    error,
    hasNextPage,
    civicEventsActive,
    refreshFeed,
    loadMoreItems,
    updatePreferences
  } = useFeedAlgorithm();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <FeedHeader 
          civicEventsActive={civicEventsActive}
          onRefresh={refreshFeed}
          loading={loading}
        />

        {/* Filters */}
        <FeedFilters 
          filters={filters}
          onFiltersChange={setFilters}
          userPreferences={userPreferences}
          onPreferencesUpdate={updatePreferences}
        />

        {/* Feed Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6 bg-card">
            <TabsTrigger value="all" className="text-xs sm:text-sm font-medium">All</TabsTrigger>
            <TabsTrigger value="civic" className="text-xs sm:text-sm font-medium">Civic</TabsTrigger>
            <TabsTrigger value="jobs" className="text-xs sm:text-sm font-medium">Jobs</TabsTrigger>
            <TabsTrigger value="artists" className="text-xs sm:text-sm font-medium">Artists</TabsTrigger>
            <TabsTrigger value="villages" className="text-xs sm:text-sm font-medium">Villages</TabsTrigger>
            <TabsTrigger value="marketplace" className="text-xs sm:text-sm font-medium">Market</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <UnifiedFeedContent 
              feedItems={feedItems}
              contentType="all"
              filters={filters}
              loading={loading}
              error={error}
              hasNextPage={hasNextPage}
              onLoadMore={loadMoreItems}
              onRefresh={refreshFeed}
            />
          </TabsContent>

          <TabsContent value="civic">
            <UnifiedFeedContent 
              feedItems={feedItems.filter(item => 
                item.content_type === 'pulse' || 
                item.content_type === 'political_update' ||
                item.content_type === 'petition'
              )}
              contentType="civic"
              filters={filters}
              loading={loading}
              error={error}
              hasNextPage={hasNextPage}
              onLoadMore={loadMoreItems}
              onRefresh={refreshFeed}
            />
          </TabsContent>

          <TabsContent value="jobs">
            <UnifiedFeedContent 
              feedItems={feedItems.filter(item => item.content_type === 'job')}
              contentType="jobs"
              filters={filters}
              loading={loading}
              error={error}
              hasNextPage={hasNextPage}
              onLoadMore={loadMoreItems}
              onRefresh={refreshFeed}
            />
          </TabsContent>

          <TabsContent value="artists">
            <UnifiedFeedContent 
              feedItems={feedItems.filter(item => item.content_type === 'artist_content')}
              contentType="artists"
              filters={filters}
              loading={loading}
              error={error}
              hasNextPage={hasNextPage}
              onLoadMore={loadMoreItems}
              onRefresh={refreshFeed}
            />
          </TabsContent>

          <TabsContent value="villages">
            <UnifiedFeedContent 
              feedItems={feedItems.filter(item => item.content_type === 'village_update')}
              contentType="villages"
              filters={filters}
              loading={loading}
              error={error}
              hasNextPage={hasNextPage}
              onLoadMore={loadMoreItems}
              onRefresh={refreshFeed}
            />
          </TabsContent>

          <TabsContent value="marketplace">
            <UnifiedFeedContent 
              feedItems={feedItems.filter(item => 
                item.content_type === 'marketplace' ||
                item.content_type === 'business_listing'
              )}
              contentType="marketplace"
              filters={filters}
              loading={loading}
              error={error}
              hasNextPage={hasNextPage}
              onLoadMore={loadMoreItems}
              onRefresh={refreshFeed}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}