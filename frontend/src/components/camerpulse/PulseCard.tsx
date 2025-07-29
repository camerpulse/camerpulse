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
          label: 'Négatif'
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
                <h4 className="font-semibold text-foreground truncate text-base font-grotesk">{pulse.user.name}</h4>
                {pulse.user.verified && (
                  <CivicTag type="verified" label="✓" size="sm" icon={false} />
                )}
                {pulse.user.isDiaspora && (
                  <CivicTag type="diaspora" label="Diaspora" size="sm" />
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span className="font-mono">@{pulse.user.username}</span>
                <span>•</span>
                <span className="font-mono">{formatTimestamp(pulse.timestamp)}</span>
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
          <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base font-inter tracking-wide">
            {pulse.content}
          </p>
          
          {/* Hashtags */}
          {pulse.hashtags && pulse.hashtags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {pulse.hashtags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-primary border-primary/30 hover:bg-primary/10 cursor-pointer transition-all duration-200 hover:scale-105 font-medium"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-2 transition-all duration-200 hover:scale-105 touch-manipulation min-h-[44px] px-3 ${
                isLiked 
                  ? 'text-cm-red hover:text-cm-red/80 bg-cm-red/5' 
                  : 'text-muted-foreground hover:text-cm-red hover:bg-cm-red/5'
              }`}
              onClick={handleLike}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-base font-medium font-mono">{likesCount}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 hover:scale-105 touch-manipulation min-h-[44px] px-3"
              onClick={() => onComment?.(pulse.id)}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-base font-mono">{pulse.comments}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-secondary hover:bg-secondary/5 transition-all duration-200 hover:scale-105 touch-manipulation min-h-[44px] px-3"
              onClick={() => onShare?.(pulse.id)}
            >
              <Share2 className="w-5 h-5" />
              <span className="text-base font-mono">{pulse.shares}</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 hover:scale-105 touch-manipulation min-h-[44px] min-w-[44px]"
              onClick={() => onBookmark?.(pulse.id)}
            >
              <BookmarkPlus className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-200 hover:scale-105 touch-manipulation min-h-[44px] min-w-[44px]"
              onClick={() => onReport?.(pulse.id)}
            >
              <Flag className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};