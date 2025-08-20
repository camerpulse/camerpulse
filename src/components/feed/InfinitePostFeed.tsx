import React, { useCallback } from 'react';
import { useComprehensiveFeed } from '@/hooks/useComprehensiveFeed';
import { FeedItemCard } from './FeedItemCard';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useInView } from 'react-intersection-observer';

interface InfinitePostFeedProps {
  className?: string;
}

export const InfinitePostFeed: React.FC<InfinitePostFeedProps> = ({ className }) => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useComprehensiveFeed();

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Auto-load more when scrolling near bottom
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLike = useCallback((itemId: string) => {
    // Handle like functionality for posts
    console.log('Like:', itemId);
  }, []);

  const handleShare = useCallback((itemId: string) => {
    // Handle share functionality
    console.log('Share:', itemId);
  }, []);

  const allItems = data?.pages.flatMap(page => page.items) || [];

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className || ''}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-4 w-1/2 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load feed</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!allItems || allItems.length === 0) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <h3 className="text-lg font-semibold mb-2">No content yet</h3>
              <p>Be the first to share something with the community!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {allItems.map((item) => (
        <FeedItemCard 
          key={item.id} 
          item={item} 
          onLike={handleLike}
          onShare={handleShare}
        />
      ))}
      
      {/* Load more trigger */}
      {hasNextPage && (
        <div 
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {isFetchingNextPage ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading more content...</span>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => fetchNextPage()}
              className="min-w-[150px]"
            >
              Load More
            </Button>
          )}
        </div>
      )}
      
      {!hasNextPage && allItems.length > 10 && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            You've reached the end of the feed
          </p>
        </div>
      )}
    </div>
  );
};