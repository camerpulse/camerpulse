import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  RefreshCw, 
  Heart, 
  Share2, 
  MessageCircle, 
  Clock,
  MapPin,
  Vote,
  Briefcase,
  Mic2,
  Store,
  FileText,
  TrendingUp,
  Users,
  Eye,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useIntersectionObserver } from '@/hooks/usePerformanceOptimization';

interface UnifiedFeedContentProps {
  feedItems: any[];
  contentType: string;
  filters: any;
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
}

export const UnifiedFeedContent: React.FC<UnifiedFeedContentProps> = ({
  feedItems,
  contentType,
  filters,
  loading,
  error,
  hasNextPage,
  onLoadMore,
  onRefresh
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [loadMoreTrigger, isLoadMoreVisible] = useIntersectionObserver({
    threshold: 0.1
  });

  useEffect(() => {
    if (isLoadMoreVisible && hasNextPage && !loading) {
      onLoadMore();
    }
  }, [isLoadMoreVisible, hasNextPage, loading, onLoadMore]);

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'pulse':
      case 'political_update':
        return <Vote className="h-4 w-4" />;
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'artist_content':
        return <Mic2 className="h-4 w-4" />;
      case 'village_update':
        return <Users className="h-4 w-4" />;
      case 'marketplace':
      case 'business_listing':
        return <Store className="h-4 w-4" />;
      case 'petition':
        return <FileText className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'pulse': return 'Civic Pulse';
      case 'political_update': return 'Political Update';
      case 'job': return 'Job Opportunity';
      case 'artist_content': return 'Artist Content';
      case 'village_update': return 'Village Update';
      case 'marketplace': return 'Marketplace';
      case 'business_listing': return 'Business Listing';
      case 'petition': return 'Petition';
      default: return 'Content';
    }
  };

  const getContentColor = (type: string) => {
    switch (type) {
      case 'pulse':
      case 'political_update':
        return 'border-l-blue-500 bg-blue-50/50';
      case 'job':
        return 'border-l-green-500 bg-green-50/50';
      case 'artist_content':
        return 'border-l-purple-500 bg-purple-50/50';
      case 'village_update':
        return 'border-l-orange-500 bg-orange-50/50';
      case 'marketplace':
      case 'business_listing':
        return 'border-l-amber-500 bg-amber-50/50';
      case 'petition':
        return 'border-l-red-500 bg-red-50/50';
      default:
        return 'border-l-gray-500 bg-gray-50/50';
    }
  };

  const renderFeedItem = (item: any) => {
    const icon = getContentIcon(item.content_type);
    const label = getContentTypeLabel(item.content_type);
    const colorClass = getContentColor(item.content_type);

    return (
      <Card 
        key={item.id} 
        className={`mb-4 border-l-4 ${colorClass} hover:shadow-md transition-all duration-200 hover:scale-[1.01]`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {icon}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-inter text-xs font-medium">
                  {label}
                </Badge>
                {item.region && (
                  <Badge variant="secondary" className="font-inter text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {item.region}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {item.score && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-inter font-medium">{Math.round(item.score * 100)}%</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Dynamic Content Rendering */}
          {item.content_type === 'pulse' && (
            <div className="space-y-3">
              <h3 className="font-inter font-semibold text-base leading-tight">
                {item.content?.content || 'Civic discussion'}
              </h3>
              <p className="font-inter text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {item.content?.description || 'Join the civic conversation and make your voice heard...'}
              </p>
              {item.content?.tags && item.content.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.content.tags.slice(0, 3).map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs font-inter">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {item.content_type === 'job' && (
            <div className="space-y-3">
              <h3 className="font-inter font-semibold text-base leading-tight">
                {item.content?.title || 'Job Opportunity'}
              </h3>
              <div className="space-y-1">
                <p className="font-inter text-sm font-medium text-primary">
                  {item.content?.company_name || 'Company'}
                </p>
                <p className="font-inter text-sm text-muted-foreground">
                  📍 {item.content?.location || 'Location TBD'}
                </p>
                {item.content?.salary_range && (
                  <p className="font-inter text-sm text-green-600 font-medium">
                    💰 {item.content.salary_range}
                  </p>
                )}
              </div>
              <p className="font-inter text-sm line-clamp-2 leading-relaxed">
                {item.content?.description || 'View job details and apply...'}
              </p>
            </div>
          )}

          {item.content_type === 'artist_content' && (
            <div className="space-y-3">
              <h3 className="font-inter font-semibold text-base leading-tight">
                🎵 {item.content?.stage_name || 'Featured Artist'}
              </h3>
              <div className="space-y-1">
                <p className="font-inter text-sm text-muted-foreground">
                  Cameroon Artist • {item.content?.real_name || 'Name'}
                </p>
                <p className="font-inter text-sm text-primary">
                  🎼 {item.content?.genre || 'Music'} • {item.content?.region || 'Cameroon'}
                </p>
              </div>
              {item.content?.latest_work && (
                <p className="font-inter text-sm line-clamp-2 leading-relaxed">
                  Latest: {item.content.latest_work}
                </p>
              )}
            </div>
          )}

          {item.content_type === 'village_update' && (
            <div className="space-y-3">
              <h3 className="font-inter font-semibold text-base leading-tight">
                🏘️ {item.content?.village_name || 'Village Update'}
              </h3>
              <div className="space-y-1">
                <p className="font-inter text-sm text-muted-foreground">
                  📍 {item.content?.division}, {item.content?.region}
                </p>
                {item.content?.population && (
                  <p className="font-inter text-sm text-primary">
                    👥 Population: {item.content.population.toLocaleString()}
                  </p>
                )}
              </div>
              <p className="font-inter text-sm line-clamp-2 leading-relaxed">
                {item.content?.description || 'Latest village development updates...'}
              </p>
            </div>
          )}

          {(item.content_type === 'marketplace' || item.content_type === 'business_listing') && (
            <div className="space-y-3">
              <h3 className="font-inter font-semibold text-base leading-tight">
                🏪 {item.content?.business_name || item.content?.title || 'Business Listing'}
              </h3>
              <div className="space-y-1">
                <p className="font-inter text-sm text-muted-foreground">
                  📍 {item.content?.location || 'Location'}
                </p>
                <p className="font-inter text-sm text-primary">
                  🏷️ {item.content?.category || 'Business'}
                </p>
                {item.content?.price && (
                  <p className="font-inter text-sm text-green-600 font-medium">
                    💰 {item.content.price}
                  </p>
                )}
              </div>
              <p className="font-inter text-sm line-clamp-2 leading-relaxed">
                {item.content?.description || 'View business details...'}
              </p>
            </div>
          )}

          {item.content_type === 'petition' && (
            <div className="space-y-3">
              <h3 className="font-inter font-semibold text-base leading-tight">
                ✊ {item.content?.title || 'Community Petition'}
              </h3>
              <div className="space-y-1">
                <p className="font-inter text-sm text-muted-foreground">
                  📍 Target: {item.content?.target || 'Government'}
                </p>
                {item.content?.signatures_count && (
                  <p className="font-inter text-sm text-primary font-medium">
                    ✍️ {item.content.signatures_count} signatures
                  </p>
                )}
              </div>
              <p className="font-inter text-sm line-clamp-2 leading-relaxed">
                {item.content?.description || 'Join this important cause...'}
              </p>
            </div>
          )}

          {/* Universal Interaction Bar */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-red-500 transition-colors font-inter"
              >
                <Heart className="w-4 h-4 mr-1" />
                <span className="text-xs">Like</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-blue-500 transition-colors font-inter"
              >
                <Share2 className="w-4 h-4 mr-1" />
                <span className="text-xs">Share</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-green-500 transition-colors font-inter"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                <span className="text-xs">Comment</span>
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="font-inter">
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
      <Alert className="mb-4 border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="font-inter">
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="ml-2 font-inter"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Loading State */}
      {loading && feedItems.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin mr-3" />
          <span className="font-inter text-muted-foreground">Loading your personalized feed...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && feedItems.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-inter text-lg font-medium mb-2">No content found</h3>
            <p className="font-inter text-muted-foreground mb-4">
              No content matches your current filters. Try adjusting your preferences.
            </p>
            <Button onClick={onRefresh} variant="outline" className="font-inter">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Feed
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Feed Items */}
      {feedItems.map(renderFeedItem)}

      {/* Load More */}
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
              <span className="font-inter text-sm text-muted-foreground">Loading more content...</span>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={onLoadMore}
              className="font-inter shadow-sm hover:shadow-md transition-all"
            >
              Load More Content
            </Button>
          )}
        </div>
      )}

      {/* End of Feed */}
      {!hasNextPage && feedItems.length > 0 && (
        <div className="text-center py-8">
          <p className="font-inter text-sm text-muted-foreground mb-2">
            🎉 You've reached the end of your feed!
          </p>
          <Button 
            variant="outline" 
            onClick={onRefresh}
            className="font-inter"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh for New Content
          </Button>
        </div>
      )}
    </div>
  );
};