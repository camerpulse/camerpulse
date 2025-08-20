import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ProductionFeedItem } from '@/hooks/useProductionFeed';
import { formatDistanceToNow } from 'date-fns';
import { EnhancedInteractionBar } from './EnhancedInteractionBar';
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
  ExternalLink,
  Users,
  Clock,
} from 'lucide-react';

interface ProductionFeedCardProps {
  item: ProductionFeedItem;
  onLike?: (itemId: string, originalId: string) => void;
  onShare?: (itemId: string) => void;
}

export const ProductionFeedCard: React.FC<ProductionFeedCardProps> = ({ 
  item, 
  onLike, 
  onShare 
}) => {
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
      case 'pulse_post':
        return 'Post';
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
    try {
      switch (item.type) {
        case 'event':
          navigate(`/events/${item.original_id}`);
          break;
        case 'policy':
          // Navigate to a policy page or scroll to policy section
          navigate(`/policy-tracker#${item.original_id}`);
          break;
        case 'alert':
          // Navigate to alerts page
          navigate(`/alerts#${item.original_id}`);
          break;
        case 'pulse_post':
        default:
          navigate(`/post/${item.original_id}`);
          break;
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to a safe navigation
      navigate('/');
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.author.username && item.author.username !== 'system') {
      try {
        navigate(`/profile/${item.author.username}`);
      } catch (error) {
        console.error('Profile navigation error:', error);
      }
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike && item.type === 'pulse_post') {
      onLike(item.id, item.original_id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(item.id);
    }
  };

  const formatEventDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Date TBD';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80" 
            onClick={handleProfileClick}
          >
            <Avatar className="h-10 w-10 ring-2 ring-background">
              <AvatarImage 
                src={item.author.avatar_url} 
                alt={item.author.display_name}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {item.author.display_name?.charAt(0) || 
                 item.author.username?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-sm truncate">
                  {item.author.display_name || item.author.username || 'Anonymous'}
                </h4>
                {item.author.verified && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800">
                    ✓
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  {getItemIcon()}
                  <Badge variant="outline" className="text-xs font-medium">
                    {getItemTypeLabel()}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>@{item.author.username || 'anonymous'}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(item.created_at))} ago</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={handleItemClick}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <div onClick={handleItemClick} className="space-y-3">
          {item.title && (
            <h3 className="text-lg font-semibold leading-tight hover:text-primary transition-colors">
              {item.title}
            </h3>
          )}
          
          <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-4">
            {item.content}
          </p>
          
          {/* Event-specific metadata */}
          {item.type === 'event' && item.metadata?.event_date && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-400">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {formatEventDate(item.metadata.event_date)}
                </span>
              </div>
              {item.metadata.venue_name && (
                <div className="flex items-center gap-2 text-blue-600">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs">
                    {item.metadata.venue_name}
                    {item.metadata.venue_address && `, ${item.metadata.venue_address}`}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Policy-specific metadata */}
          {item.type === 'policy' && (
            <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-l-4 border-green-400">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium ${
                    item.metadata?.policy_status === 'passed' ? 'bg-green-200 text-green-800 border-green-300' :
                    item.metadata?.policy_status === 'proposed' ? 'bg-yellow-200 text-yellow-800 border-yellow-300' :
                    item.metadata?.policy_status === 'rejected' ? 'bg-red-200 text-red-800 border-red-300' :
                    'bg-gray-200 text-gray-800 border-gray-300'
                  }`}
                >
                  {item.metadata?.policy_status || 'Unknown'}
                </Badge>
                {item.metadata?.regions && item.metadata.regions.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Affects: {item.metadata.regions.slice(0, 2).join(', ')}
                    {item.metadata.regions.length > 2 && ` +${item.metadata.regions.length - 2} more`}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Hashtags */}
          {item.metadata?.hashtags && item.metadata.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.metadata.hashtags.slice(0, 5).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs hover:bg-primary/10 cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/search?q=${encodeURIComponent('#' + tag)}`);
                  }}
                >
                  <Hash className="h-2 w-2 mr-1" />
                  {tag}
                </Badge>
              ))}
              {item.metadata.hashtags.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{item.metadata.hashtags.length - 5} more
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {/* Engagement Actions - only for posts */}
        {item.type === 'pulse_post' && (
          <EnhancedInteractionBar
            postId={item.id}
            originalId={item.original_id}
            engagement={item.engagement}
            onLike={handleLike}
            onComment={handleItemClick}
            onShare={handleShare}
            postAuthor={item.author.display_name || item.author.username}
            postPreview={item.content}
          />
        )}

        {/* Non-post engagement info */}
        {item.type !== 'pulse_post' && (
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>Public</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Updated {formatDistanceToNow(new Date(item.updated_at))} ago</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleItemClick}
              className="text-xs px-3 py-1 h-7"
            >
              View Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};