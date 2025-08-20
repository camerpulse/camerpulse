import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Users, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { URLBuilder } from '@/utils/slug';

export interface PoliticalEntity {
  id: string;
  full_name: string;
  position_title?: string;
  constituency?: string;
  ministry?: string;
  region?: string;
  political_party?: string;
  political_parties?: {
    id: string;
    name: string;
    acronym?: string;
    logo_url?: string;
  };
  profile_picture_url?: string;
  average_rating: number;
  total_ratings: number;
  view_count: number;
  follower_count: number;
  is_verified: boolean;
}

interface UnifiedPoliticalCardProps {
  entity: PoliticalEntity;
  entityType: 'mp' | 'minister' | 'senator';
  className?: string;
}

export function UnifiedPoliticalCard({ entity, entityType, className = '' }: UnifiedPoliticalCardProps) {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getEntityUrl = () => {
    switch (entityType) {
      case 'mp':
        return URLBuilder.buildMPProfileUrl(entity.id, entity.full_name);
      case 'minister':
        return URLBuilder.buildMinisterProfileUrl(entity.id, entity.full_name);
      case 'senator':
        return URLBuilder.buildSenatorProfileUrl(entity.id, entity.full_name);
      default:
        return '#';
    }
  };

  const getLocationText = () => {
    if (entity.constituency) return entity.constituency;
    if (entity.ministry) return entity.ministry;
    if (entity.region) return entity.region;
    return 'Location not specified';
  };

  const getPositionText = () => {
    switch (entityType) {
      case 'mp':
        return 'Member of Parliament';
      case 'minister':
        return entity.position_title || 'Minister';
      case 'senator':
        return 'Senator';
      default:
        return entity.position_title || 'Political Representative';
    }
  };

  const handleCardClick = () => {
    navigate(getEntityUrl());
  };

  return (
    <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-20 w-20 ring-2 ring-primary/10">
              <AvatarImage 
                src={entity.profile_picture_url} 
                alt={entity.full_name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-semibold text-lg">
                {getInitials(entity.full_name)}
              </AvatarFallback>
            </Avatar>
            {entity.is_verified && (
              <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Name & Position */}
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {entity.full_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {getPositionText()}
            </p>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate">{getLocationText()}</span>
          </div>

          {/* Political Party */}
          {entity.political_parties && (
            <Badge variant="secondary" className="text-xs">
              {entity.political_parties.acronym || entity.political_parties.name}
            </Badge>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              <span>{entity.average_rating.toFixed(1)}</span>
              <span className="ml-1">({entity.total_ratings})</span>
            </div>
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              <span>{entity.follower_count}</span>
            </div>
          </div>

          {/* View Profile Button */}
          <Button
            onClick={handleCardClick}
            size="sm"
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            variant="outline"
          >
            View Profile
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}