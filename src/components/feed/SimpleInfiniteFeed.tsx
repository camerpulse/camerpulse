import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, Globe } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { PostCard } from './PostCard';
import { PostSkeletonGrid } from './PostSkeleton';

export const SimpleInfiniteFeed: React.FC = () => {
  console.log('[SimpleInfiniteFeed] Component rendering');
  
  const { 
    data: posts, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = usePosts(20, 0);

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return <PostSkeletonGrid count={5} />;
  }

  if (error) {
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

  if (!posts || posts.length === 0) {
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
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      <div className="flex justify-center py-6">
        <Button variant="outline" disabled>
          Load More Posts (Phase 3 Coming Soon)
        </Button>
      </div>
    </div>
  );
};