import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { FeedItem } from '@/hooks/useComprehensiveFeed';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  AlertTriangle,
  FileText,
  MapPin,
  Hash,
  Megaphone,
} from 'lucide-react';

interface FeedItemCardProps {
  item: FeedItem;
  onLike?: (itemId: string) => void;
  onShare?: (itemId: string) => void;
}

export const FeedItemCard: React.FC<FeedItemCardProps> = ({ item, onLike, onShare }) => {
  const navigate = useNavigate();

  const getItemIcon = () => {
    switch (item.type) {
      case 'event':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'policy':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'discussion':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Megaphone className="h-4 w-4 text-primary" />;
    }
  };

  const getItemTypeLabel = () => {
    switch (item.type) {
      case 'event':
        return 'Event';
      case 'policy':
        return 'Policy Update';
      case 'alert':
        return 'Alert';
      case 'discussion':
        return 'Discussion';
      default:
        return 'Post';
    }
  };

  const handleItemClick = () => {
    const baseId = item.id.split('-')[1];
    switch (item.type) {
      case 'event':
        navigate(`/events/${baseId}`);
        break;
      case 'policy':
        navigate(`/policy/${baseId}`);
        break;
      case 'alert':
        navigate(`/alerts/${baseId}`);
        break;
      default:
        navigate(`/post/${baseId}`);
    }
  };

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3" onClick={() => navigate(`/profile/${item.author.username}`)}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.author.avatar_url} />
              <AvatarFallback>
                {item.author.display_name?.charAt(0) || 
                 item.author.username?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">
                  {item.author.display_name || item.author.username || 'Anonymous'}
                </h4>
                {item.author.verified && (
                  <Badge variant="secondary" className="text-xs px-1">
                    ✓
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  {getItemIcon()}
                  <Badge variant="outline" className="text-xs">
                    {getItemTypeLabel()}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>@{item.author.username || 'anonymous'}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(item.created_at))} ago</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div onClick={handleItemClick}>
          {item.title && (
            <h3 className="text-lg font-semibold mb-2 leading-tight">
              {item.title}
            </h3>
          )}
          
          <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap">
            {item.content}
          </p>
          
          {/* Event-specific metadata */}
          {item.type === 'event' && item.metadata?.event_date && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {formatEventDate(item.metadata.event_date)}
                </span>
              </div>
              {item.metadata.location && (
                <div className="flex items-center gap-2 text-blue-600 mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs">{item.metadata.location}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Policy-specific metadata */}
          {item.type === 'policy' && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    item.metadata?.policy_status === 'passed' ? 'bg-green-100 text-green-800' :
                    item.metadata?.policy_status === 'proposed' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {item.metadata?.policy_status || 'Unknown'}
                </Badge>
                {item.metadata?.regions && item.metadata.regions.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Affects: {item.metadata.regions.join(', ')}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Alert-specific metadata */}
          {item.type === 'alert' && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    item.metadata?.severity === 'high' ? 'bg-red-100 text-red-800' :
                    item.metadata?.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}
                >
                  {item.metadata?.severity} priority
                </Badge>
                {item.metadata?.regions && item.metadata.regions.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {item.metadata.regions.join(', ')}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Hashtags */}
          {item.metadata?.hashtags && item.metadata.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {item.metadata.hashtags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Hash className="h-2 w-2 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Media */}
          {item.metadata?.media_urls && item.metadata.media_urls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {item.metadata.media_urls.slice(0, 4).map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt="Media content"
                  className="rounded-lg object-cover aspect-video"
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Engagement Actions - only for posts */}
        {item.type === 'post' && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike?.(item.id)}
                className={`flex items-center gap-2 ${
                  item.engagement.user_has_liked ? 'text-red-500' : 'text-muted-foreground'
                }`}
              >
                <Heart className={`h-4 w-4 ${item.engagement.user_has_liked ? 'fill-current' : ''}`} />
                <span>{item.engagement.likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleItemClick}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{item.engagement.comments}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare?.(item.id)}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <Share2 className="h-4 w-4" />
                <span>{item.engagement.shares}</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};