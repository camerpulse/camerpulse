import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  Settings, 
  TrendingUp, 
  MapPin, 
  Briefcase, 
  Mic2, 
  Vote,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  MoreHorizontal,
  Clock
} from 'lucide-react';
import { useFeedAlgorithm } from '@/hooks/useFeedAlgorithm';
import { useIntersectionObserver } from '@/hooks/usePerformanceOptimization';
import { formatDistanceToNow } from 'date-fns';

interface PersonalizedFeedProps {
  className?: string;
  showPreferences?: boolean;
}

export const PersonalizedFeed: React.FC<PersonalizedFeedProps> = ({
  className = '',
  showPreferences = true
}) => {
  const {
    feedItems,
    userPreferences,
    loading,
    error,
    hasNextPage,
    civicEventsActive,
    trackInteraction,
    refreshFeed,
    loadMoreItems
  } = useFeedAlgorithm();

  const [viewTimers, setViewTimers] = useState<Map<string, number>>(new Map());
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [loadMoreTrigger, isLoadMoreVisible] = useIntersectionObserver({
    threshold: 0.1
  });

  // Auto-load more when scroll trigger is visible
  useEffect(() => {
    if (isLoadMoreVisible && hasNextPage && !loading) {
      loadMoreItems();
    }
  }, [isLoadMoreVisible, hasNextPage, loading, loadMoreItems]);

  // Track view interactions with dwell time
  const handleItemView = (item: any) => {
    const startTime = Date.now();
    setViewTimers(prev => new Map(prev.set(item.id, startTime)));

    // Track view after 1 second
    setTimeout(() => {
      const dwellTime = Math.floor((Date.now() - startTime) / 1000);
      trackInteraction(item.content_id, item.content_type, 'view', dwellTime);
    }, 1000);
  };

  const handleItemInteraction = (item: any, type: string, metadata = {}) => {
    const viewStartTime = viewTimers.get(item.id);
    const dwellTime = viewStartTime ? Math.floor((Date.now() - viewStartTime) / 1000) : 0;
    
    trackInteraction(item.content_id, item.content_type, type, dwellTime, metadata);
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'pulse':
      case 'political_update':
        return <Vote className="w-4 h-4" />;
      case 'job':
        return <Briefcase className="w-4 h-4" />;
      case 'artist_content':
        return <Mic2 className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getContentTypeLabel = (contentType: string) => {
    switch (contentType) {
      case 'pulse': return 'Civic Pulse';
      case 'political_update': return 'Political Update';
      case 'job': return 'Job Opportunity';
      case 'artist_content': return 'Artist Content';
      default: return 'Content';
    }
  };

  const renderFeedItem = (item: any) => {
    const contentIcon = getContentIcon(item.content_type);
    const contentLabel = getContentTypeLabel(item.content_type);

    return (
      <Card 
        key={item.id} 
        className="mb-4 hover:shadow-md transition-shadow"
        onMouseEnter={() => handleItemView(item)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {contentIcon}
              <Badge variant="outline" className="font-sans text-xs">
                {contentLabel}
              </Badge>
              {item.region && (
                <Badge variant="secondary" className="font-sans text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  {item.region}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              <span>{Math.round(item.score * 100)}%</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Content preview based on type */}
          {item.content_type === 'pulse' && (
            <div>
              <h3 className="font-sans font-semibold text-base mb-2">
                {item.content?.content || 'Civic discussion post'}
              </h3>
              <p className="font-sans text-sm text-muted-foreground line-clamp-3">
                {item.content?.description || 'Join the civic conversation...'}
              </p>
            </div>
          )}

          {item.content_type === 'job' && (
            <div>
              <h3 className="font-sans font-semibold text-base mb-2">
                {item.content?.title || 'Job Opportunity'}
              </h3>
              <p className="font-sans text-sm text-muted-foreground mb-2">
                {item.content?.company_name} • {item.content?.location}
              </p>
              <p className="font-sans text-sm line-clamp-2">
                {item.content?.description || 'View job details...'}
              </p>
            </div>
          )}

          {item.content_type === 'artist_content' && (
            <div>
              <h3 className="font-sans font-semibold text-base mb-2">
                {item.content?.stage_name || 'Featured Artist'}
              </h3>
              <p className="font-sans text-sm text-muted-foreground">
                Cameroon Artist • {item.content?.real_name}
              </p>
            </div>
          )}

          {/* Interaction buttons */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleItemInteraction(item, 'like')}
                className="text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Heart className="w-4 h-4 mr-1" />
                <span className="font-sans text-xs">Like</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleItemInteraction(item, 'share')}
                className="text-muted-foreground hover:text-blue-500 transition-colors"
              >
                <Share2 className="w-4 h-4 mr-1" />
                <span className="font-sans text-xs">Share</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleItemInteraction(item, 'comment')}
                className="text-muted-foreground hover:text-green-500 transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                <span className="font-sans text-xs">Comment</span>
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="font-sans">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return (
      <Alert className="mb-4">
        <AlertDescription className="font-sans">
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshFeed}
            className="ml-2 font-sans"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={className}>
      {/* Feed Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-sans text-xl font-semibold">
              Your Personalized Feed
            </CardTitle>
            <div className="flex items-center gap-2">
              {civicEventsActive && (
                <Badge variant="destructive" className="font-sans text-xs animate-pulse">
                  <Vote className="w-3 h-3 mr-1" />
                  Civic Events Active
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshFeed}
                disabled={loading}
                className="font-sans"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {showPreferences && (
                <Button variant="outline" size="sm" className="font-sans">
                  <Settings className="w-4 h-4 mr-1" />
                  Preferences
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {userPreferences && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Vote className="w-3 h-3" />
                <span className="font-sans">
                  Civic: {Math.round(userPreferences.civic_content_weight * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                <span className="font-sans">
                  Jobs: {Math.round(userPreferences.job_content_weight * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Mic2 className="w-3 h-3" />
                <span className="font-sans">
                  Artists: {Math.round(userPreferences.artist_content_weight * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="font-sans">
                  Local: {Math.round(userPreferences.local_content_preference * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Feed Items */}
      <div className="space-y-4">
        {feedItems.map(renderFeedItem)}
      </div>

      {/* Loading States */}
      {loading && feedItems.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span className="font-sans text-muted-foreground">Generating your personalized feed...</span>
        </div>
      )}

      {/* Load More Trigger */}
      {hasNextPage && (
        <div 
          ref={(el) => {
            loadMoreRef.current = el;
            loadMoreTrigger(el);
          }}
          className="flex items-center justify-center py-8"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="font-sans text-sm text-muted-foreground">Loading more content...</span>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={loadMoreItems}
              className="font-sans"
            >
              Load More Content
            </Button>
          )}
        </div>
      )}

      {/* End of Feed */}
      {!hasNextPage && feedItems.length > 0 && (
        <div className="text-center py-8">
          <p className="font-sans text-sm text-muted-foreground">
            You've reached the end of your personalized feed
          </p>
          <Button 
            variant="outline" 
            onClick={refreshFeed}
            className="mt-2 font-sans"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh for New Content
          </Button>
        </div>
      )}
    </div>
  );
};