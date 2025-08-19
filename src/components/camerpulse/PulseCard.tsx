/**
 * PulseCard Component
 * 
 * Enhanced pulse card component for the CamerPulse social feed
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from './UserAvatar';
import { CivicTag } from './CivicTag';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp, 
  TrendingDown,
  MoreHorizontal,
  Flag,
  BookmarkPlus
} from 'lucide-react';
import { Pulse } from './types';

interface PulseCardProps {
  pulse: Pulse;
  onLike?: (pulseId: string) => void;
  onComment?: (pulseId: string) => void;
  onShare?: (pulseId: string) => void;
  onBookmark?: (pulseId: string) => void;
  onReport?: (pulseId: string) => void;
  className?: string;
}

export const PulseCard: React.FC<PulseCardProps> = ({
  pulse,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onReport,
  className = ''
}) => {
  const [isLiked, setIsLiked] = useState(pulse.isLiked || false);
  const [likesCount, setLikesCount] = useState(pulse.likes);

  const getSentimentConfig = () => {
    switch (pulse.sentiment) {
      case 'positive':
        return {
          color: 'bg-cm-green text-white',
          icon: <TrendingUp className="w-3 h-3" />,
          label: 'Positif'
        };
      case 'negative':
        return {
          color: 'bg-cm-red text-white',
          icon: <TrendingDown className="w-3 h-3" />,
          label: 'Negative'
        };
      default:
        return {
          color: 'bg-muted text-muted-foreground',
          icon: null,
          label: 'Neutre'
        };
    }
  };

  const sentimentConfig = getSentimentConfig();

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    onLike?.(pulse.id);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={`hover:shadow-elegant transition-all duration-300 ${className}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <UserAvatar 
              user={pulse.user} 
              size="default"
              showDiaspora={true}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-foreground truncate">{pulse.user.name}</h4>
                {pulse.user.verified && (
                  <CivicTag type="verified" label="✓" size="sm" icon={false} />
                )}
                {pulse.user.isDiaspora && (
                  <CivicTag type="diaspora" label="Diaspora" size="sm" />
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>@{pulse.user.username}</span>
                <span>•</span>
                <span>{formatTimestamp(pulse.timestamp)}</span>
                {pulse.user.location && (
                  <>
                    <span>•</span>
                    <CivicTag type="region" label={pulse.user.location} size="sm" />
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={`${sentimentConfig.color} px-2 py-1 text-xs flex items-center gap-1`}>
              {sentimentConfig.icon}
              {sentimentConfig.label}
            </Badge>
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {pulse.content}
          </p>
          
          {/* Hashtags */}
          {pulse.hashtags && pulse.hashtags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {pulse.hashtags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-primary border-primary/30 hover:bg-primary/10 cursor-pointer transition-colors"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-2 transition-colors ${
                isLiked 
                  ? 'text-cm-red hover:text-cm-red/80' 
                  : 'text-muted-foreground hover:text-cm-red'
              }`}
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likesCount}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => onComment?.(pulse.id)}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{pulse.comments}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-cm-yellow transition-colors"
              onClick={() => onShare?.(pulse.id)}
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">{pulse.shares}</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-primary p-2"
              onClick={() => onBookmark?.(pulse.id)}
            >
              <BookmarkPlus className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-destructive p-2"
              onClick={() => onReport?.(pulse.id)}
            >
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};