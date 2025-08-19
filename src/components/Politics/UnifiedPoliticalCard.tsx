import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Star, MapPin, Users, Eye, MessageSquare, 
  Heart, UserPlus, UserMinus, Shield, Award,
  TrendingUp, ExternalLink, Flag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MessagingModal } from './MessagingModal';
import { RatingModal } from './RatingModal';
import { cn } from '@/lib/utils';
import { URLBuilder } from '@/utils/slugUtils';

interface UnifiedPoliticalCardProps {
  id: string;
  name: string;
  position: string;
  party?: string;
  region?: string;
  photo_url?: string;
  average_rating: number;
  total_ratings: number;
  transparency_score?: number;
  performance_score?: number;
  civic_engagement_score?: number;
  is_verified?: boolean;
  follower_count?: number;
  can_receive_messages?: boolean;
  bio?: string;
  type: 'politician' | 'senator' | 'mp' | 'minister';
  className?: string;
}

export const UnifiedPoliticalCard: React.FC<UnifiedPoliticalCardProps> = ({
  id,
  name,
  position,
  party,
  region,
  photo_url,
  average_rating,
  total_ratings,
  transparency_score,
  performance_score,
  civic_engagement_score,
  is_verified,
  follower_count,
  can_receive_messages = true,
  bio,
  type,
  className
}) => {
  const navigate = useNavigate();
  const [showMessaging, setShowMessaging] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDetailUrl = () => {
    const entity = { id, name };
    
    switch (type) {
      case 'senator': return URLBuilder.senators.detail(entity);
      case 'mp': return URLBuilder.mps.detail(entity);
      case 'minister': return URLBuilder.ministers.detail(entity);
      default: return URLBuilder.politicians.detail(entity);
    }
  };

  const generateSlug = (name: string, id: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <>
      <Card 
        className={cn(
          "group h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-2 cursor-pointer rounded-xl overflow-hidden",
          className
        )}
        onClick={() => navigate(getDetailUrl())}
      >
        <CardContent className="p-0">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden">
            <Avatar className="w-full h-full rounded-none">
              <AvatarImage 
                src={photo_url} 
                alt={name}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <AvatarFallback className="w-full h-full rounded-none bg-gradient-to-br from-primary/10 to-secondary/10 text-2xl font-bold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            
            {/* Overlay with verification badge */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {is_verified && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-green-500 text-white border-0">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            )}

            {/* Rating badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-black/70 text-white border-0">
                <Star className={`w-3 h-3 mr-1 ${getRatingColor(average_rating)}`} />
                {average_rating.toFixed(1)}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Name and Position */}
            <div className="mb-4">
              <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                {name}
              </h3>
              <p className="text-sm font-medium text-primary mb-1">{position}</p>
              
              {/* Party and Region */}
              <div className="flex flex-wrap gap-2 mt-2">
                {party && (
                  <Badge variant="outline" className="text-xs">
                    {party}
                  </Badge>
                )}
                {region && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-1" />
                    {region}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {bio && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {bio}
              </p>
            )}

            {/* Performance Metrics */}
            <div className="space-y-3 mb-4">
              {transparency_score !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Transparency</span>
                    <span className="font-medium">{transparency_score.toFixed(0)}%</span>
                  </div>
                  <Progress value={transparency_score} className="h-2" />
                </div>
              )}
              
              {performance_score !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Performance</span>
                    <span className="font-medium">{performance_score.toFixed(0)}%</span>
                  </div>
                  <Progress value={performance_score} className="h-2" />
                </div>
              )}

              {civic_engagement_score !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Civic Engagement</span>
                    <span className="font-medium">{civic_engagement_score.toFixed(1)}/5</span>
                  </div>
                  <Progress value={(civic_engagement_score / 5) * 100} className="h-2" />
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-between text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {follower_count || 0} followers
              </div>
              <div className="flex items-center">
                <span className="text-xs">({total_ratings} reviews)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(getDetailUrl());
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                View Profile
              </Button>
              
              {can_receive_messages && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMessaging(true);
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Message
                </Button>
              )}
            </div>

            {/* Additional Actions Row */}
            <div className="flex justify-between mt-3 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFollowing(!isFollowing);
                }}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-1" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
              
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRating(true);
                  }}
                >
                  <Star className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messaging Modal */}
      {showMessaging && (
        <MessagingModal
          open={showMessaging}
          onClose={() => setShowMessaging(false)}
          recipientId={id}
          recipientName={name}
          recipientType={type}
        />
      )}

      {/* Rating Modal */}
      {showRating && (
        <RatingModal
          open={showRating}
          onClose={() => setShowRating(false)}
          entityId={id}
          entityName={name}
          entityType={type}
        />
      )}
    </>
  );
};