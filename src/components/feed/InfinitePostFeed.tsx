import React, { useCallback } from 'react';
import { useProductionFeed } from '@/hooks/useProductionFeed';
import { ProductionFeedCard } from './ProductionFeedCard';
import { useProductionLikePost, useProductionSharePost } from '@/hooks/useProductionPostInteractions';
import { Loader2, AlertCircle, RefreshCw, Wifi, WifiOff, Megaphone } from 'lucide-react';
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
    refetch,
    isError
  } = useProductionFeed();

  const likeMutation = useProductionLikePost();
  const shareMutation = useProductionSharePost();

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

  const handleLike = useCallback((itemId: string, originalId: string) => {
    const item = allItems.find(item => item.id === itemId);
    if (item && item.type === 'pulse_post') {
      likeMutation.mutate({
        postId: originalId,
        isLiked: item.engagement.user_has_liked,
      });
    }
  }, [likeMutation]);

  const handleShare = useCallback((itemId: string) => {
    shareMutation.mutate(itemId);
  }, [shareMutation]);

  const allItems = data?.pages.flatMap(page => page.items) || [];
  const isOnline = navigator.onLine;

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

  if (error || isError) {
    return (
      <div className={className}>
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              {!isOnline ? (
                <WifiOff className="h-12 w-12 text-orange-500" />
              ) : (
                <AlertCircle className="h-12 w-12 text-red-500" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {!isOnline ? 'No Internet Connection' : 'Failed to load feed'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {!isOnline 
                ? 'Please check your internet connection and try again.'
                : error instanceof Error 
                  ? error.message 
                  : 'Unable to load the latest posts and updates.'
              }
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              {!isOnline && (
                <Button onClick={() => window.location.reload()} variant="default">
                  <Wifi className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoading && (!allItems || allItems.length === 0)) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Megaphone className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Welcome to CamerPulse!</h3>
                <p className="text-sm">
                  Your feed will appear here as you follow people and engage with the community.
                </p>
                <p className="text-xs mt-2">
                  Start by exploring events, following verified accounts, or creating your first post.
                </p>
              </div>
              <Button onClick={() => window.location.href = '/events'} variant="outline">
                Explore Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Connection status indicator */}
      {!isOnline && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-700">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">You're offline. Some features may be limited.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {allItems.map((item) => (
        <ProductionFeedCard 
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
            <Card className="w-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Loading more content...</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => fetchNextPage()}
              className="min-w-[150px] hover:scale-105 transition-transform"
              disabled={!isOnline}
            >
              Load More Content
            </Button>
          )}
        </div>
      )}
      
      {!hasNextPage && allItems.length > 5 && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground space-y-2">
              <p className="text-sm font-medium">You've caught up!</p>
              <p className="text-xs">You've seen all the latest posts and updates.</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => refetch()}
                className="mt-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh Feed
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};