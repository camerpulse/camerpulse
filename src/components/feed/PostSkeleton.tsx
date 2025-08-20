import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const PostSkeleton: React.FC = () => (
  <Card className="bg-card border-border animate-pulse">
    <CardContent className="p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-muted rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-3 bg-muted rounded w-16" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
          <div className="flex items-center gap-4 pt-2">
            <div className="h-8 bg-muted rounded w-16" />
            <div className="h-8 bg-muted rounded w-16" />
            <div className="h-8 bg-muted rounded w-16" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const PostSkeletonGrid: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-6">
    {Array.from({ length: count }, (_, i) => (
      <PostSkeleton key={i} />
    ))}
  </div>
);