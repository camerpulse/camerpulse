import React, { useCallback, useMemo, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, Globe } from 'lucide-react';
import { useInfinitePosts } from '@/hooks/useInfiniteScroll';
import { PostCard } from './PostCard';
import { PostSkeletonGrid } from './PostSkeleton';

export const InfinitePostFeed: React.FC = () => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useInfinitePosts();

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px 0px', // Start loading 100px before reaching bottom
  });

  // Auto-fetch next page when load more element comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Memoize flattened posts to prevent unnecessary re-renders - EXACT same format as usePosts
  const posts = useMemo(() => {
    return data?.pages.flatMap(page => page.posts) || [];
  }, [data?.pages]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Same loading state as SimpleInfiniteFeed
  if (isLoading) {
    return <PostSkeletonGrid count={5} />;
  }

  // Same error state as SimpleInfiniteFeed  
  if (isError) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold mb-2">Failed to load posts</h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button onClick={handleRefresh} disabled={isFetching}>
            {isFetching && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Same empty state as SimpleInfiniteFeed
  if (posts.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
          <p className="text-muted-foreground">
            Be the first to share your civic voice with the community!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Same post rendering as SimpleInfiniteFeed */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      {/* Load more trigger - enhanced version of SimpleInfiniteFeed button */}
      <div ref={loadMoreRef} className="flex justify-center py-6">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading more posts...</span>
          </div>
        ) : hasNextPage ? (
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            Load More Posts
          </Button>
        ) : posts.length > 0 ? (
          <p className="text-muted-foreground text-sm">
            You've reached the end! 🎉
          </p>
        ) : null}
      </div>
    </div>
  );
};